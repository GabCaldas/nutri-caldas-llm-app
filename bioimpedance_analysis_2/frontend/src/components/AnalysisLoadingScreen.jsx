import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Cpu, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export default function AnalysisLoadingScreen({ modelChoice, theme = 'light' }) {
  const [stage, setStage] = useState(0);
  const isDark = theme === 'dark';

  const stages = [
    { label: "Lendo dados corporais e antropométricos...", icon: Cpu, color: "text-blue-500 bg-blue-500/10" },
    { label: "Analisando composição física via IA...", icon: Brain, color: "text-purple-500 bg-purple-500/10" },
    { label: "Calculando necessidades calóricas e macros...", icon: Sparkles, color: "text-amber-500 bg-amber-500/10" },
    { label: "Estruturando plano alimentar personalizado...", icon: FileSpreadsheet, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Gerando parecer final e PDF...", icon: ShieldCheck, color: "text-indigo-500 bg-indigo-500/10" }
  ];

  useEffect(() => {
    let active = true;
    // Delays in ms before transitioning OUT of each stage (0 -> 1, 1 -> 2, etc.)
    // These reflect realistic backend times (reading is fast, AI processing and diet structure take longer)
    const delays = [1500, 6000, 4500, 6000, 3000];

    const runProgress = (currentStage) => {
      if (!active || currentStage >= delays.length) return;
      
      setTimeout(() => {
        if (!active) return;
        setStage(currentStage + 1);
        runProgress(currentStage + 1);
      }, delays[currentStage]);
    };

    runProgress(0);

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-4 text-center transition-colors duration-500 ${isDark ? 'bg-[#090D16]' : 'bg-slate-50'}`}>
      
      {/* Outer Pulse Container */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-emerald-500/10 animate-ping"></div>
        <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-pulse"></div>
        <div className="relative w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border border-emerald-500/30">
          <Brain className="w-8 h-8" />
        </div>
      </div>

      {/* Main text header */}
      <h2 className={`text-xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
        Processando seu Parecer Nutricional
      </h2>
      <p className="text-slate-400 text-xs max-w-sm mb-8">
        Nossa IA está processando suas métricas corporais utilizando o modelo <span className="text-emerald-500 font-bold">{modelChoice.split('/').pop()}</span>.
      </p>

      {/* Progression Steps checklist */}
      <div className={`w-full max-w-md rounded-2xl border p-6 text-left space-y-4 shadow-xs ${
        isDark ? 'bg-[#0F1524] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        {stages.map((stg, idx) => {
          const IconComponent = stg.icon;
          const isActive = idx === stage;
          const isCompleted = idx < stage;
          
          return (
            <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${
              isActive ? 'opacity-100 font-semibold' : isCompleted ? 'opacity-80' : 'opacity-30'
            }`}>
              {/* Stage Icon */}
              <div className={`p-2 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                isCompleted 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : isActive 
                    ? stg.color 
                    : isDark ? 'bg-slate-900 text-slate-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {isCompleted ? (
                  <span className="text-[10px] font-bold text-emerald-500">✓</span>
                ) : (
                  <IconComponent size={14} className={isActive ? "animate-pulse" : ""} />
                )}
              </div>

              {/* Stage Label */}
              <div className="flex-1">
                <p className={`text-xs transition-colors duration-300 ${
                  isCompleted 
                    ? 'text-slate-400 line-through decoration-emerald-500/30' 
                    : isActive 
                      ? isDark ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold'
                      : isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {stg.label}
                </p>
              </div>

              {/* Processing/Pulsing Dot */}
              {isActive && (
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-300"></span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
