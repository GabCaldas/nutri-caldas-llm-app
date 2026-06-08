# Nutri Caldas 🍏

O **Nutri Caldas** é um aplicativo inteligente de avaliação física e planejamento nutricional. Ele permite que profissionais de saúde ou entusiastas do fitness realizem a análise de composição corporal (IMC, percentual de gordura e riscos à saúde) de forma automatizada e gerem planos de refeição personalizados com base em diretrizes científicas.

A inteligência da aplicação é orquestrada em duas etapas usando modelos LLM do **Google Gemini**.

## 🚀 Funcionalidades

1. **Entrada Dupla de Dados:**
   - **Formulário Interativo:** Permite preencher manualmente medidas antropométricas, 9 dobras cutâneas e 15 perímetros/circunferências corporais (com cálculo de IMC em tempo real).
   - **Upload de Relatórios (.txt):** Importe relatórios de avaliação física existentes (como o arquivo de exemplo `bioimpedance.txt`).
2. **Avaliação Corporal Inteligente (Etapa 1):**
   - Classificação científica do IMC e percentual de gordura (%BF) conforme ranges científicos.
   - Análise de riscos cardiovasculares pela relação cintura/abdômen.
   - Identificação de assimetrias musculares e depósitos críticos de gordura subcutânea.
3. **Parecer e Planejamento Alimentar (Etapa 2):**
   - Diagnóstico metabólico detalhado.
   - Definição automática de metas de calorias, carboidratos, proteínas e gorduras.
   - Cálculo de hidratação alvo baseada no peso do usuário.
   - Plano alimentar diário estruturado para 4 ou 5 refeições com alimentos reais.
4. **Relatório em PDF:**
   - Exporte a análise completa de composição corporal e o plano alimentar estruturado em um documento PDF formatado e pronto para impressão ou compartilhamento.

## 🛠️ Configuração e Instalação

### Pré-requisitos
* Python 3.10 ou superior
* Uma chave de API do Google Gemini ([obtenha aqui](https://aistudio.google.com/))

### Passos para Rodar

1. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```
   *Ou se estiver utilizando o `uv`:*
   ```bash
   uv pip install -r requirements.txt
   ```

2. **Configure as credenciais:**
   - Duplique o arquivo `.env.example` e renomeie-o para `.env`.
   - Adicione sua chave do Google Gemini no arquivo:
     ```env
     GOOGLE_API_KEY=sua_chave_de_api_aqui
     ```

3. **Execute o aplicativo:**
   ```bash
   streamlit run app.py
   ```
   *Ou com o `uv`:*
   ```bash
   uv run streamlit run app.py
   ```

4. Acesse o aplicativo no seu navegador em: **http://localhost:8501**
