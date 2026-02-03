from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user, require_role
from typing import Dict

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.get("/me")
def get_current_user_info(user: Dict = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    return {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "metadata": user.get("user_metadata", {})
    }

@router.get("/admin-only")
def admin_only_endpoint(user: Dict = Depends(require_role("admin"))):
    """
    Example endpoint that requires admin role
    """
    return {
        "message": "Welcome, admin!",
        "user": user["email"]
    }

@router.get("/operator-only")
def operator_endpoint(user: Dict = Depends(require_role("operator"))):
    """
    Example endpoint that requires operator role or higher
    """
    return {
        "message": "Welcome, operator!",
        "user": user["email"]
    }
