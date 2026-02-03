# ♻️ CityCycle: Smart Waste Management System

**CityCycle** is a high-fidelity, full-stack application designed to revolutionize urban waste collection. It leverages IoT sensor data, advanced Machine Learning models, and interactive GIS mapping to optimize collection routes, predict bin fill levels, and improve city-wide waste management efficiency.

---

## 🚀 Key Features

- **🌐 Interactive Satellite Mapping**: High-quality mapping of all waste bins using Esri World Imagery with detailed road and landmark labels—centered specifically for **Hyderabad, India**.
- **📊 ML-Powered Forecasting**: Predictive analytics that forecast bin fill levels using multiple machine learning models (Random Forest, XGBoost, etc.).
- **⚡ Real-time Monitoring**: Live dashboard showing current bin status, fill levels, and collection efficiency metrics.
- **🚨 Complaint Management**: Fully functional citizen portal for submitting and tracking waste-related complaints.
- **📱 Responsive UI**: A premium dark-themed dashboard with glassmorphism, gradient accents, and modern aesthetics.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Mapping**: Leaflet with Esri Satellite Tiles
- **State Management**: React Hooks & Context API
- **Styling**: Vanilla CSS (Inline styles for robustness) & Tailwind CSS
- **Visualization**: Recharts for analytical data and forecasting charts
- **Auth**: Supabase Authentication

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **ML/Data**: Scikit-learn, Pandas, NumPy
- **Storage**: Supabase Integration

---

## 📁 Project Structure

```text
├── 📂 backend
│   ├── 📂 app            # FastAPI Application Core
│   │   ├── 📂 models     # SQLAlchemy Models
│   │   ├── 📂 routes     # API Endpoints
│   │   └── 📂 utils      # Database & ML Helpers
│   ├── main.py           # Server Entry Point
│   ├── seed_database.py  # Data Seeding Script (Hyderabad Config)
│   └── requirements.txt  # Python Dependencies
│
├── 📂 frontend
│   ├── 📂 src
│   │   ├── 📂 components # Reusable UI Components (Charts, Map, Layout)
│   │   ├── 📂 pages      # Main Dashboard Pages
│   │   ├── 📂 services   # API Connection logic
│   │   └── App.jsx       # Root Component
│   ├── 📄 .env           # Environment Variables
│   └── package.json      # Vite/React configuration
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Python 3.8+
- Node.js 16+
- Supabase Account (for DB/Auth)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv
# Activate (Windows)
venv\Scripts\activate 

# Install dependencies
pip install -r requirements.txt

# Seed the database with Hyderabad data
python seed_database.py

# Run the server
python main.py
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the developer server
npm run dev
```

---

## 🛡️ License
Built for the **Integrated Project** initiative. 

© 2026 **CityCycle** | Management System v1.0