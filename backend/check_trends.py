import sqlite3
import pandas as pd

def check_trends():
    conn = sqlite3.connect('waste_management.db')
    
    # Check variety in first 10 bins
    query = "SELECT DISTINCT bin_id FROM bin_readings LIMIT 10"
    bin_ids = [r[0] for r in conn.execute(query).fetchall()]
    
    for bin_id in bin_ids:
        query = f"SELECT fill_level_percent FROM bin_readings WHERE bin_id = '{bin_id}' ORDER BY timestamp DESC LIMIT 50"
        df = pd.read_sql_query(query, conn)
        unique_vals = df['fill_level_percent'].unique()
        print(f"Bin: {bin_id} | Unique Fill Levels: {unique_vals} | Count: {len(df)}")
        
    conn.close()

if __name__ == "__main__":
    check_trends()
