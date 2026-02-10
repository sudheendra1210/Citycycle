import sqlite3
import requests
import time

def reverse_geocode(lat, lng):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lng}&zoom=18&addressdetails=1"
        headers = {'User-Agent': 'SmartWasteManagement/1.0'}
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            addr = data.get('address', {})
            locality = addr.get('suburb') or addr.get('neighbourhood') or addr.get('city_district') or addr.get('residential') or addr.get('village') or addr.get('county') or addr.get('city') or "Unknown Area"
            return locality
    except Exception as e:
        print(f"Error geocoding {lat}, {lng}: {e}")
    return "Local Area"

def migrate_bins():
    conn = sqlite3.connect('backend/waste_management.db')
    cursor = conn.cursor()
    
    # Check if area_name column exists, if not add it (though SQLAlchemy should handle it on restart)
    try:
        cursor.execute("ALTER TABLE bins ADD COLUMN area_name TEXT")
    except sqlite3.OperationalError:
        pass # Already exists
        
    cursor.execute("SELECT bin_id, latitude, longitude FROM bins WHERE area_name IS NULL")
    bins = cursor.fetchall()
    
    print(f"Found {len(bins)} bins to migrate...")
    
    for bin_id, lat, lng in bins:
        area = reverse_geocode(lat, lng)
        print(f"Bin {bin_id}: {lat}, {lng} -> {area}")
        cursor.execute("UPDATE bins SET area_name = ? WHERE bin_id = ?", (area, bin_id))
        conn.commit()
        time.sleep(1) # Respect Nominatim rate limits
        
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate_bins()
