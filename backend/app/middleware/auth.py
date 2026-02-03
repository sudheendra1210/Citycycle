from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config.supabase_config import supabase
import jwt
from typing import Optional, Dict

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict:
    """
    Verify JWT token from Supabase and return user data
    """
    try:
        token = credentials.credentials
        
        # Verify the JWT token with Supabase
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        return {
            "id": user.user.id,
            "email": user.user.email,
            "user_metadata": user.user.user_metadata,
            "role": user.user.user_metadata.get("role", "viewer")
        }
    
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
