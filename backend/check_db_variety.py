import sqlite3
import pandas as pd

def check_db_variety():
    conn = sqlite3.connect('waste_management.db')
    
    # Check 3 different bins
    bin_ids = ['BIN_001', 'BIN_003', 'BIN_005']
    
    for bin_id in bin_ids:
        print(f"\nBin: {bin_id}")
        query = f"SELECT fill_level_percent, timestamp FROM bin_readings WHERE bin_id = '{bin_id}' ORDER BY timestamp DESC LIMIT 5"
        df = pd.read_sql_query(query, conn)
        print(df)
        
    conn.close()

if __name__ == "__main__":
    check_db_variety()
