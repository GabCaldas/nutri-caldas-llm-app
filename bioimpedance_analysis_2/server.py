import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import io

# Add current directory to path to import local modules
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from llm_pipeline import (
    format_manual_report,
    run_stage1_analysis,
    run_stage2_diet,
    parse_macro_metrics,
    parse_extraction_metrics
)
from pdf_generator import generate_pdf_bytes

app = FastAPI(title="Caldas Nutri API", version="1.0.0")

# Enable CORS for frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for inputs
class AnalyzeRequest(BaseModel):
    patient_name: str
    personal_data: Dict[str, Any]
    antro_data: Optional[Dict[str, Any]] = None
    dobras_data: Optional[Dict[str, Any]] = None
    perimetros_data: Optional[Dict[str, Any]] = None
    raw_report: Optional[str] = None
    model_choice: str
    temp_choice: float

class PDFRequest(BaseModel):
    patient_name: str
    personal_data: Dict[str, Any]
    formatted_report: str
    stage1_result: str
    stage2_result: str

@app.post("/api/analyze")
async def analyze(payload: AnalyzeRequest):
    try:
        # 1. Determine the source of the report text
        if payload.raw_report and payload.raw_report.strip():
            report_text = payload.raw_report
            calculated_imc = 0.0
            # Try to calculate BMI from text if possible, or just default to 0
        else:
            if not payload.antro_data:
                raise HTTPException(status_code=400, detail="Medições antropométricas necessárias")
            report_text, calculated_imc = format_manual_report(
                payload.personal_data,
                payload.antro_data,
                payload.dobras_data or {},
                payload.perimetros_data or {}
            )

        # 2. Run LLM Pipeline - Stage 1 (Composition Analysis)
        stage1_output = run_stage1_analysis(
            report_text,
            payload.model_choice,
            payload.temp_choice,
            payload.personal_data.get("idade", 25),
            payload.personal_data.get("sexo", "Masculino")
        )

        # 3. Run LLM Pipeline - Stage 2 (Diet Planning)
        stage2_output = run_stage2_diet(
            stage1_output,
            payload.personal_data,
            payload.model_choice,
            payload.temp_choice
        )

        # 4. Parse critical metrics for the UI dashboard charts
        imc_val, imc_class, bf_val, bf_class = parse_extraction_metrics(stage1_output)
        calories, protein, carbs, fats = parse_macro_metrics(stage2_output)

        return {
            "success": True,
            "formatted_report": report_text,
            "stage1_result": stage1_output,
            "stage2_result": stage2_output,
            "parsed_metrics": {
                "imc_val": imc_val,
                "imc_class": imc_class,
                "bf_val": bf_val,
                "bf_class": bf_class,
                "calories": calories,
                "protein": protein,
                "carbs": carbs,
                "fats": fats
            }
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro no processamento da IA: {str(e)}")

@app.post("/api/download_pdf")
async def download_pdf(payload: PDFRequest):
    try:
        pdf_data = generate_pdf_bytes(
            payload.patient_name,
            payload.personal_data,
            payload.formatted_report,
            payload.stage1_result,
            payload.stage2_result
        )
        
        # Wrap bytes in a file-like stream
        pdf_stream = io.BytesIO(pdf_data)
        
        clean_name = payload.patient_name.replace(" ", "_")
        filename = f"Plano_Nutricional_{clean_name}.pdf"
        
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        return StreamingResponse(pdf_stream, media_type="application/pdf", headers=headers)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDF: {str(e)}")

# Mount static frontend production build
dist_path = os.path.join(current_dir, "frontend/dist")
if os.path.exists(dist_path):
    # Mount assets directory first
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Prevent static routing from swallowing API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        
        # Serve static file if it exists, otherwise fall back to index.html for React Router
        file_path = os.path.join(dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    @app.get("/")
    async def home():
        return {"message": "Caldas Nutri API está rodando! Frontend ainda não foi compilado."}

if __name__ == "__main__":
    import uvicorn
    # In production/deployment, we serve on 0.0.0.0:8000
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
