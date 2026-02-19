import os
from twilio.rest import Client
from typing import Optional
import random
import string

class TwilioService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            print("WARNING: Twilio credentials not found. SMS notifications will be disabled.")

    def send_sms(self, to_phone: str, message: str) -> bool:
        """
        Send a general SMS message
        """
        if not self.client:
            print(f"DEBUG: Would send SMS to {to_phone}: {message}")
            return False
        
        try:
            self.client.messages.create(
                body=message,
                from_=self.from_phone,
                to=to_phone
            )
            return True
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return False

    def send_otp(self, to_phone: str) -> Optional[str]:
        """
        Generate and send a 6-digit OTP
        """
        otp = ''.join(random.choices(string.digits, k=6))
        message = f"Your CityCycle verification code is: {otp}. Valid for 10 minutes."
        
        if self.send_sms(to_phone, message):
            print(f"OTP sent to {to_phone}")
        else:
            print(f"DEV MODE: SMS failed, but OTP for {to_phone} is: {otp}")
        return otp

    def notify_bin_full(self, to_phone: str, bin_id: str, area: str):
        message = f"ALERT: Bin {bin_id} in {area} is marked as FULL. Please assign a worker for collection."
        self.send_sms(to_phone, message)

    def notify_complaint_update(self, to_phone: str, complaint_id: str, status: str):
        message = f"CityCycle: Your complaint {complaint_id} status has been updated to: {status}."
        self.send_sms(to_phone, message)

    def notify_assignment(self, to_phone: str, task_details: str):
        message = f"CityCycle TASK: You have a new assignment: {task_details}"
        self.send_sms(to_phone, message)

# Singleton instance
twilio_service = TwilioService()
