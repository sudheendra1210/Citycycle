import requests
import json

def debug_api():
    url = "http://localhost:5173/api/auth/phone/send-otp"
    payload = {"phone": "+91 7285961686"}
    headers = {"Content-Type": "application/json"}
    
    print(f"Calling {url} with {payload}...")
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        try:
            print(json.dumps(response.json(), indent=2))
        except:
            print(response.text)
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    debug_api()
