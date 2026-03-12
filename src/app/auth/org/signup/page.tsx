"use client";

import { signIn } from "@/lib/auth-client";
import { useEmailVerify } from "@/hooks/useEmailVerify";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2, Eye, EyeOff, Moon, Sun,
  Brain, Headphones, Globe, Code2, BarChart3, MessageSquare,
} from "lucide-react";

const features = [
  { Icon: Brain,         text: "Train an AI agent on your company knowledge" },
  { Icon: Headphones,    text: "24/7 automated support for your customers"   },
  { Icon: Globe,         text: "Embed your agent on any website"             },
  { Icon: Code2,         text: "Simple REST API — integrate in minutes"      },
  { Icon: BarChart3,     text: "Analytics on every conversation"             },
  { Icon: MessageSquare, text: "Custom agent persona & tone of voice"        },
];

export default function OrgSignupPage() {
  const verifyCallbackUrl = "/verify-email?next=%2Fonboarding%3Fcreate%3Dorg";
  const [isDark,    setIsDark]    = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return (localStorage.getItem("theme") || "dark") === "dark";
    } catch {
      return true;
    }
  });
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const { state: emailState, message: emailMessage, check: checkEmail, reset: resetEmailCheck } = useEmailVerify();

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-mode", isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-mode", next ? "dark" : "light");
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim())       { setError("Full name is required.");          return; }
    if (!email.trim())      { setError("Work email is required.");         return; }
    if (password.length < 8){ setError("Password must be at least 8 characters."); return; }
    if (password !== confirm){ setError("Passwords do not match.");        return; }

    const emailOk = await checkEmail(email, true);
    if (!emailOk) return;

    setLoading(true);
    try {
      const regRes = await fetch("/api/auth/org/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password }),
      });
      const data = await regRes.json();
      if (!data.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("org-credentials", {
        email: email.toLowerCase().trim(),
        password,
        callbackUrl: verifyCallbackUrl,
        redirect: false,
      });
      if (signInRes?.error) {
        setError("Account created — please sign in.");
        setLoading(false);
        return;
      }
      window.location.href = signInRes?.url || verifyCallbackUrl;
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
          --os-bg:#EBF5FF;--os-surface:#FFFFFF;--os-border:#C5DCF2;
          --os-text:#0A1C2C;--os-muted:#6B90AE;--os-accent:#29A9D4;
          --os-hero-bg:linear-gradient(145deg,#1A4A70,#0D2A42);
          --os-shadow:0 20px 60px rgba(10,40,80,.13);
          --os-feat-bg:rgba(41,169,212,.09);--os-feat-border:rgba(41,169,212,.22);
          --os-danger:#EF4444;--os-danger-soft:rgba(239,68,68,.09);
        }
        [data-mode="dark"]{
          --os-bg:#071320;--os-surface:#0F1E2D;--os-border:#1A3045;
          --os-text:#C8E8F8;--os-muted:#3D6580;--os-accent:#38AECC;
          --os-hero-bg:linear-gradient(145deg,#0A1F30,#071320);
          --os-shadow:0 20px 60px rgba(0,0,0,.45);
          --os-feat-bg:rgba(56,174,204,.09);--os-feat-border:rgba(56,174,204,.18);
          --os-danger:#F87171;--os-danger-soft:rgba(248,113,113,.09);
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--os-bg);color:var(--os-text);min-height:100vh}
        .os-nav{position:fixed;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:56px;background:color-mix(in srgb,var(--os-surface) 80%,transparent);border-bottom:1px solid var(--os-border);backdrop-filter:blur(12px);z-index:50}
        .os-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit}
        .os-brand-logo{width:30px;height:30px;border-radius:8px;overflow:hidden;border:1.5px solid var(--os-border)}
        .os-brand-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .os-brand-name{font-family:'DM Serif Display',serif;font-size:.93rem;color:var(--os-text)}
        .os-theme-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid var(--os-border);background:transparent;color:var(--os-muted);cursor:pointer}
        .os-page{min-height:100dvh;padding-top:56px;display:grid;grid-template-columns:1fr 1fr}
        @media(max-width:900px){.os-page{grid-template-columns:1fr}.os-hero{display:none}}
        .os-hero{background:var(--os-hero-bg);display:flex;flex-direction:column;justify-content:center;padding:60px 48px;position:relative;overflow:hidden}
        .os-hero::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 30% 70%,rgba(56,174,204,.15),transparent 60%);pointer-events:none}
        .os-hero-pretitle{font-size:.72rem;font-weight:600;letter-spacing:.12em;color:var(--os-accent);text-transform:uppercase;margin-bottom:14px}
        .os-hero-title{font-family:'DM Serif Display',serif;font-size:2.4rem;line-height:1.18;color:#E8F5FF;margin-bottom:18px;letter-spacing:-.02em}
        .os-hero-desc{font-size:.88rem;color:rgba(200,232,248,.65);line-height:1.7;margin-bottom:36px;max-width:380px}
        .os-feat-list{display:flex;flex-direction:column;gap:11px}
        .os-feat{display:flex;align-items:center;gap:13px;padding:12px 16px;border-radius:12px;background:var(--os-feat-bg);border:1px solid var(--os-feat-border)}
        .os-feat-icon{width:30px;height:30px;border-radius:8px;background:rgba(56,174,204,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--os-accent)}
        .os-feat-text{font-size:.8rem;color:rgba(200,232,248,.8);line-height:1.35}
        .os-form-col{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 32px;overflow-y:auto}
        .os-card{width:100%;max-width:420px}
        .os-card-header{margin-bottom:26px}
        .os-icon-wrap{width:48px;height:48px;border-radius:13px;background:color-mix(in srgb,var(--os-accent) 14%,transparent);border:1.5px solid color-mix(in srgb,var(--os-accent) 30%,transparent);display:flex;align-items:center;justify-content:center;margin-bottom:14px;color:var(--os-accent)}
        .os-title{font-family:'DM Serif Display',serif;font-size:1.7rem;color:var(--os-text);letter-spacing:-.02em;margin-bottom:5px}
        .os-sub{font-size:.82rem;color:var(--os-muted);line-height:1.55}
        .os-field{display:flex;flex-direction:column;gap:5px;margin-bottom:13px}
        .os-label{font-size:.76rem;font-weight:600;color:var(--os-muted);letter-spacing:.02em}
        .os-input-wrap{position:relative}
        .os-input{width:100%;padding:10px 14px;border-radius:11px;border:1.5px solid var(--os-border);background:var(--os-surface);color:var(--os-text);font-size:.88rem;font-family:inherit;outline:none;transition:border-color .2s}
        .os-input:focus{border-color:var(--os-accent)}
        .os-input.os-input--error{border-color:var(--os-danger)}
        .os-input.os-input--ok{border-color:var(--os-accent)}
        .os-input.has-toggle{padding-right:42px}
        .os-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--os-muted);cursor:pointer;display:flex;align-items:center;padding:2px}
        .os-error{display:flex;align-items:center;gap:6px;padding:9px 12px;border-radius:9px;background:var(--os-danger-soft);border:1px solid color-mix(in srgb,var(--os-danger) 28%,transparent);color:var(--os-danger);font-size:.78rem;font-weight:500;margin-bottom:12px}
        .os-field-msg{margin-top:6px;font-size:.74rem;line-height:1.45;color:var(--os-muted)}
        .os-field-msg--error{color:var(--os-danger)}
        .os-field-msg--checking{color:var(--os-muted)}
        .os-field-msg--ok{color:var(--os-accent)}
        .os-submit{width:100%;padding:12px;border-radius:12px;background:var(--os-accent);border:none;color:#fff;font-size:.9rem;font-weight:700;font-family:inherit;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;min-height:46px}
        .os-submit:hover{filter:brightness(1.1);transform:translateY(-1px)}
        .os-submit:active{transform:translateY(0) scale(.98)}
        .os-submit:disabled{opacity:.6;cursor:not-allowed;transform:none;filter:none}
        @keyframes spin{to{transform:rotate(360deg)}}
        .os-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:spin .8s linear infinite}
        .os-login-link{text-align:center;font-size:.8rem;color:var(--os-muted);margin-top:16px}
        .os-login-link a{color:var(--os-accent);font-weight:600;text-decoration:none}
        .os-login-link a:hover{text-decoration:underline}
        .os-terms{font-size:.71rem;color:var(--os-muted);text-align:center;margin-top:14px;line-height:1.55}
        .os-terms a{color:var(--os-muted);text-decoration:underline}
      `}</style>

      <nav className="os-nav">
        <Link href="/" className="os-brand">
          <div className="os-brand-logo"><img src="/logo.png" alt="Velamini" /></div>
          <span className="os-brand-name">Velamini</span>
        </Link>
        <button className="os-theme-btn" onClick={toggleTheme} title="Toggle theme">
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </nav>

      <div className="os-page">
        {/* Hero column */}
        <div className="os-hero">
          <p className="os-hero-pretitle">For businesses</p>
          <h1 className="os-hero-title">Build your AI-powered<br />support agent</h1>
          <p className="os-hero-desc">
            Automate customer conversations, train on your knowledge base, and deploy
            across WhatsApp, web, and API — all from one dashboard.
          </p>
          <div className="os-feat-list">
            {features.map(({ Icon, text }) => (
              <div key={text} className="os-feat">
                <div className="os-feat-icon"><Icon size={15} /></div>
                <span className="os-feat-text">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form column */}
        <div className="os-form-col">
          <motion.div
            className="os-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="os-card-header">
              <div className="os-icon-wrap"><Building2 size={22} /></div>
              <h2 className="os-title">Create your organisation</h2>
              <p className="os-sub">Set up your account and start building your AI agent.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="os-field">
                <label className="os-label">Full name</label>
                <div className="os-input-wrap">
                  <input
                    className="os-input"
                    type="text"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="os-field">
                <label className="os-label">Work email</label>
                <div className="os-input-wrap">
                  <input
                    className={`os-input ${emailState === "error" ? "os-input--error" : emailState === "ok" ? "os-input--ok" : ""}`}
                    type="email"
                    placeholder="you@yourcompany.com"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (emailState !== "idle") resetEmailCheck();
                    }}
                    onBlur={() => {
                      if (email.trim()) void checkEmail(email, true);
                    }}
                    autoComplete="email"
                    required
                  />
                </div>
                {emailMessage && (
                  <p
                    className={`os-field-msg ${
                      emailState === "error"
                        ? "os-field-msg--error"
                        : emailState === "checking"
                          ? "os-field-msg--checking"
                          : "os-field-msg--ok"
                    }`}
                  >
                    {emailMessage}
                  </p>
                )}
              </div>

              <div className="os-field">
                <label className="os-label">Password</label>
                <div className="os-input-wrap">
                  <input
                    className="os-input has-toggle"
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="os-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="os-field">
                <label className="os-label">Confirm password</label>
                <div className="os-input-wrap">
                  <input
                    className="os-input has-toggle"
                    type={showConf ? "text" : "password"}
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="os-eye" onClick={() => setShowConf(p => !p)} tabIndex={-1}>
                    {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <div className="os-error">{error}</div>}

              <button className="os-submit" type="submit" disabled={loading}>
                {loading ? <div className="os-spinner" /> : "Create account"}
              </button>
            </form>

            <p className="os-login-link">
              Already have an account?{" "}
              <Link href="/auth/org/login">Sign in</Link>
            </p>

            <p className="os-terms">
              By registering you agree to our{" "}
              <Link href="/terms">Terms of Service</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
