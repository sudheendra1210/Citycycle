# How to Run Smart Waste Management System

## Prerequisites
- Node.js (for the Frontend)
- Python 3.10+ (for the Backend)

## 1. Setup Backend
Open a terminal in the `backend` folder.

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python main.py
```
The backend server will start at `http://localhost:8000`.

## 2. Setup Frontend
Open a NEW terminal in the `frontend` folder.

```bash
cd frontend

# Create .env file
# Duplicate the .env.example file or create a new .env file with the keys provided by the sender.

npm install
npm run dev
```
The frontend will run at `http://localhost:5173`.

## 3. Access the App
Open `http://localhost:5173` in your browser.
