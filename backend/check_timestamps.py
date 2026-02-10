from app.utils.database import SessionLocal
from app.models.database_models import BinReading
from sqlalchemy import func
from datetime import datetime

def check_timestamps():
    db = SessionLocal()
    try:
        min_ts = db.query(func.min(BinReading.timestamp)).scalar()
        max_ts = db.query(func.max(BinReading.timestamp)).scalar()
        now = datetime.utcnow()
        
        print(f"Earliest Reading: {min_ts}")
        print(f"Latest Reading: {max_ts}")
        print(f"Current UTC Time: {now}")
        
        if max_ts:
            diff = now - max_ts
            print(f"Time since last reading: {diff}")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_timestamps()
