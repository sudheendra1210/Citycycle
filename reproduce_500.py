import os
import sys
from datetime import datetime, timedelta

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Mock env vars
os.environ['DATABASE_URL'] = 'sqlite:///./waste_management.db'
os.environ['JWT_SECRET'] = 'test_secret'

from app.utils.database import SessionLocal
from app.models.database_models import User, UserRole
from app.routes.auth import send_phone_otp, PhoneRequest

def reproduce():
    db = SessionLocal()
    try:
        print("Starting reproduction...")
        data = PhoneRequest(phone="+917285961686")
        result = send_phone_otp(data, db)
        print("Result:", result)
    except Exception as e:
        print("CAUGHT EXCEPTION:")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    reproduce()
