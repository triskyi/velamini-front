"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  Brain, Share2, Sparkles, MessageSquare,
  ShieldCheck, Zap, ArrowRight, ArrowUpRight,
  User, Building2, Check, Bot, BarChart2,
  Globe, Code2, Crown, ChevronRight,
} from "lucide-react";

/* ─── ANIMATED COUNTER ─────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 52);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(id); }
      else setCount(start);
    }, 16);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── DATA ──────────────────────────────────────────────────── */
const PERSONAL_FEATURES = [
  { Icon: Brain,         num: "01", title: "AI-Powered Twin",     desc: "Trained on your knowledge and communication style — it sounds exactly like you, not a generic chatbot." },
  { Icon: MessageSquare, num: "02", title: "24 / 7 Availability", desc: "Responds while you sleep, travel, or focus. Your presence is never offline." },
  { Icon: Share2,        num: "03", title: "One Shareable Link",  desc: "A single URL for your AI twin. Paste it in your bio, card or email signature." },
  { Icon: ShieldCheck,   num: "04", title: "Privacy by Design",   desc: "You own what the AI knows. Fully encrypted. Never sold to third parties." },
  { Icon: Zap,           num: "05", title: "5-Minute Setup",      desc: "Fill a profile, add Q&A pairs, go live. No engineers, no waiting." },
  { Icon: Sparkles,      num: "06", title: "Always Improving",    desc: "Every conversation makes your twin smarter. Compounding value over time." },
];

const ORG_FEATURES = [
  { Icon: Bot,           num: "01", title: "Customer AI Agent",   desc: "A trained support agent for your business — handles queries, FAQs and more at any hour." },
  { Icon: Globe,         num: "02", title: "REST API + Embed",    desc: "Drop a script tag on any site or call the API from any stack. Live in minutes." },
  { Icon: BarChart2,     num: "03", title: "Analytics Dashboard", desc: "Message volume, satisfaction ratings, session trends — all in one real-time view." },
  { Icon: Code2,         num: "04", title: "React / JS SDK",      desc: "First-class SDK for developers who want full control over the chat experience." },
  { Icon: Crown,         num: "05", title: "Scales With You",     desc: "500 free messages to 25,000+. Upgrade at any time from your dashboard." },
  { Icon: ShieldCheck,   num: "06", title: "Secure by Default",   desc: "API keys hashed at rest, rate limiting built in, prompt injection defence included." },
];

const PERSONAL_STEPS = [
  { label: "Step 01", title: "Build Your Profile",  desc: "Add your bio, expertise areas, and personality traits that define your communication style." },
  { label: "Step 02", title: "Train the AI",        desc: "Upload documents, seed Q&A pairs, and refine until every response sounds genuinely like you." },
  { label: "Step 03", title: "Share & Scale",       desc: "One link. Instant conversations. Your knowledge available to anyone, anywhere, anytime." },
];

const ORG_STEPS = [
  { label: "Step 01", title: "Create Organisation", desc: "Set up your company profile, agent name and personality in under two minutes — no coding." },
  { label: "Step 02", title: "Train the Agent",     desc: "Upload FAQs, policies and product docs. The agent learns your brand voice automatically." },
  { label: "Step 03", title: "Deploy Anywhere",     desc: "Embed on your website, integrate via REST API, or give customers a direct link to chat." },
];

const STATS = [
  { value: 10000, suffix: "+",    label: "Active Users" },
  { value: 99,    suffix: ".9%",  label: "Uptime" },
  { value: 5,     suffix: " min", label: "Time to Launch" },
  { value: 24,    suffix: "/7",   label: "Always On" },
];

const PERSONAL_CARD_FEATS = ["AI trained on your voice", "24/7 personal presence", "One shareable link", "Private & encrypted"];
const ORG_CARD_FEATS       = ["Trained on your FAQs & docs", "REST API + embed widget", "Real-time analytics", "Scales with traffic"];

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mode, setMode]             = useState<"personal" | "org">("personal");
  const containerRef                = useRef(null);
  const { scrollYProgress }         = useScroll({ target: containerRef });
  const lineW                       = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const stored     = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const useDark    = stored === "dark" || (!stored && prefersDark);
    applyTheme(useDark);
    setIsDarkMode(useDark);
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_EMBED_AGENT_KEY;
    if (!key || document.getElementById("vela-widget")) return;
    const s = Object.assign(document.createElement("script"), {
      src: "https://velamini-front.vercel.app/embed/agent.js", async: true, id: "vela-widget",
    });
    (s as any).dataset.agentKey  = key;
    (s as any).dataset.agentName = process.env.NEXT_PUBLIC_EMBED_AGENT_NAME || "Velamini";
    (s as any).dataset.theme     = "auto";
    document.body.appendChild(s);
  }, []);

  function applyTheme(dark: boolean) {
    const r = document.documentElement;
    r.classList.toggle("dark", dark);
    r.setAttribute("data-theme", dark ? "dark" : "light");
    r.setAttribute("data-mode",  dark ? "dark" : "light");
    // brand tokens
    r.style.setProperty("--sky",      "#38bdf8");
    r.style.setProperty("--sky-dark", "#0ea5e9");
    r.style.setProperty("--sky-dim",  dark ? "rgba(56,189,248,.12)" : "rgba(56,189,248,.08)");
    r.style.setProperty("--accent",   dark ? "#38AECC" : "#29A9D4");
    r.style.setProperty("--org-c",    dark ? "#818CF8" : "#6366F1");
    // surface
    r.style.setProperty("--bg",       dark ? "#060E18" : "#EFF7FF");
    r.style.setProperty("--bg2",      dark ? "#08111E" : "#D8ECF9");
    r.style.setProperty("--bg-card",  dark ? "#0C1A28" : "#FFFFFF");
    r.style.setProperty("--fg",       dark ? "#D4EEFF" : "#091828");
    r.style.setProperty("--muted",    dark ? "#2E5470" : "#527A96");
    r.style.setProperty("--border",   dark ? "#132234" : "#BDD9F0");
    r.style.setProperty("--border2",  dark ? "#1A3045" : "#C5DCF2");
    // cta / footer
    r.style.setProperty("--cta-bg",        dark ? "#050D16" : "#091828");
    r.style.setProperty("--cta-fg",        dark ? "#D4EEFF" : "#EFF7FF");
    r.style.setProperty("--cta-sub",       dark ? "rgba(212,238,255,.42)" : "rgba(239,247,255,.4)");
    r.style.setProperty("--footer-border", dark ? "rgba(56,174,204,.1)"   : "rgba(56,174,204,.15)");
    r.style.setProperty("--footer-text",   dark ? "rgba(212,238,255,.35)" : "rgba(9,24,40,.4)");
    r.style.setProperty("--footer-copy",   dark ? "rgba(212,238,255,.18)" : "rgba(9,24,40,.22)");
  }

  const handleThemeToggle = () => setIsDarkMode(prev => {
    const next = !prev;
    applyTheme(next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    return next;
  });

  const accentColor = mode === "personal" ? "var(--accent)" : "var(--org-c)";
  const features    = mode === "personal" ? PERSONAL_FEATURES : ORG_FEATURES;
  const steps       = mode === "personal" ? PERSONAL_STEPS    : ORG_STEPS;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Syne', system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        .page {
          background: var(--bg);
          color: var(--fg);
          min-height: 100dvh;
          overflow-x: hidden;
          transition: background .35s, color .35s;
          position: relative;
        }

        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .mono  { font-family: 'Geist Mono', 'Courier New', monospace; }

        /* ── Scroll progress ── */
        .progress-bar {
          position: fixed; top: 0; left: 0; height: 2px;
          z-index: 9999; transform-origin: left;
        }

        /* ══════════════════════════════════════════════════════
           BACKGROUND SYSTEM
        ══════════════════════════════════════════════════════ */
        .bg-layer {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
        }
        .bg-layer::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 78% 56% at 10% -8%,
              color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 58%),
            radial-gradient(ellipse 58% 44% at 90% 14%,
              color-mix(in srgb, var(--org-c) 11%, transparent) 0%, transparent 55%),
            radial-gradient(ellipse 68% 40% at 48% 104%,
              color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 58%),
            var(--bg);
        }
        /* dot grid */
        .bg-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle,
            color-mix(in srgb, var(--fg) 24%, transparent) 1px, transparent 1px);
          background-size: 26px 26px;
          opacity: .09;
          mask-image: radial-gradient(ellipse 82% 72% at 50% 36%, black 22%, transparent 100%);
        }
        [data-mode="light"] .bg-dots { opacity: .05; }

        /* orbs */
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
          animation: orb-drift 22s ease-in-out infinite alternate;
        }
        .orb-a { width:520px;height:520px; background:radial-gradient(circle,color-mix(in srgb,var(--accent) 60%,transparent),transparent 70%); top:-130px;left:-90px; opacity:.45; animation-duration:24s; }
        .orb-b { width:380px;height:380px; background:radial-gradient(circle,color-mix(in srgb,var(--org-c) 55%,transparent),transparent 70%); top:60px;right:-70px; opacity:.36; animation-delay:-9s;  animation-duration:28s; }
        .orb-c { width:440px;height:440px; background:radial-gradient(circle,color-mix(in srgb,var(--accent) 42%,transparent),transparent 70%); bottom:0;left:28%;  opacity:.32; animation-delay:-15s; animation-duration:20s; }
        .orb-d { width:260px;height:260px; background:radial-gradient(circle,color-mix(in srgb,#34D399 45%,transparent),transparent 70%);    bottom:18%;right:8%;  opacity:.28; animation-delay:-5s;  animation-duration:32s; }
        [data-mode="light"] .orb { opacity: .16; filter: blur(110px); }

        @keyframes orb-drift {
          0%   { transform: translate(0,0) scale(1); }
          35%  { transform: translate(22px,-20px) scale(1.04); }
          70%  { transform: translate(-14px,24px) scale(.97); }
          100% { transform: translate(10px,-10px) scale(1.02); }
        }

        /* everything above bg */
        .page > *:not(.bg-layer) { position: relative; z-index: 1; }

        /* ══════════════════════════════════════════════════════
           LAYOUT
        ══════════════════════════════════════════════════════ */
        .wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* ── Mode pill ── */
        .mode-pill {
          display: inline-flex; align-items: center;
          background: color-mix(in srgb, var(--bg-card) 80%, transparent);
          border: 1.5px solid var(--border2);
          border-radius: 14px; padding: 4px; gap: 3px;
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 24px rgba(0,0,0,.1);
        }
        .mode-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 22px; border: none; border-radius: 10px;
          font-family: 'Syne', sans-serif; font-size: .79rem; font-weight: 700;
          cursor: pointer; transition: all .22s; color: var(--muted); background: none;
        }
        .mode-btn svg { width: 14px; height: 14px; }
        .mode-btn.on { color: #fff; box-shadow: 0 2px 16px color-mix(in srgb, var(--accent) 44%, transparent); }
        .mode-btn.on.personal { background: var(--accent); box-shadow: 0 2px 16px color-mix(in srgb,var(--accent) 44%,transparent); }
        .mode-btn.on.org      { background: var(--org-c);  box-shadow: 0 2px 16px color-mix(in srgb,var(--org-c)  44%,transparent); }

        /* ── Buttons ── */
        .btn-primary {
          font-family: 'Geist Mono', monospace;
          font-size: .7rem; letter-spacing: .14em; text-transform: uppercase;
          padding: .9rem 2rem; border: 1.5px solid;
          display: inline-flex; align-items: center; gap: .6rem;
          text-decoration: none; transition: opacity .2s, transform .2s;
          font-weight: 500; white-space: nowrap;
          box-shadow: 0 4px 24px rgba(0,0,0,.18);
        }
        .btn-primary:hover { opacity: .86; transform: translateY(-2px); }
        .btn-primary.personal { background: color-mix(in srgb,var(--accent) 72%,transparent); border-color: color-mix(in srgb,var(--accent) 55%,transparent); color: #fff; box-shadow: 0 4px 18px color-mix(in srgb,var(--accent) 22%,transparent); }
        .btn-primary.org      { background: color-mix(in srgb,var(--org-c) 72%,transparent);  border-color: color-mix(in srgb,var(--org-c) 55%,transparent);  color: #fff; box-shadow: 0 4px 18px color-mix(in srgb,var(--org-c)  22%,transparent); }
        .btn-ghost {
          font-family: 'Geist Mono', monospace;
          font-size: .7rem; letter-spacing: .14em; text-transform: uppercase;
          background: color-mix(in srgb, var(--bg-card) 70%, transparent);
          color: var(--fg); padding: .9rem 2rem;
          border: 1.5px solid var(--border2);
          display: inline-flex; align-items: center; gap: .6rem;
          text-decoration: none; transition: border-color .2s, color .2s;
          backdrop-filter: blur(8px);
        }
        .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

        /* ── Hero ── */
        .hero { padding: 5.5rem 0 4rem; }
        .hero-grid {
          display: grid; grid-template-columns: 1fr 310px;
          gap: 3rem; align-items: center;
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-img-col { display: flex; justify-content: center; order: -1; margin-bottom: 1rem; }
        }

        /* ── Prop cards ── */
        .prop-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 20px; margin: 4rem 0 0;
        }
        @media (max-width: 700px) { .prop-grid { grid-template-columns: 1fr; } }
        .prop-card {
          position: relative; padding: 30px 26px;
          border-radius: 22px; border: 1.5px solid var(--border2);
          background: color-mix(in srgb, var(--bg-card) 80%, transparent);
          backdrop-filter: blur(16px);
          cursor: pointer; overflow: hidden;
          transition: border-color .24s, box-shadow .24s, transform .24s;
        }
        [data-mode="light"] .prop-card { background: rgba(255,255,255,.82); }
        .prop-card:hover { transform: translateY(-4px); }
        .prop-card.p-active { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent), 0 16px 52px rgba(0,0,0,.18); }
        .prop-card.o-active { border-color: var(--org-c);  box-shadow: 0 0 0 3px color-mix(in srgb,var(--org-c)  16%,transparent), 0 16px 52px rgba(0,0,0,.18); }
        /* corner glow */
        .prop-card::after {
          content: ''; position: absolute; width: 200px; height: 200px; border-radius: 50%;
          bottom: -70px; right: -60px; pointer-events: none; filter: blur(55px); opacity: .25; transition: opacity .3s;
        }
        .prop-card.personal::after { background: var(--accent); }
        .prop-card.org::after      { background: var(--org-c); }
        .prop-card:hover::after    { opacity: .45; }

        .prop-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: .59rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 20px; margin-bottom: 14px;
        }
        .prop-tag.personal { color: var(--accent); background: color-mix(in srgb,var(--accent) 10%,transparent); }
        .prop-tag.org      { color: var(--org-c);  background: color-mix(in srgb,var(--org-c)  10%,transparent); }
        .prop-h {
          font-family: 'Instrument Serif', serif; font-size: 1.6rem; font-weight: 400;
          line-height: 1.15; margin-bottom: 10px;
        }
        .prop-sub  { font-size: .82rem; color: var(--muted); line-height: 1.7; margin-bottom: 18px; }
        .prop-feat { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 7px; margin-bottom: 22px; }
        .prop-feat li { display: flex; align-items: center; gap: 8px; font-size: .79rem; color: var(--muted); }
        .prop-cta {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 11px; border: 1.5px solid;
          font-family: 'Geist Mono', monospace;
          font-size: .7rem; font-weight: 500; letter-spacing: .08em;
          text-decoration: none; transition: all .17s;
        }
        .prop-cta.personal { border-color: color-mix(in srgb,var(--accent) 40%,var(--border)); color: var(--accent); background: color-mix(in srgb,var(--accent) 7%,transparent); }
        .prop-cta.personal:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
        .prop-cta.org      { border-color: color-mix(in srgb,var(--org-c) 40%,var(--border));  color: var(--org-c);  background: color-mix(in srgb,var(--org-c)  7%,transparent); }
        .prop-cta.org:hover      { background: var(--org-c);  color: #fff; border-color: var(--org-c);  }

        /* ── Ticker ── */
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-band {
          border-top: 1px solid var(--border2); border-bottom: 1px solid var(--border2);
          background: color-mix(in srgb, var(--bg2) 70%, transparent);
          backdrop-filter: blur(10px);
          padding: 1.15rem 0; overflow: hidden;
          transition: background .3s, border-color .3s;
        }
        .ticker-inner { animation: ticker 26s linear infinite; display: flex; white-space: nowrap; }

        /* ── Feature rows ── */
        .feat-row {
          display: grid; grid-template-columns: 3rem 1fr 44px;
          gap: 2rem; align-items: center;
          padding: 2rem 1rem;
          border-top: 1px solid var(--border);
          transition: background .22s;
          cursor: default;
        }
        .feat-row:hover { background: color-mix(in srgb, var(--accent) 5%, transparent); }
        @media (max-width: 600px) {
          .feat-row { grid-template-columns: 1fr; }
          .feat-num, .feat-icon-box { display: none; }
        }

        /* ── Steps ── */
        .diagonal-section {
          background: color-mix(in srgb, var(--bg2) 65%, transparent);
          border-top: 1px solid var(--border2); border-bottom: 1px solid var(--border2);
          padding: 7rem 0; margin: 0;
          backdrop-filter: blur(8px);
          transition: background .3s, border-color .3s;
        }
        .step-card {
          padding: 2.5rem 2rem;
          border: 1px solid var(--border2);
          border-radius: 18px;
          background: color-mix(in srgb, var(--bg-card) 80%, transparent);
          backdrop-filter: blur(14px);
          display: flex; flex-direction: column; gap: 1.25rem;
          transition: border-color .25s, transform .35s cubic-bezier(.16,1,.3,1);
        }
        [data-mode="light"] .step-card { background: rgba(255,255,255,.82); }
        .step-card:hover { border-color: var(--accent); transform: translateY(-4px); }

        /* ── CTA ── */
        .cta-section {
          background: var(--cta-bg);
          padding: 8rem 0;
          border-top: 1px solid color-mix(in srgb, var(--accent) 12%, transparent);
          transition: background .3s;
        }
        .cta-btn {
          font-family: 'Geist Mono', monospace;
          font-size: .7rem; letter-spacing: .14em; text-transform: uppercase;
          padding: .9rem 2rem; border: 1.5px solid;
          display: inline-flex; align-items: center; gap: .6rem;
          text-decoration: none; transition: opacity .2s, transform .2s;
          font-weight: 500;
        }
        .cta-btn:hover { opacity: .84; transform: translateY(-2px); }
        .cta-btn.personal { background: color-mix(in srgb,var(--accent) 72%,transparent); border-color: color-mix(in srgb,var(--accent) 55%,transparent); color: #fff; box-shadow: 0 4px 18px color-mix(in srgb,var(--accent) 22%,transparent); }
        .cta-btn.org      { background: color-mix(in srgb,var(--org-c) 72%,transparent);  border-color: color-mix(in srgb,var(--org-c) 55%,transparent);  color: #fff; box-shadow: 0 4px 18px color-mix(in srgb,var(--org-c)  22%,transparent); }
        .cta-btn-ghost {
          font-family: 'Geist Mono', monospace;
          font-size: .7rem; letter-spacing: .14em; text-transform: uppercase;
          background: transparent; color: var(--cta-fg); opacity: .52;
          padding: .9rem 2rem; border: 1.5px solid rgba(255,255,255,.18);
          display: inline-flex; align-items: center; gap: .6rem;
          text-decoration: none; transition: opacity .2s, border-color .2s;
        }
        .cta-btn-ghost:hover { opacity: .85; border-color: rgba(255,255,255,.4); }

        /* ── Footer ── */
        .site-footer {
          background: var(--cta-bg);
          border-top: 1px solid var(--footer-border);
          padding: 2.25rem 0;
          transition: background .3s, border-color .3s;
        }
        .footer-link {
          font-family: 'Geist Mono', monospace;
          font-size: .6rem; letter-spacing: .14em; text-transform: uppercase;
          color: var(--footer-text); text-decoration: none; transition: color .2s;
        }
        .footer-link:hover { color: var(--accent); }

        /* ── Misc ── */
        .section-divider { border: none; border-top: 1px solid var(--border); }
        .eyebrow {
          font-family: 'Geist Mono', monospace;
          font-size: .62rem; letter-spacing: .2em; text-transform: uppercase;
          color: var(--accent); margin-bottom: .9rem; display: block;
        }
      `}</style>

      {/* ── Fixed rich background ── */}
      <div className="bg-layer" aria-hidden="true">
        <div className="bg-dots"/>
        <div className="orb orb-a"/>
        <div className="orb orb-b"/>
        <div className="orb orb-c"/>
        <div className="orb orb-d"/>
      </div>

      {/* ── Scroll progress ── */}
      <motion.div
        className="progress-bar"
        style={{ width: lineW, background: mode === "personal" ? "var(--accent)" : "var(--org-c)" }}
      />

      <div className="page" ref={containerRef}>
        <Navbar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle}/>

        {/* ══════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════ */}
        <section className="hero">
          <div className="wrap">

            {/* Mode pill */}
            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }}
              style={{ marginBottom:"2rem" }}>
              <div className="mode-pill">
                <button
                  className={`mode-btn personal${mode==="personal"?" on":""}`}
                  onClick={() => setMode("personal")}
                >
                  <User size={13}/> Personal
                </button>
                <button
                  className={`mode-btn org${mode==="org"?" on":""}`}
                  onClick={() => setMode("org")}
                >
                  <Building2 size={13}/> Organisation
                </button>
              </div>
            </motion.div>

            {/* Eyebrow */}
            <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ duration:.45 }}
              className="mono"
              style={{ fontSize:".66rem",letterSpacing:".2em",textTransform:"uppercase",color:"var(--muted)",display:"flex",alignItems:"center",gap:".8rem",marginBottom:"2rem" }}>
              <span style={{ width:"2rem",height:"1px",background:accentColor,display:"inline-block",flexShrink:0 }}/>
              {mode==="personal" ? "Digital Identity Platform · Now in Beta" : "AI Agent Platform for Businesses"}
            </motion.div>

            {/* Hero grid */}
            <div className="hero-grid">

              {/* Left: headline — animates when mode switches */}
              <div>
                <AnimatePresence mode="wait">
                  {mode === "personal" ? (
                    <motion.div key="personal-hero"
                      initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
                      transition={{ duration:.5, ease:[.16,1,.3,1] }}>
                      <h1 style={{ fontSize:"clamp(3rem,9vw,8.5rem)",fontWeight:800,lineHeight:.9,letterSpacing:"-.03em",marginBottom:".05em" }}>
                        Always on.
                      </h1>
                      <h1 className="serif"
                        style={{ fontSize:"clamp(3rem,9vw,8.5rem)",fontWeight:400,fontStyle:"italic",lineHeight:.9,letterSpacing:"-.02em",color:"var(--accent)",marginBottom:"1.8rem" }}>
                        Always you.
                      </h1>
                      <p style={{ fontSize:"1.05rem",lineHeight:1.76,color:"var(--muted)",maxWidth:"42ch",marginBottom:"2rem" }}>
                        Velamini creates an AI twin trained on your knowledge, tone and personality — available 24/7 to represent you anywhere.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="org-hero"
                      initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
                      transition={{ duration:.5, ease:[.16,1,.3,1] }}>
                      <h1 style={{ fontSize:"clamp(2.8rem,8vw,7.5rem)",fontWeight:800,lineHeight:.9,letterSpacing:"-.03em",marginBottom:".05em" }}>
                        Your agent.
                      </h1>
                      <h1 className="serif"
                        style={{ fontSize:"clamp(2.8rem,8vw,7.5rem)",fontWeight:400,fontStyle:"italic",lineHeight:.9,letterSpacing:"-.02em",color:"var(--org-c)",marginBottom:"1.8rem" }}>
                        Your brand.
                      </h1>
                      <p style={{ fontSize:"1.05rem",lineHeight:1.76,color:"var(--muted)",maxWidth:"42ch",marginBottom:"2rem" }}>
                        Deploy a trained AI support agent for your business. Embed on any site, call via REST API, and handle customer queries 24/7 — at scale.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTAs */}
                <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:.55, delay:.32 }}
                  style={{ display:"flex",flexWrap:"wrap",gap:"1rem",marginBottom:"1.75rem" }}>
                  <Link href={mode==="personal" ? "/onboarding" : "/onboarding?type=org"}
                    className={`btn-primary ${mode}`}>
                    {mode==="personal" ? "Create My AI Twin" : "Create Organisation"}
                    <ArrowRight size={13}/>
                  </Link>
                  <a href="#features" className="btn-ghost">
                    {mode==="personal" ? "See Features" : "How It Works"}
                  </a>
                </motion.div>

                {/* Trust chips */}
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:.5, delay:.48 }}
                  className="mono"
                  style={{ display:"flex",flexWrap:"wrap",gap:"1.5rem",fontSize:".64rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--muted)" }}>
                  {["Free to start","No credit card","Live in 5 min"].map(t => (
                    <span key={t} style={{ display:"flex",alignItems:"center",gap:".45rem" }}>
                      <span style={{ color:accentColor }}>✓</span>{t}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* Right: image */}
              <motion.div className="hero-img-col"
                initial={{ opacity:0, scale:.88, x:30 }} animate={{ opacity:1, scale:1, x:0 }}
                transition={{ duration:.8, delay:.2, ease:[.16,1,.3,1] }}
                style={{ display:"flex",justifyContent:"flex-end",alignItems:"center" }}>
                <div style={{ position:"relative",width:290,height:290 }}>
                  <div style={{ position:"absolute",inset:"-12%",background:`radial-gradient(circle,color-mix(in srgb,${mode==="personal"?"var(--accent)":"var(--org-c)"} 20%,transparent) 0%,transparent 70%)`,borderRadius:"50%",transition:"background .4s" }}/>
                  <div style={{ position:"absolute",inset:0,border:"1px solid var(--border2)",borderRadius:"50%",transition:"border-color .3s" }}/>
                  <Image src="/velamini.png" alt="Velamini" width={290} height={290}
                    style={{ objectFit:"contain",position:"relative",zIndex:1,padding:".5rem" }} priority/>
                </div>
              </motion.div>
            </div>

            {/* ── Dual proposition cards ── */}
            <div className="prop-grid">
              {/* Personal */}
              <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.5, delay:.05 }}
                className={`prop-card personal${mode==="personal"?" p-active":""}`}
                onClick={() => setMode("personal")}>
                <div className="prop-tag personal"><User size={9}/> For Individuals</div>
                <h3 className="prop-h">Your <em style={{ color:"var(--accent)" }}>AI Twin</em></h3>
                <p className="prop-sub">A personal AI trained on your expertise, tone, and personality — available to anyone, anytime.</p>
                <ul className="prop-feat">
                  {PERSONAL_CARD_FEATS.map(f => (
                    <li key={f}><Check size={11} style={{ color:"var(--accent)",flexShrink:0 }}/>{f}</li>
                  ))}
                </ul>
                <Link href="/onboarding" className="prop-cta personal" onClick={e => e.stopPropagation()}>
                  Start Free <ChevronRight size={12}/>
                </Link>
              </motion.div>

              {/* Organisation */}
              <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.5, delay:.12 }}
                className={`prop-card org${mode==="org"?" o-active":""}`}
                onClick={() => setMode("org")}>
                <div className="prop-tag org"><Building2 size={9}/> For Businesses</div>
                <h3 className="prop-h">Your <em style={{ color:"var(--org-c)" }}>AI Agent</em></h3>
                <p className="prop-sub">A customer-facing AI support agent for your org — embedded on your site, powered by your knowledge.</p>
                <ul className="prop-feat">
                  {ORG_CARD_FEATS.map(f => (
                    <li key={f}><Check size={11} style={{ color:"var(--org-c)",flexShrink:0 }}/>{f}</li>
                  ))}
                </ul>
                <Link href="/onboarding?type=org" className="prop-cta org" onClick={e => e.stopPropagation()}>
                  Create Organisation <ChevronRight size={12}/>
                </Link>
              </motion.div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            STATS TICKER
        ══════════════════════════════════════════════════════ */}
        <div className="ticker-band">
          <div className="ticker-inner">
            {[...STATS,...STATS,...STATS,...STATS].map((s, i) => (
              <span key={i} className="mono"
                style={{ display:"inline-flex",alignItems:"center",gap:"1.25rem",padding:"0 3rem",fontSize:".65rem",letterSpacing:".13em",textTransform:"uppercase",color:"var(--muted)" }}>
                <strong style={{ fontFamily:"'Syne',sans-serif",fontSize:"1rem",fontWeight:800,color:"var(--fg)" }}>
                  <Counter to={s.value} suffix={s.suffix}/>
                </strong>
                {s.label}
                <span style={{ color:accentColor,fontSize:".38rem",opacity:.6 }}>◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            FEATURES
        ══════════════════════════════════════════════════════ */}
        <section id="features" style={{ padding:"7rem 0" }}>
          <div className="wrap">
            <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:"2rem",marginBottom:"3.5rem",flexWrap:"wrap" }}>
              <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.5 }}>
                <span className="eyebrow" style={{ color:accentColor }}>
                  {mode==="personal" ? "Personal Capabilities" : "Organisation Capabilities"}
                </span>
                <AnimatePresence mode="wait">
                  {mode === "personal" ? (
                    <motion.h2 key="fh-p" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:.35 }}
                      style={{ fontSize:"clamp(2rem,5vw,3.6rem)",fontWeight:800,lineHeight:1,letterSpacing:"-.03em" }}>
                      What Velamini<br/>
                      <span className="serif" style={{ fontStyle:"italic",fontWeight:400,color:"var(--muted)" }}>does for you.</span>
                    </motion.h2>
                  ) : (
                    <motion.h2 key="fh-o" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:.35 }}
                      style={{ fontSize:"clamp(2rem,5vw,3.6rem)",fontWeight:800,lineHeight:1,letterSpacing:"-.03em" }}>
                      Built for<br/>
                      <span className="serif" style={{ fontStyle:"italic",fontWeight:400,color:"var(--muted)" }}>your business.</span>
                    </motion.h2>
                  )}
                </AnimatePresence>
              </motion.div>
              <p style={{ maxWidth:"28ch",color:"var(--muted)",lineHeight:1.7,fontSize:".92rem" }}>
                {mode==="personal"
                  ? "A complete toolkit to create an AI that genuinely represents you."
                  : "Everything you need to deploy, manage and grow a customer AI agent."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={mode + "-feats"}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                transition={{ duration:.35 }}>
                {features.map((f, i) => (
                  <motion.div key={f.num} className="feat-row"
                    initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }}
                    viewport={{ once:true }} transition={{ duration:.42, delay: i*.06 }}>
                    <span className="feat-num mono" style={{ fontSize:".62rem",color:"var(--muted)",letterSpacing:".1em" }}>{f.num}</span>
                    <div>
                      <h3 style={{ fontSize:"1.1rem",fontWeight:700,marginBottom:".35rem" }}>{f.title}</h3>
                      <p style={{ color:"var(--muted)",lineHeight:1.65,fontSize:".88rem",maxWidth:"44ch" }}>{f.desc}</p>
                    </div>
                    <div className="feat-icon-box"
                      style={{ width:42,height:42,border:"1px solid var(--border2)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:accentColor,flexShrink:0,transition:"border-color .3s" }}>
                      <f.Icon size={17} strokeWidth={1.5}/>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            <hr className="section-divider" style={{ marginTop:0 }}/>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════════ */}
        <div className="diagonal-section">
          <section id="how-it-works">
            <div className="wrap">
              <motion.div initial={{ opacity:0, y:22 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.5 }} style={{ marginBottom:"3.5rem" }}>
                <span className="eyebrow" style={{ color:accentColor }}>Process</span>
                <h2 style={{ fontSize:"clamp(2rem,5vw,3.6rem)",fontWeight:800,lineHeight:1,letterSpacing:"-.03em" }}>
                  Three steps.<br/>
                  <span className="serif" style={{ fontStyle:"italic",fontWeight:400,color:"var(--muted)" }}>That's all it takes.</span>
                </h2>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div key={mode + "-steps"}
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  transition={{ duration:.35 }}
                  style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.25rem" }}>
                  {steps.map((s, i) => (
                    <motion.div key={s.label} className="step-card"
                      initial={{ opacity:0, y:22 }} whileInView={{ opacity:1, y:0 }}
                      viewport={{ once:true }} transition={{ duration:.48, delay: i*.1 }}>
                      <span className="mono" style={{ fontSize:".62rem",letterSpacing:".16em",textTransform:"uppercase",color:accentColor }}>{s.label}</span>
                      <div>
                        <h3 style={{ fontSize:"1.22rem",fontWeight:700,marginBottom:".65rem" }}>{s.title}</h3>
                        <p style={{ color:"var(--muted)",lineHeight:1.72,fontSize:".9rem" }}>{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════════════ */}
        <section className="cta-section">
          <div className="wrap">
            <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:"2rem",flexWrap:"wrap" }}>
              <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.6 }}>
                <p className="mono" style={{ fontSize:".66rem",letterSpacing:".2em",textTransform:"uppercase",color:accentColor,marginBottom:"1.5rem" }}>
                  — {mode==="personal" ? "Your digital twin awaits" : "Get started today"}
                </p>
                <AnimatePresence mode="wait">
                  {mode === "personal" ? (
                    <motion.h2 key="cta-p" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:.4 }}
                      style={{ fontSize:"clamp(2.8rem,7.5vw,6.5rem)",fontWeight:800,lineHeight:.92,letterSpacing:"-.03em",color:"var(--cta-fg)" }}>
                      Create your<br/>
                      <span className="serif" style={{ fontStyle:"italic",fontWeight:400,color:"var(--accent)" }}>virtual self.</span>
                    </motion.h2>
                  ) : (
                    <motion.h2 key="cta-o" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:.4 }}
                      style={{ fontSize:"clamp(2.8rem,7.5vw,6.5rem)",fontWeight:800,lineHeight:.92,letterSpacing:"-.03em",color:"var(--cta-fg)" }}>
                      Deploy your<br/>
                      <span className="serif" style={{ fontStyle:"italic",fontWeight:400,color:"var(--org-c)" }}>AI agent.</span>
                    </motion.h2>
                  )}
                </AnimatePresence>
                <p style={{ marginTop:"2rem",maxWidth:"40ch",color:"var(--cta-sub)",lineHeight:1.76,fontSize:".95rem" }}>
                  {mode==="personal"
                    ? "Join thousands of creators and professionals who use Velamini to scale their presence — without losing their voice."
                    : "Businesses of all sizes use Velamini to serve customers 24/7, capture leads, and reduce support load — at any scale."}
                </p>
                <div style={{ marginTop:"2.5rem",display:"flex",flexWrap:"wrap",gap:"1rem" }}>
                  <Link href={mode==="personal" ? "/onboarding" : "/onboarding?type=org"}
                    className={`cta-btn ${mode}`}>
                    {mode==="personal" ? "Create My AI Twin" : "Create Organisation"}
                    <ArrowUpRight size={13}/>
                  </Link>
                  <Link href="/pricing" className="cta-btn-ghost">
                    View Pricing
                  </Link>
                </div>
              </motion.div>

              {/* Ghost number */}
              <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ duration:.9, delay:.2 }}
                className="serif"
                style={{ fontSize:"clamp(5rem,16vw,15rem)",lineHeight:1,
                  color: mode==="personal" ? "rgba(56,174,204,.06)" : "rgba(129,140,248,.06)",
                  userSelect:"none",pointerEvents:"none",fontStyle:"italic",fontWeight:400 }}>
                ∞
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════ */}
        <footer className="site-footer">
          <div className="wrap" style={{ display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"1.2rem" }}>
            <div style={{ display:"flex",alignItems:"center",gap:".7rem" }}>
              <div style={{ width:24,height:24,borderRadius:4,overflow:"hidden",border:"1.5px solid rgba(56,174,204,.4)",position:"relative",flexShrink:0 }}>
                <Image src="/logo.png" alt="Velamini" fill style={{ objectFit:"contain" }}/>
              </div>
              <span className="mono" style={{ fontSize:".6rem",letterSpacing:".28em",textTransform:"uppercase",color:"var(--footer-text)" }}>
                Velamini
              </span>
            </div>

            <nav style={{ display:"flex",flexWrap:"wrap",gap:"2rem" }}>
              {[
                { label:"Home",     href:"/" },
                { label:"Pricing",  href:"/pricing" },
                { label:"Docs",     href:"/docs" },
                { label:"Sign In",  href:"/auth/signin" },
                { label:"Terms",    href:"/terms" },
                { label:"Privacy",  href:"/privacy" },
              ].map(l => (
                <Link key={l.label} href={l.href} className="footer-link">{l.label}</Link>
              ))}
            </nav>

            <p className="mono" style={{ fontSize:".58rem",color:"var(--footer-copy)",letterSpacing:".06em" }}>
              © {new Date().getFullYear()} Velamini
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}