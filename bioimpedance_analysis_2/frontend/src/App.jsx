import React, { useState } from 'react';
import FormStep from './components/FormStep';
import ResultDashboard from './components/ResultDashboard';
import { Bell, Heart, ChevronDown } from 'lucide-react';

export default function App() {
  const [activeStep, setActiveStep] = useState('FORM'); // 'FORM' or 'RESULTS'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [modelChoice, setModelChoice] = useState('gemini-2.5-flash');
  const [tempChoice, setTempChoice] = useState(0.0);
  const [analysisData, setAnalysisData] = useState(null);

  // Initial Form State matching design examples
  const [formData, setFormData] = useState({
    patient_name: "Juliana Lima",
    personal_data: {
      idade: 29,
      sexo: "Feminino",
      goal: "Emagrecimento / Queima de Gordura",
      activity: "Moderadamente ativo (exercício 3-5 dias/semana)",
      prazo: "3 meses",
      frequencia: "3-4 vezes por semana",
      tipo_atividade: "Musculação e caminhada",
      restricoes: true
    },
    antro_data: {
      peso: 68.5,
      altura: 168.0,
      bf: 24.6
    },
    dobras_data: {
      triciptal: 19.0,
      subescapular: 25.0,
      axilar_media: 19.0,
      abdominal: 37.0,
      coxa: 25.0,
      supra_iliaca: 37.0,
      peitoral: 10.0,
      bicipital: 0.0,
      panturrilha: 0.0
    },
    perimetros_data: {
      torax: 90.0,
      cintura: 72.0,
      abdomen: 80.0,
      quadril: 98.0,
      braco_dir_cont: 28.0,
      braco_esq_cont: 28.0,
      braco_dir_rel: 27.5,
      braco_esq_rel: 27.5,
      antibraco_dir: 22.0,
      antibraco_esq: 22.0,
      coxa_dir: 56.0,
      coxa_esq: 56.0,
      panturrilha_dir: 36.0,
      panturrilha_esq: 36.0,
      escapular: 0.0
    },
    bio_data: {
      massa_magra: 51.8,
      massa_muscular: 32.6,
      gordura_visceral: 7,
      hidratacao: 52.3,
      tmb: 1482,
      idade_metabolica: 24,
      qualidade_dados: "Boa"
    },
    observations: ""
  });

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: formData.patient_name,
          personal_data: formData.personal_data,
          antro_data: formData.antro_data,
          dobras_data: formData.dobras_data,
          perimetros_data: formData.perimetros_data,
          model_choice: modelChoice,
          temp_choice: tempChoice
        }),
      });

      if (!response.ok) {
        throw new Error('Falha no processamento com a IA');
      }

      const data = await response.json();
      setAnalysisData(data);
      setActiveStep('RESULTS');
    } catch (error) {
      alert(`Erro: ${error.message}. Certifique-se de que o servidor FastAPI está rodando.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysisData) return;
    setIsDownloadingPDF(true);
    try {
      const response = await fetch('/api/download_pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: formData.patient_name,
          personal_data: formData.personal_data,
          formatted_report: analysisData.formatted_report,
          stage1_result: analysisData.stage1_result,
          stage2_result: analysisData.stage2_result
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar o arquivo PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Plano_Nutricional_${formData.patient_name.replace(/ /g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Erro no download: ${error.message}`);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const isDarkTheme = activeStep === 'RESULTS';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkTheme ? 'bg-[#090D16] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Universal Header Navigation */}
      <header className={`border-b ${isDarkTheme ? 'bg-[#0F1524]/90 border-slate-800' : 'bg-white border-slate-100'} sticky top-0 z-50 backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Heart size={16} fill="currentColor" />
            </div>
            <span className={`font-black tracking-tight text-base ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
              Caldas <span className="text-emerald-500">Nutri</span>
            </span>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <span className={`hover:text-emerald-500 cursor-pointer ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Painel</span>
            <span className="text-emerald-500 border-b-2 border-emerald-500 pb-1 cursor-pointer">Análises</span>
            <span className={`hover:text-emerald-500 cursor-pointer ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Histórico</span>
            <span className={`hover:text-emerald-500 cursor-pointer ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Planos</span>
            <span className={`hover:text-emerald-500 cursor-pointer flex items-center gap-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Recursos <ChevronDown size={12} />
            </span>
          </nav>

          {/* Profile Actions */}
          <div className="flex items-center gap-4">
            <button className={`p-1.5 rounded-lg border ${isDarkTheme ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-100 text-slate-500 hover:text-slate-800'}`}>
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100"
                alt="Profile"
                className="w-7 h-7 rounded-full border border-emerald-500 object-cover"
              />
              <span className={`text-xs font-bold hidden sm:inline ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                {formData.patient_name}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {activeStep === 'FORM' ? (
          <div className="animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 pt-8 text-center md:text-left">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center justify-center md:justify-start gap-2">
                Nova Análise Nutricional
                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold border border-emerald-100">IA</span>
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Preencha os dados abaixo para receber uma análise completa gerada por IA com recomendações personalizadas.
              </p>
            </div>
            <FormStep
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isAnalyzing={isAnalyzing}
              modelChoice={modelChoice}
              setModelChoice={setModelChoice}
              tempChoice={tempChoice}
              setTempChoice={setTempChoice}
            />
          </div>
        ) : (
          <div className="animate-fade-in bg-[#090D16]">
            <ResultDashboard
              analysisData={analysisData}
              formData={formData}
              onBack={() => setActiveStep('FORM')}
              onDownloadPDF={handleDownloadPDF}
              isDownloadingPDF={isDownloadingPDF}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`py-6 border-t text-center text-[10px] font-semibold ${isDarkTheme ? 'bg-[#090D16] border-slate-900 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
        <p>&copy; {new Date().getFullYear()} Caldas Nutri. Todos os direitos reservados. Inteligência Artificial para Avaliação Antropométrica.</p>
      </footer>

    </div>
  );
}
