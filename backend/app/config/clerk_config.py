import os
from dotenv import load_dotenv

load_dotenv()

CLERK_PUBLISHABLE_KEY = os.getenv("VITE_CLERK_PUBLISHABLE_KEY")
# Extract domain from publishable key if not provided directly
# Format: pk_test_... or pk_live_...
# The domain is often embedded or can be configured
CLERK_DOMAIN = os.getenv("CLERK_DOMAIN", "solid-krill-20.clerk.accounts.dev")
CLERK_JWKS_URL = f"https://{CLERK_DOMAIN}/.well-known/jwks.json"
CLERK_AUDIENCE = os.getenv("CLERK_AUDIENCE") # Can be null for development
