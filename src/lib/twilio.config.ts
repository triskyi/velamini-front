/**
 * Twilio Configuration and Helper Functions
 * Centralized management of all Twilio-related settings and operations
 */

// ===========================
// CONFIGURATION
// ===========================

export const TWILIO_CONFIG = {
  // Account Credentials
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER, // Your main Twilio WhatsApp number
  
  // API Endpoints
  apiVersion: "2010-04-01",
  baseUrl: `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}`,
  
  // Webhook Configuration
  webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/whatsapp/webhook`,
  
  // Default Settings
  defaultCountry: "RW", // Default country for number search (Rwanda)
  numbersPerSearch: 10, // How many numbers to show in search results
  
  // Pricing (estimated - update based on actual Twilio pricing)
  pricing: {
    numberMonthly: 1.00, // Monthly cost per phone number
    messageCost: 0.005,  // Cost per message sent
  },
  
  // Rate Limits
  rateLimits: {
    messagesPerSecond: 10,
    numbersPerAccount: 50, // Max numbers you want to provision
  },
  
  // Supported Countries for WhatsApp
  supportedCountries: [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "RW", name: "Rwanda", flag: "🇷🇼" },
    { code: "KE", name: "Kenya", flag: "🇰🇪" },
    { code: "UG", name: "Uganda", flag: "🇺🇬" },
    { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦" },
    { code: "NG", name: "Nigeria", flag: "🇳🇬" },
    { code: "GH", name: "Ghana", flag: "🇬🇭" },
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "SG", name: "Singapore", flag: "🇸🇬" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "BR", name: "Brazil", flag: "🇧🇷" },
    { code: "MX", name: "Mexico", flag: "🇲🇽" },
  ],
};

// ===========================
// VALIDATION HELPERS
// ===========================

/**
 * Validate Twilio credentials are configured
 */
export function validateTwilioConfig(): boolean {
  if (!TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken) {
    console.error("❌ Twilio credentials not configured. Check environment variables.");
    return false;
  }
  return true;
}

/**
 * Check if Twilio is ready for operations
 */
export function isTwilioConfigured(): boolean {
  return !!(
    TWILIO_CONFIG.accountSid &&
    TWILIO_CONFIG.authToken &&
    TWILIO_CONFIG.phoneNumber
  );
}

// ===========================
// AUTHENTICATION
// ===========================

/**
 * Get Basic Auth header for Twilio API
 */
export function getTwilioAuthHeader(): string {
  const credentials = Buffer.from(
    `${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`
  ).toString("base64");
  return `Basic ${credentials}`;
}

// ===========================
// PHONE NUMBER FORMATTING
// ===========================

/**
 * Format phone number to E.164 format
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  let formatted = phoneNumber.replace(/[^\d+]/g, "");
  
  // Ensure it starts with +
  if (!formatted.startsWith("+")) {
    formatted = "+" + formatted;
  }
  
  return formatted;
}

/**
 * Format phone number for WhatsApp (adds whatsapp: prefix)
 * @param phoneNumber - Phone number
 * @returns WhatsApp formatted number
 */
export function formatWhatsAppNumber(phoneNumber: string): string {
  const formatted = formatPhoneNumber(phoneNumber);
  return `whatsapp:${formatted}`;
}

/**
 * Remove WhatsApp prefix from number
 * @param whatsappNumber - Number with whatsapp: prefix
 * @returns Plain phone number
 */
export function removeWhatsAppPrefix(whatsappNumber: string): string {
  return whatsappNumber.replace("whatsapp:", "");
}

/**
 * Validate phone number format
 * @param phoneNumber - Phone number to validate
 * @returns true if valid E.164 format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // E.164 format: +[country code][number] (max 15 digits)
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(formatPhoneNumber(phoneNumber));
}

// ===========================
// COUNTRY HELPERS
// ===========================

/**
 * Get country info by code
 * @param countryCode - ISO country code
 */
export function getCountryInfo(countryCode: string) {
  return TWILIO_CONFIG.supportedCountries.find(
    (c) => c.code === countryCode.toUpperCase()
  );
}

/**
 * Get all supported countries
 */
export function getSupportedCountries() {
  return TWILIO_CONFIG.supportedCountries;
}

// ===========================
// PRICING HELPERS
// ===========================

/**
 * Calculate estimated monthly cost for an organization
 * @param messagesPerMonth - Expected messages per month
 * @param numbersProvisioned - Number of phone numbers
 */
export function calculateMonthlyCost(
  messagesPerMonth: number,
  numbersProvisioned: number = 1
): number {
  const numberCost = numbersProvisioned * TWILIO_CONFIG.pricing.numberMonthly;
  const messageCost = messagesPerMonth * TWILIO_CONFIG.pricing.messageCost;
  return numberCost + messageCost;
}

/**
 * Format cost for display
 * @param cost - Cost value
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

// ===========================
// ERROR HANDLING
// ===========================

export class TwilioError extends Error {
  constructor(
    message: string,
    public code?: number,
    public details?: any
  ) {
    super(message);
    this.name = "TwilioError";
  }
}

/**
 * Handle Twilio API errors
 * @param error - Error response from Twilio
 */
export function handleTwilioError(error: any): never {
  const message = error.message || "Twilio API request failed";
  const code = error.code || error.status || 500;
  const details = error.more_info || error.detail || null;
  
  console.error("Twilio Error:", { message, code, details });
  throw new TwilioError(message, code, details);
}

// ===========================
// LOGGING HELPERS
// ===========================

/**
 * Log Twilio operation
 * @param operation - Operation name
 * @param details - Operation details
 */
export function logTwilioOperation(operation: string, details?: any) {
  console.log(`[Twilio] ${operation}`, details || "");
}

/**
 * Log Twilio webhook event
 * @param event - Event type
 * @param data - Event data
 */
export function logWebhookEvent(event: string, data?: any) {
  console.log(`[Twilio Webhook] ${event}`, {
    timestamp: new Date().toISOString(),
    ...data,
  });
}

// ===========================
// WEBHOOK SIGNATURE VALIDATION
// ===========================

/**
 * Validate Twilio webhook signature (for security)
 * @param twilioSignature - X-Twilio-Signature header
 * @param url - Full webhook URL
 * @param params - POST parameters
 */
export function validateWebhookSignature(
  twilioSignature: string,
  url: string,
  params: Record<string, string>
): boolean {
  // Import crypto module
  const crypto = require("crypto");
  
  if (!TWILIO_CONFIG.authToken) {
    console.warn("Cannot validate webhook signature: Auth token not configured");
    return false;
  }
  
  // Sort parameters alphabetically and concatenate with URL
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);
  
  // Create HMAC SHA1 signature
  const hmac = crypto.createHmac("sha1", TWILIO_CONFIG.authToken);
  hmac.update(data);
  const expectedSignature = hmac.digest("base64");
  
  return twilioSignature === expectedSignature;
}

// ===========================
// EXPORTS
// ===========================

export default TWILIO_CONFIG;
