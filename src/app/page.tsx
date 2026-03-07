"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Brain, Share2, Sparkles, MessageSquare,
  ShieldCheck, Zap, ArrowRight, ArrowUpRight
} from "lucide-react";

/* ─── ANIMATED COUNTER ─────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 48);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(id); }
      else setCount(start);
    }, 18);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── DATA ──────────────────────────────────────────────────── */
const features = [
  { icon: Brain,         num: "01", title: "AI-Powered Clone",    desc: "Trained on your knowledge and communication style — it sounds exactly like you, not a generic chatbot." },
  { icon: MessageSquare, num: "02", title: "24 / 7 Availability", desc: "Responds while you sleep, travel, or focus. Your presence is never offline." },
  { icon: Share2,        num: "03", title: "One Shareable Link",  desc: "A single URL for your AI twin. Paste it anywhere — bio, card, signature." },
  { icon: ShieldCheck,   num: "04", title: "Privacy by Design",   desc: "You own what the AI knows. Fully encrypted. Never sold to third parties." },
  { icon: Zap,           num: "05", title: "5-Minute Setup",      desc: "Fill a profile, add Q&A pairs, go live. No engineers, no waiting." },
  { icon: Sparkles,      num: "06", title: "Continuous Growth",   desc: "Every conversation makes your twin smarter. Improvements compounding over time." },
];

const steps = [
  { label: "Step 01", title: "Build Your Profile",  desc: "Add your bio, expertise areas, and personality traits that define your communication style." },
  { label: "Step 02", title: "Train the AI",        desc: "Upload documents, seed Q&A pairs, and refine until every response sounds genuinely like you." },
  { label: "Step 03", title: "Share & Scale",       desc: "One link. Instant conversations. Your knowledge available to anyone, anywhere, anytime." },
];

const stats = [
  { value: 10000, suffix: "+",    label: "Active Users" },
  { value: 999,   suffix: "/1k",  label: "Uptime" },
  { value: 5,     suffix: " min", label: "Time to Launch" },
  { value: 24,    suffix: "/7",   label: "Always On" },
];

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const lineW = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const useDark = theme === "dark" || (!theme && prefersDark);
    applyTheme(useDark);
    setIsDarkMode(useDark);
  }, []);

  function applyTheme(dark: boolean) {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.setAttribute("data-theme", dark ? "dark" : "light");

    // Sky-blue brand tokens
    root.style.setProperty("--sky",      "#38bdf8");
    root.style.setProperty("--sky-dark", "#0ea5e9");
    root.style.setProperty("--sky-dim",  dark ? "rgba(56,189,248,0.12)" : "rgba(56,189,248,0.08)");
    root.style.setProperty("--accent",   dark ? "#38bdf8" : "#0ea5e9");

    // Surface tokens
    root.style.setProperty("--bg",       dark ? "#0a0f14" : "#f0f8ff");
    root.style.setProperty("--bg2",      dark ? "#0d1620" : "#e0f2fe");
    root.style.setProperty("--bg-card",  dark ? "#111e2a" : "#f0f8ff");
    root.style.setProperty("--fg",       dark ? "#e8f4fd" : "#0c1a26");
    root.style.setProperty("--muted",    dark ? "#7ea8c4" : "#4d829e");
    root.style.setProperty("--border",   dark ? "#1a3248" : "#bae0f7");

    // CTA / footer
    root.style.setProperty("--cta-bg",          dark ? "#060c12" : "#0c1a26");
    root.style.setProperty("--cta-fg",          dark ? "#e8f4fd" : "#f0f8ff");
    root.style.setProperty("--cta-sub",         dark ? "rgba(232,244,253,0.45)" : "rgba(240,248,255,0.45)");
    root.style.setProperty("--footer-border",   dark ? "rgba(56,189,248,0.1)"   : "rgba(56,189,248,0.15)");
    root.style.setProperty("--footer-text",     dark ? "rgba(232,244,253,0.35)" : "rgba(240,248,255,0.4)");
    root.style.setProperty("--footer-copy",     dark ? "rgba(232,244,253,0.18)" : "rgba(240,248,255,0.22)");
  }

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      applyTheme(next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --sky:       #38bdf8;
          --sky-dark:  #0ea5e9;
          --sky-dim:   rgba(56,189,248,0.08);
          --accent:    #0ea5e9;
          --bg:        #f0f8ff;
          --bg2:       #e0f2fe;
          --bg-card:   #f0f8ff;
          --fg:        #0c1a26;
          --muted:     #4d829e;
          --border:    #bae0f7;
          --cta-bg:    #0c1a26;
          --cta-fg:    #f0f8ff;
          --cta-sub:   rgba(240,248,255,0.45);
          --footer-border: rgba(56,189,248,0.15);
          --footer-text:   rgba(240,248,255,0.4);
          --footer-copy:   rgba(240,248,255,0.22);
        }

        body { margin: 0; }

        .page {
          background: var(--bg);
          color: var(--fg);
          min-height: 100vh;
          overflow-x: hidden;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .sans  { font-family: 'Syne', sans-serif; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .mono  { font-family: 'Geist Mono', 'Courier New', monospace; }

        /* ── Scroll progress bar — sky blue ── */
        .progress-bar {
          position: fixed; top: 0; left: 0; height: 2px;
          background: var(--accent); z-index: 9999; transform-origin: left;
        }

        /* ── Buttons ── */
        .btn-solid {
          font-family: 'Geist Mono', monospace;
          font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase;
          background: var(--fg); color: var(--bg);
          padding: 0.85rem 2rem; border: 1.5px solid var(--fg);
          display: inline-flex; align-items: center; gap: 0.6rem;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          cursor: pointer; text-decoration: none; white-space: nowrap;
        }
        .btn-solid:hover { background: var(--accent); border-color: var(--accent); color: #fff; }

        .btn-outline {
          font-family: 'Geist Mono', monospace;
          font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase;
          background: transparent; color: var(--muted);
          padding: 0.85rem 2rem; border: 1.5px solid var(--border);
          display: inline-flex; align-items: center; gap: 0.6rem;
          transition: color 0.2s, border-color 0.2s;
          cursor: pointer; text-decoration: none; white-space: nowrap;
        }
        .btn-outline:hover { color: var(--accent); border-color: var(--accent); }

        /* ── Feature rows ── */
        .feat-row {
          display: grid;
          grid-template-columns: 3rem 1fr auto;
          gap: 2rem; align-items: center;
          padding: 2rem 1rem;
          border-top: 1px solid var(--border);
          transition: background 0.22s, border-color 0.3s;
          cursor: default;
        }
        .feat-row:hover { background: var(--sky-dim); }
        @media (max-width: 600px) {
          .feat-row { grid-template-columns: 1fr; }
          .feat-num, .feat-icon-box { display: none; }
        }

        /* ── Step cards ── */
        .step-card {
          padding: 2.5rem 2rem;
          border: 1px solid var(--border);
          background: var(--bg-card);
          display: flex; flex-direction: column; gap: 1.25rem;
          transition: border-color 0.25s, transform 0.35s cubic-bezier(0.16,1,0.3,1), background 0.3s;
        }
        .step-card:hover { border-color: var(--accent); transform: translateY(-4px); }

        /* ── Ticker ── */
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-inner { animation: ticker 24s linear infinite; display: flex; white-space: nowrap; }

        /* ── Layout ── */
        .section { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

        /* ── Diagonal section ── */
        .diagonal-section {
          clip-path: polygon(0 4%, 100% 0%, 100% 96%, 0 100%);
          background: var(--bg2);
          padding: 8rem 0;
          margin: 3rem 0;
          transition: background 0.3s ease;
        }

        /* ── Ticker band ── */
        .ticker-band {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--bg2);
          padding: 1.2rem 0;
          overflow: hidden;
          transition: background 0.3s, border-color 0.3s;
        }

        /* ── Hero ── */
        .hero-section {
          padding-top: 5.5rem;   /* reduced: was 8rem */
          padding-bottom: 4rem;
        }

        /* ── Hero grid ── */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 3rem;
          align-items: center;
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-image-col { display: flex; justify-content: center; order: -1; }
        }

        /* ── CTA ── */
        .cta-section {
          background: var(--cta-bg);
          padding: 8rem 0;
          transition: background 0.3s;
        }

        /* ── Footer ── */
        .site-footer {
          background: var(--cta-bg);
          border-top: 1px solid var(--footer-border);
          padding: 2.25rem 0;
          transition: background 0.3s, border-color 0.3s;
        }

        /* ── Divider ── */
        .section-divider {
          border: none;
          border-top: 1px solid var(--border);
          transition: border-color 0.3s;
        }
      `}</style>

      {/* Scroll progress bar */}
      <motion.div className="progress-bar" style={{ width: lineW }} />

      <div className="page sans" ref={containerRef}>
        <Navbar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />

        {/* ══ HERO ════════════════════════════════════════════ */}
        <section className="hero-section">
          <div className="section">

            {/* Eyebrow — sky-blue accent line */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="mono"
              style={{
                fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase",
                color: "var(--muted)", display: "flex", alignItems: "center",
                gap: "0.8rem", marginBottom: "2rem",
              }}
            >
              <span style={{ width: "2rem", height: "1px", background: "var(--accent)", display: "inline-block", flexShrink: 0 }} />
              Digital Identity Platform · Now in Beta
            </motion.div>

            {/* Hero grid */}
            <div className="hero-grid">

              {/* LEFT: text */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontSize: "clamp(3.2rem, 9vw, 8.5rem)", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.03em", marginBottom: "0.05em" }}
                >
                  Always on.
                </motion.h1>

                {/* "Always you." — sky blue italic */}
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="serif"
                  style={{ fontSize: "clamp(3.2rem, 9vw, 8.5rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 0.9, letterSpacing: "-0.02em", color: "var(--accent)", marginBottom: "2rem" }}
                >
                  Always you.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.28 }}
                  style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "var(--muted)", maxWidth: "42ch", marginBottom: "2rem" }}
                >
                  Velamini creates an AI twin trained on your knowledge, tone, and personality —
                  available 24/7 to represent you anywhere.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.36 }}
                  style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}
                >
                  <Link href="/onboarding" className="btn-solid">
                    Get Started Free <ArrowRight size={13} />
                  </Link>
                  <a href="#how-it-works" className="btn-outline">How It Works</a>
                </motion.div>

                {/* Trust badges — checkmarks in sky blue */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mono"
                  style={{ display: "flex", flexWrap: "wrap", gap: "1.75rem", fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}
                >
                  {["Free to start", "No credit card", "Live in 5 min"].map(t => (
                    <span key={t} style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <span style={{ color: "var(--accent)" }}>✓</span> {t}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* RIGHT: image — tighter top, sky glow */}
              <motion.div
                className="hero-image-col"
                initial={{ opacity: 0, scale: 0.88, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
              >
                <div style={{ position: "relative", width: 280, height: 280 }}>
                  {/* Sky-blue glow ring */}
                  <div style={{
                    position: "absolute", inset: "-10%",
                    background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)",
                    borderRadius: "50%",
                  }} />
                  {/* Border circle — sky tint */}
                  <div style={{
                    position: "absolute", inset: 0,
                    border: "1px solid var(--border)",
                    borderRadius: "50%",
                    transition: "border-color 0.3s",
                  }} />
                  <Image
                    src="/velamini.png"
                    alt="Velamini AI Twin"
                    width={280}
                    height={280}
                    style={{ objectFit: "contain", position: "relative", zIndex: 1, padding: "0.5rem" }}
                    priority
                  />
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ══ STATS TICKER ════════════════════════════════════ */}
        <div className="ticker-band">
          <div className="ticker-inner">
            {[...stats, ...stats, ...stats, ...stats].map((s, i) => (
              <span key={i} className="mono" style={{ display: "inline-flex", alignItems: "center", gap: "1.25rem", padding: "0 3rem", fontSize: "0.66rem", letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--muted)" }}>
                <strong style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 800, color: "var(--fg)" }}>
                  <Counter to={s.value} suffix={s.suffix} />
                </strong>
                {s.label}
                {/* sky-tinted diamond separator */}
                <span style={{ color: "var(--accent)", fontSize: "0.4rem", opacity: 0.6 }}>◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══ FEATURES ════════════════════════════════════════ */}
        <section id="features" style={{ padding: "7rem 0" }}>
          <div className="section">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "2rem", marginBottom: "3.5rem", flexWrap: "wrap" }}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                {/* Section eyebrow — sky */}
                <p className="mono" style={{ fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.9rem" }}>
                  Capabilities
                </p>
                <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em" }}>
                  What Velamini<br />
                  <span className="serif" style={{ fontStyle: "italic", fontWeight: 400, color: "var(--muted)" }}>does for you.</span>
                </h2>
              </motion.div>
              <p style={{ maxWidth: "28ch", color: "var(--muted)", lineHeight: 1.7, fontSize: "0.92rem" }}>
                A complete toolkit to create an AI that genuinely represents you.
              </p>
            </div>

            {features.map((f, i) => (
              <motion.div
                key={f.num} className="feat-row"
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.42, delay: i * 0.065 }}
              >
                <span className="feat-num mono" style={{ fontSize: "0.62rem", color: "var(--muted)", letterSpacing: "0.1em" }}>{f.num}</span>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem" }}>{f.title}</h3>
                  <p style={{ color: "var(--muted)", lineHeight: 1.65, fontSize: "0.88rem", maxWidth: "44ch" }}>{f.desc}</p>
                </div>
                {/* Icon box — sky blue */}
                <div className="feat-icon-box" style={{ width: 42, height: 42, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0, transition: "border-color 0.3s" }}>
                  <f.icon size={17} strokeWidth={1.5} />
                </div>
              </motion.div>
            ))}
            <hr className="section-divider" style={{ marginTop: 0 }} />
          </div>
        </section>

        {/* ══ HOW IT WORKS ════════════════════════════════════ */}
        <div className="diagonal-section">
          <section id="how-it-works">
            <div className="section">
              <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: "3.5rem" }}>
                {/* Section eyebrow — sky */}
                <p className="mono" style={{ fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.9rem" }}>
                  Process
                </p>
                <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em" }}>
                  Three steps.<br />
                  <span className="serif" style={{ fontStyle: "italic", fontWeight: 400, color: "var(--muted)" }}>That's all it takes.</span>
                </h2>
              </motion.div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
                {steps.map((step, i) => (
                  <motion.div
                    key={step.label} className="step-card"
                    initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.48, delay: i * 0.1 }}
                  >
                    {/* Step label — sky */}
                    <span className="mono" style={{ fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)" }}>
                      {step.label}
                    </span>
                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.65rem" }}>{step.title}</h3>
                      <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ══ CTA ═════════════════════════════════════════════ */}
        <section className="cta-section">
          <div className="section">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
              <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                {/* CTA eyebrow — sky */}
                <p className="mono" style={{ fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sky)", marginBottom: "1.5rem" }}>
                  — Get started today
                </p>
                <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)", fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.03em", color: "var(--cta-fg)" }}>
                  Create your<br />
                  {/* "virtual self." — sky italic */}
                  <span className="serif" style={{ fontStyle: "italic", fontWeight: 400, color: "var(--sky)" }}>virtual self.</span>
                </h2>
                <p style={{ marginTop: "2rem", maxWidth: "40ch", color: "var(--cta-sub)", lineHeight: 1.75, fontSize: "0.95rem" }}>
                  Join thousands of creators and professionals who use Velamini to scale their presence — without losing their voice.
                </p>
                <div style={{ marginTop: "2.5rem" }}>
                  <Link
                    href="/onboarding"
                    style={{
                      fontFamily: "Geist Mono, monospace",
                      fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase",
                      /* CTA button — sky blue fill */
                      background: "var(--sky)", color: "#fff",
                      padding: "0.9rem 2rem", border: "1.5px solid var(--sky)",
                      display: "inline-flex", alignItems: "center", gap: "0.6rem",
                      textDecoration: "none", transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    Get Started Free <ArrowUpRight size={13} />
                  </Link>
                </div>
              </motion.div>

              {/* Ghost accent — sky tint */}
              <motion.div
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2 }}
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(5rem, 16vw, 15rem)", lineHeight: 1, color: "rgba(56,189,248,0.06)", userSelect: "none", pointerEvents: "none" }}
              >
                ∞
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══════════════════════════════════════════ */}
        <footer className="site-footer">
          <div className="section" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
              {/* Logo with sky border */}
              <div style={{ width: 24, height: 24, borderRadius: 4, overflow: "hidden", border: "1.5px solid rgba(56,189,248,0.4)", position: "relative", flexShrink: 0 }}>
                <Image src="/logo.png" alt="Velamini" fill style={{ objectFit: "contain" }} />
              </div>
              <span className="mono" style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--footer-text)" }}>
                Velamini
              </span>
            </div>

            <nav style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
              {[
                { label: "Home",    href: "/" },
                { label: "Sign In", href: "/auth/signin" },
                { label: "Terms",   href: "/terms" },
                { label: "Privacy", href: "/privacy" },
              ].map(l => (
                <Link
                  key={l.label} href={l.href} className="mono"
                  style={{ fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--footer-text)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--sky)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--footer-text)")}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <p className="mono" style={{ fontSize: "0.6rem", color: "var(--footer-copy)", letterSpacing: "0.06em" }}>
              © {new Date().getFullYear()} Velamini
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}