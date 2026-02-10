import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoints():
    endpoints = [
        ("/api/analytics/dashboard", "GET"),
        ("/api/analytics/alerts", "GET"),
        ("/api/analytics/map/bins", "GET"),
        ("/api/predictions/all-bins", "GET"),
    ]
    
    for endpoint, method in endpoints:
        url = f"{BASE_URL}{endpoint}"
        print(f"Testing {method} {url}...")
        try:
            if method == "GET":
                response = requests.get(url)
            else:
                response = requests.post(url)
            
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Response (first 100 chars): {str(data)[:100]}...")
            else:
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"Request failed: {e}")
        print("-" * 20)

if __name__ == "__main__":
    test_endpoints()
