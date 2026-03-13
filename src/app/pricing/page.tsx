"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar, { applyTheme } from "@/components/Navbar";
import Footer from "@/components/footer";
import {
  Check, X, Zap, TrendingUp, CreditCard, Crown,
  ChevronDown, User, Building2, ArrowRight, Sparkles,
} from "lucide-react";

/* ── Plan data ───────────────────────────────────────────────── */
export const PERSONAL_PLANS = [
  {
    id: "personal-free",
    label: "Personal Free",
    price: 0,
    msgs: 200,
    Icon: Zap,
    color: "#34D399",
    tagline: "Explore the platform",
    badge: "Free",
    features: [
      { t: "200 messages / month",          ok: true  },
      { t: "1 personal AI agent",           ok: true  },
      { t: "Chat via dashboard",            ok: true  },
      { t: "Conversation history (7 days)", ok: true  },
      { t: "REST API access",               ok: false },
      { t: "Embed widget",                  ok: false },
      { t: "Analytics",                     ok: false },
    ],
    cta: "Start Free",
    ctaHref: "/onboarding/personal",
    highlight: true,
  },
  {
    id: "personal-plus",
    label: "Personal Plus",
    price: 3000,
    msgs: 1500,
    Icon: Sparkles,
    color: "#38AECC",
    tagline: "For power users",
    badge: "Recommended",
    features: [
      { t: "1,500 messages / month",        ok: true },
      { t: "1 personal AI agent",           ok: true },
      { t: "Chat via dashboard",            ok: true },
      { t: "Full conversation history",     ok: true },
      { t: "REST API access",               ok: true },
      { t: "Embed widget",                  ok: false },
      { t: "Basic analytics",               ok: true },
    ],
    cta: "Get Personal Plus",
    ctaHref: "/onboarding/personal?plan=personal-plus",
    highlight: true,
  },
] as const;

export const ORG_PLANS = [
  {
    id: "free",
    label: "Free",
    price: 0,
    msgs: 500,
    Icon: Zap,
    color: "#34D399",
    tagline: "Test the waters",
    badge: "Free",
    features: [
      { t: "500 messages / month",          ok: true  },
      { t: "1 AI agent",                    ok: true  },
      { t: "API access",                    ok: true  },
      { t: "Embed widget",                  ok: true  },
      { t: "Data Insights",                 ok: true  },
    ],
    cta: "Get Started Free",
    ctaHref: "/onboarding/org",
    highlight: true,
  },
  {
    id: "starter",
    label: "Starter",
    price: 4000,
    msgs: 2000,
    Icon: TrendingUp,
    color: "#38AECC",
    tagline: "For small businesses",
    badge: "Recommended",
    features: [
      { t: "2,000 messages / month",        ok: true },
      // Removed token feature
      { t: "1 AI agent",                    ok: true },
      { t: "API + Embed",                   ok: true },
      { t: "Data Insights",                 ok: true },
      { t: "Priority support",              ok: true },
    ],
    cta: "Upgrade to Starter",
    ctaHref: "/onboarding/org?plan=starter",
    highlight: true,
  },
  {
    id: "pro",
    label: "Pro",
    price: 12000,
    msgs: 8000,
    Icon: CreditCard,
    color: "#818CF8",
    tagline: "Most popular",
    badge: "Most Popular",
    features: [
      { t: "8,000 messages / month",        ok: true },
      // Removed token feature
      { t: "1 AI agent",                    ok: true },
      { t: "API + Embed",                   ok: true },
      { t: "Analytics",                     ok: true },
      { t: "Data Insights",                 ok: true },
      { t: "Priority support",              ok: true },
    ],
    cta: "Upgrade to Pro",
    ctaHref: "/onboarding/org?plan=pro",
    highlight: true,
  },
  {
    id: "scale",
    label: "Scale",
    price: 28000,
    msgs: 25000,
    Icon: Crown,
    color: "#FCD34D",
    tagline: "High-traffic orgs",
    badge: "Best Value",
    features: [
      { t: "25,000 messages / month",       ok: true },
      // Removed token feature
      { t: "1 AI agent",                    ok: true },
      { t: "API + Embed",                   ok: true },
      { t: "Analytics",                     ok: true },
      { t: "Data Insights",                 ok: true },
      { t: "Dedicated support",             ok: true },
      { t: "SLA guarantee",                 ok: true },
    ],
    cta: "Upgrade to Scale",
    ctaHref: "/onboarding/org?plan=scale",
    highlight: true,
  },
] as const;

const PERIOD_DISPLAY = {
  monthly:   { perMonthFactor: 1,   billingNote: "" },
  "6months": { perMonthFactor: 0.9, billingNote: "billed every 6 months" },
  yearly:    { perMonthFactor: 0.8, billingNote: "billed annually" },
} as const;

const FAQS = [
  { q: "Can I start without a credit card?",    a: "Yes — the Free plan requires no payment. You get messages immediately after signing up." },
  { q: "What payment methods are supported?",   a: "We accept MTN MoMo, Airtel Money, Visa, and Mastercard via Flutterwave — common across Rwanda, Kenya, Nigeria and much of Africa." },
  { q: "When does my message count reset?",     a: "On the 1st of each calendar month, your message counter resets to zero automatically." },
  { q: "What happens when I hit my limit?",     a: "Your agent will stop responding until the counter resets or you upgrade. We email you at 80% and 95% usage." },
  { q: "Can I switch between Personal and Org?",a: "Yes — you can upgrade or switch account type any time from your account settings." },
  { q: "Can I downgrade?",                      a: "Yes. Downgrades take effect at the start of your next billing cycle. Current limits stay until then." },
];

function fmtRWF(n: number) { return n.toLocaleString("en-RW"); }

/* ── FAQ item ────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = q.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="fi">
      <button
        className="fi-q"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(p => !p)}
      >
        <span>{q}</span>
        <ChevronDown size={14} className={`fi-icon${open ? " fi-icon--open" : ""}`}/>
      </button>
      <div
        id={id}
        className="fi-body"
        style={{ maxHeight: open ? 260 : 0 }}
        aria-hidden={!open}
      >
        <p className="fi-a">{a}</p>
      </div>
    </div>
  );
}

/* ── Plan card ───────────────────────────────────────────────── */
function PlanCard({ plan, period }: { plan: typeof ORG_PLANS[number] | typeof PERSONAL_PLANS[number]; period: "monthly" | "6months" | "yearly" }) {
  const Ic = plan.Icon;
  const hi = plan.highlight;
  const pInfo = PERIOD_DISPLAY[period];
  const monthlyPrice = (plan.price as number) === 0 ? 0 : Math.round((plan.price as number) * pInfo.perMonthFactor);
  return (
    <div className={`pc${hi ? " pc--hi" : ""}`} style={{ ["--col" as any]: plan.color }}>
      {/* top accent line */}
      <div className="pc-line"/>

      {plan.badge && (
        <div className="pc-bdg" style={{ background: plan.color }}>
          {plan.badge}
        </div>
      )}

      {/* header */}
      <div className="pc-head">
        <div className="pc-ic" style={{ background: `${plan.color}18`, boxShadow: `0 0 0 1px ${plan.color}30` }}>
          <Ic size={16} style={{ color: plan.color }}/>
        </div>
        <div>
          <div className="pc-name">{plan.label}</div>
          <div className="pc-sub">{plan.tagline}</div>
        </div>
      </div>

      {/* price */}
      <div className="pc-price">
        {plan.price === 0
          ? <span className="pc-free">Free</span>
          : <>
              <span className="pc-num">{fmtRWF(monthlyPrice)}</span>
              <span className="pc-rwf">RWF<span className="pc-mo">/mo</span></span>
            </>
        }
      </div>
      {plan.price !== 0 && period !== "monthly" && (
        <div className="pc-billing-note">
          {pInfo.billingNote} · save {period === "6months" ? "10%" : "20%"}
        </div>
      )}
      <div className="pc-limit" style={{ color: plan.color }}>
        {plan.msgs.toLocaleString()} messages / month
      </div>

      <div className="pc-divider"/>

      {/* features */}
      <ul className="pc-feats">
        {plan.features.map(f => (
          <li key={f.t} className={`pc-feat${f.ok ? "" : " pc-feat--off"}`}>
            <span className="pc-feat-icon">
              {f.ok
                ? <Check size={10} style={{ color: plan.color }}/>
                : <X     size={10} className="pc-feat-x"/>}
            </span>
            {f.t}
          </li>
        ))}
      </ul>

      {/* cta */}
      <Link
        href={plan.ctaHref}
        className={`pc-cta${hi ? " pc-cta--hi" : ""}`}
        style={{ ["--col" as any]: plan.color }}
      >
        {plan.cta}
        <ArrowRight size={13}/>
      </Link>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function PricingPage() {
  const [isDark,  setIsDark]  = useState(true);
  const [tab,     setTab]     = useState<"personal"|"org">("org");
  const [period,  setPeriod]  = useState<"monthly"|"6months"|"yearly">("monthly");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const d = (localStorage.getItem("theme") || "dark") === "dark";
      setIsDark(d); applyTheme(d);
    } catch {}
  }, []);

  const toggleTheme = () => setIsDark(p => {
    const n = !p; applyTheme(n);
    try { localStorage.setItem("theme", n ? "dark" : "light"); } catch {}
    return n;
  });

  const plans = tab === "personal" ? PERSONAL_PLANS : ORG_PLANS;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        /* ─── Tokens ─────────────────────────────────────────── */
        :root,[data-mode="light"]{
          --bg:       #E8F4FD;
          --bg2:      #D8ECF9;
          --su:       #FFFFFF;
          --su2:      #F0F8FF;
          --br:       #BDD9F0;
          --br2:      #D6ECFA;
          --fg:       #091828;
          --fg2:      #1C3A52;
          --mu:       #2E4A5E;
          --ac:       #29A9D4;
          --ac2:      #1B90B8;
          --org:      #6366F1;
          --glow-ac:  rgba(41,169,212,.22);
          --glow-org: rgba(99,102,241,.16);
        }
        [data-mode="dark"]{
          --bg:       #060E18;
          --bg2:      #08111E;
          --su:       #0C1A28;
          --su2:      #0F2030;
          --br:       #132234;
          --br2:      #1A3045;
          --fg:       #D4EEFF;
          --fg2:      #8BBAD6;
          --mu:       #2E5470;
          --ac:       #38AECC;
          --ac2:      #29A9D4;
          --org:      #818CF8;
          --glow-ac:  rgba(56,174,204,.18);
          --glow-org: rgba(129,140,248,.14);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--fg);-webkit-font-smoothing:antialiased;transition:background .35s,color .35s}

        /* ─── Page wrapper ─────────────────────────────────────── */
        .pw{
          min-height:100dvh;
          padding-top:3.75rem;
          overflow-x:hidden;
          position:relative;
        }

        /* ─── Background: rich dark gradient + blurred orbs ─────── */
        .pw-bg{
          position:fixed;inset:0;z-index:0;pointer-events:none;
          overflow:hidden;
        }

        /* Base gradient */
        .pw-bg::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 80% 60% at 10% -10%, color-mix(in srgb,var(--ac) 14%,transparent) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 90% 20%,  color-mix(in srgb,var(--org) 10%,transparent) 0%, transparent 55%),
            radial-gradient(ellipse 70% 40% at 50% 100%, color-mix(in srgb,var(--ac) 9%,transparent)  0%, transparent 60%),
            var(--bg);
        }

        /* Floating orbs */
        .orb{
          position:absolute;border-radius:50%;
          filter:blur(80px);opacity:.55;
          pointer-events:none;
          animation:orb-drift 18s ease-in-out infinite alternate;
        }
        [data-mode="light"] .orb{opacity:.25;filter:blur(100px)}
        .orb-1{width:520px;height:520px;background:radial-gradient(circle,color-mix(in srgb,var(--ac) 65%,transparent),transparent 72%);top:-120px;left:-100px;animation-delay:0s;animation-duration:22s}
        .orb-2{width:400px;height:400px;background:radial-gradient(circle,color-mix(in srgb,var(--org) 55%,transparent),transparent 72%);top:80px;right:-80px;animation-delay:-7s;animation-duration:26s}
        .orb-3{width:460px;height:460px;background:radial-gradient(circle,color-mix(in srgb,var(--ac) 45%,transparent),transparent 72%);bottom:5%;left:30%;animation-delay:-13s;animation-duration:20s}
        .orb-4{width:280px;height:280px;background:radial-gradient(circle,color-mix(in srgb,#34D399 40%,transparent),transparent 72%);bottom:20%;right:10%;animation-delay:-4s;animation-duration:30s}

        @keyframes orb-drift{
          0%  {transform:translate(0,0)   scale(1)}
          33% {transform:translate(24px,-18px) scale(1.04)}
          66% {transform:translate(-16px,22px) scale(.97)}
          100%{transform:translate(10px,-8px)  scale(1.02)}
        }

        /* Fine dot grid overlay */
        .pw-bg::after{
          content:'';position:absolute;inset:0;
          background-image:radial-gradient(circle,color-mix(in srgb,var(--fg) 18%,transparent) 1px,transparent 1px);
          background-size:28px 28px;
          opacity:.12;
          mask-image:radial-gradient(ellipse 90% 80% at 50% 40%,black 30%,transparent 100%);
        }
        [data-mode="light"] .pw-bg::after{opacity:.07}

        /* ─── All content above bg ─────────────────────────────── */
        .pw > *:not(.pw-bg){position:relative;z-index:1}

        /* ─── Hero ─────────────────────────────────────────────── */
        .ph{
          text-align:center;padding:5rem 1.5rem 3.5rem;
          max-width:640px;margin:0 auto;
        }
        .ph-pill{
          display:inline-flex;align-items:center;gap:6px;
          font-size:.6rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;
          color:var(--ac);
          background:color-mix(in srgb,var(--ac) 10%,transparent);
          border:1px solid color-mix(in srgb,var(--ac) 28%,transparent);
          padding:5px 14px;border-radius:20px;margin-bottom:1.5rem;
        }
        .ph-h1{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:clamp(2.4rem,5.5vw,3.8rem);
          font-weight:400;line-height:1.08;
          letter-spacing:-.03em;color:var(--fg);
          margin-bottom:1.1rem;
        }
        .ph-h1 em{font-style:italic;color:var(--ac)}
        .ph-sub{
          font-size:.9rem;color:var(--mu);line-height:1.78;
          margin-bottom:2.2rem;max-width:460px;
          margin-left:auto;margin-right:auto;
        }
        .ph-chip{
          display:inline-flex;align-items:center;gap:9px;
          padding:10px 22px;border-radius:40px;
          background:color-mix(in srgb,var(--su) 70%,transparent);
          border:1px solid var(--br2);
          backdrop-filter:blur(12px);
          font-size:.78rem;font-weight:600;color:var(--fg2);
          box-shadow:0 2px 18px rgba(0,0,0,.1);
        }
        .ph-chip b{color:var(--ac)}

        /* ─── Tab switcher ─────────────────────────────────────── */
        .pts{
          display:flex;justify-content:center;
          margin-bottom:3rem;
        }
        .pts-inner{
          display:inline-flex;align-items:center;
          background:color-mix(in srgb,var(--su) 80%,transparent);
          border:1.5px solid var(--br2);border-radius:16px;padding:5px;
          backdrop-filter:blur(14px);gap:4px;
          box-shadow:0 4px 24px rgba(0,0,0,.1);
        }
        .pts-btn{
          display:flex;align-items:center;gap:8px;
          padding:9px 24px;border:none;border-radius:11px;
          font-family:inherit;font-size:.8rem;font-weight:600;
          cursor:pointer;transition:all .22s;
          color:var(--mu);background:none;
        }
        .pts-btn svg{width:14px;height:14px}
        .pts-btn.on{
          background:var(--ac);color:#fff;
          box-shadow:0 2px 16px color-mix(in srgb,var(--ac) 42%,transparent);
        }
        .pts-btn.on svg{color:#fff}

        /* ─── Cards grid ───────────────────────────────────────── */
        .pgrid{
          display:grid;gap:20px;
          max-width:1160px;margin:0 auto;
          padding:0 20px 3rem;
        }
        .pgrid--2{grid-template-columns:repeat(auto-fill,minmax(290px,1fr));max-width:720px}
        .pgrid--4{grid-template-columns:repeat(auto-fill,minmax(248px,1fr))}
        @media(max-width:600px){
          .pgrid--4,.pgrid--2{grid-template-columns:1fr;max-width:100%}
        }

        /* ─── Plan card ────────────────────────────────────────── */
        /* ── Plan card — DARK MODE (default) ────────────────────── */
        .pc{
          position:relative;
          /* Solid opaque dark card so text is always legible */
          background:#0D1E2E;
          border:1px solid color-mix(in srgb,var(--col) 15%,#1A3448);
          border-radius:22px;
          padding:0 0 20px;
          display:flex;flex-direction:column;
          overflow:hidden;
          transition:transform .24s,box-shadow .24s,border-color .24s;
        }
        .pc:hover{
          transform:translateY(-5px);
          box-shadow:0 18px 52px rgba(0,0,0,.5),0 0 0 1px #1E3C56;
        }
        .pc--hi{
          background:#0E2035 !important;
          border-color:color-mix(in srgb,var(--col) 55%,#1A3448) !important;
          box-shadow:0 0 0 1px color-mix(in srgb,var(--col) 25%,transparent),
                     inset 0 0 60px color-mix(in srgb,var(--col) 4%,transparent);
        }
        .pc--hi:hover{
          box-shadow:
            0 20px 56px rgba(0,0,0,.55),
            0 0 0 2px color-mix(in srgb,var(--col) 50%,transparent),
            0 0 80px color-mix(in srgb,var(--col) 20%,transparent) !important;
        }

        /* ── Plan card — LIGHT MODE overrides ────────────────────── */
        [data-mode="light"] .pc{
          background:#ffffff;
          border:1px solid #C8DDEF;
          color:#091828;
          box-shadow:0 2px 16px rgba(10,50,90,.07);
        }
        [data-mode="light"] .pc:hover{
          box-shadow:0 14px 40px rgba(10,50,90,.14),0 0 0 1px #BDD9F0;
        }
        [data-mode="light"] .pc--hi{
          background:#f6fbff !important;
          border-color:color-mix(in srgb,var(--col) 60%,#C8DDEF) !important;
          box-shadow:0 4px 28px color-mix(in srgb,var(--col) 15%,rgba(10,50,90,.08)) !important;
        }

        /* top accent bar */
        .pc-line{
          height:3px;width:100%;
          background:color-mix(in srgb,var(--col) 40%,transparent);
        }
        .pc--hi .pc-line{background:var(--col);}

        /* badge */
        .pc-bdg{
          position:absolute;top:12px;right:14px;
          font-size:.54rem;font-weight:800;letter-spacing:.1em;
          text-transform:uppercase;color:#fff;
          padding:4px 10px;border-radius:20px;
          box-shadow:0 2px 12px rgba(0,0,0,.35);
        }

        /* ── Card text — dark mode: explicit light colours ────── */
        .pc-head{display:flex;align-items:center;gap:11px;padding:20px 20px 0}
        .pc-ic{
          width:40px;height:40px;border-radius:12px;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;transition:transform .2s;
        }
        .pc:hover .pc-ic{transform:scale(1.08) rotate(-4deg)}

        /* Dark mode: bright text */
        .pc-name{font-weight:800;font-size:.96rem;color:#D4EEFF}
        .pc-sub{font-size:.67rem;color:#5B8FA8;margin-top:2px}

        /* Light mode: dark text */
        [data-mode="light"] .pc-name{color:#091828}
        [data-mode="light"] .pc-sub{color:#527A96}

        .pc-price{display:flex;align-items:baseline;gap:5px;padding:18px 20px 0;}

        /* Dark mode price */
        .pc-free{
          font-family:'DM Serif Display',serif;
          font-size:2.6rem;font-weight:400;color:#D4EEFF;line-height:1;
        }
        .pc-num{
          font-family:'DM Serif Display',serif;
          font-size:2.2rem;font-weight:400;color:#D4EEFF;line-height:1;
          letter-spacing:-.02em;
        }
        .pc-rwf{font-size:.72rem;font-weight:700;color:#5B8FA8;margin-bottom:3px}
        .pc-mo{font-weight:400;color:#5B8FA8;opacity:.8}

        /* Light mode price */
        [data-mode="light"] .pc-free{color:#091828}
        [data-mode="light"] .pc-num{color:#091828}
        [data-mode="light"] .pc-rwf{color:#527A96}
        [data-mode="light"] .pc-mo{color:#527A96}

        .pc-billing-note{padding:3px 20px 0;font-size:.67rem;font-weight:600;color:#5B8FA8}
        [data-mode="light"] .pc-billing-note{color:#527A96}

        .pc-limit{padding:5px 20px 0;font-size:.7rem;font-weight:700;letter-spacing:.01em;}

        .pc-divider{height:1px;background:#1A3448;margin:16px 20px}
        [data-mode="light"] .pc-divider{background:#D6ECFA}

        /* Feature list */
        .pc-feats{list-style:none;padding:0 20px;display:flex;flex-direction:column;gap:9px;flex:1;margin-bottom:20px}

        /* Dark: bright text for active features, muted for disabled */
        .pc-feat{display:flex;align-items:center;gap:9px;font-size:.79rem;color:#C0DCF0;line-height:1.4}
        .pc-feat--off{color:#2E5470 !important;opacity:1 !important}

        /* Light: dark text for active, soft muted for disabled */
        [data-mode="light"] .pc-feat{color:#1C3A52}
        [data-mode="light"] .pc-feat--off{color:#9CC0D8 !important;opacity:1 !important}

        .pc-feat-icon{
          display:flex;align-items:center;justify-content:center;
          width:18px;height:18px;border-radius:5px;flex-shrink:0;
          background:color-mix(in srgb,var(--col) 14%,transparent);
          flex-shrink:0;
        }
        .pc-feat--off .pc-feat-icon{background:transparent}
        /* X icon inside disabled feature — dark: dark blue, light: soft blue-grey */
        .pc-feat-x{ color:#2A4D68 }
        [data-mode="light"] .pc-feat-x{ color:#9CC0D8 }

        /* ── CTA button ────────────────────────────────────────── */
        /* Ghost (non-highlight) — dark mode */
        .pc-cta{
          display:flex;align-items:center;justify-content:center;gap:7px;
          margin:0 20px;padding:12px;border-radius:13px;
          border:1.5px solid color-mix(in srgb,var(--col) 55%,#1E3C58);
          font-size:.8rem;font-weight:700;text-decoration:none;
          color:var(--col);
          background:color-mix(in srgb,var(--col) 24%,transparent);
          transition:all .18s;
        }
        .pc-cta:hover{
          border-color:var(--col);
          background:color-mix(in srgb,var(--col) 18%,transparent);
          color:var(--col);
          transform:translateY(-1px);
        }
        /* Ghost — light mode */
        [data-mode="light"] .pc-cta{
          border-color:color-mix(in srgb,var(--col) 50%,#C8DDEF);
          color:var(--col);
          background:color-mix(in srgb,var(--col) 10%,transparent);
        }
        [data-mode="light"] .pc-cta:hover{
          border-color:var(--col);
          background:color-mix(in srgb,var(--col) 12%,transparent);
          color:var(--col);
        }
        /* Highlighted CTA — always solid accent colour */
        .pc-cta--hi{
          background:var(--col) !important;
          border-color:var(--col) !important;
          color:#fff !important;
          box-shadow:0 4px 22px color-mix(in srgb,var(--col) 40%,transparent);
        }
        .pc-cta--hi:hover{
          opacity:.88;
          transform:translateY(-2px);
          box-shadow:0 8px 32px color-mix(in srgb,var(--col) 50%,transparent);
          color:#fff !important;
        }

        /* ─── Payment methods ──────────────────────────────────── */
        .ppay{text-align:center;padding:0 1rem 3.5rem}
        .ppay-lbl{font-size:.6rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--mu);margin-bottom:14px}
        .ppay-chips{display:flex;flex-wrap:wrap;gap:9px;justify-content:center}
        .ppay-chip{
          display:flex;align-items:center;gap:6px;
          padding:7px 16px;
          background:color-mix(in srgb,var(--su) 75%,transparent);
          border:1px solid var(--br2);border-radius:24px;
          font-size:.72rem;font-weight:600;color:var(--mu);
          backdrop-filter:blur(8px);
          transition:border-color .15s,color .15s;
        }
        .ppay-chip:hover{border-color:var(--ac);color:var(--ac)}

        /* ─── Divider ──────────────────────────────────────────── */
        .pdiv{padding:0 20px 2.5rem;max-width:740px;margin:0 auto}
        .pdiv-line{height:1px;background:linear-gradient(90deg,transparent,var(--br2) 30%,var(--br2) 70%,transparent)}

        /* ─── Comparison table ─────────────────────────────────── */
        .ptbl-wrap{max-width:960px;margin:0 auto;padding:0 20px 5rem;overflow-x:auto}
        .ptbl-hd{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:clamp(1.5rem,3vw,2rem);font-weight:400;
          text-align:center;margin-bottom:1.8rem;color:var(--fg);
        }
        .ptbl-box{
          border-radius:18px;overflow:hidden;
          border:1px solid var(--br2);
          background:color-mix(in srgb,var(--su) 75%,transparent);
          color:var(--fg);
        }
        [data-mode="dark"] .ptbl-box{
          background:color-mix(in srgb,var(--su) 8%,#08111E);
          color:#D4EEFF;
          backdrop-filter:blur(14px);
        }
        .ptbl{width:100%;border-collapse:collapse;font-size:.79rem;min-width:440px}
        .ptbl th,.ptbl td{padding:12px 16px;border-bottom:1px solid var(--br);text-align:center}
        .ptbl th:first-child,.ptbl td:first-child{text-align:left;font-weight:600;color:var(--fg)}
        .ptbl thead th{
          background:color-mix(in srgb,var(--su2) 85%,transparent);
          color:var(--mu);font-size:.59rem;font-weight:800;
          letter-spacing:.1em;text-transform:uppercase;
        }
        .ptbl tbody tr:last-child td{border-bottom:none}
        .ptbl tbody tr:hover td{background:color-mix(in srgb,var(--ac) 4%,transparent)}
        .ptbl-yes{color:#34D399;font-weight:700}
        .ptbl-no{color:var(--br2);opacity:.6}
        /* highlight column */
        .ptbl--org  thead th:nth-child(4),
        .ptbl--org  tbody td:nth-child(4){background:color-mix(in srgb,var(--ac) 8%,transparent)}
        .ptbl--org  thead th:nth-child(4){color:var(--ac)!important}
        .ptbl--pers thead th:nth-child(3),
        .ptbl--pers tbody td:nth-child(3){background:color-mix(in srgb,var(--ac) 8%,transparent)}
        .ptbl--pers thead th:nth-child(3){color:var(--ac)!important}

        /* ─── FAQ ──────────────────────────────────────────────── */
        .pfaq{max-width:680px;margin:0 auto;padding:0 20px 5rem}
        .pfaq-hd{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:clamp(1.5rem,3vw,2rem);font-weight:400;
          text-align:center;margin-bottom:1.8rem;color:var(--fg);
        }
        .pfaq-card{
          border-radius:18px;overflow:hidden;
          border:1px solid var(--br2);
          background:color-mix(in srgb,var(--su) 75%,transparent);
          color:var(--fg);
        }
        [data-mode="dark"] .pfaq-card{
          background:color-mix(in srgb,var(--su) 8%,#08111E);
          color:#D4EEFF;
          backdrop-filter:blur(14px);
          padding:0 22px;
        }
        .fi{border-bottom:1px solid var(--br)}
        .fi:last-child{border-bottom:none}
        .fi-q{
          width:100%;background:none;border:none;cursor:pointer;
          display:flex;justify-content:space-between;align-items:center;
          padding:16px 0;color:var(--fg);font-family:inherit;
          font-size:.86rem;font-weight:600;text-align:left;gap:12px;
          transition:color .15s;
        }
        .fi-q:hover{color:var(--ac)}
        .fi-icon{color:var(--ac);transition:transform .22s,color .15s;flex-shrink:0}
        .fi-icon--open{transform:rotate(180deg)}
        .fi-body{overflow:hidden;transition:max-height .3s ease}
        .fi-a{margin:0 0 16px;font-size:.81rem;color:var(--mu);line-height:1.78}

        /* ─── Bottom CTA ───────────────────────────────────────── */
        .pcta{
          position:relative;overflow:hidden;
          padding:5.5rem 1.5rem;text-align:center;
          border-top:1px solid var(--br);
        }
        .pcta::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 70% 80% at 50% 0%,
              color-mix(in srgb,var(--ac) 14%,transparent) 0%,
              transparent 65%),
            var(--bg2);
        }
        .pcta-content{position:relative;z-index:1}
        .pcta-h{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:clamp(1.6rem,3.5vw,2.3rem);font-weight:400;
          margin-bottom:.7rem;color:var(--fg);
        }
        .pcta-sub{color:var(--mu);font-size:.85rem;margin-bottom:1.8rem;line-height:1.65}
        .pcta-btns{display:flex;align-items:center;justify-content:center;gap:11px;flex-wrap:wrap}
        .pcta-btn{display:inline-flex;align-items:center;gap:7px;padding:13px 30px;border-radius:13px;font-weight:700;font-size:.85rem;text-decoration:none;transition:all .17s}
        .pcta-btn--main{background:var(--ac);color:#fff;box-shadow:0 4px 24px color-mix(in srgb,var(--ac) 42%,transparent)}
        .pcta-btn--main:hover{opacity:.88;transform:translateY(-2px);box-shadow:0 8px 32px color-mix(in srgb,var(--ac) 50%,transparent)}
        .pcta-btn--ghost{background:color-mix(in srgb,var(--su) 70%,transparent);border:1.5px solid var(--br2);color:var(--fg);backdrop-filter:blur(8px)}
        .pcta-btn--ghost:hover{border-color:var(--ac);color:var(--ac)}
      `}</style>

      <div className="pw">
        {/* ── Rich background ── */}
        <div className="pw-bg" aria-hidden="true">
          <div className="orb orb-1"/>
          <div className="orb orb-2"/>
          <div className="orb orb-3"/>
          <div className="orb orb-4"/>
        </div>

        <Navbar isDarkMode={isDark} onThemeToggle={toggleTheme}/>

        {/* ── Hero ── */}
        <section className="ph">
          <div className="ph-pill"><Zap size={9}/> Pricing</div>
          <h1 className="ph-h1">
            Simple, <em>transparent</em><br/>pricing for everyone
          </h1>
          <p className="ph-sub">
            From a personal project to a full business — pick the right plan and scale with confidence.
          </p>
          <div className="ph-chip">
            <Zap size={12}/>
            <span><b>Free messages</b> on every new account — no card required</span>
          </div>
        </section>

        {/* ── Tab switcher ── */}
        <div className="pts">
          <div className="pts-inner">
            <button className={`pts-btn${tab==="personal"?" on":""}`} onClick={() => setTab("personal")}>
              <User size={14}/> Personal
            </button>
            <button className={`pts-btn${tab==="org"?" on":""}`} onClick={() => setTab("org")}>
              <Building2 size={14}/> Organisation
            </button>
          </div>
        </div>

        {/* ── Plan cards ── */}
        <div className={`pgrid ${tab==="personal" ? "pgrid--2" : "pgrid--4"}`}>
          {plans.map(plan => <PlanCard key={plan.id} plan={plan as any} period={period}/>)}
        </div>

        {/* ── Payment methods ── */}
        <div className="ppay">
          <div className="ppay-lbl">Accepted payment methods</div>
          <div className="ppay-chips">
            {["MTN MoMo","Airtel Money","Visa","Mastercard","Bank Transfer"].map(m => (
              <span key={m} className="ppay-chip">{m}</span>
            ))}
          </div>
        </div>

        <div className="pdiv"><div className="pdiv-line"/></div>

        {/* ── Comparison table ── */}
        <div className="ptbl-wrap">
          <div className="ptbl-hd">Full Comparison</div>
          <div className="ptbl-box">
            {tab === "personal" ? (
              <table className="ptbl ptbl--pers">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Personal Free</th>
                    <th>Personal Plus</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Messages / month",     "200",    "1,500"],
                    ["Personal AI agent",    "✓",      "✓"],
                    ["Dashboard chat",       "✓",      "✓"],
                    ["Conversation history", "7 days", "Full"],
                    ["REST API access",      "—",      "✓"],
                    ["Embed widget",         "—",      "—"],
                    ["Analytics",            "—",      "Basic"],
                    ["Support",              "Docs",   "Email"],
                  ].map(([feat,...vs]) => (
                    <tr key={feat}>
                      <td>{feat}</td>
                      {vs.map((v,i) => <td key={i} className={v==="✓"?"ptbl-yes":v==="—"?"ptbl-no":""}>{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="ptbl ptbl--org">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Free</th>
                    <th>Starter</th>
                    <th>Pro</th>
                    <th>Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Messages / month",    "500",    "2,000",  "8,000",    "25,000"],
                    ["REST API",            "✓",      "✓",      "✓",        "✓"],
                    ["Embed widget",        "✓",      "✓",      "✓",        "✓"],
                    ["React / JS SDK",      "✓",      "✓",      "✓",        "✓"],
                    ["Session history",     "7 days", "Full",   "Full",     "Full"],
                    ["Analytics",           "—",      "Basic",  "Full",     "Advanced"],
                    ["Feedback tracking",   "—",      "✓",      "✓",        "✓"],
                    ["Support",             "Docs",   "Email",  "Priority", "Dedicated"],
                    ["SLA guarantee",       "—",      "—",      "—",        "✓"],
                  ].map(([feat,...vs]) => (
                    <tr key={feat}>
                      <td>{feat}</td>
                      {vs.map((v,i) => <td key={i} className={v==="✓"?"ptbl-yes":v==="—"?"ptbl-no":""}>{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="pdiv"><div className="pdiv-line"/></div>

        {/* ── FAQ ── */}
        <div className="pfaq">
          <div className="pfaq-hd">Frequently asked questions</div>
          <div className="pfaq-card">
            {FAQS.map(f => <FaqItem key={f.q} {...f}/>)}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="pcta">
          <div className="pcta-content">
            <div className="pcta-h">Ready to put your AI agent to work?</div>
            <p className="pcta-sub">Start free — no credit card. Upgrade any time from your dashboard.</p>
            <div className="pcta-btns">
              <Link href="/auth/signin" className="pcta-btn pcta-btn--main">
                Get Started Free <ArrowRight size={13}/>
              </Link>
              <Link href="/docs" className="pcta-btn pcta-btn--ghost">
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
        <Footer />

      </div>
    </>
  );
}
