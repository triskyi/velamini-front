"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Clock, Twitter, Mail } from "lucide-react";

/* ── Animated background ── */
function Background() {
  return (
    <div className="mp-bg">
      <motion.div className="mp-orb mp-orb-1"
        animate={{ scale:[1,1.2,1], opacity:[0.5,0.75,0.5], x:[0,20,0], y:[0,-20,0] }}
        transition={{ duration:11, repeat:Infinity, ease:"easeInOut" }} />
      <motion.div className="mp-orb mp-orb-2"
        animate={{ scale:[1,1.25,1], opacity:[0.3,0.6,0.3], x:[0,-18,0], y:[0,24,0] }}
        transition={{ duration:14, repeat:Infinity, ease:"easeInOut", delay:2 }} />
      <motion.div className="mp-orb mp-orb-3"
        animate={{ scale:[1,1.15,1], opacity:[0.2,0.45,0.2] }}
        transition={{ duration:9, repeat:Infinity, ease:"easeInOut", delay:1 }} />
      <div className="mp-grid" />
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div key={i} className="mp-particle"
          style={{ left:`${8 + i * 9}%`, bottom:`${6 + (i % 4) * 12}%` }}
          animate={{ y:[0,-(55+i*8)], opacity:[0,0.6,0], scale:[0.5,1,0.5] }}
          transition={{ duration:4+i*0.35, repeat:Infinity, delay:i*0.65, ease:"easeOut" }} />
      ))}
    </div>
  );
}

/* ── Countdown ── */
function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ── Digit block ── */
function Digit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, "0");
  return (
    <div className="mp-digit-wrap">
      <div className="mp-digit-box">
        <span className="mp-digit-num">{str}</span>
      </div>
      <span className="mp-digit-label">{label}</span>
    </div>
  );
}

export default function MaintenancePage() {
  // Set your estimated back-online time here
  const target = new Date(Date.now() + 3 * 3600000 + 30 * 60000); // 3h 30m from now
  const { h, m, s } = useCountdown(target);

  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") || "dark";
      const dark = stored === "dark";
      setIsDark(dark);
      document.documentElement.setAttribute("data-mode", dark ? "dark" : "light");
    } catch {}
  }, []);

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
          --c-warn:        #F59E0B;
          --c-warn-soft:   #FFFBEB;
          --c-orb1:        rgba(41,169,212,.22);
          --c-orb2:        rgba(245,158,11,.14);
          --c-orb3:        rgba(125,211,252,.18);
          --c-grid:        rgba(41,169,212,.06);
          --c-particle:    #29A9D4;
          --shadow-md:     0 8px 32px rgba(10,40,80,.1);
          --shadow-lg:     0 24px 64px rgba(10,40,80,.15);
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
          --c-warn:        #FCD34D;
          --c-warn-soft:   #2D2008;
          --c-orb1:        rgba(56,174,204,.18);
          --c-orb2:        rgba(252,211,77,.10);
          --c-orb3:        rgba(41,169,212,.12);
          --c-grid:        rgba(56,174,204,.05);
          --c-particle:    #38AECC;
          --shadow-md:     0 8px 32px rgba(0,0,0,.35);
          --shadow-lg:     0 24px 64px rgba(0,0,0,.55);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--c-bg);color:var(--c-text);transition:background .3s,color .3s}

        /* ── Page ── */
        .mp-page{min-height:100dvh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:var(--c-bg);transition:background .3s}

        /* ── Background ── */
        .mp-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
        .mp-orb{position:absolute;border-radius:50%;filter:blur(90px)}
        .mp-orb-1{width:560px;height:560px;background:radial-gradient(circle,var(--c-orb1),transparent 70%);top:-140px;left:-100px}
        .mp-orb-2{width:480px;height:480px;background:radial-gradient(circle,var(--c-orb2),transparent 70%);bottom:-80px;right:-80px}
        .mp-orb-3{width:400px;height:400px;background:radial-gradient(circle,var(--c-orb3),transparent 70%);top:40%;left:55%}
        .mp-grid{
          position:absolute;inset:0;
          background-image:linear-gradient(var(--c-grid) 1px,transparent 1px),linear-gradient(90deg,var(--c-grid) 1px,transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 90% 80% at 50% 50%,black 30%,transparent 100%);
        }
        .mp-particle{position:absolute;width:4px;height:4px;border-radius:50%;background:var(--c-particle);box-shadow:0 0 5px var(--c-particle)}

        /* ── Navbar ── */
        .mp-nav{
          position:relative;z-index:10;flex-shrink:0;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 20px;height:56px;
          background:color-mix(in srgb,var(--c-surface) 80%,transparent);
          border-bottom:1px solid var(--c-border);
          backdrop-filter:blur(12px);
          transition:background .3s,border-color .3s;
        }
        .mp-brand{display:flex;align-items:center;gap:9px;text-decoration:none}
        .mp-logo{width:30px;height:30px;border-radius:8px;overflow:hidden;border:1.5px solid var(--c-border);background:var(--c-accent-soft);flex-shrink:0}
        .mp-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .mp-brand-name{font-family:'DM Serif Display',serif;font-size:.9rem;font-weight:600;color:var(--c-text)}
        .mp-status-dot{width:8px;height:8px;border-radius:50%;background:var(--c-warn);box-shadow:0 0 6px var(--c-warn);animation:mppulse 2s infinite}
        @keyframes mppulse{0%,100%{opacity:.5;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}

        /* ── Main ── */
        .mp-main{flex:1;display:flex;align-items:center;justify-content:center;padding:32px 16px 48px;position:relative;z-index:1}
        .mp-inner{width:100%;max-width:560px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:0}

        /* ── Icon badge ── */
        .mp-icon-wrap{
          width:72px;height:72px;border-radius:22px;
          background:color-mix(in srgb,var(--c-warn) 12%,transparent);
          border:1.5px solid color-mix(in srgb,var(--c-warn) 28%,transparent);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 8px 28px color-mix(in srgb,var(--c-warn) 18%,transparent);
          margin-bottom:28px;position:relative;
        }
        .mp-icon-wrap svg{width:30px;height:30px;color:var(--c-warn)}
        .mp-icon-ring{
          position:absolute;inset:-8px;border-radius:30px;
          border:1px dashed color-mix(in srgb,var(--c-warn) 30%,transparent);
          animation:mpspin 12s linear infinite;
        }
        @keyframes mpspin{to{transform:rotate(360deg)}}

        /* ── Heading ── */
        .mp-title{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:clamp(2rem,6vw,3rem);font-weight:400;
          letter-spacing:-.03em;color:var(--c-text);
          line-height:1.1;margin-bottom:14px;
        }
        .mp-title em{font-style:italic;color:var(--c-accent)}
        .mp-sub{font-size:clamp(.82rem,2vw,.95rem);color:var(--c-muted);line-height:1.7;max-width:400px;margin:0 auto 36px}

        /* ── Countdown ── */
        .mp-countdown{display:flex;align-items:flex-start;gap:10px;margin-bottom:40px}
        .mp-digit-wrap{display:flex;flex-direction:column;align-items:center;gap:6px}
        .mp-digit-box{
          min-width:72px;padding:14px 12px 12px;
          background:color-mix(in srgb,var(--c-surface) 92%,transparent);
          border:1px solid var(--c-border);border-radius:16px;
          box-shadow:var(--shadow-md);
          backdrop-filter:blur(10px);
          position:relative;overflow:hidden;
          transition:background .3s,border-color .3s;
        }
        .mp-digit-box::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c-warn);opacity:.6}
        .mp-digit-num{font-family:'DM Serif Display',serif;font-size:2.2rem;font-weight:400;color:var(--c-text);letter-spacing:-.02em;line-height:1}
        .mp-digit-label{font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted)}
        .mp-colon{font-family:'DM Serif Display',serif;font-size:2rem;color:var(--c-muted);margin-top:10px;animation:mpblink 1s step-end infinite}
        @keyframes mpblink{0%,100%{opacity:1}50%{opacity:.2}}

        /* ── Progress bar ── */
        .mp-progress-wrap{width:100%;max-width:360px;margin:0 auto 36px}
        .mp-progress-head{display:flex;justify-content:space-between;margin-bottom:8px}
        .mp-progress-label{font-size:.7rem;font-weight:600;color:var(--c-muted);text-transform:uppercase;letter-spacing:.08em}
        .mp-progress-pct{font-size:.7rem;font-weight:700;color:var(--c-accent)}
        .mp-progress-track{height:5px;background:var(--c-surface-2);border-radius:4px;overflow:hidden;border:1px solid var(--c-border)}
        .mp-progress-bar{height:100%;width:68%;background:linear-gradient(90deg,var(--c-accent),var(--c-warn));border-radius:4px;position:relative;overflow:hidden}
        .mp-progress-bar::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);animation:mpshimmer 2s linear infinite}
        @keyframes mpshimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

        /* ── What's happening cards ── */
        .mp-cards{display:grid;gap:10px;grid-template-columns:repeat(3,1fr);margin-bottom:36px;width:100%}
        @media(max-width:500px){.mp-cards{grid-template-columns:1fr}}
        .mp-card{
          background:color-mix(in srgb,var(--c-surface) 90%,transparent);
          border:1px solid var(--c-border);border-radius:14px;
          padding:14px 14px 12px;text-align:left;
          backdrop-filter:blur(10px);
          transition:background .3s,border-color .2s;
          position:relative;overflow:hidden;
        }
        .mp-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--ci-color);opacity:.6}
        .mp-card:hover{border-color:var(--ci-color)}
        .mp-card-ic{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--ci-color) 14%,transparent);color:var(--ci-color);margin-bottom:9px}
        .mp-card-ic svg{width:13px;height:13px}
        .mp-card-title{font-size:.78rem;font-weight:700;color:var(--c-text);margin-bottom:3px}
        .mp-card-sub{font-size:.68rem;color:var(--c-muted);line-height:1.5}

        /* ── Links ── */
        .mp-links{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
        .mp-link{
          display:flex;align-items:center;gap:7px;
          padding:9px 18px;border-radius:11px;
          border:1px solid var(--c-border);
          background:color-mix(in srgb,var(--c-surface) 90%,transparent);
          color:var(--c-muted);font-size:.8rem;font-weight:600;
          text-decoration:none;cursor:pointer;
          transition:all .15s;backdrop-filter:blur(8px);
        }
        .mp-link:hover{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-soft)}
        .mp-link svg{width:13px;height:13px}

        /* ── Footer ── */
        .mp-foot{position:relative;z-index:1;text-align:center;padding:12px 20px 20px;font-size:.7rem;color:var(--c-muted);flex-shrink:0}
        .mp-foot a{color:var(--c-muted);text-decoration:none;transition:color .14s}
        .mp-foot a:hover{color:var(--c-accent)}
      `}</style>

      <div className="mp-page">
        <Background />

        {/* Navbar */}
        <nav className="mp-nav">
          <div className="mp-brand">
            <div className="mp-logo"><img src="/logo.png" alt="Velamini" /></div>
            <span className="mp-brand-name">Velamini</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div className="mp-status-dot" />
            <span style={{ fontSize:".72rem", color:"var(--c-warn)", fontWeight:600 }}>Maintenance</span>
          </div>
        </nav>

        {/* Main */}
        <main className="mp-main">
          <div className="mp-inner">

            {/* Icon */}
            <motion.div className="mp-icon-wrap"
              initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1 }}
              transition={{ type:"spring", stiffness:260, damping:20 }}>
              <div className="mp-icon-ring" />
              <Wrench size={30} />
            </motion.div>

            {/* Heading */}
            <motion.h1 className="mp-title"
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:.1, duration:.5 }}>
              Back <em>soon</em>,<br />we promise.
            </motion.h1>

            <motion.p className="mp-sub"
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:.2, duration:.4 }}>
              We're upgrading Velamini to serve your virtual self better.
              Hang tight — estimated downtime is a few hours.
            </motion.p>

            {/* Countdown */}
            <motion.div className="mp-countdown"
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:.3 }}>
              <Digit value={h} label="hours" />
              <span className="mp-colon">:</span>
              <Digit value={m} label="mins" />
              <span className="mp-colon">:</span>
              <Digit value={s} label="secs" />
            </motion.div>

            {/* Progress */}
            <motion.div className="mp-progress-wrap"
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.4 }}>
              <div className="mp-progress-head">
                <span className="mp-progress-label">Restoration progress</span>
                <span className="mp-progress-pct">68%</span>
              </div>
              <div className="mp-progress-track">
                <div className="mp-progress-bar" />
              </div>
            </motion.div>

            {/* What's happening */}
            <motion.div className="mp-cards"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.5 }}>
              {[
                { label:"Database",    sub:"Schema migration in progress",   color:"#29A9D4", icon:"🗄" },
                { label:"AI Models",   sub:"Redeploying updated weights",     color:"#6366F1", icon:"🤖" },
                { label:"CDN Assets",  sub:"Flushing and re-warming cache",   color:"#10B981", icon:"⚡" },
              ].map(({ label, sub, color, icon }) => (
                <div key={label} className="mp-card" style={{ "--ci-color": color } as any}>
                  <div className="mp-card-ic"><span style={{ fontSize:13 }}>{icon}</span></div>
                  <div className="mp-card-title">{label}</div>
                  <div className="mp-card-sub">{sub}</div>
                </div>
              ))}
            </motion.div>

            {/* Links */}
            <motion.div className="mp-links"
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.6 }}>
              <a className="mp-link" href="https://twitter.com/velamini" target="_blank" rel="noopener noreferrer">
                <Twitter size={13} /> Follow for updates
              </a>
              <a className="mp-link" href="mailto:support@velamini.example">
                <Mail size={13} /> Contact support
              </a>
              <a className="mp-link" href="https://status.velamini.example" target="_blank" rel="noopener noreferrer">
                <Clock size={13} /> Status page
              </a>
            </motion.div>
          </div>
        </main>

        <footer className="mp-foot">
          © {new Date().getFullYear()} Velamini &nbsp;·&nbsp;{" "}
          <a href="/terms">Terms</a>&nbsp;·&nbsp;
          <a href="/privacy">Privacy</a>
        </footer>
      </div>
    </>
  );
}