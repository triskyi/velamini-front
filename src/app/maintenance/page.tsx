"use client";

import { motion } from "framer-motion";
import { Wrench, Clock, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function CountdownTimer() {
  // Default to 7 hours from now
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set target time to 7 hours from now
    const targetTime = Date.now() + 7 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="mn-timer">
      <div className="mn-timer-block">
        <span className="mn-timer-num">{pad(timeLeft.hours)}</span>
        <span className="mn-timer-label">Hours</span>
      </div>
      <span className="mn-timer-sep">:</span>
      <div className="mn-timer-block">
        <span className="mn-timer-num">{pad(timeLeft.minutes)}</span>
        <span className="mn-timer-label">Minutes</span>
      </div>
      <span className="mn-timer-sep">:</span>
      <div className="mn-timer-block">
        <span className="mn-timer-num">{pad(timeLeft.seconds)}</span>
        <span className="mn-timer-label">Seconds</span>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="mn-bg">
      {/* Animated orbs */}
      <motion.div className="mn-orb mn-orb-1"
        animate={{ 
          scale: [1, 1.4, 1], 
          opacity: [0.5, 0.85, 0.5], 
          x: [0, 40, 0], 
          y: [0, -40, 0] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="mn-orb mn-orb-2"
        animate={{ 
          scale: [1, 1.5, 1], 
          opacity: [0.3, 0.65, 0.3], 
          x: [0, -30, 0], 
          y: [0, 50, 0] 
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      <motion.div className="mn-orb mn-orb-3"
        animate={{ 
          scale: [1, 1.3, 1], 
          opacity: [0.25, 0.5, 0.25], 
          x: [0, 35, 0], 
          y: [0, -25, 0] 
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }} />
      
      {/* Grid pattern */}
      <div className="mn-grid" />
      
      {/* Floating particles */}
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div key={i} className="mn-particle"
          style={{ 
            left: `${5 + (i % 8) * 12}%`, 
            top: `${10 + Math.floor(i / 8) * 50}%`,
            width: 2 + (i % 4),
            height: 2 + (i % 4)
          }}
          animate={{ 
            y: [0, -(100 + i * 8)], 
            opacity: [0, 0.9, 0],
            scale: [0.3, 1.3, 0.3]
          }}
          transition={{ 
            duration: 3.5 + i * 0.25, 
            repeat: Infinity, 
            delay: i * 0.4, 
            ease: "easeOut" 
          }} 
        />
      ))}

      {/* Sparkle effects */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="mn-sparkle"
          style={{
            left: `${15 + i * 10}%`,
            top: `${20 + (i % 3) * 30}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          <Sparkles size={12} />
        </motion.div>
      ))}
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        :root {
          --c-bg: #030608;
          --c-surface: #080E18;
          --c-surface-2: #0B1520;
          --c-border: #162535;
          --c-text: #E8F4FC;
          --c-muted: #4A6A85;
          --c-accent: #29A9D4;
          --c-warn: #F59E0B;
          --shadow-lg: 0 24px 80px rgba(0, 0, 0, 0.7);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--c-bg);font-family:'DM Sans',system-ui,sans-serif;color:var(--c-text);overflow-x:hidden}

        .mn-bg{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0}
        
        .mn-orb{position:absolute;border-radius:50%;filter:blur(100px)}
        .mn-orb-1{width:600px;height:600px;background:radial-gradient(circle,rgba(41,169,212,0.45),transparent 70%);top:-150px;right:-100px}
        .mn-orb-2{width:480px;height:480px;background:radial-gradient(circle,rgba(129,140,248,0.35),transparent 70%);bottom:-80px;left:-120px}
        .mn-orb-3{width:350px;height:350px;background:radial-gradient(circle,rgba(52,211,153,0.25),transparent 70%);top:35%;left:25%}

        .mn-grid{position:absolute;inset:0;background-image:
          linear-gradient(rgba(41,169,212,0.025) 1px,transparent 1px),
          linear-gradient(90deg,rgba(41,169,212,0.025) 1px,transparent 1px);
          background-size:45px 45px}
        
        .mn-particle{position:absolute;border-radius:50%;background:var(--c-accent);box-shadow:0 0 12px var(--c-accent)}

        .mn-sparkle{position:absolute;color:var(--c-accent);filter:drop-shadow(0 0 8px var(--c-accent))}

        .mn-wrap{position:relative;z-index:1;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px 16px}
        
        .mn-card{
          background:linear-gradient(160deg,rgba(8,14,24,0.95),rgba(11,21,32,0.92));
          border:1px solid rgba(41,169,212,0.12);
          border-radius:32px;
          box-shadow:var(--shadow-lg),0 0 80px rgba(41,169,212,0.06),inset 0 1px 0 rgba(255,255,255,0.03);
          padding:60px 52px 56px;
          max-width:540px;width:100%;
          text-align:center;
          backdrop-filter:blur(24px);
          position:relative;
          overflow:hidden;
        }
        .mn-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,rgba(41,169,212,0.3),transparent);
        }
        @media(max-width:560px){.mn-card{padding:44px 28px 40px;border-radius:24px}}

        .mn-icon-ring{
          width:96px;height:96px;
          border-radius:28px;
          background:linear-gradient(155deg,rgba(245,158,11,0.18),rgba(245,158,11,0.04));
          border:1px solid rgba(245,158,11,0.22);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 36px;
          color:var(--c-warn);
          box-shadow:0 0 50px rgba(245,158,11,0.2),inset 0 0 20px rgba(245,158,11,0.05);
        }

        .mn-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(2.2rem,7vw,3rem);font-weight:400;letter-spacing:-.02em;line-height:1.1;margin-bottom:20px;color:var(--c-text)}
        
        .mn-desc{font-size:1.02rem;color:var(--c-muted);line-height:1.8;max-width:420px;margin:0 auto 40px}

        .mn-badge{
          display:inline-flex;align-items:center;gap:10px;
          padding:12px 24px;border-radius:50px;
          background:linear-gradient(95deg,rgba(245,158,11,0.14),rgba(245,158,11,0.05));
          border:1px solid rgba(245,158,11,0.18);
          font-size:.72rem;font-weight:700;color:var(--c-warn);
          letter-spacing:.14em;margin-bottom:40px;
          text-transform:uppercase;
        }
        .mn-badge-dot{
          width:9px;height:9px;border-radius:50%;
          background:var(--c-warn);
          box-shadow:0 0 14px var(--c-warn);
          animation:mn-pulse 1.5s ease-in-out infinite;
        }
        @keyframes mn-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.65)}}

        .mn-timer{
          display:flex;align-items:center;justify-content:center;gap:8px;
          margin-bottom:40px;
          padding:24px 32px;
          background:rgba(41,169,212,0.04);
          border:1px solid rgba(41,169,212,0.1);
          border-radius:20px;
          backdrop-filter:blur(8px);
        }
        .mn-timer-block{display:flex;flex-direction:column;align-items:center;gap:4px}
        .mn-timer-num{
          font-family:'JetBrains Mono',monospace;
          font-size:2.4rem;font-weight:600;
          color:var(--c-text);
          line-height:1;
          text-shadow:0 0 30px rgba(41,169,212,0.4);
        }
        .mn-timer-label{font-size:.64rem;color:var(--c-muted);text-transform:uppercase;letter-spacing:.12em}
        .mn-timer-sep{
          font-family:'JetBrains Mono',monospace;font-size:2rem;color:var(--c-muted);
          margin-top:-16px;opacity:.5;
        }

        .mn-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(41,169,212,0.15),transparent);margin:0 0 36px}

        .mn-back{
          display:inline-flex;align-items:center;gap:10px;
          padding:14px 28px;border-radius:16px;
          border:1px solid rgba(41,169,212,0.18);
          background:rgba(41,169,212,0.06);
          color:var(--c-accent);font-size:.86rem;font-weight:600;
          cursor:pointer;transition:all .2s;
          text-decoration:none;font-family:inherit;
        }
        .mn-back:hover{
          background:var(--c-accent);color:#fff;
          border-color:var(--c-accent);
          box-shadow:0 10px 30px rgba(41,169,212,0.35);
          transform:translateY(-3px);
        }
        .mn-back svg{width:16px;height:16px}

        .mn-footer{margin-top:32px;font-size:.76rem;color:var(--c-muted)}
        .mn-footer strong{color:var(--c-accent)}
        
        .mn-glow{position:absolute;width:300px;height:300px;background:radial-gradient(circle,rgba(41,169,212,0.08),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
      `}</style>

      <Background />

      <div className="mn-wrap">
        <motion.div
          className="mn-card"
          initial={{ opacity: 0, y: 50, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mn-glow" />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "backOut" }}
          >
            <div className="mn-icon-ring">
              <Wrench size={40} strokeWidth={1.5} />
            </div>
          </motion.div>

          <motion.div
            className="mn-badge"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="mn-badge-dot" />
            <Clock size={13} />
            Scheduled Maintenance
          </motion.div>

          <motion.h1
            className="mn-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
          >
            We&apos;ll be right back
          </motion.h1>

          <motion.p
            className="mn-desc"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.45 }}
          >
            Velamini is currently undergoing scheduled maintenance. We&apos;re making some 
            improvements to give you a better experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <CountdownTimer />
          </motion.div>

          <div className="mn-divider" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
          >
            <Link href="/" className="mn-back">
              <ArrowLeft size={16} /> Back to home
            </Link>
          </motion.div>

          <motion.p
            className="mn-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.4 }}
          >
            Need help? Contact <strong>support@velamini.com</strong>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
