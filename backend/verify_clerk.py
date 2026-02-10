import requests
from app.config.clerk_config import CLERK_JWKS_URL

def verify_jwks():
    print(f"Attempting to fetch JWKS from: {CLERK_JWKS_URL}")
    try:
        response = requests.get(CLERK_JWKS_URL)
        response.raise_for_status()
        jwks = response.json()
        print("Successfully fetched JWKS!")
        print(f"Number of keys found: {len(jwks.get('keys', []))}")
        for key in jwks.get('keys', []):
            print(f"- Key ID (kid): {key.get('kid')}")
        return True
    except Exception as e:
        print(f"Error fetching JWKS: {e}")
        return False

if __name__ == "__main__":
    verify_jwks()
