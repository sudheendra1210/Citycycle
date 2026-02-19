from fastapi import APIRouter, Request, HTTPException, Depends
from app.utils.twilio_service import twilio_service
from svix.webhooks import Webhook
import os
import json
from sqlalchemy.orm import Session
from app.utils.database import get_db

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@router.post("/clerk")
async def clerk_webhook(request: Request):
    """
    Handle Clerk webhooks, specifically sms.created to send via Twilio
    """
    payload = await request.body()
    headers = request.headers
    
    # Get the secret from environment
    webhook_secret = os.getenv("CLERK_WEBHOOK_SECRET")
    
    if not webhook_secret or webhook_secret == "we_will_get_this_later":
        # If no secret is set, we'll just process it for development
        # but in production you MUST verify the signature
        data = json.loads(payload)
    else:
        # Verify signature using svix
        svix_id = headers.get("svix-id")
        svix_timestamp = headers.get("svix-timestamp")
        svix_signature = headers.get("svix-signature")
        
        if not svix_id or not svix_timestamp or not svix_signature:
            raise HTTPException(status_code=400, detail="Missing svix headers")
        
        wh = Webhook(webhook_secret)
        try:
            data = wh.verify(payload, headers)
        except Exception as e:
            print(f"Webhook verification failed: {e}")
            raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    event_type = data.get("type")
    print(f"Received Clerk Webhook: {event_type}")

    if event_type == "sms.created":
        sms_data = data.get("data", {})
        to_phone = sms_data.get("to_phone_number")
        message_text = sms_data.get("message")
        
        if to_phone and message_text:
            print(f"Redirecting Clerk SMS to Twilio: {to_phone}")
            success = twilio_service.send_sms(to_phone, message_text)
            if success:
                return {"status": "success", "message": "SMS redirected to Twilio"}
            else:
                return {"status": "error", "message": "Failed to send via Twilio"}

    return {"status": "ignored"}
