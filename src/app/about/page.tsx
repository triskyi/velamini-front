"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar, { applyTheme } from "@/components/Navbar";
import Footer from "@/components/footer";
import { ArrowRight, Zap, Globe, Users, Shield, Sparkles, TrendingUp, Heart, MapPin, Target, Eye } from "lucide-react";

/* ── Animated number counter ─────────────────────────────────────── */
function AnimNum({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 18);
    return () => clearInterval(timer);
  }, [target]);
  return <>{val.toLocaleString()}{suffix}</>;
}



const VALUES = [
  {
    Icon: Globe,
    color: "#38AECC",
    title: "Africa First",
    body: "Every decision is made with the African market in mind. Local payments, local languages, local pricing. We build for where we live.",
  },
  {
    Icon: Shield,
    color: "#818CF8",
    title: "Trust by Default",
    body: "Your data stays yours. We never train on your conversations, never sell your information, and never compromise on security.",
  },
  {
    Icon: Sparkles,
    color: "#34D399",
    title: "Radical Simplicity",
    body: "AI is complex. Using it shouldn't be. We obsess over removing every unnecessary step between a business owner and their AI agent.",
  },
  {
    Icon: Heart,
    color: "#EC4899",
    title: "Customer Obsession",
    body: "Our success is measured by whether our customers' businesses grow. Every feature, every improvement starts with that question.",
  },
];

const MILESTONES = [
  { year: "2026", event: "Velamini founded in Kigali by two engineers tired of seeing African businesses miss customer messages overnight." },
  { year: "January 2026", event: "First 50 organisations onboarded. First MTN MoMo integration live. First agent deployed for a Kigali restaurant." },
  { year: "February 2026", event: "Personal accounts launched. Resume builder and AI assistant features ship to 500+ individual users." },
  { year: "March 2026", event: "Data Insights feature launched. Organisations can upload sales data and get AI-powered business analysis." },
];

export default function AboutPage() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Geist+Mono:wght@400;500&display=swap');

        :root,[data-mode="light"]{
          --bg:#E8F4FD;--bg2:#D8ECF9;--su:#FFFFFF;--su2:#F0F8FF;
          --br:#BDD9F0;--br2:#D6ECFA;--fg:#091828;--fg2:#1C3A52;
          --mu:#527A96;--ac:#29A9D4;--org:#6366F1;
        }
        [data-mode="dark"]{
          --bg:#060E18;--bg2:#08111E;--su:#0C1A28;--su2:#0F2030;
          --br:#132234;--br2:#1A3045;--fg:#D4EEFF;--fg2:#8BBAD6;
          --mu:#5B8FA8;--ac:#38AECC;--org:#818CF8;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--fg);-webkit-font-smoothing:antialiased;transition:background .35s,color .35s}

        .apw{min-height:100dvh;padding-top:3.75rem;overflow-x:hidden;position:relative}

        /* Background */
        .apw-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
        .apw-bg::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 80% 55% at 0% 0%,   color-mix(in srgb,var(--ac) 13%,transparent),transparent 55%),
            radial-gradient(ellipse 55% 45% at 100% 20%, color-mix(in srgb,var(--org) 10%,transparent),transparent 50%),
            radial-gradient(ellipse 65% 40% at 50% 110%, color-mix(in srgb,var(--ac) 8%,transparent),transparent 60%),
            var(--bg);
        }
        .apw-bg::after{
          content:'';position:absolute;inset:0;
          background-image:radial-gradient(circle,color-mix(in srgb,var(--fg) 16%,transparent) 1px,transparent 1px);
          background-size:28px 28px;opacity:.09;
          mask-image:radial-gradient(ellipse 85% 75% at 50% 40%,black 20%,transparent 100%);
        }
        [data-mode="light"] .apw-bg::after{opacity:.05}
        .aorb{position:absolute;border-radius:50%;filter:blur(85px);opacity:.48;pointer-events:none;animation:aorb 22s ease-in-out infinite alternate}
        [data-mode="light"] .aorb{opacity:.18}
        .aorb-1{width:520px;height:520px;background:radial-gradient(circle,color-mix(in srgb,var(--ac) 60%,transparent),transparent 72%);top:-120px;left:-100px}
        .aorb-2{width:400px;height:400px;background:radial-gradient(circle,color-mix(in srgb,var(--org) 52%,transparent),transparent 72%);top:80px;right:-80px;animation-delay:-9s}
        .aorb-3{width:300px;height:300px;background:radial-gradient(circle,color-mix(in srgb,#34D399 42%,transparent),transparent 72%);bottom:15%;left:35%;animation-delay:-15s}
        @keyframes aorb{0%{transform:translate(0,0)}50%{transform:translate(22px,-16px)}100%{transform:translate(-14px,20px)}}
        .apw>*:not(.apw-bg){position:relative;z-index:1}

        /* ── Hero ── */
        .ah{text-align:center;padding:5.5rem 1.5rem 4rem;max-width:700px;margin:0 auto}
        .ah-pill{
          display:inline-flex;align-items:center;gap:6px;
          font-size:.6rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;
          color:var(--ac);background:color-mix(in srgb,var(--ac) 10%,transparent);
          border:1px solid color-mix(in srgb,var(--ac) 28%,transparent);
          padding:5px 14px;border-radius:20px;margin-bottom:1.5rem;
        }
        .ah-h1{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:clamp(2.4rem,5.5vw,3.8rem);font-weight:400;line-height:1.08;
          letter-spacing:-.03em;color:var(--fg);margin-bottom:1.2rem;
        }
        .ah-h1 em{font-style:italic;color:var(--ac)}
        .ah-sub{font-size:.95rem;color:var(--mu);line-height:1.8;max-width:520px;margin:0 auto 2rem}
        .ah-loc{
          display:inline-flex;align-items:center;gap:7px;
          font-size:.78rem;font-weight:600;color:var(--fg2);
          background:color-mix(in srgb,var(--su) 70%,transparent);
          border:1px solid var(--br2);padding:9px 20px;border-radius:40px;
          backdrop-filter:blur(12px);
        }

        /* ── Stats bar ── */
        .astats{
          display:flex;flex-wrap:wrap;justify-content:center;gap:1px;
          max-width:900px;margin:0 auto 5rem;
          background:var(--br);border-radius:20px;overflow:hidden;
          border:1px solid var(--br2);
        }
        .astat{
          flex:1;min-width:160px;
          padding:2rem 1.5rem;
          background:color-mix(in srgb,var(--su) 75%,transparent);
          text-align:center;
          backdrop-filter:blur(12px);
          transition:background .2s;
        }
        [data-mode="light"] .astat{background:rgba(255,255,255,.82)}
        .astat:hover{background:color-mix(in srgb,var(--ac) 6%,var(--su))}
        .astat-num{
          font-family:'DM Serif Display',serif;
          font-size:2.4rem;font-weight:400;color:var(--ac);
          letter-spacing:-.03em;line-height:1;margin-bottom:.3rem;
        }
        .astat-label{font-size:.72rem;font-weight:700;color:var(--mu);letter-spacing:.06em;text-transform:uppercase}

        /* ── Section wrapper ── */
        .asec{max-width:1080px;margin:0 auto;padding:0 20px 5rem}
        .asec-hd{
          display:flex;align-items:center;gap:14px;
          margin-bottom:2.5rem;
        }
        .asec-line{flex:1;height:1px;background:var(--br2)}
        .asec-label{
          font-size:.62rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;
          color:var(--mu);white-space:nowrap;
        }

        /* ── Mission ── */
        .amission{
          display:grid;grid-template-columns:1fr 1fr;gap:24px;
          max-width:1080px;margin:0 auto;padding:0 20px 5rem;
        }
        @media(max-width:720px){.amission{grid-template-columns:1fr}}
        .amission-main{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:22px;
          padding:2.5rem;display:flex;flex-direction:column;gap:1rem;
        }
        [data-mode="light"] .amission-main{background:#fff;border-color:#C8DDEF}
        .amission-main h2{
          font-family:'DM Serif Display',serif;
          font-size:clamp(1.5rem,3vw,2rem);font-weight:400;
          color:#D4EEFF;line-height:1.25;
        }
        [data-mode="light"] .amission-main h2{color:#091828}
        .amission-main p{font-size:.88rem;color:#5B8FA8;line-height:1.8}
        [data-mode="light"] .amission-main p{color:var(--mu)}
        .amission-side{display:flex;flex-direction:column;gap:14px}
        .amission-card{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:18px;
          padding:1.4rem 1.5rem;flex:1;
          display:flex;gap:14px;align-items:flex-start;
        }
        [data-mode="light"] .amission-card{background:#fff;border-color:#C8DDEF}
        .amission-icon{
          width:38px;height:38px;border-radius:11px;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
        }
        .amission-card h3{font-size:.88rem;font-weight:700;color:#C0DCF0;margin-bottom:.3rem}
        [data-mode="light"] .amission-card h3{color:var(--fg2)}
        .amission-card p{font-size:.78rem;color:#5B8FA8;line-height:1.65}
        [data-mode="light"] .amission-card p{color:var(--mu)}

        /* ── Values ── */
        .avalues{
          display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
          gap:16px;
        }
        .aval{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:18px;
          padding:1.6rem;transition:transform .22s,box-shadow .22s;
        }
        [data-mode="light"] .aval{background:#fff;border-color:#C8DDEF}
        .aval:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.25)}
        [data-mode="light"] .aval:hover{box-shadow:0 12px 30px rgba(10,50,90,.1)}
        .aval-ic{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}
        .aval h3{font-size:.94rem;font-weight:800;color:#C0DCF0;margin-bottom:.5rem}
        [data-mode="light"] .aval h3{color:var(--fg2)}
        .aval p{font-size:.8rem;color:#5B8FA8;line-height:1.72}
        [data-mode="light"] .aval p{color:var(--mu)}

        /* ── Team ── */
        .ateam{
          display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));
          gap:16px;
        }
        .atm{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:18px;
          padding:1.6rem;text-align:center;
          transition:transform .22s,border-color .22s;
        }
        [data-mode="light"] .atm{background:#fff;border-color:#C8DDEF}
        .atm:hover{transform:translateY(-4px);border-color:#1E3C58}
        [data-mode="light"] .atm:hover{border-color:#BDD9F0}
        .atm-avatar{
          width:64px;height:64px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 1rem;font-size:1.1rem;font-weight:800;color:#fff;
          font-family:'DM Serif Display',serif;
        }
        .atm-name{font-size:.94rem;font-weight:800;color:#C0DCF0;margin-bottom:.2rem}
        [data-mode="light"] .atm-name{color:var(--fg2)}
        .atm-role{font-size:.72rem;font-weight:700;color:var(--ac);margin-bottom:.6rem;letter-spacing:.04em}
        .atm-bio{font-size:.77rem;color:#5B8FA8;line-height:1.68;margin-bottom:.8rem}
        [data-mode="light"] .atm-bio{color:var(--mu)}
        .atm-loc{display:inline-flex;align-items:center;gap:4px;font-size:.68rem;color:#3D6880;font-family:'Geist Mono',monospace}
        [data-mode="light"] .atm-loc{color:var(--mu)}

        /* ── Timeline ── */
        .atl{position:relative;padding-left:28px}
        .atl::before{content:'';position:absolute;left:7px;top:8px;bottom:8px;width:1px;background:var(--br2)}
        .atl-item{position:relative;margin-bottom:2rem}
        .atl-dot{
          position:absolute;left:-25px;top:4px;
          width:14px;height:14px;border-radius:50%;
          background:var(--ac);border:3px solid var(--bg);
          box-shadow:0 0 0 1px var(--ac);
        }
        .atl-year{font-size:.68rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ac);margin-bottom:.3rem;font-family:'Geist Mono',monospace}
        .atl-event{font-size:.85rem;color:#8BBAD6;line-height:1.7}
        [data-mode="light"] .atl-event{color:var(--mu)}

        /* ── Bottom CTA ── */
        .abcta{
          position:relative;overflow:hidden;
          padding:5.5rem 1.5rem;text-align:center;
          border-top:1px solid var(--br);
        }
        .abcta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 65% 75% at 50% 0%,color-mix(in srgb,var(--ac) 12%,transparent),transparent 65%),var(--bg2)}
        .abcta-content{position:relative;z-index:1}
        .abcta-h{font-family:'DM Serif Display',serif;font-size:clamp(1.6rem,3.5vw,2.3rem);font-weight:400;margin-bottom:.7rem;color:var(--fg)}
        .abcta-sub{color:var(--mu);font-size:.86rem;margin-bottom:1.8rem;line-height:1.65}
        .abcta-btns{display:flex;align-items:center;justify-content:center;gap:11px;flex-wrap:wrap}
        .abcta-btn{display:inline-flex;align-items:center;gap:7px;padding:13px 28px;border-radius:13px;font-weight:700;font-size:.84rem;text-decoration:none;transition:all .17s}
        .abcta-btn--main{background:var(--ac);color:#fff;box-shadow:0 4px 24px color-mix(in srgb,var(--ac) 42%,transparent)}
        .abcta-btn--main:hover{opacity:.88;transform:translateY(-2px)}
        .abcta-btn--ghost{background:color-mix(in srgb,var(--su) 70%,transparent);border:1.5px solid var(--br2);color:var(--fg);backdrop-filter:blur(8px)}
        .abcta-btn--ghost:hover{border-color:var(--ac);color:var(--ac)}
      `}</style>

      <div className="apw">
        <div className="apw-bg" aria-hidden>
          <div className="aorb aorb-1"/><div className="aorb aorb-2"/><div className="aorb aorb-3"/>
        </div>

        <Navbar isDarkMode={isDark} onThemeToggle={toggleTheme}/>

        {/* Hero */}
        <section className="ah">
          <div className="ah-pill"><Sparkles size={9}/> About Velamini</div>
          <h1 className="ah-h1">
            Building the <em>AI layer</em><br/>for African business
          </h1>
          <p className="ah-sub">
            Velamini is an African AI platform that gives every business — from a Kigali restaurant to a Lagos e-commerce store — the power of intelligent automation, real-time analytics, and customer service that never sleeps.
          </p>
          <span className="ah-loc">
            <MapPin size={12} style={{ color:"var(--ac)" }}/>
            Kigali Innovation City, Rwanda · Founded 2026
          </span>
        </section>

        {/* Stats */}
        <div className="astats" style={{ margin:"0 20px 5rem", maxWidth:"none" }}>
          {[
            { num:1000, suffix:"+" , label:"Active Organisations" },
            { num:12,   suffix:"M+", label:"Messages Processed"   },
            { num:4,    suffix:"",   label:"Countries"             },
            { num:98,   suffix:"%",  label:"Uptime SLA"            },
          ].map(({ num, suffix, label }) => (
            <div key={label} className="astat">
              <div className="astat-num"><AnimNum target={num} suffix={suffix}/></div>
              <div className="astat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div style={{ maxWidth:"1080px", margin:"0 auto", padding:"0 20px" }}>
          <div className="asec-hd">
            <div className="asec-line"/><span className="asec-label">Our Mission</span><div className="asec-line"/>
          </div>
        </div>
        <div className="amission">
          <div className="amission-main">
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:".5rem" }}>
              <div style={{ width:40,height:40,borderRadius:12,background:"rgba(56,174,204,.15)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Target size={18} style={{ color:"#38AECC" }}/>
              </div>
              <span style={{ fontSize:".65rem", fontWeight:800, letterSpacing:".14em", textTransform:"uppercase", color:"#38AECC" }}>Mission</span>
            </div>
            <h2>Make AI-powered business intelligence accessible to every organisation in Africa</h2>
            <p>
              The average African business misses 60% of after-hours customer enquiries. They make pricing decisions based on gut feeling instead of data. They spend hours on manual tasks that AI could handle in seconds.
            </p>
            <p style={{ marginTop:"1rem" }}>
              Velamini exists to close that gap. We believe the next wave of African business growth will be driven by intelligent automation — and we're building the platform that makes it real.
            </p>
          </div>
          <div className="amission-side">
            {[
              { Icon:Eye, color:"#38AECC", title:"Our Vision", text:"A future where every African entrepreneur — regardless of technical background or budget — can deploy intelligent AI systems that help their business thrive." },
              { Icon:Globe, color:"#818CF8", title:"Our Focus", text:"We build specifically for Africa: local payment methods, competitive pricing in local currencies, low-latency infrastructure, and support teams who understand the local context." },
              { Icon:TrendingUp, color:"#34D399", title:"Our Approach", text:"Simple to start, powerful to scale. Start free with no credit card. Grow with your business. Every feature is designed to take minutes to set up, not weeks." },
            ].map(({ Icon, color, title, text }) => (
              <div key={title} className="amission-card">
                <div className="amission-icon" style={{ background:`${color}18` }}>
                  <Icon size={16} style={{ color }}/>
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="asec">
          <div className="asec-hd">
            <div className="asec-line"/><span className="asec-label">Our Values</span><div className="asec-line"/>
          </div>
          <div className="avalues">
            {VALUES.map(({ Icon, color, title, body }) => (
              <div key={title} className="aval">
                <div className="aval-ic" style={{ background:`${color}18` }}>
                  <Icon size={20} style={{ color }}/>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>

        

        {/* Timeline */}
        <div className="asec">
          <div className="asec-hd">
            <div className="asec-line"/><span className="asec-label">Our Story</span><div className="asec-line"/>
          </div>
          <div style={{ maxWidth:"560px", margin:"0 auto" }}>
            <div className="atl">
              {MILESTONES.map(({ year, event }) => (
                <div key={year} className="atl-item">
                  <div className="atl-dot"/>
                  <div className="atl-year">{year}</div>
                  <div className="atl-event">{event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="abcta">
          <div className="abcta-content">
            <div className="abcta-h">Ready to join 1,000+ organisations?</div>
            <p className="abcta-sub">Start free. No credit card. Your AI agent live in minutes.</p>
            <div className="abcta-btns">
              <Link href="/auth/signin" className="abcta-btn abcta-btn--main">Get Started Free <ArrowRight size={13}/></Link>
              <Link href="/contact" className="abcta-btn abcta-btn--ghost">Contact Us</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
