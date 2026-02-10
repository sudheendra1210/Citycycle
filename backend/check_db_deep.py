import sqlite3
import pandas as pd

def check_db_variety():
    conn = sqlite3.connect('waste_management.db')
    
    bin_ids = ['BIN_001', 'BIN_003', 'BIN_005', 'BIN_010']
    all_data = {}
    
    for bin_id in bin_ids:
        query = f"SELECT fill_level_percent, timestamp FROM bin_readings WHERE bin_id = '{bin_id}' ORDER BY timestamp DESC LIMIT 20"
        df = pd.read_sql_query(query, conn)
        all_data[bin_id] = df
        print(f"\nBin: {bin_id}")
        print(df.head(5))
    
    # Check if BIN_001 and BIN_003 are identical
    if not all_data['BIN_001'].empty and not all_data['BIN_003'].empty:
        diff_count = (all_data['BIN_001']['fill_level_percent'] != all_data['BIN_003']['fill_level_percent']).sum()
        print(f"\nDifferences between BIN_001 and BIN_003: {diff_count}")
        
    conn.close()

if __name__ == "__main__":
    check_db_variety()
