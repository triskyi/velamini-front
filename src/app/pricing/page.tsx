"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar, { applyTheme } from "@/components/Navbar";
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
    badge: null,
    features: [
      { t: "200 messages / month",         ok: true  },
      { t: "1 personal AI agent",          ok: true  },
      { t: "Chat via dashboard",           ok: true  },
      { t: "Conversation history (7 days)",ok: true  },
      { t: "REST API access",              ok: false },
      { t: "Embed widget",                 ok: false },
      { t: "Analytics",                    ok: false },
    ],
    cta: "Start Free",
    ctaHref: "/auth/signin",
    highlight: false,
  },
  {
    id: "personal-plus",
    label: "Personal Plus",
    price: 3000,
    msgs: 1500,
    Icon: Sparkles,
    color: "#38AECC",
    tagline: "For power users",
    badge: null,
    features: [
      { t: "1,500 messages / month",       ok: true },
      { t: "1 personal AI agent",          ok: true },
      { t: "Chat via dashboard",           ok: true },
      { t: "Full conversation history",    ok: true },
      { t: "REST API access",              ok: true },
      { t: "Embed widget",                 ok: false },
      { t: "Basic analytics",              ok: true },
    ],
    cta: "Get Personal Plus",
    ctaHref: "/auth/signin?plan=personal-plus",
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
    badge: null,
    features: [
      { t: "500 messages / month",         ok: true  },
      { t: "1 AI agent",                   ok: true  },
      { t: "REST API access",              ok: true  },
      { t: "Embed widget",                 ok: true  },
      { t: "Multi-turn conversations",     ok: true  },
      { t: "Session history (7 days)",     ok: true  },
      { t: "Analytics dashboard",          ok: false },
    ],
    cta: "Get Started Free",
    ctaHref: "/auth/signin",
    highlight: false,
  },
  {
    id: "starter",
    label: "Starter",
    price: 5000,
    msgs: 2000,
    Icon: TrendingUp,
    color: "#38AECC",
    tagline: "For small businesses",
    badge: null,
    features: [
      { t: "2,000 messages / month",       ok: true },
      { t: "1 AI agent",                   ok: true },
      { t: "REST API + Embed widget",      ok: true },
      { t: "Full session history",         ok: true },
      { t: "Feedback analytics",           ok: true },
      { t: "Email support",                ok: true },
      { t: "Advanced analytics",           ok: false },
    ],
    cta: "Upgrade to Starter",
    ctaHref: "/auth/signin?plan=starter",
    highlight: false,
  },
  {
    id: "pro",
    label: "Pro",
    price: 15000,
    msgs: 8000,
    Icon: CreditCard,
    color: "#818CF8",
    tagline: "Most popular",
    badge: "Most Popular",
    features: [
      { t: "8,000 messages / month",       ok: true },
      { t: "1 AI agent",                   ok: true },
      { t: "REST API + Embed + React SDK", ok: true },
      { t: "Full session history",         ok: true },
      { t: "Usage analytics dashboard",    ok: true },
      { t: "Priority email support",       ok: true },
      { t: "Advanced analytics",           ok: true },
    ],
    cta: "Upgrade to Pro",
    ctaHref: "/auth/signin?plan=pro",
    highlight: true,
  },
  {
    id: "scale",
    label: "Scale",
    price: 35000,
    msgs: 25000,
    Icon: Crown,
    color: "#FCD34D",
    tagline: "High-traffic orgs",
    badge: "Best Value",
    features: [
      { t: "25,000 messages / month",      ok: true },
      { t: "1 AI agent",                   ok: true },
      { t: "REST API + Embed + React SDK", ok: true },
      { t: "Full session history",         ok: true },
      { t: "Advanced analytics",           ok: true },
      { t: "Dedicated support + SLA",      ok: true },
      { t: "Custom onboarding",            ok: true },
    ],
    cta: "Upgrade to Scale",
    ctaHref: "/auth/signin?plan=scale",
    highlight: false,
  },
] as const;

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
  return (
    <div className="pfaq-item">
      <button className="pfaq-item-btn" onClick={() => setOpen(p => !p)}>
        {q}
        <ChevronDown size={14} style={{ flexShrink:0, transform:open?"rotate(180deg)":"none", transition:"transform .22s", color:"var(--ac)" }}/>
      </button>
      <div className="pfaq-item-ans" style={{ maxHeight:open?320:0 }}>
        <p>{a}</p>
      </div>
    </div>
  );
}

/* ── Plan card ───────────────────────────────────────────────── */
function PlanCard({ plan }: { plan: typeof ORG_PLANS[number] | typeof PERSONAL_PLANS[number] }) {
  const IconComp = plan.Icon;
  return (
    <div className={`pc${plan.highlight ? " pc--hi" : ""}`} style={{ ["--pc" as any]: plan.color }}>
      {plan.badge && (
        <div className="pc-badge" style={{ background: plan.color }}>
          {plan.badge}
        </div>
      )}
      <div className="pc-top">
        <div className="pc-ic" style={{ background:`${plan.color}1e` }}>
          <IconComp size={17} style={{ color:plan.color }}/>
        </div>
        <div>
          <div className="pc-name">{plan.label}</div>
          <div className="pc-tag">{plan.tagline}</div>
        </div>
      </div>

      <div className="pc-price-wrap">
        <div className="pc-amt">
          {plan.price === 0
            ? <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:"2.2rem" }}>Free</span>
            : <>{fmtRWF(plan.price)}<span className="pc-cur">RWF</span></>}
        </div>
        {plan.price > 0 && <div className="pc-per">per month</div>}
        <div className="pc-msgs">{plan.msgs.toLocaleString()} messages / month</div>
      </div>

      <ul className="pc-feats">
        {plan.features.map(f => (
          <li key={f.t} className={`pc-feat${f.ok ? "" : " pc-feat--off"}`}>
            {f.ok
              ? <Check size={12} style={{ color:plan.color, flexShrink:0 }}/>
              : <X     size={12} style={{ color:"var(--br)", flexShrink:0 }}/>}
            {f.t}
          </li>
        ))}
      </ul>

      <Link href={plan.ctaHref} className={`pc-cta${plan.highlight ? " pc-cta--hi" : ""}`}
        style={plan.highlight ? { background:plan.color, borderColor:plan.color } : undefined}>
        {plan.cta}
        <ArrowRight size={13}/>
      </Link>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function PricingPage() {
  const [isDark, setIsDark] = useState(true);
  const [tab,    setTab]    = useState<"personal"|"org">("org");
  const [mounted,setMounted]= useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") || "dark";
      const d = stored === "dark";
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

        /* ── tokens ── */
        :root,[data-mode="light"]{
          --bg:#EFF7FF;--su:#FFFFFF;--s2:#E2F0FC;
          --br:#C5DCF2;--fg:#0B1E2E;--mu:#5A84A0;
          --ac:#29A9D4;--org:#6366F1;
          --sh:0 8px 32px rgba(10,50,90,.09);
        }
        [data-mode="dark"]{
          --bg:#081420;--su:#0F1E2D;--s2:#121F2E;
          --br:#1A3045;--fg:#C8E8F8;--mu:#3D6580;
          --ac:#38AECC;--org:#818CF8;
          --sh:0 8px 32px rgba(0,0,0,.38);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--fg);-webkit-font-smoothing:antialiased;transition:background .3s,color .3s}

        .pw{min-height:100dvh;padding-top:3.75rem;overflow-x:hidden}

        /* ── grid bg ── */
        .pw::before{
          content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
          background-image:
            linear-gradient(var(--br) 1px,transparent 1px),
            linear-gradient(90deg,var(--br) 1px,transparent 1px);
          background-size:48px 48px;opacity:.13;
        }

        /* ── hero ── */
        .ph{position:relative;z-index:1;text-align:center;padding:4.5rem 1.5rem 3rem;max-width:640px;margin:0 auto}
        .ph::before{
          content:'';position:absolute;width:700px;height:380px;
          background:radial-gradient(ellipse,color-mix(in srgb,var(--ac) 18%,transparent) 0%,transparent 68%);
          top:-60px;left:50%;transform:translateX(-50%);pointer-events:none;z-index:-1;
        }
        .ph-eye{display:inline-flex;align-items:center;gap:6px;font-size:.62rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--ac);background:color-mix(in srgb,var(--ac) 10%,transparent);border:1px solid color-mix(in srgb,var(--ac) 28%,transparent);padding:5px 14px;border-radius:20px;margin-bottom:1.4rem}
        .ph-h1{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(2.2rem,5vw,3.4rem);font-weight:400;line-height:1.1;letter-spacing:-.025em;color:var(--fg);margin-bottom:1rem}
        .ph-h1 em{font-style:italic;color:var(--ac)}
        .ph-sub{font-size:.9rem;color:var(--mu);line-height:1.75;margin-bottom:2rem;max-width:480px;margin-left:auto;margin-right:auto}
        .ph-badge{display:inline-flex;align-items:center;gap:8px;padding:9px 20px;border:1px solid var(--br);border-radius:30px;font-size:.77rem;font-weight:600;color:var(--fg);background:var(--su);box-shadow:0 2px 10px rgba(0,0,0,.06)}
        .ph-badge b{color:var(--ac)}

        /* ── tab switcher ── */
        .ptab-wrap{position:relative;z-index:1;display:flex;justify-content:center;margin-bottom:2.8rem}
        .ptab{display:inline-flex;align-items:center;background:var(--su);border:1.5px solid var(--br);border-radius:14px;padding:4px;gap:3px;box-shadow:0 2px 14px rgba(0,0,0,.07)}
        .ptab-btn{display:flex;align-items:center;gap:7px;padding:9px 22px;border:none;border-radius:10px;font-family:inherit;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s;color:var(--mu);background:none}
        .ptab-btn.on{background:var(--ac);color:#fff;box-shadow:0 2px 14px color-mix(in srgb,var(--ac) 38%,transparent)}
        .ptab-btn svg{width:13px;height:13px}

        /* ── cards grid ── */
        .pgrid{position:relative;z-index:1;display:grid;gap:18px;max-width:1140px;margin:0 auto;padding:0 20px 3rem}
        .pgrid--2{grid-template-columns:repeat(auto-fill,minmax(280px,1fr));max-width:700px}
        .pgrid--4{grid-template-columns:repeat(auto-fill,minmax(245px,1fr))}

        /* ── plan card ── */
        .pc{
          position:relative;background:var(--su);
          border:1.5px solid var(--br);border-radius:20px;
          padding:24px 22px 22px;
          display:flex;flex-direction:column;gap:0;
          overflow:hidden;
          transition:border-color .22s,box-shadow .22s,transform .22s;
          box-shadow:inset 0 3px 0 var(--pc);
        }
        .pc:hover{
          transform:translateY(-4px);
          box-shadow:inset 0 3px 0 var(--pc),0 14px 36px rgba(0,0,0,.13);
        }
        .pc--hi{
          border-color:color-mix(in srgb,var(--pc) 50%,var(--br))!important;
          background:color-mix(in srgb,var(--pc) 3%,var(--su))!important;
          box-shadow:
            inset 0 3px 0 var(--pc),
            0 0 0 3px color-mix(in srgb,var(--pc) 18%,transparent),
            0 14px 44px color-mix(in srgb,var(--pc) 16%,transparent)!important;
        }
        .pc--hi:hover{
          transform:translateY(-5px);
          box-shadow:
            inset 0 3px 0 var(--pc),
            0 0 0 3px color-mix(in srgb,var(--pc) 24%,transparent),
            0 22px 52px color-mix(in srgb,var(--pc) 22%,transparent)!important;
        }
        .pc-badge{
          position:absolute;top:0;left:50%;transform:translateX(-50%);
          font-size:.56rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;
          color:#fff;padding:4px 14px;border-radius:0 0 10px 10px;white-space:nowrap;
          box-shadow:0 3px 10px color-mix(in srgb,var(--pc) 38%,transparent);
        }
        .pc-top{display:flex;align-items:center;gap:11px;margin-top:10px;margin-bottom:18px}
        .pc-ic{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .18s}
        .pc:hover .pc-ic{transform:scale(1.1)}
        .pc-name{font-weight:800;font-size:.97rem;color:var(--fg)}
        .pc-tag{font-size:.68rem;color:var(--mu);margin-top:2px}

        .pc-price-wrap{display:flex;flex-direction:column;gap:2px;padding:16px 0;border-top:1px solid var(--br);border-bottom:1px solid var(--br);margin-bottom:16px}
        .pc-amt{font-family:'DM Serif Display',serif;font-size:2.5rem;font-weight:400;color:var(--fg);display:flex;align-items:baseline;gap:5px;line-height:1}
        .pc-cur{font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:700;color:var(--mu);margin-left:2px}
        .pc-per{font-size:.68rem;color:var(--mu);margin-top:5px}
        .pc-msgs{font-size:.71rem;font-weight:700;color:var(--pc);margin-top:7px;letter-spacing:.01em}

        .pc-feats{list-style:none;padding:0;display:flex;flex-direction:column;gap:9px;flex:1;margin-bottom:20px}
        .pc-feat{display:flex;align-items:center;gap:9px;font-size:.79rem;color:var(--fg);line-height:1.4}
        .pc-feat--off{color:var(--mu);opacity:.4}

        .pc-cta{
          display:flex;align-items:center;justify-content:center;gap:7px;
          padding:12px 16px;border-radius:12px;
          border:1.5px solid color-mix(in srgb,var(--pc) 38%,var(--br));
          font-size:.8rem;font-weight:700;text-decoration:none;
          color:var(--fg);background:color-mix(in srgb,var(--pc) 7%,transparent);
          transition:all .17s;width:100%;
        }
        .pc-cta:hover{
          border-color:var(--pc);
          background:color-mix(in srgb,var(--pc) 13%,transparent);
          color:var(--pc);transform:translateY(-1px);
        }
        .pc-cta--hi{color:#fff!important}
        .pc-cta--hi:hover{opacity:.9;color:#fff!important;transform:translateY(-1px)}

        /* ── payment strip ── */
        .ppay{position:relative;z-index:1;text-align:center;padding:0 1rem 3.5rem}
        .ppay-lbl{font-size:.63rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--mu);margin-bottom:12px}
        .ppay-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
        .ppay-chip{padding:6px 16px;background:var(--su);border:1.5px solid var(--br);border-radius:20px;font-size:.72rem;font-weight:600;color:var(--mu);transition:border-color .15s,color .15s}
        .ppay-chip:hover{border-color:var(--ac);color:var(--ac)}

        /* ── comparison table ── */
        .ptbl-wrap{position:relative;z-index:1;max-width:940px;margin:0 auto;padding:0 20px 4.5rem;overflow-x:auto}
        .ptbl-h{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.4rem,3vw,1.9rem);font-weight:400;text-align:center;margin-bottom:1.6rem;color:var(--fg)}
        .ptbl{width:100%;border-collapse:collapse;font-size:.79rem;min-width:480px}
        .ptbl th,.ptbl td{padding:11px 14px;border-bottom:1px solid var(--br);text-align:center}
        .ptbl th:first-child,.ptbl td:first-child{text-align:left;font-weight:600;color:var(--fg)}
        .ptbl thead th{background:var(--s2);color:var(--mu);font-size:.6rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
        .ptbl tbody tr:hover td{background:color-mix(in srgb,var(--s2) 55%,transparent)}
        .ptbl-yes{color:#34D399;font-weight:700;font-size:.9rem}
        .ptbl-no{color:var(--br);opacity:.7}
        /* org table: Pro = 4th col */
        .ptbl--org thead th:nth-child(4),.ptbl--org tbody td:nth-child(4){background:color-mix(in srgb,var(--ac) 7%,transparent)}
        .ptbl--org thead th:nth-child(4){color:var(--ac)!important;border-bottom:2px solid color-mix(in srgb,var(--ac) 30%,var(--br))}
        /* personal table: Plus = 3rd col */
        .ptbl--personal thead th:nth-child(3),.ptbl--personal tbody td:nth-child(3){background:color-mix(in srgb,var(--ac) 7%,transparent)}
        .ptbl--personal thead th:nth-child(3){color:var(--ac)!important;border-bottom:2px solid color-mix(in srgb,var(--ac) 30%,var(--br))}

        /* ── faq ── */
        .pfaq{position:relative;z-index:1;max-width:680px;margin:0 auto;padding:0 20px 5rem}
        .pfaq-h{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.4rem,3vw,1.9rem);font-weight:400;text-align:center;margin-bottom:1.8rem;color:var(--fg)}
        .pfaq-card{background:var(--su);border:1.5px solid var(--br);border-radius:18px;padding:0 22px;overflow:hidden}
        .pfaq-item{border-bottom:1px solid var(--br)}
        .pfaq-item:last-child{border-bottom:none}
        .pfaq-item-btn{width:100%;background:none;border:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:16px 0;color:var(--fg);font-family:inherit;font-size:.86rem;font-weight:600;text-align:left;gap:12px;transition:color .15s}
        .pfaq-item-btn:hover{color:var(--ac)}
        .pfaq-item-ans{overflow:hidden;transition:max-height .28s ease}
        .pfaq-item-ans p{margin:0 0 16px;font-size:.81rem;color:var(--mu);line-height:1.75}

        /* ── bottom cta ── */
        .pcta-band{
          position:relative;z-index:1;overflow:hidden;
          padding:5rem 1.5rem;text-align:center;
          background:linear-gradient(160deg,color-mix(in srgb,var(--ac) 8%,var(--su)) 0%,var(--su) 55%,color-mix(in srgb,var(--org) 6%,var(--su)) 100%);
          border-top:1px solid var(--br);
        }
        .pcta-band::before{
          content:'';position:absolute;width:560px;height:560px;border-radius:50%;
          background:radial-gradient(circle,color-mix(in srgb,var(--ac) 12%,transparent),transparent 68%);
          top:-160px;left:50%;transform:translateX(-50%);pointer-events:none;
        }
        .pcta-band-h{position:relative;font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.5rem,3vw,2.1rem);font-weight:400;margin-bottom:.65rem;color:var(--fg)}
        .pcta-band-sub{position:relative;color:var(--mu);font-size:.84rem;margin-bottom:1.8rem;line-height:1.65}
        .pcta-band-btns{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}
        .pcta-band-btn{display:inline-flex;align-items:center;gap:7px;padding:12px 28px;border-radius:12px;font-weight:700;font-size:.85rem;text-decoration:none;transition:all .15s}
        .pcta-band-btn--ac{background:var(--ac);color:#fff;box-shadow:0 4px 20px color-mix(in srgb,var(--ac) 38%,transparent)}
        .pcta-band-btn--ac:hover{opacity:.87;transform:translateY(-1px)}
        .pcta-band-btn--ghost{background:none;border:1.5px solid var(--br);color:var(--fg)}
        .pcta-band-btn--ghost:hover{border-color:var(--ac);color:var(--ac)}

        /* ── section divider ── */
        .pdiv{position:relative;z-index:1;text-align:center;padding:0 20px 2rem}
        .pdiv-line{height:1px;background:linear-gradient(90deg,transparent,var(--br),transparent);max-width:600px;margin:0 auto}

        /* ── responsive ── */
        @media(max-width:640px){
          .ptab-btn{padding:8px 14px;font-size:.75rem}
          .pgrid--4{grid-template-columns:1fr}
          .pgrid--2{grid-template-columns:1fr;max-width:100%}
        }
      `}</style>

      <div className={`pw`}>
        <Navbar isDarkMode={isDark} onThemeToggle={toggleTheme}/>

        {/* ── Hero ── */}
        <section className="ph">
          <div className="ph-eye"><Zap size={10}/> Pricing</div>
          <h1 className="ph-h1">
            Simple, <em>transparent</em><br/>pricing for everyone
          </h1>
          <p className="ph-sub">
            From a personal project to a full business — pick the right plan and scale with confidence.
          </p>
          <div className="ph-badge">
            <Zap size={12}/>
            <b>Free messages</b> on every new account — no card required
          </div>
        </section>

        {/* ── Tab switcher ── */}
        <div className="ptab-wrap">
          <div className="ptab">
            <button className={`ptab-btn${tab==="personal"?" on":""}`} onClick={() => setTab("personal")}>
              <User size={13}/> Personal
            </button>
            <button className={`ptab-btn${tab==="org"?" on":""}`} onClick={() => setTab("org")}>
              <Building2 size={13}/> Organisation
            </button>
          </div>
        </div>

        {/* ── Plan cards ── */}
        <div className={`pgrid ${tab==="personal" ? "pgrid--2" : "pgrid--4"}`}>
          {plans.map(plan => <PlanCard key={plan.id} plan={plan as any}/>)}
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
          <div className="ptbl-h">Full Comparison</div>
          {tab === "personal" ? (
            <table className="ptbl ptbl--personal">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Personal Free</th>
                  <th>Personal Plus</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Messages / month",       "200",        "1,500"],
                  ["Personal AI agent",      "✓",          "✓"],
                  ["Dashboard chat",         "✓",          "✓"],
                  ["Conversation history",   "7 days",     "Full"],
                  ["REST API access",        "—",          "✓"],
                  ["Embed widget",           "—",          "—"],
                  ["Analytics",              "—",          "Basic"],
                  ["Support",                "Docs",       "Email"],
                ].map(([feat,...vals]) => (
                  <tr key={feat}>
                    <td>{feat}</td>
                    {vals.map((v,i) => <td key={i} className={v==="✓"?"ptbl-yes":v==="—"?"ptbl-no":""}>{v}</td>)}
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
                  ["Messages / month",       "500",    "2,000",    "8,000",      "25,000"],
                  ["REST API",               "✓",      "✓",        "✓",          "✓"],
                  ["Embed widget",           "✓",      "✓",        "✓",          "✓"],
                  ["React / JS SDK",         "✓",      "✓",        "✓",          "✓"],
                  ["Session history",        "7 days", "Full",     "Full",       "Full"],
                  ["Analytics dashboard",    "—",      "Basic",    "Full",       "Advanced"],
                  ["Feedback tracking",      "—",      "✓",        "✓",          "✓"],
                  ["Support",                "Docs",   "Email",    "Priority",   "Dedicated"],
                  ["SLA guarantee",          "—",      "—",        "—",          "✓"],
                ].map(([feat,...vals]) => (
                  <tr key={feat}>
                    <td>{feat}</td>
                    {vals.map((v,i) => <td key={i} className={v==="✓"?"ptbl-yes":v==="—"?"ptbl-no":""}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pdiv"><div className="pdiv-line"/></div>

        {/* ── FAQ ── */}
        <div className="pfaq">
          <div className="pfaq-h">Frequently asked questions</div>
          <div className="pfaq-card">
            {FAQS.map(f => <FaqItem key={f.q} {...f}/>)}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="pcta-band">
          <div className="pcta-band-h">Ready to put your AI agent to work?</div>
          <p className="pcta-band-sub">Start free — no credit card. Upgrade any time from your dashboard.</p>
          <div className="pcta-band-btns">
            <Link href="/auth/signin" className="pcta-band-btn pcta-band-btn--ac">
              Get Started Free <ArrowRight size={13}/>
            </Link>
            <Link href="/docs" className="pcta-band-btn pcta-band-btn--ghost">
              Read the Docs
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}