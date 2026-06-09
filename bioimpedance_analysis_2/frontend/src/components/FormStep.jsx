import React, { useState, useEffect } from 'react';
import { User, Activity, Flame, ShieldAlert, Heart, FileText, CheckCircle2, Lock, Info, Sparkles } from 'lucide-react';

export default function FormStep({ formData, setFormData, onSubmit, isAnalyzing, modelChoice, setModelChoice, tempChoice, setTempChoice }) {
  const [characterCount, setCharacterCount] = useState(0);

  // Calculate IMC dynamically
  const weight = parseFloat(formData.antro_data.peso) || 0;
  const heightCm = parseFloat(formData.antro_data.altura) || 0;
  const heightM = heightCm / 100;
  const imc = heightM > 0 ? (weight / (heightM * heightM)) : 0;

  let imcClass = "";
  let imcColorClass = "";
  if (imc > 0) {
    if (imc < 18.5) {
      imcClass = "Abaixo do peso";
      imcColorClass = "bg-blue-50 text-blue-700 border-blue-200";
    } else if (imc >= 18.5 && imc < 25) {
      imcClass = "Adequado";
      imcColorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (imc >= 25 && imc < 30) {
      imcClass = "Sobrepeso";
      imcColorClass = "bg-amber-50 text-amber-700 border-amber-200";
    } else {
      imcClass = "Obesidade";
      imcColorClass = "bg-rose-50 text-rose-700 border-rose-200";
    }
  }

  // Handle nested state updates
  const handlePersonalChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      personal_data: { ...prev.personal_data, [key]: value }
    }));
  };

  const handleAntroChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      antro_data: { ...prev.antro_data, [key]: value }
    }));
  };

  const handleDobrasChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      dobras_data: { ...prev.dobras_data, [key]: value }
    }));
  };

  const handlePerimetrosChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      perimetros_data: { ...prev.perimetros_data, [key]: value }
    }));
  };

  const handleGoalChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      personal_data: { ...prev.personal_data, [key]: value }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stepper Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-sm">1</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm md:text-base">Preencher dados</p>
              <p className="text-slate-400 text-xs hidden md:block">Informações físicas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-semibold text-sm">2</span>
            <div>
              <p className="font-medium text-slate-800 text-sm md:text-base">Análise por IA</p>
              <p className="text-slate-400 text-xs hidden md:block">Processando dados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-semibold text-sm">3</span>
            <div>
              <p className="font-medium text-slate-800 text-sm md:text-base">Relatório</p>
              <p className="text-slate-400 text-xs hidden md:block">Diretrizes e metas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-semibold text-sm">4</span>
            <div>
              <p className="font-medium text-slate-800 text-sm md:text-base">Baixar PDF</p>
              <p className="text-slate-400 text-xs hidden md:block">Salvar no dispositivo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Dados Pessoais */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">1. Dados pessoais</h3>
                <p className="text-slate-400 text-xs">Informações básicas para sua análise.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome completo</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.patient_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
                  placeholder="Ex: Juliana Lima"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Idade</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-12 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.personal_data.idade}
                    onChange={(e) => handlePersonalChange("idade", parseInt(e.target.value) || 0)}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">anos</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Gênero</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  value={formData.personal_data.sexo}
                  onChange={(e) => handlePersonalChange("sexo", e.target.value)}
                >
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Medidas Corporais */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">2. Medidas corporais</h3>
                <p className="text-slate-400 text-xs">Informe suas medidas em centímetros (cm) e peso em quilogramas (kg).</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Peso</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.antro_data.peso}
                    onChange={(e) => handleAntroChange("peso", e.target.value)}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">kg</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Altura</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.antro_data.altura}
                    onChange={(e) => handleAntroChange("altura", e.target.value)}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cintura</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.perimetros_data.cintura}
                    onChange={(e) => handlePerimetrosChange("cintura", e.target.value)}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quadril</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.perimetros_data.quadril}
                    onChange={(e) => handlePerimetrosChange("quadril", e.target.value)}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Peito</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.perimetros_data.torax}
                    onChange={(e) => handlePerimetrosChange("torax", e.target.value)}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Braço</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.perimetros_data.braco_dir_cont}
                    onChange={(e) => handlePerimetrosChange("braco_dir_cont", e.target.value)}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Coxa</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.perimetros_data.coxa_dir}
                    onChange={(e) => handlePerimetrosChange("coxa_dir", e.target.value)}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Panturrilha</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.perimetros_data.panturrilha_dir}
                    onChange={(e) => handlePerimetrosChange("panturrilha_dir", e.target.value)}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                </div>
              </div>
            </div>

            {/* Calculated IMC section */}
            {imc > 0 && (
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl mt-4">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600">IMC (calculado):</span>
                  <span className="font-bold text-slate-800">{imc.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg/m²</span></span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${imcColorClass}`}>
                  <CheckCircle2 size={12} />
                  <span>{imcClass}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Bioimpedância */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Flame size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">3. Bioimpedância</h3>
                <p className="text-slate-400 text-xs">Dados obtidos no exame de bioimpedância.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">% de Gordura</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.antro_data.bf}
                    onChange={(e) => handleAntroChange("bf", e.target.value)}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Massa Magra</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.bio_data.massa_magra}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio_data: { ...prev.bio_data, massa_magra: e.target.value } }))}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">kg</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Massa Muscular</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.bio_data.massa_muscular}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio_data: { ...prev.bio_data, massa_muscular: e.target.value } }))}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">kg</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Gordura Visceral</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-12 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.bio_data.gordura_visceral}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio_data: { ...prev.bio_data, gordura_visceral: e.target.value } }))}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">nível</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hidratação</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.bio_data.hidratacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio_data: { ...prev.bio_data, hidratacao: e.target.value } }))}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Taxa Metabólica</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-12 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.bio_data.tmb}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio_data: { ...prev.bio_data, tmb: e.target.value } }))}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">kcal</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Idade Metabólica</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-12 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.bio_data.idade_metabolica}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio_data: { ...prev.bio_data, idade_metabolica: e.target.value } }))}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">anos</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Qualidade dos dados</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  value={formData.bio_data.qualidade_dados}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio_data: { ...prev.bio_data, qualidade_dados: e.target.value } }))}
                >
                  <option value="Boa">Boa</option>
                  <option value="Regular">Regular</option>
                  <option value="Ruim">Ruim</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Objetivos e Estilo de Vida */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">4. Objetivos e estilo de vida</h3>
                <p className="text-slate-400 text-xs">Conte-nos seus objetivos e rotina atual.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Objetivo principal</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  value={formData.personal_data.goal}
                  onChange={(e) => handleGoalChange("goal", e.target.value)}
                >
                  <option value="Recomposição Corporal">Recomposição Corporal</option>
                  <option value="Emagrecimento / Queima de Gordura">Emagrecimento / Definição</option>
                  <option value="Hipertrofia / Ganho de Massa Magra">Hipertrofia / Massa Magra</option>
                  <option value="Saúde e Qualidade de Vida">Saúde e Bem-estar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Prazo</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  value={formData.personal_data.prazo}
                  onChange={(e) => handleGoalChange("prazo", e.target.value)}
                >
                  <option value="1 mês">1 mês</option>
                  <option value="3 meses">3 meses</option>
                  <option value="6 meses">6 meses</option>
                  <option value="12 meses">12 meses</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nível de atividade física</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  value={formData.personal_data.activity}
                  onChange={(e) => handleGoalChange("activity", e.target.value)}
                >
                  <option value="Sedentário (pouco ou nenhum exercício)">Sedentário</option>
                  <option value="Levemente ativo (exercício 1-3 dias/semana)">Levemente ativo</option>
                  <option value="Moderadamente ativo (exercício 3-5 dias/semana)">Moderadamente ativo</option>
                  <option value="Altamente ativo (exercício intenso 6-7 dias/semana)">Altamente ativo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Frequência de exercícios</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  value={formData.personal_data.frequencia}
                  onChange={(e) => handleGoalChange("frequencia", e.target.value)}
                >
                  <option value="Nenhuma">Nenhuma</option>
                  <option value="1-2 vezes por semana">1-2 vezes por semana</option>
                  <option value="3-4 vezes por semana">3-4 vezes por semana</option>
                  <option value="5+ vezes por semana">5+ vezes por semana</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de atividade</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.personal_data.tipo_atividade}
                  onChange={(e) => handleGoalChange("tipo_atividade", e.target.value)}
                  placeholder="Ex: Musculação e caminhada"
                />
              </div>
              <div className="flex items-center justify-between sm:pt-6">
                <span className="text-xs font-semibold text-slate-600">Possui restrições alimentares?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.personal_data.restricoes}
                    onChange={(e) => handleGoalChange("restricoes", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-xs font-semibold text-slate-700">
                    {formData.personal_data.restricoes ? 'Sim' : 'Não'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 5: Observações */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">5. Observações</h3>
                <p className="text-slate-400 text-xs">Informações adicionais que podem ajudar na análise.</p>
              </div>
            </div>

            <div className="relative">
              <textarea
                maxLength={500}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[100px]"
                placeholder="Ex.: estilo de alimentação, uso de medicamentos, sono, histórico de saúde, etc."
                value={formData.observations}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, observations: e.target.value }));
                  setCharacterCount(e.target.value.length);
                }}
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-medium">{characterCount}/500 caracteres</span>
            </div>
          </div>

          {/* Bottom Call-to-Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldAlert size={14} />
              <span>Seus dados estão protegidos e não serão compartilhados.</span>
            </div>
            
            <button
              onClick={onSubmit}
              disabled={isAnalyzing || !formData.patient_name}
              className={`flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white rounded-xl shadow-md transition-all duration-300 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                (isAnalyzing || !formData.patient_name) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analisar com IA</span>
                  <span className="text-xs font-normal opacity-90">&rarr;</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          
          {/* Box 1: Como Funciona */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Como funciona</h4>
            <p className="text-xs text-slate-400">Entenda o fluxo da sua análise</p>

            <div className="relative border-l border-dashed border-slate-100 pl-6 ml-3 space-y-6">
              <div className="relative">
                <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <User size={12} />
                </span>
                <h5 className="font-bold text-slate-800 text-xs">Preencher dados</h5>
                <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                  Informe suas medidas, dados de bioimpedância e objetivos com o máximo de precisão.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Flame size={12} />
                </span>
                <h5 className="font-bold text-slate-800 text-xs">Análise por IA</h5>
                <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                  Nossa inteligência artificial analisa seus dados e gera insights científicos e metabólicos personalizados.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                  <FileText size={12} />
                </span>
                <h5 className="font-bold text-slate-800 text-xs">Relatório personalizado</h5>
                <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                  Você recebe um diagnóstico corporal completo com estratégias e o seu plano alimentar estruturado.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                  <CheckCircle2 size={12} />
                </span>
                <h5 className="font-bold text-slate-800 text-xs">Baixar PDF</h5>
                <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                  Visualize online ou exporte seu parecer formatado como um PDF profissional para guardar ou imprimir.
                </p>
              </div>
            </div>
          </div>

          {/* Box 2: Privacidade */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-3">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
              <Lock size={14} />
            </div>
            <div>
              <h5 className="font-bold text-emerald-800 text-xs">Privacidade em primeiro lugar</h5>
              <p className="text-emerald-700 text-[10px] leading-relaxed mt-1">
                Suas informações são armazenadas apenas localmente no estado da sessão e utilizadas estritamente para a geração do diagnóstico.
              </p>
            </div>
          </div>

          {/* Box 3: Dicas para melhores resultados */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Dicas para melhores resultados</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5 text-xs text-slate-600">
                <input type="checkbox" defaultChecked disabled className="rounded-sm border-slate-200 text-emerald-600 mt-0.5" />
                <span>Preencha todos os campos com atenção</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600">
                <input type="checkbox" defaultChecked disabled className="rounded-sm border-slate-200 text-emerald-600 mt-0.5" />
                <span>Use medidas recentes (últimos 7 dias)</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600">
                <input type="checkbox" defaultChecked disabled className="rounded-sm border-slate-200 text-emerald-600 mt-0.5" />
                <span>Mantenha hidratação estável antes do exame</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600">
                <input type="checkbox" defaultChecked disabled className="rounded-sm border-slate-200 text-emerald-600 mt-0.5" />
                <span>Evite ingestão de álcool 24h antes da avaliação</span>
              </li>
            </ul>
          </div>

          {/* Box 4: LLM Settings */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Modelos de IA (Configurações)</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Modelo Selecionado</label>
                <select
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-white"
                  value={modelChoice}
                  onChange={(e) => setModelChoice(e.target.value)}
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="nvidia/nemotron-3-ultra-550b-a55b:free">Nvidia Nemotron 3 Ultra (Free)</option>
                  <option value="nvidia/nemotron-3-ultra-550b-a55b">Nvidia Nemotron 3 Ultra (Paid)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Temperatura: {tempChoice.toFixed(1)}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  value={tempChoice}
                  onChange={(e) => setTempChoice(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
