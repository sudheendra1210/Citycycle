from app.utils.database import SessionLocal
from app.models.database_models import BinReading
from datetime import datetime, timedelta

def verify():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        last_week = now - timedelta(days=7)
        count = db.query(BinReading).filter(BinReading.timestamp >= last_week).count()
        print(f"Readings in the last 7 days: {count}")
    finally:
        db.close()

if __name__ == "__main__":
    verify()
