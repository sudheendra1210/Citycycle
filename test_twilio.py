import os
from dotenv import load_dotenv
import sys

# Add the backend directory to the path so we can import app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

load_dotenv(dotenv_path='backend/.env')

from app.utils.twilio_service import twilio_service

def test_twilio():
    print("--- Twilio Service Test ---")
    print(f"Account SID: {twilio_service.account_sid}")
    print(f"Phone Number: {twilio_service.from_phone}")
    
    if not twilio_service.client:
        print("WARNING: Twilio client is not initialized (missing credentials).")
        print("Test will run in MOCK mode.")
    
    # Test phone number (replace with your own for real testing)
    test_phone = "+1234567890" 
    
    print(f"\n1. Testing general SMS to {test_phone}...")
    success = twilio_service.send_sms(test_phone, "Test message from CityCycle verification script.")
    print(f"Result: {'Success' if success else 'Failed (or logic worked in mock mode)'}")
    
    print(f"\n2. Testing OTP sending...")
    otp = twilio_service.send_otp(test_phone)
    print(f"Result: OTP {otp} sent" if otp else "Failed to send OTP")
    
    print(f"\n3. Testing Bin Full notification...")
    twilio_service.notify_bin_full(test_phone, "BIN_001", "Indiranagar")
    
    print("\n--- Test Finished ---")

if __name__ == "__main__":
    test_twilio()
