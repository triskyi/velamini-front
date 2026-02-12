export const sendWhatsAppMessage = async (to: string, body: string) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER; // e.g., 'whatsapp:+14155238886'

  if (!accountSid || !authToken || !fromNumber) {
    console.error("Missing Twilio Environment Variables");
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("From", fromNumber);
    formData.append("Body", body);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Twilio Send Error:", error);
    } else {
      console.log(`Twilio message sent to ${to}`);
    }
  } catch (error) {
    console.error("Failed to send WhatsApp message via Twilio:", error);
  }
};
