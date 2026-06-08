import streamlit as st
import os
import re
from llm_pipeline import (
    get_imc_classification,
    format_manual_report,
    run_stage1_analysis,
    run_stage2_diet,
    parse_macro_metrics,
    parse_extraction_metrics
)
from pdf_generator import generate_pdf_bytes

# Page configuration
st.set_page_config(
    page_title="Nutri Caldas - Avaliação Física & Nutrição",
    page_icon="🍏",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- THEME MANAGEMENT & CSS INJECTION ---
# Initialize session state for theme
if "dark_mode" not in st.session_state:
    st.session_state.dark_mode = False

# Toggle theme via button with icon in sidebar
with st.sidebar:
    st.markdown("<h3 style='font-weight: 700; margin-bottom: 0.5rem; text-align: center;'>🎨 Aparência</h3>", unsafe_allow_html=True)
    if st.session_state.dark_mode:
        if st.button("☀️", key="theme_toggle", help="Mudar para o Modo Claro"):
            st.session_state.dark_mode = False
            st.rerun()
    else:
        if st.button("🌙", key="theme_toggle", help="Mudar para o Modo Escuro"):
            st.session_state.dark_mode = True
            st.rerun()

# Inject CSS based on selected theme
if not st.session_state.dark_mode:
    # --- LIGHT MODE (Mint / Emerald Theme) ---
    st.markdown("""
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        html, body, [class*="css"], .stMarkdown {
            font-family: 'Outfit', sans-serif;
        }
        
        /* App backgrounds */
        [data-testid="stAppViewContainer"], .main {
            background-color: #F8FAFC !important;
            color: #0F172A !important;
        }
        
        [data-testid="stHeader"] {
            background-color: rgba(248, 250, 252, 0.8) !important;
        }
        
        [data-testid="stSidebar"] {
            background-color: #F1F5F9 !important;
            border-right: 1px solid #E2E8F0;
        }
        
        /* Global typography colors in Light Mode */
        h1, h2, h3, h4, h5, h6 {
            color: #0F172A !important;
        }
        p, li, label, .stMarkdown p, .stMarkdown li, [data-testid="stWidgetLabel"] p {
            color: #334155 !important;
        }
        
        /* Specific input label styles */
        [data-testid="stWidgetLabel"] p {
            font-weight: 600 !important;
            color: #0F172A !important;
        }
        
        /* Text inputs, number inputs, textareas */
        .stTextInput div[data-baseweb="base-input"],
        .stNumberInput div[data-baseweb="base-input"],
        .stTextArea div[data-baseweb="base-input"],
        div[data-testid="stTextInput"] div[data-baseweb="base-input"],
        div[data-testid="stNumberInput"] div[data-baseweb="base-input"],
        div[data-testid="stTextArea"] div[data-baseweb="base-input"] {
            background-color: #FFFFFF !important;
            border: 1px solid #CBD5E1 !important;
            border-radius: 8px !important;
        }
        .stTextInput div[data-baseweb="base-input"]:focus-within,
        .stNumberInput div[data-baseweb="base-input"]:focus-within,
        .stTextArea div[data-baseweb="base-input"]:focus-within {
            border-color: #10B981 !important;
            box-shadow: 0 0 0 1px #10B981 !important;
        }
        
        /* Force Input elements to have dark text and transparent background inside container */
        .stTextInput input,
        .stNumberInput input,
        .stTextArea textarea,
        input,
        textarea {
            color: #0F172A !important;
            background-color: transparent !important;
        }
        
        /* Number Input buttons (+/-) */
        div[data-testid="stNumberInput"] button {
            background-color: #F8FAFC !important;
            color: #0F172A !important;
            border: 1px solid #CBD5E1 !important;
        }
        div[data-testid="stNumberInput"] button:hover {
            background-color: #F1F5F9 !important;
            border-color: #10B981 !important;
            color: #047857 !important;
        }
        
        /* Selectbox styling */
        .stSelectbox div[data-baseweb="select"] > div,
        div[data-testid="stSelectbox"] div[data-baseweb="select"] > div {
            background-color: #FFFFFF !important;
            border: 1px solid #CBD5E1 !important;
            border-radius: 8px !important;
            color: #0F172A !important;
        }
        .stSelectbox div[data-baseweb="select"] span,
        div[data-testid="stSelectbox"] div[data-baseweb="select"] span {
            color: #0F172A !important;
            font-weight: 500 !important;
        }
        .stSelectbox div[data-baseweb="select"] svg,
        div[data-testid="stSelectbox"] div[data-baseweb="select"] svg {
            fill: #0F172A !important;
        }
        
        /* Dropdown options rendering in portal */
        div[data-baseweb="popover"] ul,
        div[role="listbox"] {
            background-color: #FFFFFF !important;
            color: #0F172A !important;
            border: 1px solid #E2E8F0 !important;
        }
        div[data-baseweb="popover"] li,
        div[role="option"] {
            background-color: #FFFFFF !important;
            color: #0F172A !important;
        }
        div[data-baseweb="popover"] li:hover,
        div[role="option"]:hover,
        div[data-baseweb="popover"] li[aria-selected="true"],
        div[role="option"][aria-selected="true"] {
            background-color: #ECFDF5 !important;
            color: #047857 !important;
        }
        
        /* Radio button styles */
        div[data-testid="stRadio"] label p,
        div[data-testid="stRadio"] span {
            color: #334155 !important;
        }
        /* Radio dot color */
        div[data-testid="stRadio"] label div[role="radio"][aria-checked="true"] > div {
            background-color: #10B981 !important;
        }
        div[data-testid="stRadio"] label div[role="radio"][aria-checked="true"] {
            border-color: #10B981 !important;
        }
        
        /* File Uploader styling */
        div[data-testid="stFileUploader"] section {
            background-color: #FFFFFF !important;
            border: 2px dashed #CBD5E1 !important;
            border-radius: 12px !important;
            padding: 1.5rem !important;
        }
        div[data-testid="stFileUploader"] section [data-testid="stBaseButton-secondary"] {
            background-color: #F1F5F9 !important;
            color: #0F172A !important;
            border: 1px solid #CBD5E1 !important;
            font-weight: 600 !important;
        }
        div[data-testid="stFileUploader"] section p,
        div[data-testid="stFileUploader"] section span {
            color: #475569 !important;
        }
        
        /* Slider styling */
        div[data-baseweb="slider"] > div {
            background: #E2E8F0 !important;
        }
        div[data-baseweb="slider"] div[role="slider"] {
            background-color: #10B981 !important;
            border-color: #10B981 !important;
        }
        div[data-baseweb="slider"] div[role="slider"] > div {
            background-color: #10B981 !important;
        }
        div[data-baseweb="slider"] > div > div > div {
            background-color: #10B981 !important;
        }
        
        /* Info / Success / Warning Alert boxes */
        div[data-testid="stAlert"] {
            background-color: #EFF6FF !important;
            color: #1E40AF !important;
            border: 1px solid #BFDBFE !important;
            border-radius: 10px !important;
        }
        div[data-testid="stAlert"] p,
        div[data-testid="stAlert"] span,
        div[data-testid="stAlert"] li {
            color: #1E40AF !important;
        }
        
        /* Success alert specifics */
        div[data-testid="stAlert"]:has(div[class*="success"]) {
            background-color: #ECFDF5 !important;
            color: #047857 !important;
            border: 1px solid #A7F3D0 !important;
        }
        div[data-testid="stAlert"]:has(div[class*="success"]) p,
        div[data-testid="stAlert"]:has(div[class*="success"]) span {
            color: #047857 !important;
        }
        
        /* Title banner styling */
        .title-banner {
            background: linear-gradient(135deg, #047857 0%, #10B981 100%);
            padding: 2.5rem;
            border-radius: 16px;
            text-align: center;
            margin-bottom: 2rem;
            box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
        }
        .title-banner h1 {
            font-weight: 800;
            font-size: 2.8rem;
            margin-bottom: 0.5rem;
            color: #FFFFFF !important;
        }
        .title-banner p {
            font-weight: 300;
            font-size: 1.2rem;
            color: #FFFFFF !important;
            opacity: 0.9;
        }
        
        /* Section headers */
        .section-header {
            font-weight: 700;
            font-size: 1.5rem;
            color: #047857;
            border-left: 5px solid #10B981;
            padding-left: 10px;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
        }
        
        /* Card design */
        .card, [data-testid="stExpander"], div.stTabs [data-baseweb="tab-panel"] {
            background-color: #FFFFFF !important;
            border-radius: 12px !important;
            padding: 1.5rem !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
            border: 1px solid #E2E8F0 !important;
            margin-bottom: 1.2rem !important;
        }
        .card h1, .card h2, .card h3, .card h4, .card h5, .card h6 {
            color: #0F172A !important;
        }
        .card p, .card li, .card span:not([style*="color"]) {
            color: #334155 !important;
        }
        
        /* Macro metrics cards */
        .macro-container {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .macro-card {
            flex: 1;
            background: #FFFFFF;
            border-radius: 12px;
            padding: 1.25rem;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            border: 1px solid #E2E8F0;
            border-top: 4px solid #10B981;
            transition: transform 0.2s;
        }
        .macro-card:hover {
            transform: translateY(-3px);
        }
        .macro-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: #64748B;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
        }
        .macro-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: #0F172A;
        }
        
        /* Hydration card */
        .hydration-card {
            background: linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%);
            border-radius: 12px;
            padding: 1.25rem;
            border-left: 6px solid #2563EB;
            border-top: 1px solid #BFDBFE;
            border-right: 1px solid #BFDBFE;
            border-bottom: 1px solid #BFDBFE;
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .hydration-icon {
            font-size: 2.2rem;
        }
        .hydration-text h4 {
            margin: 0;
            color: #1E3A8A !important;
            font-weight: 700;
            font-size: 1.1rem;
        }
        .hydration-text p {
            margin: 0;
            color: #2563EB !important;
            font-weight: 800;
            font-size: 1.4rem;
        }
        
        /* Buttons inside the main content (generate and download) */
        .main .stButton>button, .main .stDownloadButton>button {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
            color: white !important;
            font-weight: 600 !important;
            border-radius: 8px !important;
            border: none !important;
            padding: 0.6rem 1.8rem !important;
            box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2) !important;
            transition: all 0.3s !important;
            width: 100%;
        }
        .main .stButton>button:hover, .main .stDownloadButton>button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 12px -1px rgba(16, 185, 129, 0.3) !important;
        }
        
        /* Custom CSS table override */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
        }
        th {
            background-color: #ECFDF5 !important;
            color: #047857 !important;
            font-weight: 700 !important;
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid #10B981;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #E2E8F0;
            color: #334155;
        }
        tr:nth-child(even) {
            background-color: #F8FAFC;
        }
        
        /* Style the sidebar button (Theme toggle) to be a beautiful circular icon button */
        [data-testid="stSidebar"] [data-testid="stButton"] {
            text-align: center;
            display: flex;
            justify-content: center;
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
        [data-testid="stSidebar"] [data-testid="stButton"] button {
            background-color: #FFFFFF !important;
            color: #0F172A !important;
            border: 1px solid #CBD5E1 !important;
            border-radius: 50% !important;
            width: 50px !important;
            height: 50px !important;
            min-width: 50px !important;
            min-height: 50px !important;
            padding: 0 !important;
            font-size: 1.6rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
            transition: all 0.3s ease !important;
        }
        [data-testid="stSidebar"] [data-testid="stButton"] button:hover {
            transform: scale(1.1) rotate(15deg) !important;
            border-color: #10B981 !important;
            box-shadow: 0 8px 12px -1px rgba(16, 185, 129, 0.2) !important;
        }
        
        /* Tabs styling in Light Mode */
        div.stTabs [data-baseweb="tab"] {
            color: #64748B !important;
            font-weight: 600 !important;
        }
        div.stTabs [aria-selected="true"] {
            color: #047857 !important;
            border-bottom-color: #10B981 !important;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #F1F5F9;
        }
        ::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94A3B8;
        }
        
        /* Text selection color */
        ::selection {
            background-color: #A7F3D0 !important;
            color: #047857 !important;
        }
        
        /* Custom card metric text and alignment */
        .card-metric-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: #64748B !important;
            text-transform: uppercase;
        }
        .card-metric-value {
            font-size: 2.2rem;
            font-weight: 800;
            margin: 0.5rem 0;
            color: #0F172A !important;
        }
        .metric-top-card {
            border-top: 4px solid #10B981 !important;
        }
    </style>
    """, unsafe_allow_html=True)
else:
    # --- DARK MODE (Sleek Obsidian Theme) ---
    st.markdown("""
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        html, body, [class*="css"], .stMarkdown {
            font-family: 'Outfit', sans-serif;
        }
        
        /* App backgrounds */
        [data-testid="stAppViewContainer"], .main {
            background-color: #090D16 !important;
            color: #E2E8F0 !important;
        }
        
        [data-testid="stHeader"] {
            background-color: rgba(9, 13, 22, 0.8) !important;
        }
        
        [data-testid="stSidebar"] {
            background-color: #111625 !important;
            border-right: 1px solid #1E293B;
        }
        
        /* Global typography colors in Dark Mode */
        h1, h2, h3, h4, h5, h6 {
            color: #F8FAFC !important;
        }
        p, li, label, .stMarkdown p, .stMarkdown li, [data-testid="stWidgetLabel"] p {
            color: #CBD5E1 !important;
        }
        
        /* Specific input label styles */
        [data-testid="stWidgetLabel"] p {
            font-weight: 600 !important;
            color: #F8FAFC !important;
        }
        
        /* Text inputs, number inputs, textareas */
        .stTextInput div[data-baseweb="base-input"],
        .stNumberInput div[data-baseweb="base-input"],
        .stTextArea div[data-baseweb="base-input"],
        div[data-testid="stTextInput"] div[data-baseweb="base-input"],
        div[data-testid="stNumberInput"] div[data-baseweb="base-input"],
        div[data-testid="stTextArea"] div[data-baseweb="base-input"] {
            background-color: #1E293B !important;
            border: 1px solid #334155 !important;
            border-radius: 8px !important;
        }
        .stTextInput div[data-baseweb="base-input"]:focus-within,
        .stNumberInput div[data-baseweb="base-input"]:focus-within,
        .stTextArea div[data-baseweb="base-input"]:focus-within {
            border-color: #34D399 !important;
            box-shadow: 0 0 0 1px #34D399 !important;
        }
        
        /* Force Input elements to have light text and transparent background inside container */
        .stTextInput input,
        .stNumberInput input,
        .stTextArea textarea,
        input,
        textarea {
            color: #F8FAFC !important;
            background-color: transparent !important;
        }
        
        /* Number Input buttons (+/-) */
        div[data-testid="stNumberInput"] button {
            background-color: #1E293B !important;
            color: #F8FAFC !important;
            border: 1px solid #334155 !important;
        }
        div[data-testid="stNumberInput"] button:hover {
            background-color: #334155 !important;
            border-color: #34D399 !important;
            color: #34D399 !important;
        }
        
        /* Selectbox styling */
        .stSelectbox div[data-baseweb="select"] > div,
        div[data-testid="stSelectbox"] div[data-baseweb="select"] > div {
            background-color: #1E293B !important;
            border: 1px solid #334155 !important;
            border-radius: 8px !important;
            color: #F8FAFC !important;
        }
        .stSelectbox div[data-baseweb="select"] span,
        div[data-testid="stSelectbox"] div[data-baseweb="select"] span {
            color: #F8FAFC !important;
            font-weight: 500 !important;
        }
        .stSelectbox div[data-baseweb="select"] svg,
        div[data-testid="stSelectbox"] div[data-baseweb="select"] svg {
            fill: #F8FAFC !important;
        }
        
        /* Dropdown options rendering in portal */
        div[data-baseweb="popover"] ul,
        div[role="listbox"] {
            background-color: #151B2C !important;
            color: #F8FAFC !important;
            border: 1px solid #232E48 !important;
        }
        div[data-baseweb="popover"] li,
        div[role="option"] {
            background-color: #151B2C !important;
            color: #F8FAFC !important;
        }
        div[data-baseweb="popover"] li:hover,
        div[role="option"]:hover,
        div[data-baseweb="popover"] li[aria-selected="true"],
        div[role="option"][aria-selected="true"] {
            background-color: #064E3B !important;
            color: #34D399 !important;
        }
        
        /* Radio button styles */
        div[data-testid="stRadio"] label p,
        div[data-testid="stRadio"] span {
            color: #CBD5E1 !important;
        }
        /* Radio dot color */
        div[data-testid="stRadio"] label div[role="radio"][aria-checked="true"] > div {
            background-color: #34D399 !important;
        }
        div[data-testid="stRadio"] label div[role="radio"][aria-checked="true"] {
            border-color: #34D399 !important;
        }
        
        /* File Uploader styling */
        div[data-testid="stFileUploader"] section {
            background-color: #151B2C !important;
            border: 2px dashed #232E48 !important;
            border-radius: 12px !important;
            padding: 1.5rem !important;
        }
        div[data-testid="stFileUploader"] section [data-testid="stBaseButton-secondary"] {
            background-color: #1E293B !important;
            color: #F8FAFC !important;
            border: 1px solid #334155 !important;
            font-weight: 600 !important;
        }
        div[data-testid="stFileUploader"] section p,
        div[data-testid="stFileUploader"] section span {
            color: #CBD5E1 !important;
        }
        
        /* Slider styling */
        div[data-baseweb="slider"] > div {
            background: #334155 !important;
        }
        div[data-baseweb="slider"] div[role="slider"] {
            background-color: #34D399 !important;
            border-color: #34D399 !important;
        }
        div[data-baseweb="slider"] div[role="slider"] > div {
            background-color: #34D399 !important;
        }
        div[data-baseweb="slider"] > div > div > div {
            background-color: #34D399 !important;
        }
        
        /* Info / Success / Warning Alert boxes */
        div[data-testid="stAlert"] {
            background-color: #1E293B !important;
            color: #93C5FD !important;
            border: 1px solid #2563EB !important;
            border-radius: 10px !important;
        }
        div[data-testid="stAlert"] p,
        div[data-testid="stAlert"] span,
        div[data-testid="stAlert"] li {
            color: #93C5FD !important;
        }
        
        /* Success alert specifics */
        div[data-testid="stAlert"]:has(div[class*="success"]) {
            background-color: #064E3B !important;
            color: #34D399 !important;
            border: 1px solid #065F46 !important;
        }
        div[data-testid="stAlert"]:has(div[class*="success"]) p,
        div[data-testid="stAlert"]:has(div[class*="success"]) span {
            color: #34D399 !important;
        }
        
        /* Title banner styling */
        .title-banner {
            background: linear-gradient(135deg, #064E3B 0%, #065F46 100%);
            padding: 2.5rem;
            border-radius: 16px;
            text-align: center;
            margin-bottom: 2rem;
            box-shadow: 0 10px 15px -3px rgba(6, 95, 70, 0.4);
        }
        .title-banner h1 {
            font-weight: 800;
            font-size: 2.8rem;
            margin-bottom: 0.5rem;
            color: #FFFFFF !important;
        }
        .title-banner p {
            font-weight: 300;
            font-size: 1.2rem;
            color: #FFFFFF !important;
            opacity: 0.9;
        }
        
        /* Section headers */
        .section-header {
            font-weight: 700;
            font-size: 1.5rem;
            color: #34D399;
            border-left: 5px solid #34D399;
            padding-left: 10px;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
        }
        
        /* Card design */
        .card, [data-testid="stExpander"], div.stTabs [data-baseweb="tab-panel"] {
            background-color: #151B2C !important;
            border-radius: 12px !important;
            padding: 1.5rem !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
            border: 1px solid #232E48 !important;
            margin-bottom: 1.2rem !important;
        }
        .card h1, .card h2, .card h3, .card h4, .card h5, .card h6 {
            color: #F8FAFC !important;
        }
        .card p, .card li, .card span:not([style*="color"]) {
            color: #CBD5E1 !important;
        }
        
        /* Macro metrics cards */
        .macro-container {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .macro-card {
            flex: 1;
            background: #151B2C;
            border-radius: 12px;
            padding: 1.25rem;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            border: 1px solid #232E48;
            border-top: 4px solid #34D399;
            transition: transform 0.2s;
        }
        .macro-card:hover {
            transform: translateY(-3px);
        }
        .macro-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: #94A3B8;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
        }
        .macro-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: #F8FAFC;
        }
        
        /* Hydration card */
        .hydration-card {
            background: linear-gradient(135deg, #1E3A8A 0%, #172554 100%);
            border-radius: 12px;
            padding: 1.25rem;
            border-left: 6px solid #3B82F6;
            border-top: 1px solid #1E40AF;
            border-right: 1px solid #1E40AF;
            border-bottom: 1px solid #1E40AF;
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .hydration-icon {
            font-size: 2.2rem;
        }
        .hydration-text h4 {
            margin: 0;
            color: #EFF6FF !important;
            font-weight: 700;
            font-size: 1.1rem;
        }
        .hydration-text p {
            margin: 0;
            color: #60A5FA !important;
            font-weight: 800;
            font-size: 1.4rem;
        }
        
        /* Buttons inside the main content (generate and download) */
        .main .stButton>button, .main .stDownloadButton>button {
            background: linear-gradient(135deg, #34D399 0%, #059669 100%) !important;
            color: white !important;
            font-weight: 600 !important;
            border-radius: 8px !important;
            border: none !important;
            padding: 0.6rem 1.8rem !important;
            box-shadow: 0 4px 6px -1px rgba(52, 211, 153, 0.2) !important;
            transition: all 0.3s !important;
            width: 100%;
        }
        .main .stButton>button:hover, .main .stDownloadButton>button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 12px -1px rgba(52, 211, 153, 0.3) !important;
        }
        
        /* Custom CSS table override */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
        }
        th {
            background-color: #064E3B !important;
            color: #34D399 !important;
            font-weight: 700 !important;
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid #34D399;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #232E48;
            color: #CBD5E1;
        }
        tr:nth-child(even) {
            background-color: #0F1524;
        }
        
        /* Style the sidebar button (Theme toggle) to be a beautiful circular icon button */
        [data-testid="stSidebar"] [data-testid="stButton"] {
            text-align: center;
            display: flex;
            justify-content: center;
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
        [data-testid="stSidebar"] [data-testid="stButton"] button {
            background-color: #1E293B !important;
            color: #F8FAFC !important;
            border: 1px solid #334155 !important;
            border-radius: 50% !important;
            width: 50px !important;
            height: 50px !important;
            min-width: 50px !important;
            min-height: 50px !important;
            padding: 0 !important;
            font-size: 1.6rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
            transition: all 0.3s ease !important;
        }
        [data-testid="stSidebar"] [data-testid="stButton"] button:hover {
            transform: scale(1.1) rotate(-15deg) !important;
            border-color: #34D399 !important;
            box-shadow: 0 8px 12px -1px rgba(52, 211, 153, 0.3) !important;
        }
        
        /* Tabs styling in Dark Mode */
        div.stTabs [data-baseweb="tab"] {
            color: #94A3B8 !important;
            font-weight: 600 !important;
        }
        div.stTabs [aria-selected="true"] {
            color: #34D399 !important;
            border-bottom-color: #34D399 !important;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #111827;
        }
        ::-webkit-scrollbar-thumb {
            background: #374151;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #4B5563;
        }
        
        /* Text selection color */
        ::selection {
            background-color: #065F46 !important;
            color: #34D399 !important;
        }
        
        /* Custom card metric text and alignment */
        .card-metric-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: #94A3B8 !important;
            text-transform: uppercase;
        }
        .card-metric-value {
            font-size: 2.2rem;
            font-weight: 800;
            margin: 0.5rem 0;
            color: #F8FAFC !important;
        }
        .metric-top-card {
            border-top: 4px solid #34D399 !important;
        }
    </style>
    """, unsafe_allow_html=True)


# --- BADGE MARKER HELPER ---
def get_badge_html(class_text):
    class_clean = class_text.lower()
    if "normal" in class_clean or "bom" in class_clean or "excelente" in class_clean:
        bg, fg = "#D1FAE5", "#065F46"  # Emerald
    elif "elevado" in class_clean or "sobrepeso" in class_clean or "moderado" in class_clean or "alto" in class_clean:
        bg, fg = "#FEF3C7", "#D97706"  # Amber
    elif "crítico" in class_clean or "obesidade" in class_clean or "muito alto" in class_clean:
        bg, fg = "#FEE2E2", "#991B1B"  # Rose
    else:
        bg, fg = "#DBEAFE", "#1E40AF"  # Blue (Abaixo/Atleta)
    return f'<span style="background-color: {bg}; color: {fg}; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 700;">{class_text}</span>'


# --- STREAMLIT UI ---

# Header banner
st.markdown("""
<div class="title-banner">
    <h1>Nutri Caldas 🍏</h1>
    <p>Avaliação Antropométrica e Planejamento Nutricional Inteligente</p>
</div>
""", unsafe_allow_html=True)

st.markdown("<p style='text-align: center; color: #6B7280; font-size: 1.1rem; margin-top: -1rem; margin-bottom: 2rem;'>Sua jornada de saúde personalizada e orientada a dados metabólicos reais.</p>", unsafe_allow_html=True)

# Sidebar configurations
with st.sidebar:
    st.markdown("---")
    st.markdown("<h3 style='font-weight: 700; margin-bottom: 0.5rem;'>⚙️ Configurações</h3>", unsafe_allow_html=True)

    model_choice = st.selectbox(
        "Selecione o Modelo LLM:",
        ["gemini-2.5-flash", "gemma-4-31b-it"],
        index=0,
        help="gemini-2.5-flash é o modelo recomendado e verificado para esta aplicação."
    )

    temp_choice = st.slider(
        "Temperatura do Modelo:",
        min_value=0.0,
        max_value=1.0,
        value=0.0,
        step=0.1,
        help="Valores mais baixos geram respostas mais precisas e focadas nas diretrizes científicas."
    )

    input_method = st.radio(
        "Método de Entrada:",
        ["Preenchimento Manual (Formulário)", "Upload de Arquivo (Relatório .txt)"],
        index=0
    )

    st.markdown("---")
    st.markdown("<div style='text-align: center; color: #6B7280; font-size: 0.85rem;'>Desenvolvido por Nutri Caldas &copy; 2026</div>", unsafe_allow_html=True)

# Initialize Session States
if "stage1_result" not in st.session_state:
    st.session_state.stage1_result = ""
if "stage2_result" not in st.session_state:
    st.session_state.stage2_result = ""
if "formatted_report" not in st.session_state:
    st.session_state.formatted_report = ""
if "patient_name" not in st.session_state:
    st.session_state.patient_name = ""

# Input details container
with st.container():
    st.markdown("<div class='section-header'>📋 Informações e Dados Físicos</div>", unsafe_allow_html=True)

    # 2 columns for profile details
    col_name, col_age, col_sex = st.columns([2, 1, 1])
    with col_name:
        patient_name = st.text_input("Nome Completo do Paciente:", value=st.session_state.patient_name or "Paciente Exemplo")
        st.session_state.patient_name = patient_name
    with col_age:
        patient_age = st.number_input("Idade (anos):", min_value=1, max_value=120, value=25)
    with col_sex:
        patient_sex = st.selectbox("Sexo Biológico:", ["Masculino", "Feminino"], index=0)

    col_goal, col_activity = st.columns(2)
    with col_goal:
        patient_goal = st.selectbox(
            "Objetivo Principal:",
            ["Recomposição Corporal", "Emagrecimento / Queima de Gordura", "Hipertrofia / Ganho de Massa Magra", "Saúde e Qualidade de Vida"],
            index=0
        )
    with col_activity:
        patient_activity = st.selectbox(
            "Nível de Atividade Física:",
            ["Sedentário (pouco ou nenhum exercício)", "Levemente ativo (exercício 1-3 dias/semana)", "Moderadamente ativo (exercício 3-5 dias/semana)", "Altamente ativo (exercício intenso 6-7 dias/semana)", "Atleta / Muito ativo (treino duplo diário)"],
            index=2
        )

    personal_data = {
        "idade": patient_age,
        "sexo": patient_sex,
        "goal": patient_goal,
        "activity": patient_activity
    }

    # Manual Form Mode
    if input_method == "Preenchimento Manual (Formulário)":
        st.markdown("<p style='font-size: 0.95rem; margin-top: 1rem;'>Preencha as medições corporais abaixo para gerar a análise:</p>", unsafe_allow_html=True)

        tab_antro, tab_dobras, tab_perimetros = st.tabs([
            "📊 1. Antropometria & Composição",
            "📏 2. Dobras Cutâneas (mm)",
            "🔄 3. Perímetros / Circunferências (cm)"
        ])

        with tab_antro:
            col_w, col_h, col_bf = st.columns(3)
            with col_w:
                weight = st.number_input("Peso Atual (kg):", min_value=1.0, max_value=300.0, value=78.2, step=0.1)
            with col_h:
                height = st.number_input("Altura (m):", min_value=0.5, max_value=2.50, value=1.74, step=0.01)
            with col_bf:
                bf = st.number_input("Percentual de Gordura Estimado (%BF):", min_value=1.0, max_value=60.0, value=22.73, step=0.01)

            # Show real-time IMC
            if height > 0:
                imc = weight / (height ** 2)
                imc_class = get_imc_classification(imc)
                st.markdown(f"""
                <div style='background-color: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 8px; border-left: 5px solid #10B981; margin-top: 1rem;'>
                    <span style='font-weight: 700; margin-right: 10px;'>IMC Calculado:</span>
                    <strong style='font-size: 1.1rem;'>{imc:.2f} kg/m²</strong>
                    <span style='margin-left: 10px;'>{get_badge_html(imc_class)}</span>
                </div>
                """, unsafe_allow_html=True)

            antro_data = {"peso": weight, "altura": height, "bf": bf}

        with tab_dobras:
            st.info("Insira as medidas de dobras cutâneas em milímetros. Valores nulos serão automaticamente ignorados no relatório.")
            col_d1, col_d2, col_d3 = st.columns(3)
            with col_d1:
                triciptal = st.number_input("Triciptal (mm):", min_value=0.0, value=19.0, step=0.1)
                subescapular = st.number_input("Subescapular (mm):", min_value=0.0, value=25.0, step=0.1)
                axilar_media = st.number_input("Axilar Média (mm):", min_value=0.0, value=19.0, step=0.1)
            with col_d2:
                abdominal = st.number_input("Abdominal (mm):", min_value=0.0, value=37.0, step=0.1)
                coxa = st.number_input("Coxa (mm):", min_value=0.0, value=25.0, step=0.1)
                supra_iliaca = st.number_input("Supra-ilíaca (mm):", min_value=0.0, value=37.0, step=0.1)
            with col_d3:
                peitoral = st.number_input("Peitoral (mm):", min_value=0.0, value=10.0, step=0.1)
                bicipital = st.number_input("Bicipital (mm):", min_value=0.0, value=0.0, step=0.1)
                panturrilha = st.number_input("Panturrilha (mm):", min_value=0.0, value=0.0, step=0.1)

            dobras_data = {
                "triciptal": triciptal,
                "subescapular": subescapular,
                "axilar_media": axilar_media,
                "abdominal": abdominal,
                "coxa": coxa,
                "supra_iliaca": supra_iliaca,
                "peitoral": peitoral,
                "bicipital": bicipital,
                "panturrilha": panturrilha
            }

        with tab_perimetros:
            st.info("Insira as medidas de circunferências/perímetros em centímetros.")
            col_p1, col_p2, col_p3 = st.columns(3)
            with col_p1:
                torax = st.number_input("Tórax (cm):", min_value=0.0, value=102.0, step=0.1)
                cintura = st.number_input("Cintura (cm):", min_value=0.0, value=85.0, step=0.1)
                abdomen_c = st.number_input("Abdômen (cm):", min_value=0.0, value=94.0, step=0.1)
                quadril = st.number_input("Quadril (cm):", min_value=0.0, value=104.0, step=0.1)
            with col_p2:
                braco_dir_cont = st.number_input("Braço Direito Contraído (cm):", min_value=0.0, value=33.0, step=0.1)
                braco_esq_cont = st.number_input("Braço Esquerdo Contraído (cm):", min_value=0.0, value=33.0, step=0.1)
                braco_dir_rel = st.number_input("Braço Direito Relaxado (cm):", min_value=0.0, value=32.5, step=0.1)
                braco_esq_rel = st.number_input("Braço Esquerdo Relaxado (cm):", min_value=0.0, value=32.5, step=0.1)
            with col_p3:
                antibraco_dir = st.number_input("Antebraço Direito (cm):", min_value=0.0, value=25.0, step=0.1)
                antibraco_esq = st.number_input("Antebraço Esquerdo (cm):", min_value=0.0, value=25.0, step=0.1)
                coxa_dir = st.number_input("Coxa Direita (cm):", min_value=0.0, value=62.0, step=0.1)
                coxa_esq = st.number_input("Coxa Esquerda (cm):", min_value=0.0, value=62.0, step=0.1)
                panturrilha_dir = st.number_input("Panturrilha Direita (cm):", min_value=0.0, value=39.5, step=0.1)
                panturrilha_esq = st.number_input("Panturrilha Esquerda (cm):", min_value=0.0, value=38.0, step=0.1)
                escapular = st.number_input("Escapular (cm):", min_value=0.0, value=44.0, step=0.1)

            perimetros_data = {
                "torax": torax,
                "cintura": cintura,
                "abdomen": abdomen_c,
                "quadril": quadril,
                "braco_dir_cont": braco_dir_cont,
                "braco_esq_cont": braco_esq_cont,
                "braco_dir_rel": braco_dir_rel,
                "braco_esq_rel": braco_esq_rel,
                "antibraco_dir": antibraco_dir,
                "antibraco_esq": antibraco_esq,
                "coxa_dir": coxa_dir,
                "coxa_esq": coxa_esq,
                "panturrilha_dir": panturrilha_dir,
                "panturrilha_esq": panturrilha_esq,
                "escapular": escapular
            }

        # Format report text
        formatted_report_text, calculated_imc = format_manual_report(personal_data, antro_data, dobras_data, perimetros_data)
        st.session_state.formatted_report = formatted_report_text

    # File Upload Mode
    else:
        st.markdown("<p style='font-size: 0.95rem; margin-top: 1rem;'>Faça upload do relatório em formato de texto para processamento:</p>", unsafe_allow_html=True)
        uploaded_file = st.file_uploader("Escolha um arquivo .txt contendo a avaliação física:", type=["txt"])

        if uploaded_file is not None:
            raw_text = uploaded_file.read().decode("utf-8")
            edited_text = st.text_area("Texto do Relatório extraído (você pode editar se necessário):", value=raw_text, height=300)
            st.session_state.formatted_report = edited_text
        else:
            st.info("💡 Dica: Para testar, você pode subir o arquivo 'bioimpedance.txt' localizado na pasta do projeto.")
            st.session_state.formatted_report = ""

    # Generate Button
    st.markdown("<div style='margin-top: 1.5rem; margin-bottom: 2rem;'>", unsafe_allow_html=True)
    if st.button("🚀 Processar Avaliação e Gerar Dieta"):
        if not st.session_state.formatted_report:
            st.error("Erro: Nenhum relatório físico carregado ou preenchido. Por favor, insira seus dados ou faça upload de um arquivo.")
        else:
            try:
                # Stage 1 Spinner
                with st.spinner("🧠 Etapa 1: Analisando Composição Corporal e Extraindo Métricas Científicas..."):
                    stage1_output = run_stage1_analysis(
                        st.session_state.formatted_report,
                        model_choice,
                        temp_choice,
                        patient_age,
                        patient_sex
                    )
                    st.session_state.stage1_result = stage1_output

                # Stage 2 Spinner
                with st.spinner("🍳 Etapa 2: Calculando Diretrizes Macronutricionais e Estruturando Dieta Personalizada..."):
                    stage2_output = run_stage2_diet(
                        st.session_state.stage1_result,
                        personal_data,
                        model_choice,
                        temp_choice
                    )
                    st.session_state.stage2_result = stage2_output

                st.success("✅ Planejamento Nutricional gerado com sucesso!")

            except Exception as e:
                st.error(f"Erro ao processar com a LLM: {str(e)}")
                st.info("Verifique se a API Key no arquivo .env está configurada e se a internet está funcionando.")
    st.markdown("</div>", unsafe_allow_html=True)


# --- OUTPUT DASHBOARD ---
if st.session_state.stage1_result and st.session_state.stage2_result:
    st.markdown("<div class='section-header'>🎯 Painel de Resultados - Nutri Caldas</div>", unsafe_allow_html=True)

    tab_results_1, tab_results_2, tab_results_3 = st.tabs([
        "📊 1. Análise Corporal & Métricas",
        "🍎 2. Planejamento Alimentar & Metas",
        "💾 3. Exportar & Salvar PDF"
    ])

    with tab_results_1:
        st.markdown("<h3 style='font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem;'>Diagnóstico da Composição Corporal</h3>", unsafe_allow_html=True)

        # Parse BMI and BF values out of Stage 1 text for custom dashboard widget
        imc_val, imc_class, bf_val, bf_class = parse_extraction_metrics(st.session_state.stage1_result)

        if imc_val != "N/A" or bf_val != "N/A":
            st.markdown(f"""
            <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div class="card metric-top-card" style="flex: 1; text-align: center;">
                    <div class="card-metric-title">Índice de Massa Corporal (IMC)</div>
                    <div class="card-metric-value">{imc_val}</div>
                    <div>{get_badge_html(imc_class)}</div>
                </div>
                <div class="card metric-top-card" style="flex: 1; text-align: center;">
                    <div class="card-metric-title">Percentual de Gordura (%BF)</div>
                    <div class="card-metric-value">{bf_val}</div>
                    <div>{get_badge_html(bf_class)}</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

        # Display the main scientific classifications markdown inside a beautiful card wrapper
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        st.markdown(st.session_state.stage1_result)
        st.markdown("</div>", unsafe_allow_html=True)

    with tab_results_2:
        st.markdown("<h3 style='font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem;'>Parecer Nutricional, Macronutrientes e Refeições</h3>", unsafe_allow_html=True)

        # Extract macros dynamically to display in card format
        calories, protein, carbs, fats = parse_macro_metrics(st.session_state.stage2_result)

        # Display Macro stats in beautiful cards
        st.markdown(f"""
        <div class="macro-container">
            <div class="macro-card" style="border-top-color: #10B981;">
                <div class="macro-title">🔥 Estratégia Calórica</div>
                <div class="macro-value">{calories}</div>
            </div>
            <div class="macro-card" style="border-top-color: #EF4444;">
                <div class="macro-title">🥩 Proteínas</div>
                <div class="macro-value">{protein}</div>
            </div>
            <div class="macro-card" style="border-top-color: #3B82F6;">
                <div class="macro-title">🍞 Carboidratos</div>
                <div class="macro-value">{carbs}</div>
            </div>
            <div class="macro-card" style="border-top-color: #F59E0B;">
                <div class="macro-title">🥑 Gorduras</div>
                <div class="macro-value">{fats}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Hydration Target Box
        peso_calc = 78.2
        if input_method == "Preenchimento Manual (Formulário)":
            peso_calc = weight
        else:
            weight_match = re.search(r'Peso Atual:\s*([\d,.]+)\s*kg', st.session_state.formatted_report, re.IGNORECASE)
            if weight_match:
                peso_calc = float(weight_match.group(1).replace(',', '.'))

        agua_l = (peso_calc * 35) / 1000.0

        st.markdown(f"""
        <div class="hydration-card">
            <div class="hydration-icon">💧</div>
            <div class="hydration-text">
                <h4>Meta de Hidratação Diária Recomendada</h4>
                <p>{agua_l:.2f} Litros / dia (mínimo de {int(agua_l * 4)} copos de 250ml)</p>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Parse output structure into Parecer and Meal Plan and display nicely
        full_diet_text = st.session_state.stage2_result

        meal_plan_section = ""
        parecer_section = ""

        if "## Plano Alimentar" in full_diet_text:
            parts = full_diet_text.split("## Plano Alimentar")
            parecer_section = parts[0]
            meal_plan_section = "## Plano Alimentar" + parts[1]
        elif "## Plano Alimentar Sugerido" in full_diet_text:
            parts = full_diet_text.split("## Plano Alimentar Sugerido")
            parecer_section = parts[0]
            meal_plan_section = "## Plano Alimentar Sugerido" + parts[1]
        else:
            parecer_section = full_diet_text

        col_left, col_right = st.columns(2)

        with col_left:
            st.markdown("<div class='card'>", unsafe_allow_html=True)
            st.markdown(parecer_section)
            st.markdown("</div>", unsafe_allow_html=True)

        with col_right:
            if meal_plan_section:
                st.markdown("<div class='card'>", unsafe_allow_html=True)
                st.markdown(meal_plan_section)
                st.markdown("</div>", unsafe_allow_html=True)
            else:
                st.info("Veja o plano alimentar completo na seção à esquerda.")

    with tab_results_3:
        st.markdown("<h3 style='font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem;'>Gerar Relatório em PDF</h3>", unsafe_allow_html=True)
        st.write("Baixe a análise corporal completa e o planejamento dietético estruturado em um arquivo PDF profissional para salvar no seu celular ou imprimir.")

        try:
            pdf_bytes = generate_pdf_bytes(
                st.session_state.patient_name,
                personal_data,
                st.session_state.formatted_report,
                st.session_state.stage1_result,
                st.session_state.stage2_result
            )

            clean_filename = f"Plano_Nutricional_{st.session_state.patient_name.replace(' ', '_')}.pdf"
            st.download_button(
                label="📥 Baixar Plano Nutricional Completo (PDF)",
                data=pdf_bytes,
                file_name=clean_filename,
                mime="application/pdf"
            )
        except Exception as e:
            st.error(f"Erro ao gerar o arquivo PDF: {str(e)}")
            st.info("Você ainda pode copiar as informações diretamente das abas acima.")
