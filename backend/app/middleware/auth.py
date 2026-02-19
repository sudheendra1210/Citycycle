from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import requests
from typing import Optional, Dict
from jose import jwt
from app.config.clerk_config import CLERK_JWKS_URL, CLERK_AUDIENCE
from app.utils.database import get_db
from sqlalchemy.orm import Session
from app.models.database_models import User, UserRole

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

def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict:
    """
    Verify JWT token from Clerk and return payload
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
            raise HTTPException(status_code=401, detail="Invalid token")

        # Verify the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=CLERK_AUDIENCE,
            options={"verify_at_hash": False}
        )
        return payload

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def verify_backend_token(token: str) -> Dict:
    """
    Verify custom JWT issued by our backend
    """
    try:
        payload = jwt.decode(
            token, 
            os.getenv("JWT_SECRET"), 
            algorithms=["HS256"]
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid backend token: {str(e)}")

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> Dict:
    """
    Dependency to get current authenticated user (Clerk or Backend)
    """
    token = credentials.credentials
    
    # Logic to distinguish between Clerk and Backend tokens
    # Custom backend tokens are HS256, Clerk tokens are RS256 with specific headers
    try:
        header = jwt.get_unverified_header(token)
        if header.get("alg") == "HS256":
            # Backend Token
            payload = verify_backend_token(token)
            user_id = payload.get("user_id")
            user = db.query(User).filter(User.id == user_id).first()
        else:
            # Clerk Token
            payload = verify_clerk_token(credentials)
            clerk_id = payload.get("sub")
            user = db.query(User).filter(User.clerk_id == clerk_id).first()
            
            if not user:
                # Sync Clerk user to DB
                email = payload.get("email") or payload.get("email_address")
                metadata = {**payload.get("public_metadata", {}), **payload.get("unsafe_metadata", {})}
                user = User(
                    clerk_id=clerk_id,
                    email=email,
                    role=metadata.get("role") or UserRole.USER,
                    area=metadata.get("area"),
                    is_phone_verified=False
                )
                db.add(user)
                db.commit()
                db.refresh(user)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "id": user.clerk_id or f"phone_{user.id}",
        "db_id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "area": user.area,
        "is_phone_verified": user.is_phone_verified
    }


def require_role(required_role: str):
    """
    Dependency to check if user has required role from DB
    """
    def role_checker(user: Dict = Depends(get_current_user)) -> Dict:
        user_role = user.get("role", "user")
        
        roles_hierarchy = {
            "admin": 3,
            "worker": 2,
            "user": 1
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

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(optional_security),
    db: Session = Depends(get_db)
) -> Optional[Dict]:
    """
    Get user if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        payload = verify_clerk_token(credentials)
        return get_current_user(payload, db)
    except:
        return None
