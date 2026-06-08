import os
import re
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv(dotenv_path="/home/caldas/Projects/agentic-ai-crash-course-codebasics/tutorial-agentic-ai/.env")

def get_imc_classification(imc):
    """Classifies the Body Mass Index (IMC) according to WHO guidelines."""
    if imc < 18.5:
        return "Abaixo do peso"
    elif 18.5 <= imc < 25.0:
        return "Peso normal"
    elif 25.0 <= imc < 30.0:
        return "Acima do peso (Sobrepeso)"
    else:
        return "Obesidade"

def format_manual_report(personal_data, antro_data, dobras_data, perimetros_data):
    """Formats manual body measurements into the standardized bioimpedance report text structure."""
    peso = antro_data["peso"]
    altura = antro_data["altura"]
    imc = peso / (altura ** 2) if altura > 0 else 0
    imc_class = get_imc_classification(imc)
    
    report = f"""===============================================================================
                       RELATÓRIO DE AVALIAÇÃO FÍSICA
===============================================================================

1. DADOS ANTROPOMÉTRICOS E COMPOSIÇÃO CORPORAL
-------------------------------------------------------------------------------
Peso Atual:      {peso:.2f} kg
Altura:          {altura:.2f} m
IMC:             {imc:.2f} kg/m² -> Classificação: {imc_class}

Percentual de Gordura (%BF): {antro_data['bf']:.2f}% (Protocolo: Pollock 7 dobras)

2. DOBRAS CUTÂNEAS (mm)
-------------------------------------------------------------------------------
Triciptal:       {dobras_data.get('triciptal', 0.0):.2f} mm
Subescapular:    {dobras_data.get('subescapular', 0.0):.2f} mm
Axilar Média:    {dobras_data.get('axilar_media', 0.0):.2f} mm
Abdominal:       {dobras_data.get('abdominal', 0.0):.2f} mm
Coxa:            {dobras_data.get('coxa', 0.0):.2f} mm
Panturrilha:     {dobras_data.get('panturrilha', 0.0):.2f} mm
Bicipital:       {dobras_data.get('bicipital', 0.0):.2f} mm
Peitoral:        {dobras_data.get('peitoral', 0.0):.2f} mm
Supra-ilíaca:    {dobras_data.get('supra_iliaca', 0.0):.2f} mm

3. PERÍMETROS / CIRCUNFERÊNCIAS (cm)
-------------------------------------------------------------------------------
Tórax:                    {perimetros_data.get('torax', 0.0):.2f} cm
Braço Direito Contraído:   {perimetros_data.get('braco_dir_cont', 0.0):.2f} cm
Braço Esquerdo Contraído:  {perimetros_data.get('braco_esq_cont', 0.0):.2f} cm
Braço Direito Relaxado:    {perimetros_data.get('braco_dir_rel', 0.0):.2f} cm
Braço Esquerdo Relaxado:   {perimetros_data.get('braco_esq_rel', 0.0):.2f} cm
Antebraço Direito:         {perimetros_data.get('antibraco_dir', 0.0):.2f} cm
Antebraço Esquerdo:        {perimetros_data.get('antibraco_esq', 0.0):.2f} cm
Cintura:                   {perimetros_data.get('cintura', 0.0):.2f} cm
Abdômen:                   {perimetros_data.get('abdomen', 0.0):.2f} cm
Quadril:                  {perimetros_data.get('quadril', 0.0):.2f} cm
Escapular:                 {perimetros_data.get('escapular', 0.0):.2f} cm
Coxa Direita:              {perimetros_data.get('coxa_dir', 0.0):.2f} cm
Coxa Esquerda:             {perimetros_data.get('coxa_esq', 0.0):.2f} cm
Panturrilha Direita:       {perimetros_data.get('panturrilha_dir', 0.0):.2f} cm
Panturrilha Esquerda:      {perimetros_data.get('panturrilha_esq', 0.0):.2f} cm

-------------------------------------------------------------------------------
Observações: Relatório gerado via formulário manual interativo Nutri Caldas.
===============================================================================
"""
    return report, imc

def run_stage1_analysis(report_text, model_name, temperature, age, sex):
    """Runs the first stage of the LLM pipeline, analyzing and classifying composition metrics."""
    llm = ChatGoogleGenerativeAI(model=model_name, temperature=temperature)
    
    extraction_prompt = f"""# PERSONA E CONTEXTO
Você é um Agente Especialista em Antropometria e Composição Corporal de Alta Precisão. Sua função é receber relatórios estruturados de avaliação física (contendo peso, altura, dobras cutâneas e circunferências), extrair as métricas cruciais, cruzá-las com os dados demográficos e de perfil do usuário (Idade e Sexo Biológico) e gerar uma análise classificatória rigorosa e acurada.

# OBJETIVO
Analisar os dados brutos de entrada, determinar a classificação de cada indicador em um dos 4 níveis de criticidade (Abaixo, Normal, Elevado, Crítico) e fornecer explicitamente o range de referência científica utilizado para aquela tomada de decisão.

# REGRAS DE NEGÓCIO E REFERÊNCIAS
Utilize as seguintes diretrizes científicas para determinar os ranges e classificações (seja estrito na aplicação com base no sexo e idade do usuário fornecidos no contexto):

1. Índice de Massa Corporal (IMC) - Padrão OMS:
   - Abaixo: < 18.5 kg/m²
   - Normal: 18.5 a 24.9 kg/m²
   - Elevado (Sobrepeso): 25.0 a 29.9 kg/m²
   - Crítico (Obesidade): >= 30.0 kg/m²

2. Percentual de Gordura (%BF) - Protocolo Pollock (7 Dobras):
   - Adapte os ranges dinamicamente conforme a faixa etária e o sexo do usuário baseado nas tabelas de Jackson & Pollock.
   - Categorize o resultado final em: "Abaixo (Essencial/Atleta)", "Normal (Bom/Excelente)", "Elevado (Moderado/Alto)" ou "Crítico (Muito Alto/Obesidade)".

3. Circunferências / Relações de Risco à Saúde:
   - Cintura e Abdômen: Avalie o risco cardiovascular associado ao acúmulo de gordura visceral.
     * Para Homens: Normal (< 94cm), Elevado (94-102cm), Crítico (> 102cm).
     * Para Mulheres: Normal (< 80cm), Elevado (80-88cm), Crítico (> 88cm).

# INSTRUÇÕES DE PROCESSAMENTO
1. Identifique o sexo biológico e a idade do usuário a partir das variáveis de contexto da sessão antes de processar o relatório.
2. Faça o parsing completo do relatório de texto recebido.
3. Ignore medições que estejam zeradas (ex: dobras não coletadas) e não as inclua no output.
4. Para cada métrica analisada, você DEVE retornar obrigatoriamente: o valor atual, a classificação e o range de referência exato aplicado para o perfil do usuário.
5. Seja puramente analítico, técnico e direto ao ponto. Evite conversas informais ou introduções longas.

# FORMATO DA SAÍDA (OUTPUT EXPECTADO)
Gere a resposta estritamente no seguinte formato estruturado:

### Perfil de Análise Aplicado
* **Sexo:** {sex}
* **Idade:** {age} anos

### Classificação da Composição Corporal
| Métrica | Valor Atual | Classificação | Range de Referência |
| :--- | :--- | :--- | :--- |
| **IMC** | [Valor] kg/m² | [Abaixo/Normal/Elevado/Crítico] | [Range] kg/m² |
| **Percentual de Gordura (%BF)** | [Valor]% | [Abaixo/Normal/Elevado/Crítico] | [Range para Idade/Sexo]% |

### Análise de Perímetros Críticos (Risco Cardiovascular/Saúde)
* **Cintura:** [Valor] cm | **Classificação:** [Normal/Elevado/Crítico] | *(Referência: [Range] cm)*
* **Abdômen:** [Valor] cm | **Classificação:** [Normal/Elevado/Crítico] | *(Referência: [Range] cm)*

### Insights de Assimetria e Dobras (Opcional/Se aplicável)
* [Identificar se há assimetrias significativas de perímetros laterais, ex: braço esquerdo vs direito, ou focar nas maiores dobras acumuladas, ex: Abdominal/Supra-ilíaca].

segue as informacoes do usuario: {report_text}
"""
    response = llm.invoke(extraction_prompt)
    return response.text

def run_stage2_diet(extraction_values, personal_data, model_name, temperature):
    """Runs the second stage of the LLM pipeline, calculating macro targets and creating daily meal plans."""
    llm = ChatGoogleGenerativeAI(model=model_name, temperature=temperature)
    
    diet_prompt = f"""# PERSONA E CONTEXTO
Você é um Nutricionista Clínico e Esportivo de Elite, focado em nutrição baseada em evidências e otimização de performance/composição corporal. Você não apenas lê números, mas interpreta o cenário metabólico do paciente. Sua postura é empática, motivadora, mas extremamente técnica e direta ao ponto, sem o uso de floreios, rodeios ou emojis.

# OBJETIVO
Com base nos dados antropométricos classificados (vindos do Agente Analisador) e nas características/objetivos individuais do paciente, você deve:
1. Fornecer um Parecer Nutricional e de Saúde detalhado.
2. Definir as metas de macronutrientes.
3. ESTRUTURAR UM PLANO ALIMENTAR DIÁRIO COMPLETO E DETALHADO.

# INFORMAÇÕES DE ENTRADA (CONTEXTO DA PIPELINE)
Você receberá um objeto contendo:
- [PERFIL DO PACIENTE]: Idade: {personal_data['idade']}, Sexo: {personal_data['sexo']}, Nível de Atividade Física: {personal_data['activity']}, Objetivo Atual: {personal_data['goal']}.
- [DADOS DA AVALIAÇÃO CLASSIFICADA]: O output gerado pelo agente anterior (contendo Peso, IMC, %BF, Perímetros e Dobras Cutâneas com suas respectivas classificações de criticidade).

# REGRAS DE NEGÓCIO E LÓGICA DE DIAGNÓSTICO
1. Análise de Risco e Distribuição de Gordura: Olhe atentamente para as dobras de maior acúmulo (ex: Abdominal e Supra-ilíaca) e para o perímetro da cintura/abdômen. Se estiverem em níveis "Elevado" ou "Crítico", priorize a saúde metabólica e a redução da gordura visceral no seu parecer.
2. Avaliação da Massa Magra Oculta: Se o IMC estiver "Elevado" (Sobrepeso), mas os perímetros de membros (como coxas e braços) mostrarem bom desenvolvimento e o %BF estiver moderado, reconheça que parte desse peso é massa muscular (fenótipo de praticante de treino de força).
3. Cálculo de Diretrizes Nutricionais (Estimativas Críticas):
   - Déficit/Excedente: Se o objetivo for recomposição ou emagrecimento com %BF elevado, estabeleça um déficit calórico moderado (evite restrições severas para preservar a massa magra).
   - Aporte Proteico: Como o paciente realiza treinos estruturados, mantenha o foco em uma ingestão proteica otimizada (geralmente entre 1.8g/kg a 2.2g/kg de peso corporal).
4. Construção do Plano Alimentar: Monte uma rotina de 4 a 5 refeições diárias distribuídas estrategicamente para o padrão do paciente. As refeições devem conter opções reais de alimentos limpos (arroz, feijão, ovos, frango, frutas, aveia, etc.) e quantidades estimadas compatíveis com as metas macro. Se houver indicação para praticidade, utilize suplementação básica (como whey protein).

# INSTRUÇÕES DE PROCESSAMENTO
- Não invente dados. Use exatamente as métricas fornecidas.
- Se o relatório apontar dobras zeradas ou não coletadas (como bicipital ou panturrilha), ignore-as no parecer; foque no que está alterado.
- Não utilize emojis ou símbolos gráficos em nenhuma parte do texto gerado.
- Divida sua resposta estritamente nas seções do formato de saída abaixo.

# FORMATO DA SAÍDA (OUTPUT EXPECTADO)

## Parecer Nutricional e Diagnóstico de Saúde
* Status Metabólico Atual: [Análise interpretativa do peso vs. percentual de gordura. Explique o que o IMC e o %BF juntos significam para a realidade dele].
* Pontos de Atenção (Gargalos): [Identifique onde estão os maiores acúmulos de gordura de acordo com as dobras críticas (ex: região central/abdominal) e o impacto disso na saúde cardiovascular ou estética].
* Pontos Fortes (Estrutura Atual): [Elogie os pontos positivos, como boa simetria de membros, perímetros de coxa/braço que indiquem boa base de massa magra, etc].

## Diretrizes Estratégicas e Metas Macrodietéticas
* Foco da Fase Atual: [Ex: Recomposição Corporal Eficiente - Redução de gordura com preservação/ganho de massa muscular]
* Meta Macrodietética Estimada:
  - Estratégia Calórica: [Ex: Déficit Calórico Leve a Moderado / Normocalórica]
  - Proteínas: Target de ~[X]g/kg de peso corporal (Total: ~[Y]g).
  - Carboidratos: Ajustados para fornecer energia para os treinos.
  - Gorduras: Foco em gorduras saudáveis para suporte hormonal.
* Hidratação Alvo: Mínimo de [Calcular: Peso * 35ml] litros de água por dia.

## Plano Alimentar Sugerido
[Escreva o plano estruturado aqui com refeições numeradas e claras, ex: Refeição 1: Café da Manhã, Refeição 2: Almoço, etc. Liste os alimentos e suas quantidades estimadas.]

segue informacoes do usuario: {extraction_values}
"""
    response = llm.invoke(diet_prompt)
    return response.text

def parse_macro_metrics(diet_text):
    """Extracts calorie and macro targets from the diet plan text using regular expressions."""
    calories = "N/A"
    protein = "N/A"
    carbs = "N/A"
    fats = "N/A"
    
    cal_match = re.search(r'(?:Estrat[eé]gia Cal[oó]rica|Calorias|Total Cal[oó]rico):\s*([^\n\r]+)', diet_text, re.IGNORECASE)
    prot_match = re.search(r'Prote[ií]nas:\s*([^\n\r]+)', diet_text, re.IGNORECASE)
    carb_match = re.search(r'Carboidratos:\s*([^\n\r]+)', diet_text, re.IGNORECASE)
    fat_match = re.search(r'Gorduras:\s*([^\n\r]+)', diet_text, re.IGNORECASE)
    
    if cal_match:
        calories = cal_match.group(1).strip()
    if prot_match:
        protein = prot_match.group(1).strip()
    if carb_match:
        carbs = carb_match.group(1).strip()
    if fat_match:
        fats = fat_match.group(1).strip()
        
    return calories, protein, carbs, fats

def parse_extraction_metrics(extraction_text):
    """Extracts IMC and Body Fat % values and their classifications from the Stage 1 LLM response."""
    imc_val = "N/A"
    imc_class = "N/A"
    bf_val = "N/A"
    bf_class = "N/A"
    
    # Try to find table row matches: | **IMC** | 25,83 kg/m² | Elevado | ...
    imc_match = re.search(r'\|\s*\*\*IMC\*\*\s*\|\s*([^|]+)\|\s*([^|]+)\|', extraction_text, re.IGNORECASE)
    # Match Percentual de Gordura row
    bf_match = re.search(r'\|\s*\*\*Percentual de Gordura.*?\*\*\s*\|\s*([^|]+)\|\s*([^|]+)\|', extraction_text, re.IGNORECASE)
    
    if imc_match:
        imc_val = imc_match.group(1).strip()
        imc_class = imc_match.group(2).strip()
    if bf_match:
        bf_val = bf_match.group(1).strip()
        bf_class = bf_match.group(2).strip()
        
    return imc_val, imc_class, bf_val, bf_class

