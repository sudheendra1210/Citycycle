from app.utils.database import SessionLocal
from app.models.database_models import BinReading
from datetime import datetime, timedelta
import random

def fix_data():
    db = SessionLocal()
    try:
        readings = db.query(BinReading).all()
        if not readings:
            print("No readings to fix.")
            return
            
        now = datetime.utcnow()
        print(f"Updating {len(readings)} readings to be more recent...")
        
        # Spread readings over the last 10 days
        for i, reading in enumerate(readings):
            # i % 240 gives us some distribution
            days_ago = (i % 10)
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)
            
            new_ts = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
            reading.timestamp = new_ts
            
        db.commit()
        print("Success! Data updated.")
        
    finally:
        db.close()

if __name__ == "__main__":
    fix_data()
