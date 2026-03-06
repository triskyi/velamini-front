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
    document.documentElement.classList.toggle("dark", useDark);
    document.documentElement.setAttribute("data-theme", useDark ? "dark" : "light");
    setIsDarkMode(useDark);
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
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
          --bg:      #f5f2ed;
          --bg2:     #edeae4;
          --fg:      #0f0e0c;
          --muted:   #7a7670;
          --border:  #d4cfc8;
          --red:     #d63a2f;
          --red-dim: rgba(214,58,47,0.07);
        }

        .page { background: var(--bg); color: var(--fg); min-height: 100vh; overflow-x: hidden; }
        .sans  { font-family: 'Syne', sans-serif; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .mono  { font-family: 'Geist Mono', 'Courier New', monospace; }

        .progress-bar {
          position: fixed; top: 0; left: 0; height: 2px;
          background: var(--red); z-index: 9999; transform-origin: left;
        }

        .btn-solid {
          font-family: 'Geist Mono', monospace;
          font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase;
          background: var(--fg); color: var(--bg);
          padding: 0.85rem 2rem; border: 1.5px solid var(--fg);
          display: inline-flex; align-items: center; gap: 0.6rem;
          transition: background 0.2s, border-color 0.2s;
          cursor: pointer; text-decoration: none; white-space: nowrap;
        }
        .btn-solid:hover { background: var(--red); border-color: var(--red); }

        .btn-outline {
          font-family: 'Geist Mono', monospace;
          font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase;
          background: transparent; color: var(--muted);
          padding: 0.85rem 2rem; border: 1.5px solid var(--border);
          display: inline-flex; align-items: center; gap: 0.6rem;
          transition: color 0.2s, border-color 0.2s;
          cursor: pointer; text-decoration: none; white-space: nowrap;
        }
        .btn-outline:hover { color: var(--fg); border-color: var(--fg); }

        .feat-row {
          display: grid;
          grid-template-columns: 3rem 1fr auto;
          gap: 2rem; align-items: center;
          padding: 2rem 1rem; border-top: 1px solid var(--border);
          transition: background 0.22s;
          cursor: default;
        }
        .feat-row:hover { background: var(--red-dim); }
        @media (max-width: 600px) {
          .feat-row { grid-template-columns: 1fr; }
          .feat-num  { display: none; }
          .feat-icon-box { display: none; }
        }

        .step-card {
          padding: 2.5rem 2rem; border: 1px solid var(--border); background: var(--bg);
          display: flex; flex-direction: column; gap: 1.25rem;
          transition: border-color 0.25s, transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .step-card:hover { border-color: var(--red); transform: translateY(-4px); }

        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-inner { animation: ticker 24s linear infinite; display: flex; white-space: nowrap; }

        .section { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

        .diagonal-section {
          clip-path: polygon(0 4%, 100% 0%, 100% 96%, 0 100%);
          background: var(--bg2);
          padding: 8rem 0;
          margin: 3rem 0;
        }
      `}</style>

      <motion.div className="progress-bar" style={{ width: lineW }} />

      <div className="page sans" ref={containerRef}>
        <Navbar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />

        {/* ══ HERO ════════════════════════════════════════ */}
        <section style={{ paddingTop: "8rem", paddingBottom: "5rem" }}>
          <div className="section">

            {/* eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="mono"
              style={{ fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "3.5rem" }}
            >
              <span style={{ width: "2rem", height: "1px", background: "var(--red)", display: "inline-block", flexShrink: 0 }} />
              Digital Identity Platform · Now in Beta
            </motion.div>

            {/* headline + image */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontSize: "clamp(3.5rem, 9.5vw, 9rem)", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.03em", marginBottom: "0.1em" }}
                >
                  Always on.
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="serif"
                  style={{ fontSize: "clamp(3.5rem, 9.5vw, 9rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 0.9, letterSpacing: "-0.02em", color: "var(--red)" }}
                >
                  Always you.
                </motion.h1>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ flexShrink: 0 }}
              >
                <div style={{ position: "relative", width: 260, height: 260 }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(214,58,47,0.1) 0%, transparent 70%)", borderRadius: "50%" }} />
                  <Image src="/velamini.png" alt="Velamini" width={260} height={260} style={{ objectFit: "contain", position: "relative", zIndex: 1 }} priority />
                </div>
              </motion.div>
            </div>

            {/* description + CTA */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginTop: "3.5rem", paddingTop: "3rem", borderTop: "1px solid var(--border)", alignItems: "center" }}>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.28 }}
                style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "var(--muted)", maxWidth: "38ch" }}
              >
                Velamini creates an AI twin trained on your knowledge, tone, and personality — available 24/7 to represent you anywhere.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.36 }}
                style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "flex-end" }}
              >
                <Link href="/auth/signin" className="btn-solid">
                  Get Started Free <ArrowRight size={13} />
                </Link>
                <a href="#how-it-works" className="btn-outline">How It Works</a>
              </motion.div>
            </div>

            {/* trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mono"
              style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginTop: "2rem", fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}
            >
              {["Free to start", "No credit card", "Live in 5 min"].map(t => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <span style={{ color: "var(--red)" }}>✓</span> {t}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ STATS TICKER ════════════════════════════════ */}
        <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg2)", padding: "1.2rem 0", overflow: "hidden" }}>
          <div className="ticker-inner">
            {[...stats, ...stats, ...stats, ...stats].map((s, i) => (
              <span key={i} className="mono" style={{ display: "inline-flex", alignItems: "center", gap: "1.25rem", padding: "0 3rem", fontSize: "0.66rem", letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--muted)" }}>
                <strong style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 800, color: "var(--fg)" }}>
                  <Counter to={s.value} suffix={s.suffix} />
                </strong>
                {s.label}
                <span style={{ color: "var(--border)", fontSize: "0.5rem" }}>◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══ FEATURES ════════════════════════════════════ */}
        <section id="features" style={{ padding: "7rem 0" }}>
          <div className="section">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "2rem", marginBottom: "3.5rem", flexWrap: "wrap" }}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <p className="mono" style={{ fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--red)", marginBottom: "0.9rem" }}>Capabilities</p>
                <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em" }}>
                  What Velamini<br />
                  <span className="serif" style={{ fontStyle: "italic", fontWeight: 400, color: "var(--muted)" }}>does for you.</span>
                </h2>
              </motion.div>
              <p style={{ maxWidth: "28ch", color: "var(--muted)", lineHeight: 1.7, fontSize: "0.92rem" }} className="hidden sm:block">
                A complete toolkit to create an AI that genuinely represents you.
              </p>
            </div>

            {features.map((f, i) => (
              <motion.div
                key={f.num}
                className="feat-row"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: i * 0.065 }}
              >
                <span className="feat-num mono" style={{ fontSize: "0.62rem", color: "var(--muted)", letterSpacing: "0.1em" }}>{f.num}</span>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem" }}>{f.title}</h3>
                  <p style={{ color: "var(--muted)", lineHeight: 1.65, fontSize: "0.88rem", maxWidth: "44ch" }}>{f.desc}</p>
                </div>
                <div className="feat-icon-box" style={{ width: 42, height: 42, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", flexShrink: 0 }}>
                  <f.icon size={17} strokeWidth={1.5} />
                </div>
              </motion.div>
            ))}
            <div style={{ borderTop: "1px solid var(--border)" }} />
          </div>
        </section>

        {/* ══ HOW IT WORKS ════════════════════════════════ */}
        <div className="diagonal-section">
          <section id="how-it-works">
            <div className="section">
              <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: "3.5rem" }}>
                <p className="mono" style={{ fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--red)", marginBottom: "0.9rem" }}>Process</p>
                <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em" }}>
                  Three steps.<br />
                  <span className="serif" style={{ fontStyle: "italic", fontWeight: 400, color: "var(--muted)" }}>That's all it takes.</span>
                </h2>
              </motion.div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
                {steps.map((step, i) => (
                  <motion.div
                    key={step.label}
                    className="step-card"
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.48, delay: i * 0.1 }}
                  >
                    <span className="mono" style={{ fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--red)" }}>{step.label}</span>
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

        {/* ══ CTA ═════════════════════════════════════════ */}
        <section style={{ background: "var(--fg)", padding: "8rem 0" }}>
          <div className="section">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
              <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p className="mono" style={{ fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--red)", marginBottom: "1.5rem" }}>— Get started today</p>
                <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)", fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.03em", color: "var(--bg)" }}>
                  Create your<br />
                  <span className="serif" style={{ fontStyle: "italic", fontWeight: 400, color: "var(--red)" }}>virtual self.</span>
                </h2>
                <p style={{ marginTop: "2rem", maxWidth: "40ch", color: "rgba(245,242,237,0.45)", lineHeight: 1.75, fontSize: "0.95rem" }}>
                  Join thousands of creators and professionals who use Velamini to scale their presence — without losing their voice.
                </p>
                <div style={{ marginTop: "2.5rem" }}>
                  <Link
                    href="/auth/signin"
                    style={{ fontFamily: "Geist Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", background: "var(--red)", color: "var(--bg)", padding: "0.9rem 2rem", border: "1.5px solid var(--red)", display: "inline-flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    Get Started Free <ArrowUpRight size={13} />
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.2 }}
                style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(5rem, 16vw, 15rem)", lineHeight: 1, color: "rgba(245,242,237,0.04)", userSelect: "none", pointerEvents: "none" }}
              >
                ∞
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══════════════════════════════════════ */}
        <footer style={{ background: "var(--fg)", borderTop: "1px solid rgba(245,242,237,0.07)", padding: "2.25rem 0" }}>
          <div className="section" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
              <Image src="/logo.png" alt="Velamini" width={22} height={22} style={{ borderRadius: 3, opacity: 0.75 }} />
              <span className="mono" style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(245,242,237,0.4)" }}>Velamini</span>
            </div>
            <nav style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
              {[{ label: "Home", href: "/" }, { label: "Sign In", href: "/auth/signin" }, { label: "Terms", href: "/terms" }, { label: "Privacy", href: "/privacy" }].map(l => (
                <Link key={l.label} href={l.href} className="mono" style={{ fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(245,242,237,0.3)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(245,242,237,0.75)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(245,242,237,0.3)")}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <p className="mono" style={{ fontSize: "0.6rem", color: "rgba(245,242,237,0.2)", letterSpacing: "0.06em" }}>
              © {new Date().getFullYear()} Velamini
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}