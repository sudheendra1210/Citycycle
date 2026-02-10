import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_nearby_bins():
    print("\n--- Testing /bins/nearby ---")
    lat, lng = 17.3850, 78.4867 # Hydebarad coordinates
    response = requests.get(f"{BASE_URL}/bins/nearby", params={"lat": lat, "lng": lng})
    if response.status_code == 200:
        bins = response.json()
        print(f"Success: Found {len(bins)} bins nearby.")
        if bins:
            print(f"Closest bin: {bins[0]['bin_id']} at {bins[0]['distance_km']} km")
    else:
        print(f"Error {response.status_code}: {response.text}")

def test_area_analytics():
    print("\n--- Testing /analytics/area ---")
    lat, lng = 17.3850, 78.4867
    response = requests.get(f"{BASE_URL}/analytics/area", params={"lat": lat, "lng": lng})
    if response.status_code == 200:
        stats = response.json()
        print(f"Success: Area analytics fetched.")
        print(f"Avg Fill Level: {stats.get('avg_fill_level')}%")
        print(f"Weekly Generation: {stats.get('waste_generated_weekly_kg')} kg")
    else:
        print(f"Error {response.status_code}: {response.text}")

def test_bin_prediction():
    print("\n--- Testing /predict/bin-fill ---")
    # Get a bin ID first
    resp = requests.get(f"{BASE_URL}/bins")
    if resp.status_code == 200 and resp.json():
        bin_id = resp.json()[0]['bin_id']
        payload = {"bin_id": bin_id, "hours_ahead": 24}
        response = requests.post(f"{BASE_URL}/predictions/bin-fill", json=payload)
        if response.status_code == 200:
            pred = response.json()
            print(f"Success: Prediction for {bin_id} fetched.")
            print(f"Predicted Fill in 24h: {pred.get('predicted_fill_level')}%")
        else:
            print(f"Error {response.status_code}: {response.text}")
    else:
        print("Could not fetch bins for prediction test.")

if __name__ == "__main__":
    try:
        test_nearby_bins()
        test_area_analytics()
        test_bin_prediction()
    except Exception as e:
        print(f"Script failed: {e}")
        print("Make sure the backend is running at http://localhost:8000")
