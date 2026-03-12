"use client";

import { signIn } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Moon, Sun } from "lucide-react";
import Navbar from "@/components/Navbar";

/* ─── Animated mesh background ─────────────────────────────────── */
function MeshBackground() {
  return (
    <div className="si-bg">
      {/* Soft orbs */}
      <motion.div className="si-orb si-orb-1"
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.8, 0.5], x: [0, 24, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="si-orb si-orb-2"
        animate={{ scale: [1, 1.22, 1], opacity: [0.35, 0.6, 0.35], x: [0, -18, 0], y: [0, 28, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div className="si-orb si-orb-3"
        animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Grid lines */}
      <div className="si-grid" />

      {/* Floating particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div key={i} className="si-particle"
          style={{ left: `${8 + i * 9}%`, bottom: `${10 + (i % 3) * 12}%` }}
          animate={{ y: [0, -(55 + i * 8)], opacity: [0, 0.7, 0], scale: [0.6, 1, 0.6] }}
          transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Feature pill ──────────────────────────────────────────────── */
function FeaturePill({ icon, text, delay }: { icon: string; text: string; delay: number }) {
  return (
    <motion.div className="si-pill"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <span className="si-pill-icon">{icon}</span>
      <span>{text}</span>
    </motion.div>
  );
}

/* ─── Main sign-in content ──────────────────────────────────────── */
function SignInContent() {
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams?.get("callbackUrl");
  const callbackUrl =
    rawCallbackUrl && rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/Dashboard";
  const isBanned = searchParams?.get("error") === "banned";
  const personalSignupUrl = `/auth/signup?callbackUrl=${encodeURIComponent(
    rawCallbackUrl && rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/onboarding"
  )}`;
  const [isDark, setIsDark] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [credentialsError, setCredentialsError] = useState("");
  const [credentialsLoading, setCredentialsLoading] = useState(false);

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

  const handleGoogleSignIn = () => {
    setIsSigningIn(true);
    signIn("google", { callbackUrl });
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError("");
    if (!email.trim() || !password) {
      setCredentialsError("Email and password are required.");
      return;
    }

    setCredentialsLoading(true);
    const result = await signIn("user-credentials", {
      email: email.toLowerCase().trim(),
      password,
      callbackUrl:
        rawCallbackUrl && rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
          ? rawCallbackUrl
          : "/onboarding",
      redirect: false,
    });
    setCredentialsLoading(false);

    if (result?.error) {
      setCredentialsError("Invalid email or password.");
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  const handleOrgSignIn = () => {
    try { localStorage.setItem("ob_account_type", "organization"); } catch {}
    setIsSigningIn(true);
    signIn("google", { callbackUrl: "/onboarding?create=org" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root,[data-mode="light"]{
          --si-bg:       #EBF5FF;
          --si-bg2:      #F5FAFF;
          --si-surface:  #FFFFFF;
          --si-border:   #C5DCF2;
          --si-text:     #0A1C2C;
          --si-muted:    #6B90AE;
          --si-accent:   #29A9D4;
          --si-accent2:  #1D8BB2;
          --si-soft:     #DDF1FA;
          --si-card-bg:  rgba(255,255,255,0.88);
          --si-shadow:   0 20px 60px rgba(10,40,80,0.13);
          --si-orb1:     rgba(41,169,212,0.22);
          --si-orb2:     rgba(125,211,252,0.18);
          --si-orb3:     rgba(99,210,239,0.14);
          --si-grid:     rgba(41,169,212,0.06);
        }
        [data-mode="dark"]{
          --si-bg:       #071320;
          --si-bg2:      #0A1A2A;
          --si-surface:  #0F1E2D;
          --si-border:   #1A3045;
          --si-text:     #C8E8F8;
          --si-muted:    #3D6580;
          --si-accent:   #38AECC;
          --si-accent2:  #2690AB;
          --si-soft:     #0C2535;
          --si-card-bg:  rgba(15,30,45,0.92);
          --si-shadow:   0 20px 60px rgba(0,0,0,0.45);
          --si-orb1:     rgba(56,174,204,0.18);
          --si-orb2:     rgba(41,169,212,0.12);
          --si-orb3:     rgba(125,211,252,0.08);
          --si-grid:     rgba(56,174,204,0.05);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--si-bg);color:var(--si-text);min-height:100vh}

        /* ── Shell ── */
        .si-page{
          min-height:100dvh;
          background:var(--si-bg);
          display:flex;flex-direction:column;
          overflow:hidden;position:relative;
        }

        /* ── Background ── */
        .si-bg{
          position:fixed;inset:0;pointer-events:none;z-index:0;
          overflow:hidden;
        }
        .si-orb{position:absolute;border-radius:50%;filter:blur(80px)}
        .si-orb-1{
          width:520px;height:520px;
          background:radial-gradient(circle,var(--si-orb1),transparent 70%);
          top:-100px;left:-80px;
        }
        .si-orb-2{
          width:600px;height:600px;
          background:radial-gradient(circle,var(--si-orb2),transparent 70%);
          bottom:-120px;right:-100px;
        }
        .si-orb-3{
          width:400px;height:400px;
          background:radial-gradient(circle,var(--si-orb3),transparent 70%);
          top:40%;left:40%;transform:translate(-50%,-50%);
        }
        .si-grid{
          position:absolute;inset:0;
          background-image:
            linear-gradient(var(--si-grid) 1px,transparent 1px),
            linear-gradient(90deg,var(--si-grid) 1px,transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%);
        }
        .si-particle{
          position:absolute;width:5px;height:5px;border-radius:50%;
          background:var(--si-accent);
          box-shadow:0 0 6px var(--si-accent);
        }

        /* ── Navbar override ── */
        .si-nav{
          position:fixed;top:0;left:0;right:0;z-index:50;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 20px;height:56px;
          background:color-mix(in srgb,var(--si-surface) 80%,transparent);
          border-bottom:1px solid var(--si-border);
          backdrop-filter:blur(12px);
        }
        .si-nav-brand{
          display:flex;align-items:center;gap:10px;
          cursor:pointer;text-decoration:none;
        }
        .si-nav-brand:hover .si-nav-name{color:var(--si-accent)}        
        .si-nav-brand:hover .si-nav-logo{border-color:var(--si-accent)}
        .si-nav-logo{
          width:32px;height:32px;border-radius:9px;overflow:hidden;
          border:1.5px solid var(--si-border);background:var(--si-soft);
        }
        .si-nav-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .si-nav-name{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:.95rem;font-weight:400;color:var(--si-text);letter-spacing:-.01em;
        }
        .si-nav-right{display:flex;align-items:center;gap:8px}
        .si-theme-btn{
          display:flex;align-items:center;justify-content:center;
          width:32px;height:32px;border-radius:8px;
          border:1px solid var(--si-border);background:var(--si-soft);
          color:var(--si-muted);cursor:pointer;transition:all .15s;
        }
        .si-theme-btn:hover{color:var(--si-accent);border-color:var(--si-accent)}
        .si-theme-btn svg{width:14px;height:14px}
        .si-nav-link{
          font-size:.8rem;font-weight:500;color:var(--si-muted);
          text-decoration:none;transition:color .15s;
          padding:4px 8px;border-radius:6px;
        }
        .si-nav-link:hover{color:var(--si-accent)}

        /* ── Main content ── */
        .si-main{
          flex:1;display:flex;align-items:center;justify-content:center;
          padding:80px 20px 40px;
          position:relative;z-index:1;
          min-height:100dvh;
        }

        .si-layout{
          width:100%;max-width:1000px;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:60px;align-items:center;
        }
        @media(max-width:768px){
          .si-layout{grid-template-columns:1fr;gap:40px;max-width:420px}
          .si-hero{order:2;text-align:center}
          .si-card-col{order:1}
        }

        /* ── Hero side ── */
        .si-hero{}

        .si-logo-mark{
          display:inline-flex;align-items:center;gap:10px;
          margin-bottom:28px;
        }
        .si-logo-icon{
          width:44px;height:44px;border-radius:12px;
          background:linear-gradient(135deg,var(--si-accent),#7DD3FC);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 14px rgba(41,169,212,0.35);
          flex-shrink:0;
        }
        .si-logo-icon svg{width:20px;height:20px;color:#fff}
        .si-logo-name{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:1.3rem;color:var(--si-text);letter-spacing:-.01em;
        }
        .si-logo-tag{font-size:.7rem;color:var(--si-muted);letter-spacing:.04em;text-transform:uppercase;margin-top:1px}

        .si-headline{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:clamp(2rem,4.5vw,3rem);
          line-height:1.18;letter-spacing:-.025em;
          color:var(--si-text);margin-bottom:18px;
        }
        .si-headline em{font-style:italic;color:var(--si-accent)}

        .si-desc{
          font-size:clamp(.88rem,1.8vw,1rem);
          color:var(--si-muted);line-height:1.7;
          margin-bottom:28px;max-width:400px;
        }
        @media(max-width:768px){.si-desc{max-width:100%;margin-left:auto;margin-right:auto}}

        .si-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:0}
        @media(max-width:768px){.si-pills{justify-content:center}}

        .si-pill{
          display:inline-flex;align-items:center;gap:6px;
          padding:6px 12px;border-radius:20px;
          border:1px solid var(--si-border);
          background:color-mix(in srgb,var(--si-surface) 70%,transparent);
          font-size:.75rem;font-weight:500;color:var(--si-muted);
          backdrop-filter:blur(6px);
        }
        .si-pill-icon{font-size:.85rem}

        /* Stat row */
        .si-stats{
          display:flex;gap:20px;margin-top:28px;
          padding-top:24px;border-top:1px solid var(--si-border);
        }
        @media(max-width:768px){.si-stats{justify-content:center}}
        .si-stat-num{
          font-family:'DM Serif Display',serif;
          font-size:1.45rem;font-weight:400;color:var(--si-accent);
          line-height:1;
        }
        .si-stat-lbl{font-size:.68rem;color:var(--si-muted);letter-spacing:.04em;text-transform:uppercase;margin-top:3px}

        /* ── Sign-in card ── */
        .si-card-col{display:flex;justify-content:center}
        .si-card{
          width:100%;max-width:360px;
          background:var(--si-card-bg);
          border:1px solid var(--si-border);
          border-radius:24px;
          padding:36px 32px 28px;
          box-shadow:var(--si-shadow);
          backdrop-filter:blur(20px);
          position:relative;overflow:hidden;
        }
        /* Top accent line */
        .si-card::before{
          content:'';
          position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,var(--si-accent),#7DD3FC,var(--si-accent));
          background-size:200% 100%;
          animation:shimmer 3s linear infinite;
        }
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        .si-card-header{text-align:center;margin-bottom:28px}
        .si-card-eyebrow{
          font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
          color:var(--si-accent);margin-bottom:8px;
        }
        .si-card-title{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:1.6rem;color:var(--si-text);letter-spacing:-.015em;margin-bottom:6px;
        }
        .si-card-sub{font-size:.8rem;color:var(--si-muted);line-height:1.5}
        .si-form{display:flex;flex-direction:column;gap:12px}
        .si-field{display:flex;flex-direction:column;gap:5px}
        .si-label{font-size:.76rem;font-weight:600;color:var(--si-muted);letter-spacing:.02em}
        .si-input-wrap{position:relative}
        .si-input{width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid var(--si-border);background:var(--si-surface);color:var(--si-text);font-size:.88rem;font-family:'DM Sans',system-ui,sans-serif;outline:none;transition:border-color .2s}
        .si-input:focus{border-color:var(--si-accent)}
        .si-input.has-toggle{padding-right:42px}
        .si-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--si-muted);cursor:pointer;display:flex;align-items:center;padding:2px}
        .si-error{display:flex;align-items:center;gap:6px;padding:9px 12px;border-radius:9px;background:color-mix(in srgb,#EF4444 10%,transparent);border:1px solid color-mix(in srgb,#EF4444 30%,transparent);color:#EF4444;font-size:.78rem;font-weight:500}
        .si-primary-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 20px;border-radius:13px;background:var(--si-accent);border:none;color:#fff;font-size:.88rem;font-weight:700;font-family:'DM Sans',system-ui,sans-serif;cursor:pointer;transition:all .2s;min-height:48px}
        .si-primary-btn:disabled{opacity:.65;cursor:not-allowed}
        .si-secondary-link{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 20px;border-radius:13px;background:transparent;border:1.5px solid var(--si-border);color:var(--si-text);font-size:.84rem;font-weight:600;font-family:'DM Sans',system-ui,sans-serif;text-decoration:none;transition:all .2s;min-height:46px}
        .si-secondary-link:hover{border-color:var(--si-accent);color:var(--si-accent);background:color-mix(in srgb,var(--si-accent) 6%,transparent)}
        /* Google button */
        .si-google-btn{
          width:100%;display:flex;align-items:center;justify-content:center;gap:11px;
          padding:13px 20px;border-radius:13px;
          background:var(--si-surface);
          border:1.5px solid var(--si-border);
          color:var(--si-text);font-size:.88rem;font-weight:600;
          font-family:'DM Sans',system-ui,sans-serif;
          cursor:pointer;transition:all .2s;
          box-shadow:0 2px 8px rgba(10,40,80,0.07);
          position:relative;overflow:hidden;
          min-height:48px;
        }
        .si-google-btn::after{
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(41,169,212,.08),transparent 60%);
          opacity:0;transition:opacity .2s;
        }
        .si-google-btn:hover{
          border-color:var(--si-accent);
          box-shadow:0 4px 18px rgba(41,169,212,.18);
          transform:translateY(-1px);
        }
        .si-google-btn:hover::after{opacity:1}
        .si-google-btn:active{transform:translateY(0) scale(.98)}
        .si-google-btn:disabled{opacity:.65;cursor:not-allowed;transform:none}

        .si-google-icon{width:18px;height:18px;flex-shrink:0}
        .si-google-text{flex:1;text-align:center}

        /* Arrow inside button */
        .si-btn-arrow{
          width:22px;height:22px;border-radius:6px;
          background:var(--si-soft);display:flex;align-items:center;justify-content:center;
          color:var(--si-accent);flex-shrink:0;transition:transform .2s;
        }
        .si-google-btn:hover .si-btn-arrow{transform:translateX(3px)}
        .si-btn-arrow svg{width:12px;height:12px}

        /* Divider */
        .si-divider{
          display:flex;align-items:center;gap:10px;
          margin:20px 0;color:var(--si-muted);font-size:.72rem;
        }
        .si-divider-line{flex:1;height:1px;background:var(--si-border)}

        /* Terms */
        .si-terms{font-size:.72rem;color:var(--si-muted);text-align:center;line-height:1.6;margin-top:20px}
        .si-terms a{color:var(--si-accent);text-decoration:none;transition:opacity .15s}
        .si-terms a:hover{opacity:.75;text-decoration:underline}

        /* Footer */
        .si-footer{
          position:relative;z-index:1;text-align:center;
          padding:12px 20px 20px;
          font-size:.72rem;color:var(--si-muted);
        }
        .si-footer a{color:var(--si-muted);text-decoration:none;transition:color .15s}
        .si-footer a:hover{color:var(--si-accent)}

        /* Divider */
        .si-divider{
          display:flex;align-items:center;gap:10px;
          margin:14px 0;
          color:var(--si-muted);font-size:.72rem;
        }
        .si-divider::before,.si-divider::after{
          content:'';flex:1;height:1px;background:var(--si-border);
        }

        /* Org button */
        .si-org-btn{
          width:100%;display:flex;align-items:center;justify-content:center;gap:10px;
          padding:11px 20px;border-radius:13px;
          background:transparent;
          border:1.5px solid var(--si-border);
          color:var(--si-muted);font-size:.84rem;font-weight:500;
          font-family:'DM Sans',system-ui,sans-serif;
          cursor:pointer;transition:all .2s;
          min-height:44px;
        }
        .si-org-btn:hover{
          border-color:var(--si-accent);
          color:var(--si-text);
          background:color-mix(in srgb,var(--si-accent) 6%,transparent);
        }
        .si-org-btn:disabled{opacity:.55;cursor:not-allowed}

        /* Loading spinner in button */
        @keyframes spin{to{transform:rotate(360deg)}}
        .si-spinner{
          width:16px;height:16px;border-radius:50%;
          border:2px solid var(--si-border);border-top-color:var(--si-accent);
          animation:spin .8s linear infinite;
          flex-shrink:0;
        }
      `}</style>

      <div className="si-page">
        <MeshBackground />

        {/* Navbar */}
        <nav className="si-nav">
          <Link href="/" className="si-nav-brand">
            <div className="si-nav-logo">
              <img src="/logo.png" alt="Velamini" />
            </div>
            <span className="si-nav-name">Velamini</span>
          </Link>
          <div className="si-nav-right">
            <Link href="/terms" className="si-nav-link" style={{ display: 'none' }}>Terms</Link>
            <button className="si-theme-btn" onClick={toggleTheme} title="Toggle theme">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </nav>

        {/* Main */}
        <main className="si-main">
          <div className="si-layout">

            {/* Hero */}
            <div className="si-hero">
              <motion.div className="si-logo-mark"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="si-logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <div className="si-logo-name">Velamini</div>
                  <div className="si-logo-tag">Virtual Self Platform</div>
                </div>
              </motion.div>

              <motion.h1 className="si-headline"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}>
                Your digital twin,<br /><em>alive and present</em>
              </motion.h1>

              <motion.p className="si-desc"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}>
                Train an AI that thinks, responds, and represents you. Share your knowledge and personality with the world — even when you're offline.
              </motion.p>

              <div className="si-pills">
                <FeaturePill icon="⚡" text="Live in minutes" delay={0.22} />
                <FeaturePill icon="🔒" text="Privacy first" delay={0.28} />
                <FeaturePill icon="🎯" text="Truly personalised" delay={0.34} />
              </div>

              <motion.div className="si-stats"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}>
                <div>
                  <div className="si-stat-num">100%</div>
                  <div className="si-stat-lbl">Free to start</div>
                </div>
                <div>
                  <div className="si-stat-num">&lt;5 min</div>
                  <div className="si-stat-lbl">Setup time</div>
                </div>
                <div>
                  <div className="si-stat-num">24/7</div>
                  <div className="si-stat-lbl">Always on</div>
                </div>
              </motion.div>
            </div>

            {/* Sign-in card */}
            <div className="si-card-col">
              <motion.div className="si-card"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.1 }}
              >
                <div className="si-card-header">
                  <p className="si-card-eyebrow">Welcome</p>
                  <h2 className="si-card-title">Get started free</h2>
                </div>

                {isBanned && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 10, marginBottom: 16,
                    background: "color-mix(in srgb,#EF4444 12%,transparent)",
                    border: "1px solid color-mix(in srgb,#EF4444 30%,transparent)",
                    color: "#EF4444", fontSize: ".8rem", lineHeight: 1.5,
                  }}>
                    <strong>Account suspended.</strong> Your account has been banned. Contact support if you believe this is a mistake.
                  </div>
                )}

                <form className="si-form" onSubmit={handleCredentialsSignIn} noValidate>
                  <div className="si-field">
                    <label className="si-label">Email</label>
                    <div className="si-input-wrap">
                      <input
                        className="si-input"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="si-field">
                    <label className="si-label">Password</label>
                    <div className="si-input-wrap">
                      <input
                        className="si-input has-toggle"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button type="button" className="si-eye" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {credentialsError && <div className="si-error">{credentialsError}</div>}

                  <button className="si-primary-btn" type="submit" disabled={credentialsLoading || isSigningIn}>
                    {credentialsLoading ? <span className="si-spinner" /> : "Continue with email"}
                  </button>

                  <Link className="si-secondary-link" href={personalSignupUrl}>
                    Create a personal account
                  </Link>
                </form>

                <motion.button
                  className="si-google-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  whileHover={{ scale: isSigningIn ? 1 : 1.01 }}
                  whileTap={{ scale: isSigningIn ? 1 : 0.98 }}
                >
                  {isSigningIn ? (
                    <>
                      <div className="si-spinner" />
                      <span className="si-google-text">Signing in…</span>
                    </>
                  ) : (
                    <>
                      <svg className="si-google-icon" viewBox="0 0 24 24" aria-hidden>
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" />
                      </svg>
                      <span className="si-google-text">Continue with Google</span>
                      <div className="si-btn-arrow"><ArrowRight size={12} /></div>
                    </>
                  )}
                </motion.button>

                <div className="si-divider">or</div>

                <Link
                  href="/auth/org/signup"
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 10, padding: "11px 20px", borderRadius: 13,
                    background: "transparent", border: "1.5px solid var(--si-border)",
                    color: "var(--si-muted)", fontSize: ".84rem", fontWeight: 500,
                    fontFamily: "'DM Sans',system-ui,sans-serif", textDecoration: "none",
                    transition: "all .2s", minHeight: 44, boxSizing: "border-box",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
                  </svg>
                  Register / sign in as Organisation
                </Link>

                <p className="si-terms">
                  By continuing you agree to our{" "}
                  <Link href="/terms">Terms of Service</Link> and{" "}
                  <Link href="/privacy">Privacy Policy</Link>.
                </p>
              </motion.div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="si-footer">
          © {new Date().getFullYear()} Velamini &nbsp;·&nbsp;{" "}
          <Link href="/terms">Terms</Link>&nbsp;·&nbsp;
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </>
  );
}

/* ─── Page export ───────────────────────────────────────────────── */
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#EBF5FF', flexDirection: 'column', gap: 16,
        fontFamily: "'DM Sans', system-ui, sans-serif"
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid #C5DCF2', borderTopColor: '#29A9D4',
          animation: 'spin .8s linear infinite'
        }} />
        <p style={{ color: '#6B90AE', fontSize: '.84rem' }}>Loading…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
