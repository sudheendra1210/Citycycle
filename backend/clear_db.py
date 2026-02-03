import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.database import SessionLocal, engine, Base
from sqlalchemy import text

def clear_database():
    print("Clearing database tables...")
    db = SessionLocal()
    try:
        # Delete all records from all tables in correct order
        db.execute(text("DELETE FROM bin_readings"))
        db.execute(text("DELETE FROM collections"))
        db.execute(text("DELETE FROM gps_logs"))
        db.execute(text("DELETE FROM complaints"))
        db.execute(text("DELETE FROM bins"))
        db.execute(text("DELETE FROM vehicles"))
        db.commit()
        print("✓ All tables cleared")
    except Exception as e:
        print(f"Error clearing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_database()
