"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, CheckCircle, Loader2,
  Mail, RefreshCw, ShieldCheck,
} from "lucide-react";

type PageState = "sending" | "waiting" | "verifying" | "success" | "error";

function sanitizeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/Dashboard";
  return raw;
}

/* ─────────────────────────────────────────────────────────────────
   Inner component — wrapped in <Suspense> because useSearchParams()
   requires a Suspense boundary in Next.js 13+
───────────────────────────────────────────────────────────────── */
function VerifyEmailPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();

  const nextPath = useMemo(
    () => sanitizeNext(searchParams.get("next")),
    [searchParams],
  );

  const [pageState,    setPageState]    = useState<PageState>("sending");
  const [otp,          setOtp]          = useState(["", "", "", "", "", ""]);
  const [errorMsg,     setErrorMsg]     = useState("");
  const [cooldown,     setCooldown]     = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const inputsRef       = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestedOtpRef = useRef(false);
  const redirectingRef  = useRef(false);

  /* ── Send OTP ──────────────────────────────────────────────── */
  const sendOtp = useCallback(async () => {
    setPageState("sending");
    setErrorMsg("");

    try {
      const res  = await fetch("/api/auth/send-otp", { method: "POST" });
      const data = await res.json();

      if (data.alreadyVerified) {
        redirectingRef.current = true;
        setPageState("success");
        await update();
        window.setTimeout(() => router.replace(nextPath), 300);
        return;
      }

      if (!res.ok) {
        if (typeof data.cooldown === "number") setCooldown(data.cooldown);
        setErrorMsg(data.error || "Failed to send code.");
        setPageState("error");
        return;
      }

      setPageState("waiting");
      requestedOtpRef.current = true;
      setCooldown(typeof data.cooldown === "number" ? data.cooldown : 60);
      setAttemptsLeft(5);
      setOtp(["", "", "", "", "", ""]);
      window.setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setPageState("error");
    }
  }, [nextPath, router, update]);

  /* ── Verify OTP ─────────────────────────────────────────────── */
  const verifyOtp = useCallback(async (code: string) => {
    setPageState("verifying");
    setErrorMsg("");

    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (typeof data.attemptsLeft === "number") setAttemptsLeft(data.attemptsLeft);
        setErrorMsg(data.error || "Incorrect code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        setPageState("waiting");
        window.setTimeout(() => inputsRef.current[0]?.focus(), 50);
        return;
      }

      setPageState("success");
      redirectingRef.current = true;
      await update();
      window.setTimeout(() => router.replace(nextPath), 1500);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setPageState("waiting");
    }
  }, [nextPath, router, update]);

  /* ── Redirect if unauthenticated ───────────────────────────── */
  useEffect(() => {
    if (status === "unauthenticated") {
      redirectingRef.current = true;
      router.replace(
        `/auth/signin?callbackUrl=${encodeURIComponent(
          `/verify-email?next=${encodeURIComponent(nextPath)}`,
        )}`,
      );
    }
  }, [nextPath, router, status]);

  /* ── Redirect if already verified ──────────────────────────── */
  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.emailVerified) {
      redirectingRef.current = true;
      router.replace(nextPath);
    }
  }, [nextPath, router, session?.user?.emailVerified, status]);

  /* ── Auto-send OTP once on mount ───────────────────────────── */
  useEffect(() => {
    if (
      status !== "authenticated" ||
      session?.user?.emailVerified ||
      requestedOtpRef.current ||
      redirectingRef.current
    ) return;
    const t = window.setTimeout(() => void sendOtp(), 0);
    return () => window.clearTimeout(t);
  }, [sendOtp, session?.user?.emailVerified, status]);

  /* ── Cooldown countdown ─────────────────────────────────────── */
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldown(v => {
        if (v <= 1) { clearInterval(timerRef.current!); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cooldown]);

  /* ── Auto-submit when all 6 digits filled ───────────────────── */
  useEffect(() => {
    if (pageState !== "waiting" || otp.some(d => d === "")) return;
    const t = window.setTimeout(() => void verifyOtp(otp.join("")), 0);
    return () => window.clearTimeout(t);
  }, [otp, pageState, verifyOtp]);

  /* ── Input handlers ─────────────────────────────────────────── */
  function handleOtpInput(index: number, value: string) {
    // Support paste of full 6-digit code into any box
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      setOtp(value.split(""));
      inputsRef.current[5]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace"  && !otp[index] && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowLeft"  && index > 0)                inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)                inputsRef.current[index + 1]?.focus();
  }

  const maskedEmail = session?.user?.email
    ? session.user.email.replace(/(.{2}).*(@.*)/, "$1****$2")
    : "your email";

  const isBlocked = pageState === "sending" || pageState === "verifying" || status !== "authenticated";

  /* ── JSX ────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');

        :root,[data-mode="light"]{
          --ve-bg:#EBF5FF;--ve-surface:#FFFFFF;--ve-border:#C5DCF2;
          --ve-text:#0A1C2C;--ve-muted:#6B90AE;--ve-accent:#29A9D4;
          --ve-soft:#DDF1FA;--ve-danger:#EF4444;
        }
        [data-mode="dark"]{
          --ve-bg:#071320;--ve-surface:#0F1E2D;--ve-border:#1A3045;
          --ve-text:#C8E8F8;--ve-muted:#5B8FA8;--ve-accent:#38AECC;
          --ve-soft:#0C2535;--ve-danger:#F87171;
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{min-height:100%}
        body{
          font-family:'DM Sans',system-ui,sans-serif;
          background:var(--ve-bg);color:var(--ve-text);
          -webkit-font-smoothing:antialiased;
        }

        .ve-page{
          min-height:100dvh;display:flex;align-items:center;
          justify-content:center;padding:24px;position:relative;
          background:
            radial-gradient(ellipse 60% 45% at 12% 12%,
              color-mix(in srgb,var(--ve-accent) 18%,transparent),transparent 55%),
            radial-gradient(ellipse 50% 40% at 88% 8%,
              color-mix(in srgb,#7DD3FC 14%,transparent),transparent 50%),
            radial-gradient(ellipse 40% 35% at 80% 90%,
              color-mix(in srgb,#818CF8 10%,transparent),transparent 50%),
            var(--ve-bg);
        }
        .ve-page::before{
          content:'';position:fixed;inset:0;pointer-events:none;
          background-image:radial-gradient(circle,
            color-mix(in srgb,var(--ve-text) 12%,transparent) 1px,transparent 1px);
          background-size:26px 26px;opacity:.07;
          mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,black 10%,transparent 100%);
        }
        [data-mode="light"] .ve-page::before{opacity:.04}

        .ve-card{
          position:relative;z-index:1;
          width:100%;max-width:460px;
          background:var(--ve-surface);
          border:1px solid var(--ve-border);
          border-radius:24px;padding:40px 34px;
          box-shadow:0 24px 70px rgba(0,0,0,.12),0 2px 8px rgba(0,0,0,.05);
        }
        @media(max-width:480px){.ve-card{padding:28px 20px;border-radius:20px}}
        [data-mode="dark"] .ve-card{box-shadow:0 24px 70px rgba(0,0,0,.5)}

        /* Icon */
        .ve-icon{
          width:62px;height:62px;border-radius:18px;
          background:color-mix(in srgb,var(--ve-accent) 12%,transparent);
          border:1px solid color-mix(in srgb,var(--ve-accent) 25%,transparent);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 22px;color:var(--ve-accent);
        }
        .ve-icon--success{
          background:color-mix(in srgb,#22C55E 12%,transparent);
          border-color:color-mix(in srgb,#22C55E 30%,transparent);
          color:#22C55E;
        }

        /* Header */
        .ve-head{
          text-align:center;display:flex;flex-direction:column;
          align-items:center;gap:10px;margin-bottom:30px;
        }
        .ve-pill{
          display:inline-flex;align-items:center;gap:6px;
          padding:5px 13px;border-radius:999px;
          border:1px solid color-mix(in srgb,var(--ve-accent) 30%,transparent);
          background:color-mix(in srgb,var(--ve-accent) 10%,transparent);
          color:var(--ve-accent);font-size:.63rem;font-weight:800;
          letter-spacing:.14em;text-transform:uppercase;
        }
        .ve-title{
          font-family:'DM Serif Display',serif;
          font-size:2rem;line-height:1.1;color:var(--ve-text);
        }
        @media(max-width:380px){.ve-title{font-size:1.65rem}}
        .ve-sub{font-size:.88rem;line-height:1.72;color:var(--ve-muted);max-width:300px}
        .ve-email{
          display:block;margin-top:5px;
          color:var(--ve-accent);font-weight:700;font-size:.86rem;
        }

        /* OTP inputs */
        .ve-otp{display:flex;gap:10px;justify-content:center;margin-bottom:18px}
        @media(max-width:400px){.ve-otp{gap:7px}}

        .ve-input{
          width:52px;height:60px;border-radius:14px;
          border:2px solid var(--ve-border);
          background:color-mix(in srgb,var(--ve-surface) 70%,var(--ve-soft));
          color:var(--ve-text);-webkit-text-fill-color:var(--ve-text);
          text-align:center;font-size:1.5rem;font-weight:800;
          font-family:'DM Sans',monospace;outline:none;
          transition:border-color .17s,box-shadow .17s,background .17s;
          caret-color:var(--ve-accent);
        }
        @media(max-width:400px){.ve-input{width:42px;height:52px;font-size:1.3rem;border-radius:11px}}
        .ve-input:focus{
          border-color:var(--ve-accent);background:var(--ve-surface);
          box-shadow:0 0 0 3px color-mix(in srgb,var(--ve-accent) 18%,transparent);
        }
        .ve-input--filled{border-color:color-mix(in srgb,var(--ve-accent) 55%,transparent)}
        .ve-input--error{
          border-color:var(--ve-danger)!important;
          box-shadow:0 0 0 3px color-mix(in srgb,var(--ve-danger) 14%,transparent)!important;
        }
        .ve-input:disabled{opacity:.45;cursor:not-allowed}

        /* Error box */
        .ve-error-box{
          display:flex;align-items:flex-start;gap:9px;
          padding:11px 14px;border-radius:12px;
          background:color-mix(in srgb,var(--ve-danger) 9%,transparent);
          border:1px solid color-mix(in srgb,var(--ve-danger) 22%,transparent);
          color:var(--ve-danger);font-size:.8rem;line-height:1.55;
          margin-bottom:14px;
        }
        .ve-dot{
          width:6px;height:6px;border-radius:50%;
          background:currentColor;flex-shrink:0;margin-top:5px;
        }

        .ve-attempts{
          text-align:center;font-size:.74rem;
          color:var(--ve-danger);margin-bottom:12px;font-weight:600;
        }

        /* Primary button */
        .ve-btn{
          width:100%;min-height:50px;border:none;border-radius:14px;
          background:var(--ve-accent);color:#fff;
          font-family:'DM Sans',inherit;font-size:.92rem;font-weight:700;
          display:flex;align-items:center;justify-content:center;gap:8px;
          cursor:pointer;transition:transform .15s,opacity .15s;
          box-shadow:0 4px 20px color-mix(in srgb,var(--ve-accent) 35%,transparent);
          margin-bottom:16px;
        }
        .ve-btn:hover:not(:disabled){transform:translateY(-1px);opacity:.9}
        .ve-btn:active:not(:disabled){transform:scale(.98)}
        .ve-btn:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}

        /* Resend */
        .ve-resend{
          display:flex;align-items:center;justify-content:center;
          gap:7px;font-size:.8rem;color:var(--ve-muted);flex-wrap:wrap;
        }
        .ve-link{
          background:none;border:none;padding:0;
          color:var(--ve-accent);font:inherit;font-weight:700;
          cursor:pointer;transition:opacity .14s;
          display:inline-flex;align-items:center;gap:4px;
        }
        .ve-link:disabled{color:var(--ve-muted);cursor:not-allowed;opacity:.6}

        /* Success */
        .ve-success{
          text-align:center;display:flex;flex-direction:column;
          align-items:center;gap:16px;padding:8px 0;
        }

        .ve-spin{animation:ve-spin 1s linear infinite}
        @keyframes ve-spin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="ve-page">
        <AnimatePresence mode="wait">

          {/* ── Success ── */}
          {pageState === "success" ? (
            <motion.div key="success" className="ve-card"
              initial={{ opacity:0, scale:.95, y:14 }}
              animate={{ opacity:1, scale:1,   y:0  }}
              transition={{ duration:.32, ease:[.16,1,.3,1] }}>
              <div className="ve-success">
                <div className="ve-icon ve-icon--success">
                  <CheckCircle size={26}/>
                </div>
                <h1 className="ve-title">Email verified!</h1>
                <p className="ve-sub">
                  Your Velamini account is now active. Taking you to the dashboard.
                </p>
                <div className="ve-resend">
                  <Loader2 size={14} className="ve-spin"/> Redirecting…
                </div>
              </div>
            </motion.div>

          ) : (

          /* ── Main ── */
            <motion.div key="main" className="ve-card"
              initial={{ opacity:0, scale:.97, y:22 }}
              animate={{ opacity:1, scale:1,   y:0  }}
              transition={{ duration:.36, ease:[.16,1,.3,1] }}>

              <div className="ve-head">
                <div className="ve-icon">
                  {isBlocked
                    ? <Loader2 size={24} className="ve-spin"/>
                    : <Mail size={24}/>
                  }
                </div>
                <div className="ve-pill"><ShieldCheck size={10}/> Verify Email</div>
                <h1 className="ve-title">Check your inbox</h1>
                <p className="ve-sub">
                  We sent a 6-digit code to
                  <span className="ve-email">{maskedEmail}</span>
                </p>
              </div>

              {/* OTP boxes */}
              <div className="ve-otp">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputsRef.current[i] = el; }}
                    className={[
                      "ve-input",
                      digit    ? "ve-input--filled" : "",
                      errorMsg ? "ve-input--error"  : "",
                    ].filter(Boolean).join(" ")}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={e  => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onFocus={e   => e.target.select()}
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    disabled={isBlocked}
                  />
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div className="ve-error-box"
                    initial={{ opacity:0, y:-6 }}
                    animate={{ opacity:1, y:0  }}
                    exit={{ opacity:0 }}>
                    <div className="ve-dot"/>
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attempts warning */}
              {attemptsLeft < 3 && attemptsLeft > 0 && pageState === "waiting" && (
                <p className="ve-attempts">
                  {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} remaining
                </p>
              )}

              {/* Verify button */}
              <button
                className="ve-btn"
                onClick={() => void verifyOtp(otp.join(""))}
                disabled={otp.some(d => !d) || isBlocked}
              >
                {pageState === "verifying"
                  ? <><Loader2 size={14} className="ve-spin"/> Verifying…</>
                  : <>Verify email <ArrowRight size={14}/></>
                }
              </button>

              {/* Resend */}
              <div className="ve-resend">
                <span>Didn&apos;t get the code?</span>
                <button
                  className="ve-link"
                  onClick={() => void sendOtp()}
                  disabled={cooldown > 0 || isBlocked}
                >
                  {pageState === "sending"
                    ? <><RefreshCw size={12} className="ve-spin"/> Sending…</>
                    : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend code"
                  }
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Default export — Suspense boundary required for useSearchParams()
───────────────────────────────────────────────────────────────── */
export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailPageInner />
    </Suspense>
  );
}