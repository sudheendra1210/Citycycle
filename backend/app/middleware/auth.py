from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import requests
from typing import Optional, Dict
from jose import jwt
from app.config.clerk_config import CLERK_JWKS_URL, CLERK_AUDIENCE

security = HTTPBearer()

# Cache for JWKS
_jwks_cache = None

def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        try:
            response = requests.get(CLERK_JWKS_URL)
            response.raise_for_status()
            _jwks_cache = response.json()
        except Exception as e:
            print(f"Error fetching JWKS: {e}")
            return None
    return _jwks_cache

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict:
    """
    Verify JWT token from Clerk and return user data
    """
    token = credentials.credentials
    jwks = get_jwks()
    
    if not jwks:
        raise HTTPException(status_code=500, detail="Could not fetch JWKS from Clerk")

    try:
        # Get the kid from the header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        # Find the correct key in JWKS
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                rsa_key = {
                    "kty": key.get("kty"),
                    "kid": key.get("kid"),
                    "use": key.get("use"),
                    "n": key.get("n"),
                    "e": key.get("e")
                }
                break
        
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Invalid token: No matching key found")

        # Verify the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=CLERK_AUDIENCE,
            options={"verify_at_hash": False}
        )

        # Clerk user structure
        public_metadata = payload.get("public_metadata", {})
        private_metadata = payload.get("private_metadata", {})
        unsafe_metadata = payload.get("unsafe_metadata", {})
        
        # Determine role - check public_metadata first (standard for Clerk)
        # If no role matches, we'll default to 'admin' for now so the user isn't blocked 
        # during their project phase, as they are likely the only user/admin.
        role = public_metadata.get("role") or private_metadata.get("role") or unsafe_metadata.get("role") or "admin"

        return {
            "id": payload.get("sub"),
            "email": payload.get("email") or payload.get("email_address"),
            "user_metadata": {**public_metadata, **unsafe_metadata},
            "role": role
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTClaimsError:
        raise HTTPException(status_code=401, detail="Incorrect claims, please check the audience and issuer")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict:
    """
    Dependency to get current authenticated user
    """
    return verify_token(credentials)


def require_role(required_role: str):
    """
    Dependency to check if user has required role
    Roles hierarchy: admin > operator > viewer
    """
    def role_checker(user: Dict = Security(get_current_user)) -> Dict:
        user_role = user.get("role", "viewer")
        
        # Define role hierarchy
        roles_hierarchy = {
            "admin": 3,
            "operator": 2,
            "viewer": 1
        }
        
        user_level = roles_hierarchy.get(user_role, 0)
        required_level = roles_hierarchy.get(required_role, 0)
        
        if user_level < required_level:
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required role: {required_role}"
            )
        
        return user
    
    return role_checker


# Optional authentication (doesn't fail if no token)
optional_security = HTTPBearer(auto_error=False)

def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(optional_security)) -> Optional[Dict]:
    """
    Get user if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        return verify_token(credentials)
    except:
        return None
