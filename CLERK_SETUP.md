# Clerk Configuration Checklist

To see both Email and Phone options in the login screen, you **must** update your Clerk project settings. Clerk components automatically hide fields that are not enabled in the dashboard.

### 🛠 Clerk "3-Click" Visual Guide

If you can't find the switch, follow these exact steps:

1.  **Sidebar**: Click **`User & Authentication`** (the icon looks like a small person 👤).
2.  **Tabs**: Look at the top center. Click the **`Email, Phone, Username`** tab.
3.  **The Switch**: 
    - Find **`Phone Number`** in the list.
    - Toggle the switch to **`ON`**.
    - **Crucial**: Scroll down to the **`Sign-up`** section on that same page.
    - Make sure the checkbox for **`Phone number`** is **Checked** ✅.

---

**Current Project Key**: `solid-krill-20`
*Make sure the name at the top-left of your Clerk Dashboard matches this!*

### 🚨 SOLUTION: Connect Twilio to Clerk
Since Clerk blocks India (+91) by default, you must link your **Twilio** account. This bypasses the Clerk tier restrictions.

1.  In Clerk Dashboard, go to [**Settings > SMS**](https://dashboard.clerk.com/last-active?path=settings/sms).
2.  Find the **"Custom SMS provider"** section (at the bottom).
3.  Click **"Add custom SMS provider"**.
4.  Enter your details from your Twilio Console:
    - **Account SID**: (Starts with `AC...`)
    - **Auth Token**: (Your secret token)
    - **From Phone Number**: (Your Twilio number starting with `+`)
5.  Click **Save**.

---

### 3. Verification Strategies
- Ensure "SMS verification code" is enabled under **Verification strategies**.

---

**Do you want me to replace the standard Clerk login box with a custom UI that has separate "Email" and "Phone" buttons?** This would give us more control over the "Look & Feel" to match your branding perfectly.
