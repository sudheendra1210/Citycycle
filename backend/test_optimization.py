import requests
import json

BASE_URL = "http://localhost:8000"

def test_optimization():
    url = f"{BASE_URL}/api/predictions/route-optimization"
    payload = {
        "vehicle_id": "V-001",
        "threshold": 40.0  # Lower threshold to ensure we find some bins
    }
    
    print(f"Testing POST {url} with threshold {payload['threshold']}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Total Bins to Collect: {len(data['bins_to_collect'])}")
            print(f"Total Distance: {data['total_distance_km']} km")
            if data['optimized_sequence']:
                print(f"First bin in sequence: {data['optimized_sequence'][0]['bin_id']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_optimization()
