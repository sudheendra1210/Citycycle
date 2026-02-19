import os
from dotenv import load_dotenv
from twilio.rest import Client

# Load env from backend folder
load_dotenv('backend/.env')

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
from_phone = os.getenv("TWILIO_PHONE_NUMBER")
to_phone = "+917285961686" # User's verified number from screenshot

print(f"Testing Twilio with:\nSID: {account_sid[:5]}...\nPhone: {from_phone}")

try:
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body="CityCycle: Twilio is now LINKED! 🚀",
        from_=from_phone,
        to=to_phone
    )
    print(f"✅ Success! Message SID: {message.sid}")
except Exception as e:
    print(f"❌ Failed: {e}")
