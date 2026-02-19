from fastapi import APIRouter, Depends, HTTPException
import os
from datetime import datetime, timedelta
from app.middleware.auth import get_current_user, require_role
from app.utils.twilio_service import twilio_service
from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.utils.database import get_db
from pydantic import BaseModel
from app.models.database_models import User, UserRole

import jwt as pyjwt # Using pyjwt for our own tokens to avoid conflict with jose

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class PhoneRequest(BaseModel):
    phone: str
    name: Optional[str] = None

class PhoneSignupRequest(BaseModel):
    phone: str
    role: Optional[str] = "user"

class PhoneVerifyRequest(BaseModel):
    phone: str
    code: str

class OTPVerifyRequest(BaseModel):
    phone: str
    code: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[str] = None
    phone: Optional[str] = None

@router.post("/phone/send-otp")
def send_phone_otp(data: PhoneRequest, db: Session = Depends(get_db)):
    """
    Send OTP to a phone number (Direct Twilio, no Clerk)
    """
    otp = twilio_service.send_otp(data.phone)
    if not otp:
        raise HTTPException(status_code=500, detail="Failed to send SMS")
    
    # Upsert user record for this phone
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        user = User(
            phone=data.phone,
            name=data.name,
            role=UserRole.USER, 
            is_phone_verified=False,
            created_at=datetime.utcnow()
        )
        db.add(user)
    elif data.name and not user.name:
        user.name = data.name
    
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()
    return {"message": "OTP sent successfully"}

@router.post("/phone/verify-otp")
def verify_phone_otp_direct(data: PhoneVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify OTP for phone and return a custom JWT
    """
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user or user.otp_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")
    
    user.is_phone_verified = True
    user.otp_code = None
    db.commit()

    # Create custom JWT
    payload = {
        "sub": f"phone_{user.id}",
        "user_id": user.id,
        "phone": user.phone,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    token = pyjwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")
    
    return {
        "token": token,
        "user": {
            "id": f"phone_{user.id}",
            "name": user.name,
            "phone": user.phone,
            "role": user.role
        }
    }

@router.get("/me")
def get_current_user_info(user: Dict = Depends(get_current_user)):
    """
    Get current authenticated user information from DB
    """
    return user

@router.post("/request-otp")
def request_phone_otp(
    data: PhoneRequest,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request an OTP for phone verification
    """
    db_user = db.query(User).filter(User.clerk_id == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    otp = twilio_service.send_otp(data.phone)
    if not otp:
        raise HTTPException(status_code=500, detail="Failed to send SMS. Please try again later.")
    
    db_user.otp_code = otp
    db_user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    # Store the pending phone in a temporary field or user_metadata if needed
    # For now we'll just store it in the phone field but marked as unverified
    db_user.phone = data.phone
    db_user.is_phone_verified = False
    db.commit()
    
    return {"message": "Verification code sent to your phone."}

@router.post("/verify-otp")
def verify_phone_otp(
    data: OTPVerifyRequest,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify the phone OTP
    """
    db_user = db.query(User).filter(User.clerk_id == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not db_user.otp_code or db_user.otp_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    if not db_user.otp_expires_at or db_user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired")
    
    # Verification successful
    db_user.is_phone_verified = True
    db_user.otp_code = None
    db_user.otp_expires_at = None
    db_user.phone = data.phone
    db.commit()
    
    return {"message": "Phone number verified successfully.", "phone": data.phone}

@router.patch("/update-profile")
def update_profile(
    data: ProfileUpdate,
    user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update local user profile (area, etc.)
    """
    db_user = db.query(User).filter(User.id == user["db_id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.name is not None:
        db_user.name = data.name
    if data.area is not None:
        db_user.area = data.area
    if data.phone is not None and data.phone != db_user.phone:
        db_user.phone = data.phone
        db_user.is_phone_verified = False # Reset verification if phone changed
    
    db.commit()
    return {"message": "Profile updated successfully.", "user": user}
