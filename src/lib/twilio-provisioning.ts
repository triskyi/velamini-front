/**
 * Twilio Number Provisioning & Management Service
 * Handles purchasing, configuring, and releasing WhatsApp-enabled phone numbers
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_BASE_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`;
const WEBHOOK_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  capabilities: {
    voice: boolean;
    SMS: boolean;
    MMS: boolean;
  };
}

interface PurchasedNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
}

/**
 * Get Basic Auth header for Twilio API
 */
function getTwilioAuthHeader() {
  const credentials = Buffer.from(
    `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
  ).toString("base64");
  return `Basic ${credentials}`;
}

/**
 * Search for available phone numbers in a specific country
 * @param countryCode - ISO country code (e.g., "US", "RW", "KE")
 * @param areaCode - Optional area code
 */
export async function searchAvailableNumbers(
  countryCode: string = "US",
  areaCode?: string
): Promise<AvailableNumber[]> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured");
    }

    let url = `${TWILIO_BASE_URL}/AvailablePhoneNumbers/${countryCode}/Local.json?SmsEnabled=true`;
    
    if (areaCode) {
      url += `&AreaCode=${areaCode}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: getTwilioAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Twilio search error:", error);
      throw new Error(`Failed to search numbers: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`Found ${data.available_phone_numbers?.length || 0} numbers in ${countryCode}`);
    
    // Map Twilio's snake_case to camelCase
    const numbers = (data.available_phone_numbers || []).map((num: any) => ({
      phoneNumber: num.phone_number,
      friendlyName: num.friendly_name,
      capabilities: {
        voice: num.capabilities?.voice || false,
        SMS: num.capabilities?.SMS || false,
        MMS: num.capabilities?.MMS || false,
      }
    }));
    
    return numbers;
  } catch (error) {
    console.error("Search available numbers error:", error);
    throw error;
  }
}

/**
 * Purchase a phone number from Twilio
 * @param phoneNumber - The phone number to purchase (E.164 format)
 * @param organizationId - The organization ID to associate with this number
 */
export async function purchasePhoneNumber(
  phoneNumber: string,
  organizationId: string
): Promise<PurchasedNumber> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured");
    }

    const webhookUrl = `${WEBHOOK_BASE_URL}/api/whatsapp/webhook`;
    const isLocalhost = WEBHOOK_BASE_URL.includes('localhost') || WEBHOOK_BASE_URL.includes('127.0.0.1');

    const formData = new URLSearchParams();
    formData.append("PhoneNumber", phoneNumber);
    
    // Only set webhook if not localhost (Twilio rejects localhost URLs)
    if (!isLocalhost) {
      formData.append("SmsUrl", webhookUrl);
      formData.append("SmsMethod", "POST");
    } else {
      console.warn("⚠️ Localhost detected - Webhook NOT configured during purchase.");
      console.warn("📝 You must manually configure webhook in Twilio Console after purchase:");
      console.warn(`   Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming`);
      console.warn(`   Set webhook to your public URL when ready.`);
    }
    
    formData.append("FriendlyName", `Velamini - Org ${organizationId}`);

    const response = await fetch(`${TWILIO_BASE_URL}/IncomingPhoneNumbers.json`, {
      method: "POST",
      headers: {
        Authorization: getTwilioAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Twilio purchase error:", error);
      throw new Error(`Failed to purchase number: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      sid: data.sid,
      phoneNumber: data.phone_number,
      friendlyName: data.friendly_name,
    };
  } catch (error) {
    console.error("Purchase phone number error:", error);
    throw error;
  }
}

/**
 * Update webhook configuration for an existing number
 * @param numberSid - Twilio Phone Number SID
 * @param organizationId - Organization ID for webhook routing
 */
export async function updateNumberWebhook(
  numberSid: string,
  organizationId: string
): Promise<void> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured");
    }

    const webhookUrl = `${WEBHOOK_BASE_URL}/api/whatsapp/webhook`;

    const formData = new URLSearchParams();
    formData.append("SmsUrl", webhookUrl);
    formData.append("SmsMethod", "POST");

    const response = await fetch(
      `${TWILIO_BASE_URL}/IncomingPhoneNumbers/${numberSid}.json`,
      {
        method: "POST",
        headers: {
          Authorization: getTwilioAuthHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Twilio update webhook error:", error);
      throw new Error(`Failed to update webhook: ${error.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Update number webhook error:", error);
    throw error;
  }
}

/**
 * Release (delete) a phone number from Twilio
 * @param numberSid - Twilio Phone Number SID
 */
export async function releasePhoneNumber(numberSid: string): Promise<void> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured");
    }

    const response = await fetch(
      `${TWILIO_BASE_URL}/IncomingPhoneNumbers/${numberSid}.json`,
      {
        method: "DELETE",
        headers: {
          Authorization: getTwilioAuthHeader(),
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      console.error("Twilio release error:", error);
      throw new Error(`Failed to release number: ${error.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Release phone number error:", error);
    throw error;
  }
}

/**
 * Get details of a phone number
 * @param numberSid - Twilio Phone Number SID
 */
export async function getPhoneNumberDetails(numberSid: string) {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured");
    }

    const response = await fetch(
      `${TWILIO_BASE_URL}/IncomingPhoneNumbers/${numberSid}.json`,
      {
        method: "GET",
        headers: {
          Authorization: getTwilioAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Twilio get number error:", error);
      throw new Error(`Failed to get number details: ${error.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get phone number details error:", error);
    throw error;
  }
}

/**
 * List all phone numbers in the Twilio account
 */
export async function listAllPhoneNumbers() {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured");
    }

    const response = await fetch(
      `${TWILIO_BASE_URL}/IncomingPhoneNumbers.json`,
      {
        method: "GET",
        headers: {
          Authorization: getTwilioAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Twilio list numbers error:", error);
      throw new Error(`Failed to list numbers: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.incoming_phone_numbers || [];
  } catch (error) {
    console.error("List phone numbers error:", error);
    throw error;
  }
}
