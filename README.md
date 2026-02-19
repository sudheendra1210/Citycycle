# ♻️ CityCycle: Smart Waste Management System

**CityCycle** is a high-fidelity, full-stack application designed to revolutionize urban waste collection. It leverages IoT sensor data, advanced Machine Learning models, and interactive GIS mapping to optimize collection routes, predict bin fill levels, and improve city-wide waste management efficiency.

---

## 🚀 Key Features

- **🌐 Interactive Satellite Mapping**: High-quality mapping of all waste bins using Esri World Imagery with detailed road and landmark labels.
- **📍 Dynamic Bin Seeding**: Automatically generates test bins within **2km of your actual location** for realistic testing.
- **👤 Smart User Profile**:
  - **New User Flow**: Auto-redirects new users to set their name upon first login.
  - **Hybrid Auth**: Supports both Clerk (Social/Email) and Custom Phone OTP authentication.
  - **Profile Management**: Editable user details and real-time updates.
- **📊 ML-Powered Forecasting**: Predictive analytics that forecast bin fill levels using multiple machine learning models (Random Forest, XGBoost).
- **⚡ Real-time Monitoring**: Live dashboard showing current bin status, fill levels, and collection efficiency metrics.
- **🚨 Complaint Management**: Fully functional citizen portal for submitting and tracking waste-related complaints.
- **📱 Responsive UI**: A premium dark-themed dashboard with glassmorphism, gradient accents, and modern aesthetics.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Mapping**: Leaflet with Esri Satellite Tiles
- **State Management**: React Hooks & Context API (AuthContext, LocationContext)
- **Styling**: Tailwind CSS + Custom Dark Theme
- **Visualization**: Recharts for analytical data
- **Auth**: Clerk (Email/Social) + Custom Axios Interceptors (Phone Auth)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Hybrid (Clerk JWT + Custom JWT for Phone)
- **ML/Data**: Scikit-learn, Pandas, NumPy
- **SMS**: Twilio Integration for OTPs

---

## 📁 Project Structure

```text
├── 📂 backend
│   ├── 📂 app            # FastAPI Application Core
│   │   ├── 📂 models     # SQLAlchemy Models
│   │   ├── 📂 routes     # API Endpoints (Auth, Bins, Complaints)
│   │   └── 📂 utils      # Database & ML Helpers
│   ├── main.py           # Server Entry Point
│   └── requirements.txt  # Python Dependencies
│
├── 📂 frontend
│   ├── 📂 src
│   │   ├── 📂 components # Reusable UI Components
│   │   ├── 📂 pages      # Main Dashboard Pages (Dashboard, Bins, Profile)
│   │   ├── 📂 services   # API Connection logic
│   │   └── 📂 contexts   # Auth & Location State
│   └── package.json      # Vite/React configuration
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Python 3.8+
- Node.js 16+
- Twilio Account (for SMS) & Clerk Account (for Auth)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv
# Activate (Windows)
.\venv\Scripts\activate 

# Install dependencies
pip install -r requirements.txt

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

## 🧪 How to Test

### 1. New User Flow
- Sign up with a new phone number.
- You will be automatically redirected to a **"Welcome" screen** to enter your name.
- Once saved, your name appears in the Sidebar and Profile.

### 2. Dynamic Bin Seeding
- Go to the **Bins** page.
- If no bins exist, you'll see a **"Generate Test Bins"** button.
- Click it -> Allow Location Permission.
- 10 test bins will be created within **2km of your location**.

### 3. Phone Authentication
- Use the **Phone Login** option.
- Enter your mobile number -> Receive OTP (simulated in backend console if using trial account).
- Enter OTP to login.

---

## 🛡️ License
Built for the **Integrated Project** initiative. 

© 2026 **CityCycle** | Management System v1.0