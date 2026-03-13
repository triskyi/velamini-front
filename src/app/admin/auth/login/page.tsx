"use client";

import { signIn, useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, AlertCircle, Moon, Sun, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

/* ── Animated grid + orbs background ── */
function Background() {
  return (
    <div className="al-bg">
      <motion.div className="al-orb al-orb-1"
        animate={{ scale:[1,1.18,1], opacity:[0.45,0.7,0.45], x:[0,22,0], y:[0,-18,0] }}
        transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }} />
      <motion.div className="al-orb al-orb-2"
        animate={{ scale:[1,1.22,1], opacity:[0.3,0.55,0.3], x:[0,-16,0], y:[0,26,0] }}
        transition={{ duration:13, repeat:Infinity, ease:"easeInOut", delay:1.5 }} />
      <div className="al-grid" />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="al-particle"
          style={{ left:`${10 + i * 11}%`, bottom:`${8 + (i % 3) * 14}%` }}
          animate={{ y:[0,-(50+i*9)], opacity:[0,0.65,0], scale:[0.6,1,0.6] }}
          transition={{ duration:3.5+i*0.4, repeat:Infinity, delay:i*0.7, ease:"easeOut" }} />
      ))}
    </div>
  );
}

function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const signedUp = searchParams?.get("signup") === "success";

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [isDark,       setIsDark]       = useState(true);
  const [mounted,      setMounted]      = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") || "dark";
      const dark   = stored === "dark";
      setIsDark(dark);
      document.documentElement.setAttribute("data-mode", dark ? "dark" : "light");
    } catch {}
  }, []);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.isAdminAuth) {
      router.replace("/admin");
    }
  }, [session, status, router]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-mode", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const result = await signIn("admin-credentials", {
      email: email.trim().toLowerCase(), password, redirect: false,
    });
    setLoading(false);
    if (result?.error) setError("Invalid credentials. Access denied.");
    else router.replace("/admin");
  };

  if (status === "loading") {
    return (
      <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--c-bg,#EFF7FF)" }}>
        <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid var(--c-border,#C5DCF2)", borderTopColor:"var(--c-accent,#29A9D4)", animation:"spin .8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root,[data-mode="light"]{
          --c-bg:          #EFF7FF;
          --c-surface:     #FFFFFF;
          --c-surface-2:   #E2F0FC;
          --c-border:      #C5DCF2;
          --c-text:        #0B1E2E;
          --c-muted:       #6B90AE;
          --c-accent:      #29A9D4;
          --c-accent-dim:  #1D8BB2;
          --c-accent-soft: #DDF1FA;
          --c-danger:      #EF4444;
          --c-danger-soft: #FEE2E2;
          --c-orb1:        rgba(41,169,212,.22);
          --c-orb2:        rgba(125,211,252,.16);
          --c-grid:        rgba(41,169,212,.06);
          --c-particle:    #29A9D4;
          --shadow-md:     0 16px 48px rgba(10,40,80,.12);
          --shadow-lg:     0 24px 64px rgba(10,40,80,.16);
        }
        [data-mode="dark"]{
          --c-bg:          #081420;
          --c-surface:     #0F1E2D;
          --c-surface-2:   #162435;
          --c-border:      #1A3045;
          --c-text:        #C8E8F8;
          --c-muted:       #3D6580;
          --c-accent:      #38AECC;
          --c-accent-dim:  #2690AB;
          --c-accent-soft: #0C2535;
          --c-danger:      #F87171;
          --c-danger-soft: #3B1212;
          --c-orb1:        rgba(56,174,204,.18);
          --c-orb2:        rgba(41,169,212,.11);
          --c-grid:        rgba(56,174,204,.05);
          --c-particle:    #38AECC;
          --shadow-md:     0 16px 48px rgba(0,0,0,.4);
          --shadow-lg:     0 24px 64px rgba(0,0,0,.55);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--c-bg);color:var(--c-text);transition:background .3s,color .3s}

        /* ── Page ── */
        .al-page{
          min-height:100dvh;position:relative;overflow:hidden;
          display:flex;flex-direction:column;
          background:var(--c-bg);transition:background .3s;
        }

        /* ── Background ── */
        .al-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
        .al-orb{position:absolute;border-radius:50%;filter:blur(80px)}
        .al-orb-1{width:500px;height:500px;background:radial-gradient(circle,var(--c-orb1),transparent 70%);top:-120px;left:-80px}
        .al-orb-2{width:560px;height:560px;background:radial-gradient(circle,var(--c-orb2),transparent 70%);bottom:-100px;right:-100px}
        .al-grid{
          position:absolute;inset:0;
          background-image:
            linear-gradient(var(--c-grid) 1px,transparent 1px),
            linear-gradient(90deg,var(--c-grid) 1px,transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 80% 70% at 50% 50%,black 40%,transparent 100%);
        }
        .al-particle{
          position:absolute;width:5px;height:5px;border-radius:50%;
          background:var(--c-particle);box-shadow:0 0 6px var(--c-particle);
        }

        /* ── Navbar ── */
        .al-nav{
          position:relative;z-index:10;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 20px;height:56px;
          background:color-mix(in srgb,var(--c-surface) 80%,transparent);
          border-bottom:1px solid var(--c-border);
          backdrop-filter:blur(12px);
          transition:background .3s,border-color .3s;
        }
        .al-nav-brand{display:flex;align-items:center;gap:9px;text-decoration:none}
        .al-nav-logo{width:30px;height:30px;border-radius:8px;overflow:hidden;border:1.5px solid var(--c-border);background:var(--c-accent-soft);flex-shrink:0}
        .al-nav-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .al-nav-name{font-family:'DM Serif Display',serif;font-size:.9rem;font-weight:600;color:var(--c-text)}
        .al-nav-chip{font-size:.56rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--c-danger);padding:2px 7px;border-radius:20px}
        .al-theme-btn{
          display:flex;align-items:center;justify-content:center;
          width:32px;height:32px;border-radius:8px;
          border:1px solid var(--c-border);background:var(--c-surface-2);
          color:var(--c-muted);cursor:pointer;transition:all .14s;
        }
        .al-theme-btn:hover{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-accent-soft)}
        .al-theme-btn svg{width:14px;height:14px}

        /* ── Main ── */
        .al-main{
          flex:1;display:flex;align-items:center;justify-content:center;
          padding:32px 16px 48px;position:relative;z-index:1;
        }

        /* ── Card ── */
        .al-card{
          width:100%;max-width:400px;
          background:color-mix(in srgb,var(--c-surface) 92%,transparent);
          border:1px solid var(--c-border);border-radius:22px;
          padding:36px 32px 28px;
          box-shadow:var(--shadow-lg);
          backdrop-filter:blur(20px);
          position:relative;overflow:hidden;
        }
        .al-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,var(--c-danger),#F87171 40%,var(--c-accent) 100%);
          background-size:200% 100%;animation:alshimmer 3.5s linear infinite;
        }
        @keyframes alshimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        /* ── Card header ── */
        .al-card-head{text-align:center;margin-bottom:28px}
        .al-shield{
          width:56px;height:56px;border-radius:16px;
          background:color-mix(in srgb,var(--c-danger) 12%,transparent);
          border:1.5px solid color-mix(in srgb,var(--c-danger) 30%,transparent);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 14px;
          box-shadow:0 4px 14px color-mix(in srgb,var(--c-danger) 18%,transparent);
        }
        .al-shield svg{width:24px;height:24px;color:var(--c-danger)}
        .al-card-title{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:1.55rem;font-weight:400;letter-spacing:-.02em;
          color:var(--c-text);margin-bottom:5px;
        }
        .al-card-sub{font-size:.77rem;color:var(--c-muted);line-height:1.5}

        /* ── Form ── */
        .al-form{display:flex;flex-direction:column;gap:16px}
        .al-field label{
          display:block;font-size:.65rem;font-weight:700;letter-spacing:.1em;
          text-transform:uppercase;color:var(--c-muted);margin-bottom:6px;
        }
        .al-input-wrap{position:relative}
        .al-input-ic{
          position:absolute;left:11px;top:50%;transform:translateY(-50%);
          color:var(--c-muted);pointer-events:none;width:14px;height:14px;
        }
        .al-input{
          width:100%;padding:10px 12px 10px 34px;
          border-radius:11px;border:1.5px solid var(--c-border);
          background:var(--c-surface-2);color:var(--c-text);
          font-size:.85rem;font-family:inherit;outline:none;
          transition:border-color .15s,background .15s;
        }
        .al-input:focus{border-color:var(--c-accent);background:var(--c-surface)}
        .al-input::placeholder{color:var(--c-muted);opacity:.7}
        .al-input--pr{padding-right:38px}
        .al-eye{
          position:absolute;right:11px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:var(--c-muted);
          display:flex;align-items:center;justify-content:center;
          transition:color .14s;padding:2px;
        }
        .al-eye:hover{color:var(--c-accent)}
        .al-eye svg{width:14px;height:14px}

        /* ── Error ── */
        .al-error{
          display:flex;align-items:center;gap:8px;
          padding:10px 13px;border-radius:10px;
          background:var(--c-danger-soft);
          border:1px solid color-mix(in srgb,var(--c-danger) 28%,transparent);
          color:var(--c-danger);font-size:.78rem;font-weight:500;
        }
        .al-error svg{width:13px;height:13px;flex-shrink:0}

        /* ── Submit ── */
        .al-submit{
          display:flex;align-items:center;justify-content:center;gap:8px;
          width:100%;padding:12px 20px;border-radius:12px;
          background:var(--c-accent);color:#fff;
          border:none;font-size:.88rem;font-weight:700;
          font-family:inherit;cursor:pointer;transition:all .16s;
          min-height:46px;margin-top:2px;
        }
        .al-submit:hover:not(:disabled){background:var(--c-accent-dim);transform:translateY(-1px);box-shadow:0 6px 20px color-mix(in srgb,var(--c-accent) 35%,transparent)}
        .al-submit:active:not(:disabled){transform:translateY(0) scale(.98)}
        .al-submit:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .al-submit svg{width:15px;height:15px}
        .al-spinner{
          width:16px;height:16px;border-radius:50%;
          border:2px solid rgba(255,255,255,.35);border-top-color:#fff;
          animation:alspin .75s linear infinite;flex-shrink:0;
        }
        @keyframes alspin{to{transform:rotate(360deg)}}

        /* ── Divider ── */
        .al-divider{display:flex;align-items:center;gap:10px;margin:4px 0}
        .al-divider-line{flex:1;height:1px;background:var(--c-border)}
        .al-divider-text{font-size:.68rem;color:var(--c-muted)}

        /* ── Footer note ── */
        .al-note{text-align:center;font-size:.72rem;color:var(--c-muted);margin-top:16px;line-height:1.6}
        .al-note a{color:var(--c-accent);text-decoration:none;transition:opacity .14s}
        .al-note a:hover{opacity:.75;text-decoration:underline}

        /* ── Restricted banner ── */
        .al-restricted{
          display:flex;align-items:center;gap:8px;
          padding:9px 13px;border-radius:10px;
          background:color-mix(in srgb,var(--c-danger) 8%,transparent);
          border:1px solid color-mix(in srgb,var(--c-danger) 18%,transparent);
          font-size:.72rem;color:var(--c-muted);margin-bottom:20px;
        }
        .al-restricted svg{width:12px;height:12px;color:var(--c-danger);flex-shrink:0}

        /* ── Page footer ── */
        .al-foot{
          position:relative;z-index:1;
          text-align:center;padding:12px 20px 20px;
          font-size:.7rem;color:var(--c-muted);
        }
        .al-foot a{color:var(--c-muted);text-decoration:none;transition:color .14s}
        .al-foot a:hover{color:var(--c-accent)}
      `}</style>

      <div className="al-page">
        <Background />

        {/* Navbar */}
        <nav className="al-nav">
          <Link href="/" className="al-nav-brand">
            <div className="al-nav-logo"><img src="/logo.png" alt="Velamini" /></div>
            <span className="al-nav-name">Velamini</span>
            <span className="al-nav-chip">Admin</span>
          </Link>
          {mounted && (
            <button className="al-theme-btn" onClick={toggleTheme} title="Toggle theme">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
        </nav>

        {/* Main */}
        <main className="al-main">
          <motion.div style={{ width:"100%", maxWidth:400 }}
            initial={{ opacity:0, y:22, scale:.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ type:"spring", stiffness:260, damping:24 }}>

            <div className="al-card">
              {/* Header */}
              <div className="al-card-head">
                <div className="al-shield"><ShieldCheck size={24} /></div>
                <h1 className="al-card-title">Admin Access</h1>
                <p className="al-card-sub">Restricted to authorised personnel only.</p>
              </div>

              {/* Restricted notice */}
              <div className="al-restricted">
                <AlertCircle size={12} />
                All access attempts are logged and monitored.
              </div>

              {/* Form */}
              <form className="al-form" onSubmit={handleSubmit}>
                {/* Email */}
                <div className="al-field">
                  <label htmlFor="al-email">Email</label>
                  <div className="al-input-wrap">
                    <Mail className="al-input-ic" />
                    <input id="al-email" className="al-input" type="email" placeholder="email@admin.rw"
                      value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                </div>

                {/* Password */}
                <div className="al-field">
                  <label htmlFor="al-pass">Password</label>
                  <div className="al-input-wrap">
                    <Lock className="al-input-ic" />
                    <input id="al-pass" className={`al-input al-input--pr`}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      required autoComplete="current-password" />
                    <button type="button" className="al-eye" onClick={() => setShowPassword(v => !v)}
                      title={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Signup success banner */}
                {signedUp && (
                  <motion.div
                    initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                    className="al-error"
                    style={{ background:"rgba(34,197,94,0.1)", borderColor:"rgba(34,197,94,0.3)", color:"#4ade80" }}
                  >
                    <CheckCircle2 size={13} /> Account created! Sign in below.
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <motion.div className="al-error"
                    initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}>
                    <AlertCircle size={13} /> {error}
                  </motion.div>
                )}

                {/* Submit */}
                <button type="submit" className="al-submit" disabled={loading}>
                  {loading
                    ? <><div className="al-spinner" /> Verifying…</>
                    : <><ShieldCheck size={15} /> Sign in as Admin</>
                  }
                </button>
              </form>

              <div className="al-divider">
                <div className="al-divider-line" />
                <span className="al-divider-text">or</span>
                <div className="al-divider-line" />
              </div>

              <p className="al-note">
                Not an admin?{" "}
                <Link href="/auth/signin">Regular sign in</Link>
              </p>
              <p className="al-note" style={{ marginTop: "0.5rem" }}>
                Need an account?{" "}
                <Link href="/admin/auth/signup">Create admin account</Link>
              </p>
            </div>
          </motion.div>
        </main>

        <footer className="al-foot">
          © {new Date().getFullYear()} Velamini &nbsp;·&nbsp;{" "}
          <Link href="/terms">Terms</Link>&nbsp;·&nbsp;
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </>
  );
}

export default function AdminLoginPageWrapper() {
  return (
    <Suspense>
      <AdminLoginPage />
    </Suspense>
  );
}
