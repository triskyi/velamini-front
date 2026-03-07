"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Compass } from "lucide-react";

/* ── Animated background ── */
function Background() {
  return (
    <div className="nf-bg">
      <motion.div className="nf-orb nf-orb-1"
        animate={{ scale:[1,1.2,1], opacity:[0.4,0.65,0.4], x:[0,18,0], y:[0,-20,0] }}
        transition={{ duration:11, repeat:Infinity, ease:"easeInOut" }} />
      <motion.div className="nf-orb nf-orb-2"
        animate={{ scale:[1,1.25,1], opacity:[0.25,0.5,0.25], x:[0,-14,0], y:[0,22,0] }}
        transition={{ duration:14, repeat:Infinity, ease:"easeInOut", delay:2 }} />
      <div className="nf-grid" />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="nf-particle"
          style={{ left:`${10 + i * 10}%`, bottom:`${6 + (i % 4) * 11}%` }}
          animate={{ y:[0,-(50+i*8)], opacity:[0,0.55,0], scale:[0.5,1,0.5] }}
          transition={{ duration:3.8+i*0.4, repeat:Infinity, delay:i*0.7, ease:"easeOut" }} />
      ))}
    </div>
  );
}

export default function NotFound() {
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
          --c-orb1:        rgba(41,169,212,.2);
          --c-orb2:        rgba(125,211,252,.14);
          --c-grid:        rgba(41,169,212,.055);
          --c-particle:    #29A9D4;
          --shadow-md:     0 8px 32px rgba(10,40,80,.1);
          --shadow-lg:     0 24px 64px rgba(10,40,80,.14);
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
          --c-orb1:        rgba(56,174,204,.16);
          --c-orb2:        rgba(41,169,212,.10);
          --c-grid:        rgba(56,174,204,.048);
          --c-particle:    #38AECC;
          --shadow-md:     0 8px 32px rgba(0,0,0,.32);
          --shadow-lg:     0 24px 64px rgba(0,0,0,.52);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--c-bg);color:var(--c-text);transition:background .3s,color .3s}

        /* ── Page ── */
        .nf-page{min-height:100dvh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:var(--c-bg);transition:background .3s}

        /* ── Background ── */
        .nf-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
        .nf-orb{position:absolute;border-radius:50%;filter:blur(90px)}
        .nf-orb-1{width:520px;height:520px;background:radial-gradient(circle,var(--c-orb1),transparent 70%);top:-130px;left:-90px}
        .nf-orb-2{width:480px;height:480px;background:radial-gradient(circle,var(--c-orb2),transparent 70%);bottom:-90px;right:-80px}
        .nf-grid{
          position:absolute;inset:0;
          background-image:linear-gradient(var(--c-grid) 1px,transparent 1px),linear-gradient(90deg,var(--c-grid) 1px,transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 85% 75% at 50% 50%,black 30%,transparent 100%);
        }
        .nf-particle{position:absolute;width:4px;height:4px;border-radius:50%;background:var(--c-particle);box-shadow:0 0 5px var(--c-particle)}

        /* ── Navbar ── */
        .nf-nav{
          position:relative;z-index:10;flex-shrink:0;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 20px;height:56px;
          background:color-mix(in srgb,var(--c-surface) 80%,transparent);
          border-bottom:1px solid var(--c-border);
          backdrop-filter:blur(12px);
          transition:background .3s,border-color .3s;
        }
        .nf-brand{display:flex;align-items:center;gap:9px;text-decoration:none}
        .nf-logo{width:30px;height:30px;border-radius:8px;overflow:hidden;border:1.5px solid var(--c-border);background:var(--c-accent-soft);flex-shrink:0}
        .nf-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .nf-brand-name{font-family:'DM Serif Display',serif;font-size:.9rem;font-weight:600;color:var(--c-text)}
        .nf-back{display:flex;align-items:center;gap:6px;font-size:.76rem;font-weight:600;color:var(--c-muted);text-decoration:none;transition:color .14s}
        .nf-back:hover{color:var(--c-accent)}
        .nf-back svg{width:13px;height:13px}

        /* ── Main ── */
        .nf-main{flex:1;display:flex;align-items:center;justify-content:center;padding:32px 16px 48px;position:relative;z-index:1}
        .nf-inner{width:100%;max-width:520px;display:flex;flex-direction:column;align-items:center;text-align:center}

        /* ── 404 number ── */
        .nf-num-wrap{position:relative;margin-bottom:8px;user-select:none}
        .nf-num-ghost{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:clamp(9rem,22vw,14rem);
          font-weight:400;letter-spacing:-.04em;line-height:1;
          color:transparent;
          -webkit-text-stroke:1.5px color-mix(in srgb,var(--c-accent) 20%,transparent);
          position:relative;z-index:0;
          pointer-events:none;
        }
        .nf-num-real{
          position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          font-family:'DM Serif Display',Georgia,serif;
          font-size:clamp(9rem,22vw,14rem);
          font-weight:400;letter-spacing:-.04em;line-height:1;
          background:linear-gradient(135deg,var(--c-accent),color-mix(in srgb,var(--c-accent) 55%,var(--c-text)));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;
          filter:drop-shadow(0 4px 32px color-mix(in srgb,var(--c-accent) 28%,transparent));
        }

        /* ── Icon badge ── */
        .nf-icon{
          width:56px;height:56px;border-radius:16px;
          background:var(--c-accent-soft);
          border:1.5px solid color-mix(in srgb,var(--c-accent) 28%,transparent);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 6px 24px color-mix(in srgb,var(--c-accent) 18%,transparent);
          margin-bottom:20px;
        }
        .nf-icon svg{width:22px;height:22px;color:var(--c-accent)}

        /* ── Text ── */
        .nf-title{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:clamp(1.5rem,4vw,1.9rem);font-weight:400;
          letter-spacing:-.02em;color:var(--c-text);
          margin-bottom:10px;line-height:1.2;
        }
        .nf-title em{font-style:italic;color:var(--c-accent)}
        .nf-sub{font-size:.86rem;color:var(--c-muted);line-height:1.7;max-width:380px;margin:0 auto 32px}

        /* ── Buttons ── */
        .nf-btns{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:40px}
        .nf-btn-primary{
          display:inline-flex;align-items:center;gap:8px;
          padding:11px 22px;border-radius:12px;
          background:var(--c-accent);color:#fff;
          border:none;font-size:.86rem;font-weight:700;
          font-family:inherit;cursor:pointer;text-decoration:none;
          transition:all .16s;
        }
        .nf-btn-primary:hover{background:var(--c-accent-dim);transform:translateY(-1px);box-shadow:0 6px 20px color-mix(in srgb,var(--c-accent) 32%,transparent)}
        .nf-btn-primary:active{transform:translateY(0) scale(.98)}
        .nf-btn-primary svg{width:15px;height:15px}
        .nf-btn-secondary{
          display:inline-flex;align-items:center;gap:8px;
          padding:11px 20px;border-radius:12px;
          background:color-mix(in srgb,var(--c-surface) 90%,transparent);
          color:var(--c-muted);border:1px solid var(--c-border);
          font-size:.86rem;font-weight:600;
          font-family:inherit;cursor:pointer;text-decoration:none;
          transition:all .15s;backdrop-filter:blur(8px);
        }
        .nf-btn-secondary:hover{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-soft)}
        .nf-btn-secondary svg{width:14px;height:14px}

        /* ── Suggestions ── */
        .nf-suggest-label{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);margin-bottom:12px}
        .nf-suggest{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
        .nf-suggest-link{
          padding:6px 14px;border-radius:20px;
          border:1px solid var(--c-border);
          background:color-mix(in srgb,var(--c-surface) 90%,transparent);
          color:var(--c-muted);font-size:.76rem;font-weight:500;
          text-decoration:none;transition:all .13s;backdrop-filter:blur(6px);
        }
        .nf-suggest-link:hover{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-soft)}

        /* ── Footer ── */
        .nf-foot{position:relative;z-index:1;text-align:center;padding:12px 20px 20px;font-size:.7rem;color:var(--c-muted);flex-shrink:0}
        .nf-foot a{color:var(--c-muted);text-decoration:none;transition:color .14s}
        .nf-foot a:hover{color:var(--c-accent)}
      `}</style>

      <div className="nf-page">
        <Background />

        {/* Navbar */}
        <nav className="nf-nav">
          <Link href="/" className="nf-brand">
            <div className="nf-logo"><img src="/logo.png" alt="Velamini" /></div>
            <span className="nf-brand-name">Velamini</span>
          </Link>
          <Link href="/" className="nf-back">
            <ArrowLeft size={13} /> Go back
          </Link>
        </nav>

        {/* Main */}
        <main className="nf-main">
          <div className="nf-inner">

            {/* 404 */}
            <motion.div className="nf-num-wrap"
              initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
              transition={{ type:"spring", stiffness:220, damping:20 }}>
              <div className="nf-num-ghost">404</div>
              <div className="nf-num-real">404</div>
            </motion.div>

            {/* Icon */}
            <motion.div className="nf-icon"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:.15, type:"spring", stiffness:260, damping:22 }}>
              <Compass size={22} />
            </motion.div>

            {/* Text */}
            <motion.h1 className="nf-title"
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:.2 }}>
              This page <em>got lost</em>
            </motion.h1>

            <motion.p className="nf-sub"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:.27 }}>
              The page you're looking for doesn't exist or has been moved.
              Your virtual self is still safe though.
            </motion.p>

            {/* Buttons */}
            <motion.div className="nf-btns"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:.34 }}>
              <Link href="/" className="nf-btn-primary">
                <Home size={15} /> Back to Velamini
              </Link>
              
            </motion.div>

   
           
          </div>
        </main>

        <footer className="nf-foot">
          © {new Date().getFullYear()} Velamini &nbsp;·&nbsp;
          <Link href="/terms">Terms</Link>&nbsp;·&nbsp;
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </>
  );
}