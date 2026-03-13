"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Building2, Check, ChevronRight, ArrowRight,
  Brain, Share2, MessageSquare, Sparkles,
  Globe, Headphones, Code2, BarChart3, Moon, Sun,
} from "lucide-react";

export const dynamic = "force-dynamic";

type AccountType = "personal" | "organization" | null;

const PERSONAL_DOMAINS = new Set([
  "gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com",
  "live.com","msn.com","aol.com","protonmail.com","me.com",
  "ymail.com","googlemail.com","mail.com","inbox.com",
]);

function isPersonalEmail(email?: string | null): boolean {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && PERSONAL_DOMAINS.has(domain);
}

const personalFeatures = [
  { Icon: Brain,        text: "Train AI with your personality & knowledge"     },
  { Icon: Share2,       text: "Share your virtual self with a public link"      },
  { Icon: MessageSquare,text: "Chat with other people's virtual selves"         },
  { Icon: Sparkles,     text: "Generate AI-powered resume & bio"                },
];

const orgFeatures = [
  { Icon: Brain,        text: "Create a company AI agent trained on your data"  },
  { Icon: Headphones,   text: "24/7 Q&A agent for your customers"               },
  { Icon: Globe,        text: "Embed agent anywhere via our API"                 },
  { Icon: Code2,        text: "Simple REST API — integrate in minutes"          },
  { Icon: BarChart3,    text: "Analytics on every conversation"                  },
  { Icon: MessageSquare,text: "Custom agent persona & tone of voice"            },
];

const industries = [
  "E-commerce","Healthcare","Education","Finance","Technology",
  "Hospitality","Real Estate","Retail","Food & Beverage","Other",
];

export default function OnboardingPage() {
  const router      = useRouter();
  const sessionResult = useSession();

  const [step,             setStep]             = useState<1 | 2>(1);
  const [selectedType,     setSelectedType]     = useState<AccountType>(null);
  const [orgName,          setOrgName]          = useState("");
  const [orgEmail,         setOrgEmail]         = useState("");
  const [orgWebsite,       setOrgWebsite]       = useState("");
  const [orgIndustry,      setOrgIndustry]      = useState("");
  const [orgDescription,   setOrgDescription]   = useState("");
  const [agentName,        setAgentName]        = useState("");
  const [agentPersonality, setAgentPersonality] = useState("");
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState("");
  const [isDark,           setIsDark]           = useState(true);
  const [mounted,          setMounted]          = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") || "dark";
      const dark   = stored === "dark";
      setIsDark(dark);
      document.documentElement.setAttribute("data-mode", dark ? "dark" : "light");
    } catch {}
  }, []);

  if (!sessionResult) return <Spinner isDark={isDark} />;
  const { data: session, update, status } = sessionResult;

  // Restore account-type choice stored before Google OAuth redirect
  useEffect(() => {
    if (status !== "authenticated") return;
    try {
      const saved = localStorage.getItem("ob_account_type") as AccountType;
      if (saved === "personal" || saved === "organization") {
        localStorage.removeItem("ob_account_type");
        // Block personal emails for org accounts
        if (saved === "organization" && isPersonalEmail(session?.user?.email)) {
          setSelectedType("organization");
          setError("That email is a personal address. Organisation accounts require a work/business email — click \"Continue with work email\" below to sign in with your company Google account.");
          return;
        }
        setSelectedType(saved);
        if (saved === "organization") setStep(2);
        // Personal: auto-proceed after sign-in redirect
        if (saved === "personal") {
          setTimeout(() => {
            setLoading(true);
            fetch("/api/user/onboarding", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accountType: "personal" }),
            })
              .then(r => r.json())
              .then(d => {
                if (d.ok) router.push("/Dashboard");
                else setError(d.error || "Something went wrong.");
              })
              .catch(() => setError("Something went wrong. Please try again."))
              .finally(() => setLoading(false));
          }, 0);
        }
      }
    } catch {}
  }, [status, session?.user?.email]);  // eslint-disable-line

  // Only redirect away if the user has already completed onboarding
  useEffect(() => {
    if (status !== "authenticated") return;
    // ?create=org OR pending localStorage type: skip redirect so user can set up an org
    const searchParams = new URLSearchParams(window.location.search);
    const pendingType = (() => { try { return localStorage.getItem("ob_account_type"); } catch { return null; } })();
    if (searchParams.get("create") === "org" || pendingType === "organization") {
      setSelectedType("organization");
      setStep(2);
      return;
    }
    fetch("/api/user/onboarding")
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.user?.onboardingComplete) {
          // For org accounts, only redirect if they actually have an org — otherwise stay on
          // onboarding so they can create one (prevents infinite loop with /Dashboard/organizations)
          if (d.user.accountType === "organization" && !d.user.hasOrganization) return;
          router.push(
            d.user.accountType === "organization"
              ? "/Dashboard/organizations"
              : "/Dashboard"
          );
        }
      })
      .catch(() => {});
  }, [status, router]);

  if (status === "loading") return <Spinner isDark={isDark} />;

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-mode", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleContinue = async () => {
    setError("");

    // Step 1 → Step 2 for org
    if (step === 1) {
      if (!selectedType) { setError("Please choose an account type."); return; }

      if (selectedType === "personal") {
        if (status !== "authenticated") {
          // Not signed in — personal accounts continue to dashboard after login
          router.push("/auth/signin?callbackUrl=/Dashboard");
          return;
        }
        await submit();
        return;
      }

      // Organization — must create/sign-in to an org account first
      if (selectedType === "organization") {
        if (status !== "authenticated") {
          router.push("/auth/org/signup");
          return;
        }
        setStep(2);
        return;
      }
    }

    // Step 2 (org details)
    if (!orgName.trim())  { setError("Organisation name is required."); return; }
    if (!orgEmail.trim()) { setError("Contact email is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgEmail)) { setError("Please enter a valid email address."); return; }
    if (isPersonalEmail(orgEmail)) { setError("Please use a work/business email address for the contact email (e.g. name@yourcompany.com)."); return; }
    if (!agentName.trim()){ setError("Agent name is required."); return; }
    await submit();
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType:        selectedType,
          organizationName:   selectedType === "organization" ? orgName          : undefined,
          contactEmail:       selectedType === "organization" ? orgEmail          : undefined,
          website:            selectedType === "organization" ? orgWebsite        : undefined,
          industry:           selectedType === "organization" ? orgIndustry       : undefined,
          description:        selectedType === "organization" ? orgDescription    : undefined,
          agentName:          selectedType === "organization" ? agentName         : undefined,
          agentPersonality:   selectedType === "organization" ? agentPersonality  : undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        await update();
        router.push(selectedType === "organization" ? "/Dashboard/organizations" : "/Dashboard");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStep2Valid = orgName.trim() && orgEmail.trim() && agentName.trim();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root,[data-mode="light"]{
          --c-bg:#EFF7FF; --c-surface:#FFFFFF; --c-surface-2:#E2F0FC;
          --c-border:#C5DCF2; --c-text:#0B1E2E; --c-muted:#6B90AE;
          --c-accent:#29A9D4; --c-accent-dim:#1D8BB2; --c-accent-soft:#DDF1FA;
          --c-success:#10B981; --c-success-soft:#ECFDF5;
          --c-danger:#EF4444; --c-danger-soft:#FEE2E2;
          --c-org:#6366F1; --c-org-soft:rgba(99,102,241,.1);
          --c-orb1:rgba(41,169,212,.2); --c-orb2:rgba(99,102,241,.12);
          --c-grid:rgba(41,169,212,.055);
          --shadow-lg:0 24px 64px rgba(10,40,80,.14);
        }
        [data-mode="dark"]{
          --c-bg:#081420; --c-surface:#0F1E2D; --c-surface-2:#162435;
          --c-border:#1A3045; --c-text:#C8E8F8; --c-muted:#3D6580;
          --c-accent:#38AECC; --c-accent-dim:#2690AB; --c-accent-soft:#0C2535;
          --c-success:#34D399; --c-success-soft:#063320;
          --c-danger:#F87171; --c-danger-soft:#3B1212;
          --c-org:#818CF8; --c-org-soft:rgba(129,140,248,.1);
          --c-orb1:rgba(56,174,204,.16); --c-orb2:rgba(129,140,248,.1);
          --c-grid:rgba(56,174,204,.048);
          --shadow-lg:0 24px 64px rgba(0,0,0,.52);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--c-bg);color:var(--c-text);transition:background .3s,color .3s}

        .ob-page{min-height:100dvh;display:flex;flex-direction:column;background:var(--c-bg);position:relative;overflow:hidden;transition:background .3s}

        /* bg */
        .ob-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
        .ob-orb{position:absolute;border-radius:50%;filter:blur(90px)}
        .ob-orb-1{width:500px;height:500px;background:radial-gradient(circle,var(--c-orb1),transparent 70%);top:-120px;left:-80px}
        .ob-orb-2{width:480px;height:480px;background:radial-gradient(circle,var(--c-orb2),transparent 70%);bottom:-100px;right:-80px}
        .ob-grid{
          position:absolute;inset:0;
          background-image:linear-gradient(var(--c-grid) 1px,transparent 1px),linear-gradient(90deg,var(--c-grid) 1px,transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 85% 75% at 50% 50%,black 30%,transparent 100%);
        }

        /* navbar */
        .ob-nav{
          position:relative;z-index:10;flex-shrink:0;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 20px;height:56px;
          background:color-mix(in srgb,var(--c-surface) 80%,transparent);
          border-bottom:1px solid var(--c-border);backdrop-filter:blur(12px);
          transition:background .3s,border-color .3s;
        }
        .ob-brand{display:flex;align-items:center;gap:9px;text-decoration:none}
        .ob-logo{width:30px;height:30px;border-radius:8px;overflow:hidden;border:1.5px solid var(--c-border);background:var(--c-accent-soft)}
        .ob-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .ob-brand-name{font-family:'DM Serif Display',serif;font-size:.9rem;font-weight:600;color:var(--c-text)}
        .ob-theme-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);cursor:pointer;transition:all .14s}
        .ob-theme-btn:hover{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-accent-soft)}
        .ob-theme-btn svg{width:14px;height:14px}

        /* main */
        .ob-main{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:28px 16px 48px;position:relative;z-index:1;overflow-y:auto}
        .ob-inner{width:100%;max-width:680px;display:flex;flex-direction:column;gap:0}

        /* progress */
        .ob-progress{display:flex;align-items:center;gap:8px;margin-bottom:24px}
        .ob-step{display:flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;color:var(--c-muted)}
        .ob-step--on{color:var(--c-accent)}
        .ob-step-num{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--c-border);display:flex;align-items:center;justify-content:center;font-size:.65rem;transition:all .2s}
        .ob-step--on .ob-step-num{border-color:var(--c-accent);background:var(--c-accent);color:#fff}
        .ob-step--done .ob-step-num{border-color:var(--c-success);background:var(--c-success);color:#fff}
        .ob-step--done{color:var(--c-success)}
        .ob-step-line{flex:1;height:1px;background:var(--c-border)}

        /* card */
        .ob-card{
          background:color-mix(in srgb,var(--c-surface) 92%,transparent);
          border:1px solid var(--c-border);border-radius:22px;
          padding:32px 28px 28px;
          box-shadow:var(--shadow-lg);backdrop-filter:blur(18px);
          position:relative;overflow:hidden;
        }
        .ob-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,var(--c-accent),var(--c-org));
          background-size:200% 100%;animation:obshimmer 3.5s linear infinite;
        }
        @keyframes obshimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        /* heading */
        .ob-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.5rem,4vw,1.9rem);font-weight:400;letter-spacing:-.022em;color:var(--c-text);margin-bottom:6px}
        .ob-title em{font-style:italic;color:var(--c-accent)}
        .ob-sub{font-size:.82rem;color:var(--c-muted);line-height:1.6;margin-bottom:28px}

        /* account type cards */
        .ob-types{display:grid;gap:14px;grid-template-columns:1fr 1fr;margin-bottom:24px}
        @media(max-width:520px){.ob-types{grid-template-columns:1fr}}

        .ob-type{
          border:2px solid var(--c-border);border-radius:16px;padding:20px;
          cursor:pointer;transition:all .17s;background:var(--c-surface-2);
          display:flex;flex-direction:column;gap:14px;
          position:relative;overflow:hidden;
        }
        .ob-type:hover{border-color:var(--c-accent);background:var(--c-accent-soft)}
        .ob-type--personal.ob-type--on{border-color:var(--c-accent);background:var(--c-accent-soft);box-shadow:0 0 0 4px color-mix(in srgb,var(--c-accent) 12%,transparent)}
        .ob-type--org.ob-type--on{border-color:var(--c-org);background:var(--c-org-soft);box-shadow:0 0 0 4px color-mix(in srgb,var(--c-org) 12%,transparent)}
        .ob-type--org:hover{border-color:var(--c-org);background:var(--c-org-soft)}

        .ob-type-ic{
          width:44px;height:44px;border-radius:13px;
          display:flex;align-items:center;justify-content:center;
          background:var(--c-surface);border:1px solid var(--c-border);
        }
        .ob-type--personal .ob-type-ic{background:var(--c-accent-soft);border-color:color-mix(in srgb,var(--c-accent) 25%,transparent)}
        .ob-type--org     .ob-type-ic{background:var(--c-org-soft);border-color:color-mix(in srgb,var(--c-org) 25%,transparent)}
        .ob-type--personal .ob-type-ic svg{color:var(--c-accent)}
        .ob-type--org     .ob-type-ic svg{color:var(--c-org)}
        .ob-type-ic svg{width:20px;height:20px}

        .ob-type-title{font-family:'DM Serif Display',serif;font-size:1rem;font-weight:400;color:var(--c-text)}
        .ob-type-sub{font-size:.72rem;color:var(--c-muted);line-height:1.5;margin-top:2px}

        .ob-type-features{display:flex;flex-direction:column;gap:6px}
        .ob-type-feat{display:flex;align-items:flex-start;gap:7px;font-size:.74rem;color:var(--c-muted);line-height:1.4}
        .ob-type-feat svg{width:12px;height:12px;flex-shrink:0;margin-top:2px}
        .ob-type--personal .ob-type-feat svg{color:var(--c-accent)}
        .ob-type--org     .ob-type-feat svg{color:var(--c-org)}

        .ob-type-badge{
          position:absolute;top:12px;right:12px;
          width:20px;height:20px;border-radius:50%;
          border:2px solid var(--c-surface);
          display:flex;align-items:center;justify-content:center;
          transition:all .15s;
        }
        .ob-type--personal .ob-type-badge{background:var(--c-accent);opacity:0}
        .ob-type--org     .ob-type-badge{background:var(--c-org);opacity:0}
        .ob-type--on .ob-type-badge{opacity:1}
        .ob-type-badge svg{width:10px;height:10px;color:#fff}

        /* org details form */
        .ob-form{display:flex;flex-direction:column;gap:16px}
        .ob-form-grid{display:grid;gap:14px;grid-template-columns:1fr 1fr}
        @media(max-width:500px){.ob-form-grid{grid-template-columns:1fr}}

        .ob-field label{display:block;font-size:.66rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);margin-bottom:6px}
        .ob-field label span{color:var(--c-danger);margin-left:2px}
        .ob-input,.ob-select,.ob-textarea{
          width:100%;padding:10px 12px;border-radius:11px;
          border:1.5px solid var(--c-border);background:var(--c-surface-2);
          color:var(--c-text);font-size:.84rem;font-family:inherit;outline:none;
          transition:border-color .14s,background .14s;
        }
        .ob-input:focus,.ob-select:focus,.ob-textarea:focus{border-color:var(--c-accent);background:var(--c-surface)}
        .ob-input::placeholder,.ob-textarea::placeholder{color:var(--c-muted);opacity:.7}
        .ob-select{cursor:pointer}
        .ob-textarea{resize:vertical;min-height:80px;line-height:1.5}

        /* agent section */
        .ob-agent-head{
          display:flex;align-items:center;gap:9px;
          padding:12px 14px;border-radius:12px;
          background:color-mix(in srgb,var(--c-org) 8%,transparent);
          border:1px solid color-mix(in srgb,var(--c-org) 20%,transparent);
          margin-bottom:14px;
        }
        .ob-agent-ic{width:30px;height:30px;border-radius:8px;background:var(--c-org-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .ob-agent-ic svg{width:13px;height:13px;color:var(--c-org)}
        .ob-agent-title{font-size:.82rem;font-weight:700;color:var(--c-text)}
        .ob-agent-sub{font-size:.7rem;color:var(--c-muted);margin-top:1px}

        /* api preview */
        .ob-api-preview{
          background:color-mix(in srgb,var(--c-surface-2) 80%,transparent);
          border:1px solid var(--c-border);border-radius:12px;
          padding:14px 16px;margin-top:4px;
        }
        .ob-api-label{font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-muted);margin-bottom:8px}
        .ob-api-code{
          font-family:ui-monospace,'Cascadia Code',monospace;font-size:.72rem;
          color:var(--c-accent);line-height:1.7;
          white-space:pre-wrap;word-break:break-all;
        }
        .ob-api-code .ob-c-key{color:var(--c-org)}
        .ob-api-code .ob-c-str{color:var(--c-success)}
        .ob-api-code .ob-c-muted{color:var(--c-muted)}

        /* error */
        .ob-error{display:flex;align-items:center;gap:8px;padding:10px 13px;border-radius:10px;background:var(--c-danger-soft);border:1px solid color-mix(in srgb,var(--c-danger) 28%,transparent);color:var(--c-danger);font-size:.78rem;font-weight:500}

        /* actions */
        .ob-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:24px;flex-wrap:wrap}
        .ob-skip{background:none;border:none;cursor:pointer;font-size:.78rem;color:var(--c-muted);font-family:inherit;transition:color .13s;padding:4px}
        .ob-skip:hover{color:var(--c-text)}
        .ob-back{display:flex;align-items:center;gap:6px;background:none;border:1px solid var(--c-border);border-radius:10px;padding:9px 16px;font-size:.82rem;font-weight:600;color:var(--c-muted);cursor:pointer;font-family:inherit;transition:all .14s}
        .ob-back:hover{border-color:var(--c-accent);color:var(--c-accent)}
        .ob-continue{
          display:flex;align-items:center;gap:7px;
          padding:11px 24px;border-radius:12px;
          background:var(--c-accent);color:#fff;border:none;
          font-size:.88rem;font-weight:700;font-family:inherit;
          cursor:pointer;transition:all .16s;
        }
        .ob-continue:hover:not(:disabled){background:var(--c-accent-dim);transform:translateY(-1px);box-shadow:0 6px 20px color-mix(in srgb,var(--c-accent) 30%,transparent)}
        .ob-continue:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .ob-continue svg{width:15px;height:15px}
        .ob-spinner{width:15px;height:15px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:obspin .75s linear infinite}
        @keyframes obspin{to{transform:rotate(360deg)}}

        /* footer */
        .ob-foot{position:relative;z-index:1;text-align:center;padding:10px 20px 18px;font-size:.7rem;color:var(--c-muted);flex-shrink:0}
      `}</style>

      <div className="ob-page">
        <div className="ob-bg">
          <div className="ob-orb ob-orb-1"/>
          <div className="ob-orb ob-orb-2"/>
          <div className="ob-grid"/>
        </div>

        {/* Navbar */}
        <nav className="ob-nav">
          <div className="ob-brand">
            <div className="ob-logo"><img src="/logo.png" alt="Velamini"/></div>
            <span className="ob-brand-name">Velamini</span>
          </div>
          {mounted && (
            <button className="ob-theme-btn" onClick={toggleTheme}>
              {isDark ? <Sun size={14}/> : <Moon size={14}/>}
            </button>
          )}
        </nav>

        <main className="ob-main">
          <div className="ob-inner">

            {/* Progress (only show for org since personal is 1 step) */}
            {selectedType === "organization" && (
              <div className="ob-progress">
                <div className={`ob-step ${step >= 1 ? (step > 1 ? "ob-step--done" : "ob-step--on") : ""}`}>
                  <div className="ob-step-num">{step > 1 ? <Check size={10}/> : "1"}</div>
                  Account type
                </div>
                <div className="ob-step-line"/>
                <div className={`ob-step ${step >= 2 ? "ob-step--on" : ""}`}>
                  <div className="ob-step-num">2</div>
                  Organisation setup
                </div>
              </div>
            )}

            <motion.div className="ob-card"
              key={step}
              initial={{ opacity:0, y:16, scale:.98 }}
              animate={{ opacity:1, y:0, scale:1 }}
              transition={{ type:"spring", stiffness:260, damping:24 }}>

              <AnimatePresence mode="wait">

                {/* ── Step 1: Choose account type ── */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                    <h1 className="ob-title">Welcome to <em>Velamini</em></h1>
                    <p className="ob-sub">Choose how you'd like to use Velamini. You can always change this later.</p>

                    <div className="ob-types">
                      {/* Personal */}
                      <div
                        className={`ob-type ob-type--personal ${selectedType==="personal"?"ob-type--on":""}`}
                        onClick={()=>setSelectedType("personal")}>
                        <div className="ob-type-badge"><Check size={10}/></div>
                        <div className="ob-type-ic"><User size={20}/></div>
                        <div>
                          <div className="ob-type-title">Personal</div>
                          <div className="ob-type-sub">Build your virtual self & digital twin</div>
                        </div>
                        <div className="ob-type-features">
                          {personalFeatures.map(({Icon, text}) => (
                            <div key={text} className="ob-type-feat">
                              <Check size={12}/> {text}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Organisation */}
                      <div
                        className={`ob-type ob-type--org ${selectedType==="organization"?"ob-type--on":""}`}
                        onClick={()=>setSelectedType("organization")}>
                        <div className="ob-type-badge"><Check size={10}/></div>
                        <div className="ob-type-ic"><Building2 size={20}/></div>
                        <div>
                          <div className="ob-type-title">Organisation</div>
                          <div className="ob-type-sub">Create an AI agent for your business</div>
                          <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:4,padding:"2px 7px",borderRadius:6,background:"var(--c-org-soft)",border:"1px solid color-mix(in srgb,var(--c-org) 25%,transparent)",fontSize:".62rem",fontWeight:700,color:"var(--c-org)",letterSpacing:".04em"}}>Work email required</div>
                        </div>
                        <div className="ob-type-features">
                          {orgFeatures.slice(0,4).map(({Icon, text}) => (
                            <div key={text} className="ob-type-feat">
                              <Check size={12}/> {text}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {error && <div className="ob-error" style={{marginBottom:14}}>{error}</div>}

                    <div className="ob-actions">
                      {status === "authenticated" ? (
                        <>
                          <button className="ob-skip" onClick={()=>router.push("/Dashboard")}>
                            Skip for now
                          </button>
                          <button className="ob-continue" disabled={!selectedType || loading} onClick={handleContinue}>
                            {loading ? <div className="ob-spinner"/> : null}
                            {selectedType==="organization" ? <>Next <ChevronRight size={15}/></> : <>Get started <ArrowRight size={15}/></>}
                          </button>
                        </>
                      ) : (
                        <button
                          className="ob-continue"
                          disabled={!selectedType}
                          onClick={() => {
                            if (selectedType === "organization") {
                              router.push("/auth/org/login");
                            } else {
                              router.push("/auth/signin?callbackUrl=/Dashboard");
                            }
                          }}
                        >
                          {selectedType === "organization" ? <>Continue <ArrowRight size={15}/></> : <>Get started <ArrowRight size={15}/></>}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Organisation details ── */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                    <h1 className="ob-title">Set up your <em>organisation</em></h1>
                    <p className="ob-sub">Tell us about your company and configure your AI agent that will answer questions for your customers.</p>

                    <div className="ob-form">
                      {/* Company info */}
                      <div className="ob-form-grid">
                        <div className="ob-field">
                          <label>Organisation name <span>*</span></label>
                          <input className="ob-input" placeholder="Acme Corp" value={orgName} onChange={e=>setOrgName(e.target.value)}/>
                        </div>
                        <div className="ob-field">
                          <label>Website</label>
                          <input className="ob-input" placeholder="https://acme.com" value={orgWebsite} onChange={e=>setOrgWebsite(e.target.value)}/>
                        </div>
                      </div>

                      <div className="ob-field">
                        <label>Contact / billing email <span>*</span></label>
                        <input className="ob-input" type="email" placeholder="you@yourcompany.com" value={orgEmail} onChange={e=>setOrgEmail(e.target.value)}/>
                      </div>

                      <div className="ob-form-grid">
                        <div className="ob-field">
                          <label>Industry</label>
                          <select className="ob-select" value={orgIndustry} onChange={e=>setOrgIndustry(e.target.value)}>
                            <option value="">Select industry…</option>
                            {industries.map(i => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div className="ob-field">
                          <label>Agent name <span>*</span></label>
                          <input className="ob-input" placeholder="e.g. Aria, Max, Support Bot" value={agentName} onChange={e=>setAgentName(e.target.value)}/>
                        </div>
                      </div>

                      <div className="ob-field">
                        <label>Company description</label>
                        <textarea className="ob-textarea" placeholder="Briefly describe what your company does — this trains your agent's knowledge base." value={orgDescription} onChange={e=>setOrgDescription(e.target.value)}/>
                      </div>

                      <div className="ob-field">
                        <label>Agent personality / tone</label>
                        <textarea className="ob-textarea" style={{minHeight:64}} placeholder="e.g. Friendly, professional, concise. Always greet users by name if known." value={agentPersonality} onChange={e=>setAgentPersonality(e.target.value)}/>
                      </div>

                      {/* Agent section */}
                      <div>
                        <div className="ob-agent-head">
                          <div className="ob-agent-ic"><Brain size={13}/></div>
                          <div>
                            <div className="ob-agent-title">How your agent works</div>
                            <div className="ob-agent-sub">After setup, train your agent with Q&A pairs, documents, and FAQs. Then embed it anywhere via our API.</div>
                          </div>
                        </div>

                        <div className="ob-api-preview">
                          <div className="ob-api-label">API integration preview</div>
                          <div className="ob-api-code">
                            <span className="ob-c-muted">// Ask your agent anything</span>{"\n"}
                            <span className="ob-c-key">fetch</span>(<span className="ob-c-str">"/api/agent/chat"</span>, {"{"}{"\n"}
                            {"  "}<span className="ob-c-key">method</span>: <span className="ob-c-str">"POST"</span>,{"\n"}
                            {"  "}<span className="ob-c-key">headers</span>: {"{"} <span className="ob-c-str">"X-Agent-Key"</span>: <span className="ob-c-str">"your_key"</span> {"}"},  {"\n"}
                            {"  "}<span className="ob-c-key">body</span>: <span className="ob-c-key">JSON.stringify</span>({"{"} <span className="ob-c-key">message</span>: <span className="ob-c-str">"What are your opening hours?"</span> {"}"}){"\n"}
                            {"}"})
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && <div className="ob-error" style={{marginTop:14}}>{error}</div>}

                    <div className="ob-actions">
                      <button className="ob-back" onClick={()=>{ setStep(1); setError(""); }}>
                        ← Back
                      </button>
                      <button className="ob-continue" disabled={!isStep2Valid || loading} onClick={handleContinue}>
                        {loading ? <><div className="ob-spinner"/> Setting up…</> : <>Create organisation <ArrowRight size={15}/></>}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </div>
        </main>

        <footer className="ob-foot">
          You can change all of this later in your settings &nbsp;·&nbsp;
          <a href="/terms" style={{color:"var(--c-muted)",textDecoration:"none"}}>Terms</a>
          &nbsp;·&nbsp;
          <a href="/privacy" style={{color:"var(--c-muted)",textDecoration:"none"}}>Privacy</a>
        </footer>
      </div>
    </>
  );
}

function Spinner({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", background: isDark ? "#081420" : "#EFF7FF" }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #1A3045", borderTopColor:"#29A9D4", animation:"obspin .8s linear infinite" }}/>
      <style>{`@keyframes obspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
