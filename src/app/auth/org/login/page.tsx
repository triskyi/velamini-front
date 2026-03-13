"use client";

import { signIn } from "@/lib/auth-client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Building2, Eye, EyeOff, Moon, Sun } from "lucide-react";

function OrgLoginContent() {
  const [isDark,      setIsDark]      = useState(true);
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") || "dark";
      const dark = stored === "dark";
      setIsDark(dark);
      document.documentElement.setAttribute("data-mode", dark ? "dark" : "light");
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-mode", next ? "dark" : "light");
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Email and password are required."); return; }
    setLoading(true);
    const res = await signIn("org-credentials", {
      email: email.toLowerCase().trim(),
      password,
      callbackUrl: "/Dashboard/organizations",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else if (res?.url) {
      window.location.href = res.url;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root,[data-mode="light"]{
          --ol-bg:#EBF5FF;--ol-surface:#FFFFFF;--ol-border:#C5DCF2;
          --ol-text:#0A1C2C;--ol-muted:#6B90AE;--ol-accent:#29A9D4;
          --ol-soft:#DDF1FA;--ol-shadow:0 20px 60px rgba(10,40,80,.13);
          --ol-danger:#EF4444;--ol-danger-soft:rgba(239,68,68,.09);
        }
        [data-mode="dark"]{
          --ol-bg:#071320;--ol-surface:#0F1E2D;--ol-border:#1A3045;
          --ol-text:#C8E8F8;--ol-muted:#3D6580;--ol-accent:#38AECC;
          --ol-soft:#0C2535;--ol-shadow:0 20px 60px rgba(0,0,0,.45);
          --ol-danger:#F87171;--ol-danger-soft:rgba(248,113,113,.09);
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--ol-bg);color:var(--ol-text);min-height:100vh}
        .ol-page{min-height:100dvh;background:var(--ol-bg);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px 40px}
        .ol-nav{position:fixed;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:56px;background:color-mix(in srgb,var(--ol-surface) 80%,transparent);border-bottom:1px solid var(--ol-border);backdrop-filter:blur(12px);z-index:50}
        .ol-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit}
        .ol-brand-logo{width:30px;height:30px;border-radius:8px;overflow:hidden;border:1.5px solid var(--ol-border)}
        .ol-brand-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .ol-brand-name{font-family:'DM Serif Display',serif;font-size:.93rem;color:var(--ol-text)}
        .ol-theme-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid var(--ol-border);background:transparent;color:var(--ol-muted);cursor:pointer}
        .ol-card{width:100%;max-width:400px;background:color-mix(in srgb,var(--ol-surface) 92%,transparent);border:1px solid var(--ol-border);border-radius:24px;padding:40px 36px 32px;box-shadow:var(--ol-shadow);backdrop-filter:blur(20px);position:relative;overflow:hidden}
        .ol-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--ol-accent),#7DD3FC,var(--ol-accent));background-size:200% 100%;animation:shimmer 3s linear infinite}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .ol-icon-wrap{width:52px;height:52px;border-radius:14px;background:color-mix(in srgb,var(--ol-accent) 14%,transparent);border:1.5px solid color-mix(in srgb,var(--ol-accent) 30%,transparent);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;color:var(--ol-accent)}
        .ol-title{font-family:'DM Serif Display',serif;font-size:1.6rem;text-align:center;color:var(--ol-text);margin-bottom:5px;letter-spacing:-.015em}
        .ol-sub{font-size:.81rem;color:var(--ol-muted);text-align:center;line-height:1.55;margin-bottom:24px}
        .ol-field{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
        .ol-label{font-size:.76rem;font-weight:600;color:var(--ol-muted);letter-spacing:.02em}
        .ol-input-wrap{position:relative}
        .ol-input{width:100%;padding:10px 14px;border-radius:11px;border:1.5px solid var(--ol-border);background:var(--ol-surface);color:var(--ol-text);font-size:.88rem;font-family:inherit;outline:none;transition:border-color .2s}
        .ol-input:focus{border-color:var(--ol-accent)}
        .ol-input.has-toggle{padding-right:42px}
        .ol-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ol-muted);cursor:pointer;display:flex;align-items:center;padding:2px}
        .ol-error{display:flex;align-items:center;gap:6px;padding:9px 12px;border-radius:9px;background:var(--ol-danger-soft);border:1px solid color-mix(in srgb,var(--ol-danger) 28%,transparent);color:var(--ol-danger);font-size:.78rem;font-weight:500;margin-bottom:14px}
        .ol-submit{width:100%;padding:12px;border-radius:12px;background:var(--ol-accent);border:none;color:#fff;font-size:.9rem;font-weight:700;font-family:inherit;cursor:pointer;transition:all .2s;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:8px;min-height:46px}
        .ol-submit:hover{filter:brightness(1.1);transform:translateY(-1px)}
        .ol-submit:active{transform:translateY(0) scale(.98)}
        .ol-submit:disabled{opacity:.6;cursor:not-allowed;transform:none;filter:none}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ol-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:spin .8s linear infinite}
        .ol-divider{display:flex;align-items:center;gap:10px;margin:20px 0 16px;color:var(--ol-muted);font-size:.72rem}
        .ol-divider::before,.ol-divider::after{content:'';flex:1;height:1px;background:var(--ol-border)}
        .ol-signup-link{text-align:center;font-size:.8rem;color:var(--ol-muted);margin-bottom:10px}
        .ol-signup-link a{color:var(--ol-accent);font-weight:600;text-decoration:none}
        .ol-signup-link a:hover{text-decoration:underline}
        .ol-personal-link{display:block;text-align:center;font-size:.76rem;color:var(--ol-muted)}
        .ol-personal-link a{color:var(--ol-muted);text-decoration:none;border-bottom:1px solid var(--ol-border)}
        .ol-personal-link a:hover{color:var(--ol-text)}
        .ol-terms{font-size:.71rem;color:var(--ol-muted);text-align:center;margin-top:18px;line-height:1.55}
        .ol-terms a{color:var(--ol-muted);text-decoration:underline}
      `}</style>

      <nav className="ol-nav">
        <Link href="/" className="ol-brand">
          <div className="ol-brand-logo"><img src="/logo.png" alt="Velamini" /></div>
          <span className="ol-brand-name">Velamini</span>
        </Link>
        <button className="ol-theme-btn" onClick={toggleTheme} title="Toggle theme">
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </nav>

      <div className="ol-page">
        <motion.div
          className="ol-card"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <div className="ol-icon-wrap"><Building2 size={24} /></div>
          <h1 className="ol-title">Organisation sign in</h1>
          <p className="ol-sub">Sign in to manage your AI agent and organisation dashboard.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="ol-field">
              <label className="ol-label">Work email</label>
              <div className="ol-input-wrap">
                <input
                  className="ol-input"
                  type="email"
                  placeholder="you@yourcompany.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="ol-field">
              <label className="ol-label">Password</label>
              <div className="ol-input-wrap">
                <input
                  className="ol-input has-toggle"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="ol-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <div className="ol-error">{error}</div>}

            <button className="ol-submit" type="submit" disabled={loading}>
              {loading ? <div className="ol-spinner" /> : "Sign in"}
            </button>
          </form>

          <div className="ol-divider">no account yet?</div>
          <p className="ol-signup-link">
            <Link href="/auth/org/signup">Create an organisation account</Link>
          </p>
          <p className="ol-personal-link" style={{ marginTop: 10 }}>
            <Link href="/auth/signin">← Personal account instead</Link>
          </p>

          <p className="ol-terms">
            By continuing you agree to our{" "}
            <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </>
  );
}

export default function OrgLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#071320" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #1A3045", borderTopColor: "#38AECC", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <OrgLoginContent />
    </Suspense>
  );
}
