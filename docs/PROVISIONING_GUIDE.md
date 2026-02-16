# WhatsApp Number Provisioning Guide

## Overview

This guide explains how to provision dedicated US WhatsApp numbers for your organizations using Twilio.

## Quick Summary

- **Each organization needs ONE unique number** for multi-tenant support
- **US numbers are recommended** (Rwanda not available via Twilio)
- **Cost**: ~$1/month per number + $0.005 per message
- **Customer messages are cheap**: Most conversations cost $0.015-0.02

---

## Prerequisites

### 1. Twilio Account Setup

1. Sign up at [Twilio.com](https://www.twilio.com/try-twilio)
2. Get your credentials from the [Twilio Console](https://console.twilio.com/):
   - Account SID
   - Auth Token
3. Add these to your `.env` file:

```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="whatsapp:+14155238886"  # Sandbox for testing
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # or your production URL
```

### 2. WhatsApp Sender Setup

For the **sandbox number** (testing):
- Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
- Use `whatsapp:+14155238886` in your `.env`
- Customers must send "join [your-code]" first

For **production numbers** (provisioned):
- Numbers are purchased via the app UI
- No "join" command needed
- Professional setup

---

## How It Works

### The Routing System

```
Customer → WhatsApp Number → Twilio → Your Webhook → Organization's AI

Example:
Customer A texts: +1 (415) 555-0001
  ↓
Webhook receives: to = "+14155550001"
  ↓
Database lookup: Organization with whatsappNumber = "+14155550001"
  ↓
Loads Organization's custom AI knowledge base
  ↓
Sends personalized response
```

**Why each organization needs a unique number:**
- Different organizations = Different AI knowledge bases
- Webhook identifies organization by the "To" number
- Shared numbers would give same responses to all customers

---

## Provisioning a Number (Step-by-Step)

### Step 1: Create an Organization

1. Go to `/Dashboard/organizations`
2. Click "Create New Organization"
3. Fill in details:
   - Organization name
   - Description
   - Business info (optional)

### Step 2: Search for Available Numbers

1. Click on the organization you just created
2. Go to the "Overview" tab
3. Click **"Provision a Number"**
4. Select country (default: **United States**)
5. Click **"Search Numbers"**

Available countries:
- 🇺🇸 United States (Recommended)
- 🇨🇦 Canada
- 🇬🇧 United Kingdom
- ⚠️ Rwanda (Not available via Twilio)

### Step 3: Select and Provision

1. Browse the list of available numbers
2. Click **"Select"** on your preferred number
3. Confirm the provisioning (this will charge your Twilio account)
4. Wait for confirmation

**What happens behind the scenes:**
- Purchases number from Twilio (~$1/month)
- Configures webhook to point to your app
- Stores number in database
- Associates with organization

### Step 4: Train the AI

1. Go to the **"AI Training"** tab
2. Upload knowledge base or enter information
3. Click **"Train AI"**
4. Wait for training to complete

### Step 5: Test It!

1. Save the provisioned number in your WhatsApp
2. Send a test message
3. Receive AI-powered response based on your training

---

## Pricing Breakdown

### Twilio Costs (Pay-as-you-go)

**Phone Number Rental:**
- **$1.00/month** per number
- No upfront cost
- Cancel anytime

**Message Costs:**

| Scenario | Twilio Fee | Meta Fee | Total Cost |
|----------|-----------|----------|------------|
| Customer messages you (incoming) | $0.005 | $0.00 | $0.005 |
| You reply during 24hr window | $0.005 | $0.00 | $0.005 |
| You message first (utility template) | $0.005 | $0.0034 | $0.0084 |
| Authentication template | $0.005 | Varies | ~$0.01 |

**Customer Service Window:**
- Opens when customer messages you first
- Lasts for **24 hours**
- During this window: **No Meta fees** (only Twilio's $0.005)
- You can send unlimited free-form messages

### Example Monthly Costs

**Light Organization (100 conversations):**
```
Phone number:        $1.00
50 customers message first:
  - 150 replies @ $0.005 = $0.75
50 proactive messages:
  - 50 templates @ $0.0084 = $0.42
─────────────────────
Total:               $2.17/month
```

**Medium Organization (500 conversations):**
```
Phone number:        $1.00
Messages:            ~$5.00
─────────────────────
Total:               ~$6/month
```

**Heavy Organization (2000 conversations):**
```
Phone number:        $1.00
Messages:            ~$20-30
─────────────────────
Total:               ~$25-30/month
```

### Your Pricing Strategy (Suggested)

```javascript
planType: "trial"
  - FREE
  - 50 messages
  - Shared sandbox number
  - Good for testing

planType: "starter"
  - $15/month
  - 500 messages
  - Dedicated US number
  - Basic AI training

planType: "business"
  - $50/month
  - 2000 messages
  - Dedicated US number
  - Advanced AI features
  - Priority support
```

**Your profit margin:**
- Starter: $15 - $6 actual cost = **$9 profit**
- Business: $50 - $30 actual cost = **$20 profit**

---

## Releasing (Unprovision) a Number

If you need to release a number:

1. Go to organization detail page
2. Click **"Release Number"**
3. Confirm the action

**Warning:**
- Customers can no longer message that number
- Number becomes available for others to purchase
- This action cannot be undone

---

## Troubleshooting

### Error: "Organization already has a WhatsApp number" (400)

**Cause:** You're trying to provision a second number for the same organization.

**Solution:**
1. Release the existing number first, OR
2. Create a new organization

### Error: "Failed to search numbers"

**Possible causes:**
- Invalid Twilio credentials
- Country not supported (e.g., Rwanda)
- Network issues

**Solutions:**
1. Check your `.env` file has correct Twilio credentials
2. Try a different country (use US)
3. Check Twilio API status

### No numbers available for Rwanda

**Cause:** Twilio doesn't offer standard phone numbers in Rwanda.

**Solution:** Use US numbers instead. Customers in Rwanda can still message US WhatsApp numbers without issues.

### Messages not being routed correctly

**Check:**
1. Webhook URL is configured correctly in Twilio
2. Organization's `whatsappNumber` matches exactly
3. Number format is E.164 (e.g., `+14155551234`, not `whatsapp:+14155551234`)

---

## Development vs Production

### Development (Free)

Use Twilio's sandbox number:
```env
TWILIO_PHONE_NUMBER="whatsapp:+14155238886"
```

**Limitations:**
- Customers must send "join [code]" first
- Only one organization can use it
- Good for testing only

### Production ($1-30/month)

Provision real numbers:
- Professional setup
- No "join" command needed
- Multi-tenant support
- Each organization gets unique number

---

## API Reference

### Search Numbers
```http
GET /api/organizations/search-numbers?country=US&areaCode=415
```

**Response:**
```json
{
  "ok": true,
  "numbers": [
    {
      "phoneNumber": "+14155551234",
      "friendlyName": "San Francisco, CA",
      "capabilities": {
        "SMS": true,
        "voice": true
      }
    }
  ],
  "total": 10
}
```

### Provision Number
```http
POST /api/organizations/{orgId}/provision-number
Content-Type: application/json

{
  "phoneNumber": "+14155551234"
}
```

**Response:**
```json
{
  "ok": true,
  "organization": {
    "id": "...",
    "whatsappNumber": "+14155551234",
    "whatsappNumberSid": "PN..."
  },
  "message": "WhatsApp number provisioned successfully"
}
```

### Release Number
```http
DELETE /api/organizations/{orgId}/provision-number
```

**Response:**
```json
{
  "ok": true,
  "message": "WhatsApp number released successfully"
}
```

---

## Best Practices

1. **Start with US numbers** - Most reliable and available
2. **One number per organization** - Required for multi-tenant routing
3. **Test with sandbox first** - Before paying for production numbers
4. **Monitor usage** - Check organization stats regularly
5. **Set message limits** - Prevent unexpected costs
6. **Train AI properly** - Better responses = happier customers

---

## Next Steps

1. ✅ Set up Twilio credentials in `.env`
2. ✅ Create your first organization
3. ✅ Provision a US number
4. ✅ Train your AI
5. ✅ Test with WhatsApp
6. ✅ Launch to customers!

For more details, see:
- [Main README](../README.md)
- [WhatsApp Organizations Guide](../WHATSAPP_ORGANIZATIONS.md)
- [Deployment Guide](./DEPLOYMENT.md)
