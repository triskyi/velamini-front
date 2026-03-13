const EMAILABLE_API = "https://api.emailable.com/v1/verify";

export type EmailState = "deliverable" | "undeliverable" | "risky" | "unknown";

export interface EmailVerifyResult {
  email: string;
  state: EmailState;
  reason?: string;
  disposable: boolean;
  free: boolean;
  role: boolean;
  accept: boolean;
  message: string;
}

export async function verifyEmail(email: string): Promise<EmailVerifyResult> {
  const key = process.env.EMAILABLE_API_KEY;

  if (!key) {
    console.warn("[Velamini] EMAILABLE_API_KEY not set; using basic email validation.");
    return basicFallback(email);
  }

  try {
    const url = `${EMAILABLE_API}?email=${encodeURIComponent(email)}&api_key=${key}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error("[Emailable] API error", res.status);
      return failOpen(email);
    }

    const data = await res.json();
    const state: EmailState = data.state ?? "unknown";
    const disposable = Boolean(data.disposable);
    const free = Boolean(data.free_email);
    const role = Boolean(data.role_account);
    const reason = typeof data.reason === "string" ? data.reason : "";

    if (disposable) {
      return {
        email,
        state,
        reason,
        disposable,
        free,
        role,
        accept: false,
        message: "Disposable email addresses are not allowed. Please use a real email.",
      };
    }

    if (state === "undeliverable") {
      return {
        email,
        state,
        reason,
        disposable,
        free,
        role,
        accept: false,
        message: "This email address doesn't exist or can't receive mail. Please check it and try again.",
      };
    }

    return {
      email,
      state,
      reason,
      disposable,
      free,
      role,
      accept: true,
      message:
        state === "risky"
          ? "Email accepted; your domain uses catch-all routing. We'll verify access by email confirmation."
          : role
            ? "Email accepted; this looks like a shared inbox. Make sure your team can access it."
            : "Email looks good.",
    };
  } catch (error) {
    console.error("[Emailable] fetch failed", error);
    return failOpen(email);
  }
}

function basicFallback(email: string): EmailVerifyResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return {
      email,
      state: "undeliverable",
      reason: "invalid_format",
      disposable: false,
      free: false,
      role: false,
      accept: false,
      message: "Please enter a valid email address.",
    };
  }

  return {
    email,
    state: "unknown",
    reason: "no_api_key",
    disposable: false,
    free: false,
    role: false,
    accept: true,
    message: "Email accepted.",
  };
}

function failOpen(email: string): EmailVerifyResult {
  return {
    email,
    state: "unknown",
    reason: "api_unavailable",
    disposable: false,
    free: false,
    role: false,
    accept: true,
    message: "Email accepted; please check your inbox to confirm.",
  };
}

export function quickReject(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address.";
  if (email.length > 254) return "Email address is too long.";
  if (email.includes("..")) return "Please enter a valid email address.";

  const disposableDomains = new Set([
    "mailinator.com",
    "guerrillamail.com",
    "tempmail.com",
    "throwaway.email",
    "yopmail.com",
    "sharklasers.com",
    "guerrillamailblock.com",
    "grr.la",
    "guerrillamail.info",
    "spam4.me",
    "trashmail.com",
    "maildrop.cc",
    "dispostable.com",
    "fakeinbox.com",
    "tempr.email",
    "discard.email",
    "spamgourmet.com",
    "trashmail.me",
    "mailnull.com",
    "spamfree24.org",
  ]);

  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && disposableDomains.has(domain)) {
    return "Disposable email addresses are not allowed. Please use a real email.";
  }

  return null;
}
