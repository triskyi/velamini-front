"use client";

import { motion } from "framer-motion";
import { Wrench, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

function Background() {
  return (
    <div className="mn-bg">
      <motion.div className="mn-orb mn-orb-1"
        animate={{ scale:[1,1.2,1], opacity:[0.4,0.65,0.4], x:[0,18,0], y:[0,-20,0] }}
        transition={{ duration:11, repeat:Infinity, ease:"easeInOut" }} />
      <motion.div className="mn-orb mn-orb-2"
        animate={{ scale:[1,1.25,1], opacity:[0.25,0.5,0.25], x:[0,-14,0], y:[0,22,0] }}
        transition={{ duration:14, repeat:Infinity, ease:"easeInOut", delay:2 }} />
      <div className="mn-grid" />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="mn-particle"
          style={{ left:`${10 + i * 10}%`, bottom:`${6 + (i % 4) * 11}%` }}
          animate={{ y:[0,-(50+i*8)], opacity:[0,0.55,0], scale:[0.5,1,0.5] }}
          transition={{ duration:3.8+i*0.4, repeat:Infinity, delay:i*0.7, ease:"easeOut" }} />
      ))}
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
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
          --c-warn-soft:   rgba(245,158,11,.1);
          --c-orb1:        rgba(41,169,212,.2);
          --c-orb2:        rgba(125,211,252,.14);
          --c-grid:        rgba(41,169,212,.055);
          --c-particle:    #29A9D4;
          --shadow-md:     0 8px 32px rgba(10,40,80,.1);
          --shadow-lg:     0 24px 64px rgba(10,40,80,.14);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--c-bg);font-family:'DM Sans',system-ui,sans-serif;color:var(--c-text);overflow-x:hidden}

        .mn-bg{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0}
        .mn-orb{position:absolute;border-radius:50%;filter:blur(72px)}
        .mn-orb-1{width:420px;height:420px;background:var(--c-orb1);top:-80px;right:-60px}
        .mn-orb-2{width:360px;height:360px;background:var(--c-orb2);bottom:-40px;left:-80px}
        .mn-grid{position:absolute;inset:0;background-image:linear-gradient(var(--c-grid) 1px,transparent 1px),linear-gradient(90deg,var(--c-grid) 1px,transparent 1px);background-size:40px 40px}
        .mn-particle{position:absolute;width:5px;height:5px;border-radius:50%;background:var(--c-particle)}

        .mn-wrap{position:relative;z-index:1;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px 16px}
        .mn-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:24px;box-shadow:var(--shadow-lg);padding:48px 40px 44px;max-width:500px;width:100%;text-align:center}
        @media(max-width:520px){.mn-card{padding:36px 24px 32px;border-radius:18px}}

        .mn-icon-ring{width:72px;height:72px;border-radius:20px;background:var(--c-warn-soft);border:1px solid rgba(245,158,11,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;color:var(--c-warn)}

        .mn-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.8rem,5vw,2.4rem);font-weight:400;letter-spacing:-.025em;line-height:1.2;margin-bottom:14px;color:var(--c-text)}
        .mn-desc{font-size:.92rem;color:var(--c-muted);line-height:1.7;max-width:380px;margin:0 auto 32px}

        .mn-badge{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:30px;background:var(--c-warn-soft);border:1px solid rgba(245,158,11,.25);font-size:.76rem;font-weight:700;color:var(--c-warn);letter-spacing:.04em;margin-bottom:32px}
        .mn-badge-dot{width:7px;height:7px;border-radius:50%;background:var(--c-warn);animation:mn-pulse 1.5s ease-in-out infinite}
        @keyframes mn-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}

        .mn-divider{height:1px;background:var(--c-border);margin:0 0 28px}

        .mn-back{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:12px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);font-size:.82rem;font-weight:600;cursor:pointer;transition:all .14s;text-decoration:none;font-family:inherit}
        .mn-back:hover{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-soft)}
        .mn-back svg{width:14px;height:14px}

        .mn-footer{margin-top:20px;font-size:.72rem;color:var(--c-muted)}
        .mn-footer strong{color:var(--c-text)}
      `}</style>

      <Background />

      <div className="mn-wrap">
        <motion.div
          className="mn-card"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="mn-icon-ring"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "backOut" }}
          >
            <Wrench size={30} strokeWidth={1.5} />
          </motion.div>

          <motion.div
            className="mn-badge"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <span className="mn-badge-dot" />
            <Clock size={11} />
            MAINTENANCE IN PROGRESS
          </motion.div>

          <motion.h1
            className="mn-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
          >
            We&apos;ll be right back
          </motion.h1>

          <motion.p
            className="mn-desc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.45 }}
          >
            Velamini is currently undergoing scheduled maintenance. We&apos;re making some
            improvements to give you a better experience. Please check back shortly.
          </motion.p>

          <div className="mn-divider" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Link href="/" className="mn-back">
              <ArrowLeft size={14} /> Back to home
            </Link>
          </motion.div>

          <motion.p
            className="mn-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            Questions? Contact <strong>support@velamini.com</strong>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
