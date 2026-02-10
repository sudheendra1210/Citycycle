from app.utils.database import SessionLocal
from app.models.database_models import Bin, BinReading
from sqlalchemy import func

def check_data():
    db = SessionLocal()
    try:
        total_bins = db.query(Bin).count()
        total_readings = db.query(BinReading).count()
        print(f"Total Bins: {total_bins}")
        print(f"Total Readings: {total_readings}")
        
        # Check readings per bin
        readings_per_bin = db.query(
            BinReading.bin_id, 
            func.count(BinReading.id).label('count')
        ).group_by(BinReading.bin_id).all()
        
        print("\nReadings per bin:")
        for bin_id, count in readings_per_bin:
            print(f"- {bin_id}: {count} readings")
            
        if not readings_per_bin:
            print("No readings found in the database.")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
