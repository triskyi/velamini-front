import { Resend } from "resend";
import { render } from "@react-email/render";

import UserWelcomeEmail from "@/emails/user-welcome";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://velamini.com";
}

function sender() {
  return process.env.RESEND_FROM_EMAIL || "contact@coodic.org";
}

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  return new Resend(key);
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: sender(),
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[Resend] email send failed", error);
      throw new Error(`Resend send failed from ${sender()}: ${error.message || "Email send failed"}`);  
    }  
    return data;  

}

export { sendEmail };

function otpTemplate({
  name,
  code,
  expiresMinutes,
}: {
  name: string;
  code: string;
  expiresMinutes: number;
}) {
  const url = appUrl();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Verify your Velamini account</title>
</head>
<body style="margin:0;padding:0;background:#081420;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#081420;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr>
            <td style="background:#0F1E2D;border:1px solid #1A3045;border-radius:22px;padding:36px;">
              <p style="margin:0 0 10px;color:#38AECC;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;">Verify Email</p>
              <h1 style="margin:0 0 14px;color:#D4EEFF;font-size:28px;line-height:1.2;">Use this code to verify your account</h1>
              <p style="margin:0 0 24px;color:#8BBAD6;font-size:15px;line-height:1.7;">Hi ${name}, enter the code below in Velamini. It expires in ${expiresMinutes} minutes.</p>
              <div style="margin:0 0 24px;padding:18px 20px;border-radius:16px;background:#0B1825;border:1px solid #1A3045;text-align:center;">
                <span style="font-size:34px;line-height:1;font-weight:800;letter-spacing:.3em;color:#38AECC;font-family:Consolas,monospace;">${code}</span>
              </div>
              <p style="margin:0 0 18px;color:#5B8FA8;font-size:13px;line-height:1.7;">If you did not create this account, you can ignore this email.</p>
              <p style="margin:0;color:#5B8FA8;font-size:12px;">Velamini · <a href="${url}" style="color:#38AECC;text-decoration:none;">${url}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function canSendResendEmail() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendOtpEmail({
  to,
  name,
  code,
  expiresMinutes,

}: {
  to: string;
  name: string;
  code: string;
  expiresMinutes: number;
  userId: string;
}) {
  return sendEmail({
    to,
    subject: `${code} is your Velamini verification code`,
    html: otpTemplate({ name, code, expiresMinutes }),
  });
}

export async function sendWelcomeEmail({
  to,
  name,

}: {
  to: string;
  name: string;
  userId: string;
}) {
  const html = await render(
    UserWelcomeEmail({
      username: name,
      company: "Velamini",
      ctaUrl: `${appUrl()}/Dashboard`,
    })
  );

  return sendEmail({
    to,
    subject: `Welcome to Velamini, ${name}`,
    html,
  });
}

export async function sendContactEmail({
  fromName,
  fromEmail,
  subject,
  message,
}: {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>New Contact Form Submission</title>
</head>
<body style="margin:0;padding:0;background:#081420;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#081420;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="background:#0F1E2D;border:1px solid #1A3045;border-radius:22px;padding:36px;">
              <p style="margin:0 0 10px;color:#38AECC;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;">New Contact Form</p>
              <h1 style="margin:0 0 20px;color:#D4EEFF;font-size:24px;line-height:1.2;">${subject}</h1>
              
              <div style="margin:0 0 20px;padding:16px;border-radius:12px;background:#0B1825;border:1px solid #1A3045;">
                <p style="margin:0 0 8px;color:#8BBAD6;font-size:13px;"><strong style="color:#D4EEFF;">Name:</strong> ${fromName}</p>
                <p style="margin:0 0 8px;color:#8BBAD6;font-size:13px;"><strong style="color:#D4EEFF;">Email:</strong> <a href="mailto:${fromEmail}" style="color:#38AECC;text-decoration:none;">${fromEmail}</a></p>
                <p style="margin:0;color:#8BBAD6;font-size:13px;"><strong style="color:#D4EEFF;">Subject:</strong> ${subject}</p>
              </div>
              
              <div style="padding:16px;border-radius:12px;background:#0B1825;border:1px solid #1A3045;">
                <p style="margin:0 0 12px;color:#D4EEFF;font-size:14px;font-weight:600;">Message:</p>
                <p style="margin:0;color:#8BBAD6;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
              </div>
              
              <p style="margin:24px 0 0;color:#5B8FA8;font-size:12px;">Sent from Velamini Contact Form</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Send to contact@coodic.org
  return sendEmail({
    to: "contact@coodic.org",
    subject: `[Velamini Contact] ${subject} - from ${fromName}`,
    html,
  });
}
