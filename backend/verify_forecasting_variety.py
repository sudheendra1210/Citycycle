import requests
import json

BASE_URL = "http://localhost:8000"

def get_bins():
    res = requests.get(f"{BASE_URL}/api/bins")
    return res.json()

def check_forecasting_variety():
    bins = get_bins()
    if not bins:
        print("No bins found")
        return
    
    # Check first 3 bins
    for bin_info in bins[:3]:
        bin_id = bin_info['bin_id']
        print(f"\nChecking Bin: {bin_id}")
        
        # Check different models
        for model in ['linear', 'forest']:
            url = f"{BASE_URL}/api/forecasting/historical-vs-predicted/{bin_id}?model_type={model}"
            try:
                res = requests.get(url)
                if res.status_code == 200:
                    data = res.json()
                    hist_count = len(data.get('historical', []))
                    pred_count = len(data.get('predicted', []))
                    current = data.get('current_fill_level')
                    pred_val = data.get('predicted_fill_level')
                    
                    print(f"  Model: {model}")
                    print(f"    Historical points: {hist_count}")
                    print(f"    Predicted points: {pred_count}")
                    print(f"    Current Level: {current}%")
                    print(f"    Predicted Level: {pred_val}%")
                    
                    # Print first 2 historical points to see variety
                    if hist_count > 0:
                        vals = [p['fill_level_percent'] for p in data['historical'][:5]]
                        print(f"    First few hist values: {vals}")
                else:
                    print(f"  Model {model}: Error {res.status_code} - {res.text}")
            except Exception as e:
                print(f"  Model {model}: Failed - {e}")

if __name__ == "__main__":
    check_forecasting_variety()
