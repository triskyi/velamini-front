"use client";

import { signIn } from "@/lib/auth-client";
import { useEmailVerify } from "@/hooks/useEmailVerify";
import { motion } from "framer-motion";
import { Eye, EyeOff, Moon, Sparkles, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SignupContent() {
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams?.get("callbackUrl");
  const postVerifyNext =
    rawCallbackUrl && rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/onboarding";
  const callbackUrl = `/verify-email?next=${encodeURIComponent(postVerifyNext)}`;

  const [isDark, setIsDark] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { state: emailState, message: emailMessage, check: checkEmail, reset: resetEmailCheck } = useEmailVerify();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      const dark = stored === "dark" || (!stored && prefersDark);
      setIsDark(dark);
      document.documentElement.setAttribute("data-mode", dark ? "dark" : "light");
    } catch {}
  }, []);

  const toggleTheme = () => {
    try {
      const next = !isDark;
      setIsDark(next);
      document.documentElement.setAttribute("data-mode", next ? "dark" : "light");
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const emailOk = await checkEmail(email, false);
    if (!emailOk) return;

    setLoading(true);
    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
        }),
      });
      const data = await regRes.json();
      if (!data.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      try {
        localStorage.setItem("ob_account_type", "personal");
      } catch {}

      const signInRes = await signIn("user-credentials", {
        email: email.toLowerCase().trim(),
        password,
        callbackUrl,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created. Please sign in.");
        setLoading(false);
        return;
      }

      window.location.href = signInRes?.url || callbackUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root,[data-mode="light"]{
          --ps-bg:#EBF5FF;--ps-bg2:#F7FBFF;--ps-surface:#FFFFFF;--ps-border:#C5DCF2;
          --ps-text:#0A1C2C;--ps-muted:#6B90AE;--ps-accent:#29A9D4;--ps-accent-2:#1D8BB2;
          --ps-soft:#DDF1FA;--ps-shadow:0 24px 70px rgba(10,40,80,.14);--ps-danger:#EF4444;
        }
        [data-mode="dark"]{
          --ps-bg:#071320;--ps-bg2:#0A1A2A;--ps-surface:#0F1E2D;--ps-border:#1A3045;
          --ps-text:#C8E8F8;--ps-muted:#4F7893;--ps-accent:#38AECC;--ps-accent-2:#2690AB;
          --ps-soft:#0C2535;--ps-shadow:0 24px 70px rgba(0,0,0,.48);--ps-danger:#F87171;
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--ps-bg);color:var(--ps-text);min-height:100vh}
        .ps-page{
          min-height:100dvh;display:grid;grid-template-columns:minmax(320px, 1.05fr) minmax(320px, .95fr);
          background:
            radial-gradient(circle at 15% 20%, color-mix(in srgb,var(--ps-accent) 14%, transparent), transparent 28%),
            radial-gradient(circle at 82% 14%, color-mix(in srgb,#7DD3FC 14%, transparent), transparent 25%),
            linear-gradient(135deg,var(--ps-bg),var(--ps-bg2));
        }
        @media(max-width:920px){.ps-page{grid-template-columns:1fr}}
        .ps-nav{
          position:fixed;top:0;left:0;right:0;height:56px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;
          background:color-mix(in srgb,var(--ps-surface) 82%,transparent);border-bottom:1px solid var(--ps-border);backdrop-filter:blur(14px);z-index:20;
        }
        .ps-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit}
        .ps-brand-logo{width:30px;height:30px;border-radius:8px;overflow:hidden;border:1.5px solid var(--ps-border)}
        .ps-brand-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .ps-brand-name{font-family:'DM Serif Display',serif;font-size:.94rem}
        .ps-theme-btn{
          display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;
          border:1px solid var(--ps-border);background:var(--ps-soft);color:var(--ps-muted);cursor:pointer
        }
        .ps-side{
          padding:96px 48px 48px;display:flex;align-items:center;justify-content:center;
        }
        @media(max-width:920px){.ps-side{display:none}}
        .ps-side-inner{max-width:470px}
        .ps-kicker{
          display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;
          border:1px solid color-mix(in srgb,var(--ps-accent) 28%, transparent);
          background:color-mix(in srgb,var(--ps-accent) 10%, transparent);
          color:var(--ps-accent);font-size:.7rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:22px;
        }
        .ps-title{
          font-family:'DM Serif Display',serif;font-size:clamp(2rem,4.6vw,3.2rem);line-height:1.08;letter-spacing:-.03em;margin-bottom:18px;
        }
        .ps-title em{font-style:italic;color:var(--ps-accent)}
        .ps-copy{font-size:.94rem;line-height:1.75;color:var(--ps-muted);max-width:420px;margin-bottom:28px}
        .ps-points{display:grid;gap:12px}
        .ps-point{
          padding:14px 16px;border-radius:16px;background:color-mix(in srgb,var(--ps-surface) 86%, transparent);
          border:1px solid var(--ps-border);box-shadow:0 8px 24px rgba(10,40,80,.06)
        }
        .ps-point-title{font-size:.82rem;font-weight:700;margin-bottom:4px}
        .ps-point-copy{font-size:.78rem;line-height:1.55;color:var(--ps-muted)}
        .ps-form-wrap{
          padding:96px 24px 40px;display:flex;align-items:center;justify-content:center;
        }
        .ps-card{
          width:100%;max-width:420px;background:color-mix(in srgb,var(--ps-surface) 92%, transparent);
          border:1px solid var(--ps-border);border-radius:26px;padding:34px 30px 28px;box-shadow:var(--ps-shadow);backdrop-filter:blur(18px);
          position:relative;overflow:hidden;
        }
        .ps-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,var(--ps-accent),#7DD3FC,var(--ps-accent));background-size:200% 100%;animation:ps-shimmer 3.3s linear infinite;
        }
        @keyframes ps-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .ps-icon{
          width:52px;height:52px;border-radius:16px;background:color-mix(in srgb,var(--ps-accent) 14%, transparent);
          border:1.5px solid color-mix(in srgb,var(--ps-accent) 30%, transparent);display:flex;align-items:center;justify-content:center;
          color:var(--ps-accent);margin-bottom:16px;
        }
        .ps-card-title{font-family:'DM Serif Display',serif;font-size:1.7rem;letter-spacing:-.02em;margin-bottom:6px}
        .ps-card-sub{font-size:.82rem;line-height:1.6;color:var(--ps-muted);margin-bottom:22px}
        .ps-form{display:flex;flex-direction:column;gap:13px}
        .ps-field{display:flex;flex-direction:column;gap:5px}
        .ps-label{font-size:.76rem;font-weight:600;color:var(--ps-muted);letter-spacing:.02em}
        .ps-input-wrap{position:relative}
        .ps-input{
          width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid var(--ps-border);background:var(--ps-surface);
          color:var(--ps-text);font-size:.88rem;font-family:inherit;outline:none;transition:border-color .2s;
        }
        .ps-input:focus{border-color:var(--ps-accent)}
        .ps-input.has-toggle{padding-right:42px}
        .ps-input--error{border-color:var(--ps-danger)}
        .ps-input--ok{border-color:var(--ps-accent)}
        .ps-eye{
          position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ps-muted);cursor:pointer;
          display:flex;align-items:center;padding:2px
        }
        .ps-field-msg{font-size:.74rem;line-height:1.45;color:var(--ps-muted);margin-top:2px}
        .ps-field-msg--error{color:var(--ps-danger)}
        .ps-field-msg--checking{color:var(--ps-muted)}
        .ps-field-msg--ok{color:var(--ps-accent)}
        .ps-error{
          padding:10px 12px;border-radius:10px;background:color-mix(in srgb,var(--ps-danger) 10%, transparent);
          border:1px solid color-mix(in srgb,var(--ps-danger) 26%, transparent);color:var(--ps-danger);font-size:.79rem;line-height:1.5
        }
        .ps-submit{
          width:100%;min-height:48px;padding:12px 18px;border:none;border-radius:14px;background:var(--ps-accent);color:#fff;
          font-size:.9rem;font-weight:700;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .18s
        }
        .ps-submit:hover:not(:disabled){background:var(--ps-accent-2);transform:translateY(-1px)}
        .ps-submit:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .ps-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:ps-spin .8s linear infinite}
        @keyframes ps-spin{to{transform:rotate(360deg)}}
        .ps-links{margin-top:16px;text-align:center;font-size:.8rem;color:var(--ps-muted);line-height:1.7}
        .ps-links a{color:var(--ps-accent);font-weight:600;text-decoration:none}
        .ps-links a:hover{text-decoration:underline}
        .ps-terms{margin-top:14px;text-align:center;font-size:.72rem;line-height:1.65;color:var(--ps-muted)}
        .ps-terms a{color:inherit;text-decoration:underline}
      `}</style>

      <nav className="ps-nav">
        <Link href="/" className="ps-brand">
          <div className="ps-brand-logo"><img src="/logo.png" alt="Velamini" /></div>
          <span className="ps-brand-name">Velamini</span>
        </Link>
        <button className="ps-theme-btn" onClick={toggleTheme} title="Toggle theme">
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </nav>

      <div className="ps-page">
        <aside className="ps-side">
          <motion.div
            className="ps-side-inner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="ps-kicker"><Sparkles size={13} /> Personal account</div>
            <h1 className="ps-title">
              Start shaping your <em>digital twin</em>.
            </h1>
            <p className="ps-copy">
              Create a personal Velamini account with your own password, train your virtual self, and publish it when you are ready.
            </p>
            <div className="ps-points">
              <div className="ps-point">
                <div className="ps-point-title">Train on your story</div>
                <div className="ps-point-copy">Add your personality, experience, Q&A, and links so your profile answers like you.</div>
              </div>
              <div className="ps-point">
                <div className="ps-point-title">Share publicly when ready</div>
                <div className="ps-point-copy">Keep building privately first, then turn on your public profile when the content is solid.</div>
              </div>
              <div className="ps-point">
                <div className="ps-point-title">Use email or Google later</div>
                <div className="ps-point-copy">This flow adds direct username/password access without taking away the existing auth options.</div>
              </div>
            </div>
          </motion.div>
        </aside>

        <main className="ps-form-wrap">
          <motion.div
            className="ps-card"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="ps-icon"><UserRound size={24} /></div>
            <h2 className="ps-card-title">Create your personal account</h2>
            <p className="ps-card-sub">Use your email and a password to create a personal login for Velamini.</p>

            <form className="ps-form" onSubmit={handleSubmit} noValidate>
              <div className="ps-field">
                <label className="ps-label">Full name</label>
                <div className="ps-input-wrap">
                  <input
                    className="ps-input"
                    type="text"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="ps-field">
                <label className="ps-label">Email</label>
                <div className="ps-input-wrap">
                  <input
                    className={`ps-input ${emailState === "error" ? "ps-input--error" : emailState === "ok" ? "ps-input--ok" : ""}`}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailState !== "idle") resetEmailCheck();
                    }}
                    onBlur={() => {
                      if (email.trim()) void checkEmail(email, false);
                    }}
                    autoComplete="email"
                    required
                  />
                </div>
                {emailMessage && (
                  <p
                    className={`ps-field-msg ${
                      emailState === "error"
                        ? "ps-field-msg--error"
                        : emailState === "checking"
                          ? "ps-field-msg--checking"
                          : "ps-field-msg--ok"
                    }`}
                  >
                    {emailMessage}
                  </p>
                )}
              </div>

              <div className="ps-field">
                <label className="ps-label">Password</label>
                <div className="ps-input-wrap">
                  <input
                    className="ps-input has-toggle"
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="ps-eye" onClick={() => setShowPass((value) => !value)} tabIndex={-1}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="ps-field">
                <label className="ps-label">Confirm password</label>
                <div className="ps-input-wrap">
                  <input
                    className="ps-input has-toggle"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="ps-eye" onClick={() => setShowConfirm((value) => !value)} tabIndex={-1}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <div className="ps-error">{error}</div>}

              <button className="ps-submit" type="submit" disabled={loading}>
                {loading ? <div className="ps-spinner" /> : "Create account"}
              </button>
            </form>

            <p className="ps-links">
              Already have an account? <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(postVerifyNext)}`}>Sign in</Link>
            </p>
            <p className="ps-links">
              Creating an organisation instead? <Link href="/auth/org/signup">Use the business flow</Link>
            </p>
            <p className="ps-terms">
              By registering you agree to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </motion.div>
        </main>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#071320" }} />}>
      <SignupContent />
    </Suspense>
  );
}
