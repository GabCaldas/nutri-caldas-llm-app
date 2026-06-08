from fpdf import FPDF

def generate_pdf_bytes(user_name, personal_data, raw_report, extraction_output, diet_output):
    """Generates a structured PDF document containing the nutrition plan and physical analysis."""
    class PDF(FPDF):
        def header(self):
            # Header dark banner
            self.set_fill_color(6, 95, 70)  # Dark Emerald Green
            self.rect(0, 0, 210, 35, 'F')
            
            self.set_text_color(255, 255, 255)
            self.set_font('Helvetica', 'B', 20)
            self.set_y(10)
            self.cell(0, 8, 'NUTRI CALDAS', 0, 1, 'C')
            
            self.set_font('Helvetica', 'I', 10)
            self.cell(0, 5, 'Plano Alimentar e Analise de Composicao Corporal Inteligente', 0, 1, 'C')
            self.ln(12)
            
        def footer(self):
            self.set_y(-15)
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(156, 163, 175)
            self.cell(0, 10, f'Nutri Caldas | Pagina {self.page_no()} de {{nb}}', 0, 0, 'C')

    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    
    # Helper to print safe text
    def safe_print(title, content, title_size=12, text_size=10):
        # Convert accents safely to avoid FPDF encoding exceptions
        clean_title = title.encode('latin-1', 'replace').decode('latin-1')
        pdf.set_font('Helvetica', 'B', title_size)
        pdf.set_text_color(6, 95, 70)
        pdf.cell(0, 8, clean_title, 0, 1)
        
        pdf.set_font('Helvetica', '', text_size)
        pdf.set_text_color(55, 65, 81)
        
        # Print block of text directly to avoid cursor layout issues
        clean_content = content.encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 5, clean_content)
        pdf.ln(4)

    # User Info Block
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(6, 95, 70)
    pdf.cell(0, 10, f"Paciente: {user_name or 'Nao identificado'}", 0, 1)
    
    info_str = f"Idade: {personal_data['idade']} anos | Sexo: {personal_data['sexo']} | Objetivo: {personal_data['goal']}\nNivel de Atividade: {personal_data['activity']}"
    safe_print("Perfil do Paciente", info_str, 12, 10)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)

    # Stage 1 Outputs
    safe_print("1. COMPOSICAO CORPORAL E CLASSIFICACOES", extraction_output, 13, 9)
    pdf.add_page()
    
    # Stage 2 Outputs
    safe_print("2. DIRETRIZES NUTRICIONAIS E PLANO ALIMENTAR", diet_output, 13, 9)

    return bytes(pdf.output())
