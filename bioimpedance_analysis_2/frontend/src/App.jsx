import React, { useState, useEffect } from 'react';
import FormStep from './components/FormStep';
import ResultDashboard from './components/ResultDashboard';
import { Heart, Sun, Moon } from 'lucide-react';

export default function App() {
  const [activeStep, setActiveStep] = useState('FORM'); // 'FORM' or 'RESULTS'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [modelChoice, setModelChoice] = useState('gemini-2.5-flash');
  const [tempChoice, setTempChoice] = useState(0.0);
  const [analysisData, setAnalysisData] = useState(null);

  const [inputMethod, setInputMethod] = useState('manual'); // 'manual' or 'upload'
  const [rawReport, setRawReport] = useState('');
  const [theme, setTheme] = useState('light');

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
          antro_data: inputMethod === 'manual' ? formData.antro_data : null,
          dobras_data: inputMethod === 'manual' ? formData.dobras_data : null,
          perimetros_data: inputMethod === 'manual' ? formData.perimetros_data : null,
          raw_report: inputMethod === 'upload' ? rawReport : null,
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
      setTheme('dark');
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

  const isDark = theme === 'dark';
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#090D16] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Universal Header Navigation */}
      <header className={`border-b ${isDark ? 'bg-[#0F1524]/90 border-slate-800' : 'bg-white border-slate-100'} sticky top-0 z-50 backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Heart size={16} fill="currentColor" />
            </div>
            <span className={`font-black tracking-tight text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Caldas <span className="text-emerald-500">Nutri</span>
            </span>
          </div>

          {/* Theme Switch & Page Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all ${
                isDark
                  ? 'border-slate-800 text-amber-400 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
              title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
              isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {activeStep === 'FORM' ? 'Ficha de Avaliação' : 'Relatório IA'}
            </span>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {activeStep === 'FORM' ? (
          <div className="animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 pt-8 text-center md:text-left">
              <h1 className={`text-2xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Nova Análise Nutricional
                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold border border-emerald-100">IA</span>
              </h1>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs mt-1`}>
                Preencha os dados abaixo ou faça upload de um relatório para receber uma análise completa gerada por IA com recomendações personalizadas.
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
              inputMethod={inputMethod}
              setInputMethod={setInputMethod}
              rawReport={rawReport}
              setRawReport={setRawReport}
              theme={theme}
            />
          </div>
        ) : (
          <div className="animate-fade-in">
            <ResultDashboard
              analysisData={analysisData}
              formData={formData}
              onBack={() => {
                setActiveStep('FORM');
                setTheme('light');
              }}
              onDownloadPDF={handleDownloadPDF}
              isDownloadingPDF={isDownloadingPDF}
              theme={theme}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`py-6 border-t text-center text-[10px] font-semibold ${isDark ? 'bg-[#090D16] border-slate-900 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
        <p>&copy; {new Date().getFullYear()} Caldas Nutri. Todos os direitos reservados. Inteligência Artificial para Avaliação Antropométrica.</p>
      </footer>

    </div>
  );
}
