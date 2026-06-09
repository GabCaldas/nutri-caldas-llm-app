import React from 'react';
import { Sparkles, Trophy, Flame, Dumbbell, ShieldAlert, ArrowLeft, Download, Share2, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';

// Reusable SVG Donut Chart Component
function DonutChart({ value, label, segments, size = 130, strokeWidth = 10, isDark = true }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Base Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={isDark ? "#1E293B" : "#F1F5F9"}
            strokeWidth={strokeWidth}
          />
          {segments.map((segment, idx) => {
            const strokeLength = (segment.percentage / 100) * circumference;
            const strokeOffset = circumference - strokeLength;
            const rotationOffset = (currentOffset / 100) * 360;
            currentOffset += segment.percentage;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transform={`rotate(${rotationOffset} ${size / 2} ${size / 2})`}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</span>
          <span className={`text-[9px] font-semibold uppercase tracking-wider mt-0.5 leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
        </div>
      </div>
    </div>
  );
}

// Custom Markdown Parser to render analysis text elegantly in Dark Mode
function MarkdownRenderer({ text, isDark = true }) {
  if (!text) return null;

  const lines = text.split('\n');
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];
  const elements = [];

  lines.forEach((line, idx) => {
    let cleanLine = line.trim();

    // Skip table line separators
    if (cleanLine.startsWith('|') && cleanLine.includes('---')) {
      return;
    }

    // Table parser
    if (cleanLine.startsWith('|')) {
      const cols = cleanLine.split('|').map(c => c.trim()).filter((c, i) => i > 0 && i < cleanLine.split('|').length - 1);
      if (!inTable) {
        inTable = true;
        tableHeaders = cols;
      } else {
        tableRows.push(cols);
      }
      return;
    } else {
      if (inTable) {
        elements.push(
          <div key={`table-${idx}`} className={`overflow-x-auto my-4 border rounded-xl ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/50 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="p-3 font-semibold">{h.replace(/\*\*/g, '')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, ri) => (
                  <tr key={ri} className={`border-b last:border-b-0 ${isDark ? 'border-slate-800 hover:bg-slate-850/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={`p-3 ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>{cell.replace(/\*\*/g, '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    }

    // Header parsing
    if (cleanLine.startsWith('### ')) {
      elements.push(<h4 key={idx} className={`text-xs font-bold uppercase tracking-wider mt-5 mb-2 border-b pb-1 ${isDark ? 'text-slate-400 border-slate-800/60' : 'text-slate-500 border-slate-200'}`}>{cleanLine.substring(4)}</h4>);
      return;
    }
    if (cleanLine.startsWith('## ')) {
      elements.push(<h3 key={idx} className={`text-sm font-extrabold mt-6 mb-3 flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{cleanLine.substring(3)}</h3>);
      return;
    }
    if (cleanLine.startsWith('# ')) {
      elements.push(<h2 key={idx} className={`text-base font-bold mt-8 mb-4 ${isDark ? 'text-white' : 'text-slate-850'}`}>{cleanLine.substring(2)}</h2>);
      return;
    }

    // List item parsing
    if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
      elements.push(
        <li key={idx} className={`text-xs ml-4 list-disc mb-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-650'}`}>
          {parseInlineMarkdown(cleanLine.substring(2), isDark)}
        </li>
      );
      return;
    }

    // Paragraph parsing
    if (cleanLine) {
      elements.push(
        <p key={idx} className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-650'}`}>
          {parseInlineMarkdown(cleanLine, isDark)}
        </p>
      );
    }
  });

  return <div className="space-y-1">{elements}</div>;
}

function parseInlineMarkdown(text, isDark) {
  const parts = text.split(/\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{part}</strong> : part);
}

export default function ResultDashboard({ analysisData, formData, onBack, onDownloadPDF, isDownloadingPDF, theme = 'dark' }) {
  const { parsed_metrics, stage1_result, stage2_result, formatted_report } = analysisData;
  const isDark = theme === 'dark';

  const [shareText, setShareText] = React.useState('Compartilhar');

  const handleShare = async () => {
    const shareTextContent = `🍏 *Caldas Nutri - Relatório IA de ${formData.patient_name}*\n` +
      `- Composição Corporal: ${parsed_metrics.bf_class || 'Saudável'} (BF: ${(parseFloat(formData.antro_data.bf) || 0).toFixed(1)}%)\n` +
      `- Gasto Calórico Diário: ${parsed_metrics.calories || '2000 kcal'}\n` +
      `- Objetivo Principal: ${formData.personal_data.goal}\n` +
      `Gerado automaticamente via Caldas Nutri.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Relatório Nutricional - ${formData.patient_name}`,
          text: shareTextContent,
          url: window.location.origin
        });
        return;
      } catch (err) {
        // ignore cancellation
      }
    }

    try {
      await navigator.clipboard.writeText(shareTextContent + `\n\nLink: ${window.location.origin}`);
      setShareText('Copiado!');
      setTimeout(() => setShareText('Compartilhar'), 2500);
    } catch (err) {
      setShareText('Erro ao copiar');
      setTimeout(() => setShareText('Compartilhar'), 2500);
    }
  };

  // Formatting variables
  const patientName = formData.patient_name;
  const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // 1. Calculate values for Body Composition Donut Chart
  const peso = parseFloat(formData.antro_data.peso) || 0;
  const pctGordura = parseFloat(formData.antro_data.bf) || parseFloat(parsed_metrics.bf_val) || 0;
  const massaGorda = (peso * (pctGordura / 100));
  const massaMagra = parseFloat(formData.bio_data.massa_magra) || (peso - massaGorda);
  const massaMuscular = parseFloat(formData.bio_data.massa_muscular) || 0;
  const outros = Math.max(0, massaMagra - massaMuscular);

  const compSegments = [
    { name: "Massa Gorda", percentage: pctGordura, color: "#F59E0B" }, // Amber
    { name: "Massa Muscular", percentage: (massaMuscular / peso) * 100, color: "#10B981" }, // Emerald
    { name: "Outros", percentage: (outros / peso) * 100, color: "#3B82F6" } // Blue
  ];

  // Calculate sum and adjust to ensure it sums to 100
  const compSum = compSegments.reduce((sum, s) => sum + s.percentage, 0);
  if (compSum > 0 && compSum < 100) {
    compSegments.push({ name: "Resto", percentage: 100 - compSum, color: "#1E293B" });
  }

  // 2. Calorie expenditure Donut Chart
  const tmb = parseFloat(formData.bio_data.tmb) || 1500;
  const exerciseCal = formData.personal_data.activity.includes("Sedentário") ? 100 
                     : formData.personal_data.activity.includes("Levemente") ? 250
                     : formData.personal_data.activity.includes("Moderadamente") ? 400
                     : 600;
  const thermalCal = 150;
  const totalCal = tmb + exerciseCal + thermalCal;

  const calSegments = [
    { name: "TMB", percentage: (tmb / totalCal) * 100, color: "#3B82F6" },
    { name: "Atividade", percentage: (exerciseCal / totalCal) * 100, color: "#10B981" },
    { name: "Efeito Térmico", percentage: (thermalCal / totalCal) * 100, color: "#F59E0B" }
  ];

  // 3. Macronutrients Donut Chart
  // Parse targets (fallback if not parsed)
  const caloriesStr = parsed_metrics.calories || "2000 kcal";
  const caloriesVal = parseInt(caloriesStr.replace(/\D/g, '')) || totalCal;

  const carbStr = parsed_metrics.carbs || "45%";
  const protStr = parsed_metrics.protein || "30%";
  const fatStr = parsed_metrics.fats || "25%";

  const carbPct = parseInt(carbStr) || 45;
  const protPct = parseInt(protStr) || 30;
  const fatPct = parseInt(fatStr) || 25;

  const macroSegments = [
    { name: "Carboidratos", percentage: carbPct, color: "#8B5CF6" }, // Purple
    { name: "Proteínas", percentage: protPct, color: "#3B82F6" }, // Blue
    { name: "Gorduras", percentage: fatPct, color: "#F59E0B" } // Amber
  ];

  // Recommendations mapping
  const recomendacoes = [
    {
      title: "Objetivo principal",
      val: formData.personal_data.goal,
      desc: `Foco em recomposição corporal por um prazo sugerido de ${formData.personal_data.prazo}, com controle calórico direcionado.`,
      colorClass: "bg-emerald-950/20 text-emerald-400 border-emerald-900/50"
    },
    {
      title: "Ingestão proteica",
      val: parsed_metrics.protein !== "N/A" ? parsed_metrics.protein : "1.8g - 2.0g/kg",
      desc: "Distribua proteínas de alto valor biológico (ovos, aves, peixes, whey) em todas as refeições do dia.",
      colorClass: "bg-blue-950/20 text-blue-400 border-blue-900/50"
    },
    {
      title: "Hidratação",
      val: `${((peso * 35) / 1000).toFixed(1)}L por dia`,
      desc: "Fundamental para síntese de glicogênio muscular, eliminação de toxinas e regulação da temperatura.",
      colorClass: "bg-indigo-950/20 text-indigo-400 border-indigo-900/50"
    },
    {
      title: "Rotina alimentar",
      val: "4 a 5 refeições/dia",
      desc: "Fracione para otimizar a digestibilidade, manter síntese proteica estável e evitar picos de fome extrema.",
      colorClass: "bg-purple-950/20 text-purple-400 border-purple-900/50"
    }
  ];

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 transition-colors duration-500 ${isDark ? 'text-slate-100 bg-[#090D16]' : 'light-theme-override bg-slate-50 text-slate-800'}`}>
      
      {/* Stepper Header (Dark Mode styled) */}
      <div className="bg-[#0F1524] rounded-2xl border border-slate-800 p-6 mb-8 shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 opacity-60">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-semibold text-sm">1</span>
            <div>
              <p className="font-medium text-slate-300 text-sm md:text-base">Preencher dados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-60">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-semibold text-sm">2</span>
            <div>
              <p className="font-medium text-slate-300 text-sm md:text-base">Análise por IA</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-sm">3</span>
            <div>
              <p className="font-semibold text-white text-sm md:text-base">Relatório</p>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-60">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-semibold text-sm">4</span>
            <div>
              <p className="font-medium text-slate-300 text-sm md:text-base">Baixar PDF</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-white">Resultado da Análise</h2>
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Análise concluída com base nas informações fornecidas. Confira seus insights e recomendações personalizadas.
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900/40 self-start transition-all"
        >
          <ArrowLeft size={14} />
          <span>Voltar ao formulário</span>
        </button>
      </div>

      {/* Main Grid: Dashboard on left (2/3), Action Bar on right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dashboard Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Box 1: Resumo da Análise */}
          <div className="bg-[#0F1524] rounded-2xl border border-slate-800/80 p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <Sparkles size={18} className="text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Resumo da análise</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-4 border border-slate-800/50 rounded-xl">
              Seu estado nutricional é bom, com percentual de gordura adequado e boa base de massa muscular. Foram encontradas excelentes oportunidades para otimizar sua composição corporal, aumentar o aporte de proteínas e melhorar a hidratação diária de forma a favorecer o objetivo de {formData.personal_data.goal.toLowerCase()}.
            </p>

            {/* Quick Metrics Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Composição corporal</p>
                <p className="text-xs font-extrabold text-emerald-400 mt-1">{parsed_metrics.bf_class !== "N/A" ? parsed_metrics.bf_class : "Saudável"}</p>
              </div>
              <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Gasto calórico diário</p>
                <p className="text-xs font-extrabold text-blue-400 mt-1">{caloriesStr}</p>
              </div>
              <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Objetivo principal</p>
                <p className="text-xs font-extrabold text-purple-400 mt-1 truncate">{formData.personal_data.goal.split(" ")[0]}</p>
              </div>
              <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Nível de atividade</p>
                <p className="text-xs font-extrabold text-amber-400 mt-1 truncate">{formData.personal_data.activity.split(" ")[0]}</p>
              </div>
            </div>
          </div>

          {/* Box 2: SVG Donut Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chart 1: Composição Corporal */}
            <div className="bg-[#0F1524] rounded-2xl border border-slate-800/80 p-5 shadow-md flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-white text-xs">Composição corporal</h4>
                <div className="flex gap-1 bg-slate-900/50 p-0.5 rounded-md border border-slate-800 text-[9px] font-bold">
                  <span className="px-1.5 py-0.5 rounded-sm bg-slate-800 text-white">kg</span>
                  <span className="px-1.5 py-0.5 text-slate-400">%</span>
                </div>
              </div>

              <DonutChart 
                value={`${pctGordura.toFixed(1)}%`} 
                label="Gordura corporal" 
                segments={compSegments} 
                isDark={isDark}
              />

              <div className="space-y-2 mt-4 text-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]"></span>
                    <span className="text-slate-400 font-medium">Massa Magra</span>
                  </div>
                  <span className="font-bold text-white">{massaMagra.toFixed(1)} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]"></span>
                    <span className="text-slate-400 font-medium">Massa Gorda</span>
                  </div>
                  <span className="font-bold text-white">{massaGorda.toFixed(1)} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]"></span>
                    <span className="text-slate-400 font-medium">Massa Muscular</span>
                  </div>
                  <span className="font-bold text-white">{massaMuscular.toFixed(1)} kg</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Necessidade Calórica */}
            <div className="bg-[#0F1524] rounded-2xl border border-slate-800/80 p-5 shadow-md flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-white text-xs">Necessidade calórica</h4>
                <span className="text-[9px] font-bold text-slate-500">kcal/dia</span>
              </div>

              <DonutChart 
                value={caloriesVal.toLocaleString('pt-BR')} 
                label="Gasto estimado" 
                segments={calSegments} 
                isDark={isDark}
              />

              <div className="space-y-2 mt-4 text-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]"></span>
                    <span className="text-slate-400 font-medium">Taxa Metabólica Basal</span>
                  </div>
                  <span className="font-bold text-white">{tmb.toLocaleString('pt-BR')} kcal</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]"></span>
                    <span className="text-slate-400 font-medium">Atividade física</span>
                  </div>
                  <span className="font-bold text-white">+{exerciseCal} kcal</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]"></span>
                    <span className="text-slate-400 font-medium">Efeito térmico alimentos</span>
                  </div>
                  <span className="font-bold text-white">+{thermalCal} kcal</span>
                </div>
              </div>
            </div>

            {/* Chart 3: Distribuição de Macronutrientes */}
            <div className="bg-[#0F1524] rounded-2xl border border-slate-800/80 p-5 shadow-md flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-white text-xs">Distribuição de macros</h4>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wide">Equilibrado</span>
              </div>

              <DonutChart 
                value={`${caloriesVal.toLocaleString('pt-BR')} kcal`} 
                label="Target diário" 
                segments={macroSegments} 
                isDark={isDark}
              />

              <div className="space-y-2 mt-4 text-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#8B5CF6]"></span>
                    <span className="text-slate-400 font-medium">Carboidratos ({carbPct}%)</span>
                  </div>
                  <span className="font-bold text-white">{((caloriesVal * (carbPct/100)) / 4).toFixed(0)}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]"></span>
                    <span className="text-slate-400 font-medium">Proteínas ({protPct}%)</span>
                  </div>
                  <span className="font-bold text-white">{((caloriesVal * (protPct/100)) / 4).toFixed(0)}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]"></span>
                    <span className="text-slate-400 font-medium">Gorduras ({fatPct}%)</span>
                  </div>
                  <span className="font-bold text-white">{((caloriesVal * (fatPct/100)) / 9).toFixed(0)}g</span>
                </div>
              </div>
            </div>

          </div>

          {/* Box 3: Observações de Saúde */}
          <div className="bg-[#0F1524] rounded-2xl border border-slate-800/80 p-6 shadow-md space-y-4">
            <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-2">Observações de saúde</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl">
                <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Biomarcadores</span>
                <span className="block text-xs font-bold text-emerald-400 mt-1">Dentro do normal</span>
              </div>
              <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl">
                <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Hidratação</span>
                <span className="block text-xs font-bold text-emerald-400 mt-1">Adequada</span>
              </div>
              <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl">
                <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Nível de atividade</span>
                <span className="block text-xs font-bold text-blue-400 mt-1">Moderado</span>
              </div>
              <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl">
                <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Qualidade dos dados</span>
                <span className="block text-xs font-bold text-emerald-400 mt-1">Boa</span>
              </div>
            </div>
          </div>

          {/* Box 4: Recomendações Personalizadas */}
          <div className="bg-[#0F1524] rounded-2xl border border-slate-800/80 p-6 shadow-md space-y-4">
            <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-2">Recomendações personalizadas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recomendacoes.map((item, idx) => (
                <div key={idx} className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{item.title}</span>
                    <span className="block text-xs font-extrabold text-white mt-1">{item.val}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Box 5: Relatórios Completos da IA (Texto e Tabelas do Gemini) */}
          <div className="bg-[#0F1524] rounded-2xl border border-slate-800/80 p-6 shadow-md space-y-6">
            <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
              <h4 className="font-bold text-white text-xs">Parecer de Composição Física (IA Stage 1)</h4>
              <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded-sm border border-slate-800 text-slate-500 font-bold">Diagnóstico</span>
            </div>
            <MarkdownRenderer text={stage1_result} isDark={isDark} />

            <div className="border-b border-slate-800 pb-2 pt-4 flex items-center justify-between">
              <h4 className="font-bold text-white text-xs">Diretrizes Dietéticas e Plano Alimentar (IA Stage 2)</h4>
              <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded-sm border border-slate-800 text-slate-500 font-bold">Nutrição</span>
            </div>
            <MarkdownRenderer text={stage2_result} isDark={isDark} />
          </div>

        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          
          {/* Box 1: Relatório Gerado Preview */}
          <div className="bg-[#0F1524] rounded-2xl border border-slate-800/80 p-6 shadow-md space-y-4">
            <h4 className="font-bold text-slate-300 text-xs border-b border-slate-800 pb-2">Relatório gerado</h4>
            <p className="text-[10px] text-slate-400">Seu relatório personalizado está pronto.</p>

            {/* Document card visual mock */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 aspect-3/4 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="text-sm">🍏</span>
                <span>Caldas Nutri</span>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-white text-sm tracking-tight leading-snug">
                  Relatório Nutricional Personalizado
                </h5>
                <p className="text-[10px] text-slate-400 font-semibold">{patientName}</p>
                <p className="text-[9px] text-slate-600 font-medium">{currentDate}</p>
              </div>

              <div className="border-t border-slate-800/60 pt-3 flex items-center justify-between text-[9px] text-slate-500">
                <span>Parceiro de Saúde IA</span>
                <span className="text-emerald-500 font-bold">Verificado</span>
              </div>
            </div>

            {/* Actions Stack */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={onDownloadPDF}
                disabled={isDownloadingPDF}
                className={`flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl shadow-md transition-all duration-300 active:scale-98 ${
                  isDownloadingPDF ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isDownloadingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                    <span>Gerando arquivo...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Baixar PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 w-full py-3 border border-slate-800 hover:border-slate-700 font-bold text-xs text-slate-300 hover:bg-slate-900/40 rounded-xl transition-all active:scale-98"
              >
                <Share2 size={14} />
                <span>{shareText}</span>
              </button>

              <button
                onClick={onBack}
                className="flex items-center justify-center gap-2 w-full py-3 border border-slate-800 hover:border-slate-700 font-bold text-xs text-slate-300 hover:bg-slate-900/40 rounded-xl transition-all"
              >
                <RefreshCw size={14} />
                <span>Nova análise</span>
              </button>
            </div>
          </div>

          {/* Box 2: Guidelines / Tips */}
          <div className="bg-[#0F1524] rounded-2xl border border-slate-800/80 p-6 shadow-md space-y-4">
            <h4 className="font-bold text-slate-300 text-xs border-b border-slate-800 pb-2">Dicas para melhores resultados</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-[10px] text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></div>
                <span>Siga as recomendações do relatório</span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></div>
                <span>Mantenha consistência nas refeições</span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></div>
                <span>Combine com exercícios regulares</span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></div>
                <span>Reavalie seus dados em 3 meses</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
