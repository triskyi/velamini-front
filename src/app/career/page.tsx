"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar, { applyTheme } from "@/components/Navbar";
import Footer from "@/components/footer";
import { ArrowRight, MapPin, Zap, Heart, Globe, Shield, TrendingUp, Sparkles, Users } from "lucide-react";

const BENEFITS = [
  { Icon:Heart,      color:"#EC4899", title:"Health Cover",        body:"Full medical insurance for you and your dependents, including dental and vision." },
  { Icon:TrendingUp, color:"#38AECC", title:"Equity",              body:"Every full-time employee gets a meaningful equity stake. We grow together." },
  { Icon:Globe,      color:"#818CF8", title:"Remote-Friendly",     body:"Hybrid setup — work from the office when it matters, home when it doesn't." },
  { Icon:Sparkles,   color:"#34D399", title:"Learning Budget",     body:"$500/year for courses, conferences, books, or anything that makes you better." },
  { Icon:Zap,        color:"#F59E0B", title:"Latest Equipment",    body:"MacBook Pro, mechanical keyboard, monitors — whatever helps you do your best work." },
  { Icon:Shield,     color:"#38AECC", title:"Paid Leave",          body:"25 days annual leave + all Rwandan public holidays + mental health days." },
];

function getInitialTheme(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return (localStorage.getItem("theme") || "dark") === "dark";
  } catch {
    return true;
  }
}

export default function CareersPage() {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

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

        .carpw{min-height:100dvh;padding-top:3.75rem;overflow-x:hidden;position:relative}
        .carpw-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
        .carpw-bg::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 75% 52% at 5% 5%,   color-mix(in srgb,var(--ac) 11%,transparent),transparent 55%),
            radial-gradient(ellipse 50% 42% at 95% 18%, color-mix(in srgb,var(--org) 9%,transparent),transparent 50%),
            radial-gradient(ellipse 55% 38% at 50% 108%,color-mix(in srgb,#34D399 7%,transparent),transparent 55%),
            var(--bg);
        }
        .carpw-bg::after{
          content:'';position:absolute;inset:0;
          background-image:radial-gradient(circle,color-mix(in srgb,var(--fg) 15%,transparent) 1px,transparent 1px);
          background-size:28px 28px;opacity:.08;
          mask-image:radial-gradient(ellipse 80% 70% at 50% 40%,black 20%,transparent 100%);
        }
        [data-mode="light"] .carpw-bg::after{opacity:.05}
        .karb{position:absolute;border-radius:50%;filter:blur(85px);opacity:.45;pointer-events:none;animation:karb 22s ease-in-out infinite alternate}
        [data-mode="light"] .karb{opacity:.16}
        .karb-1{width:500px;height:500px;background:radial-gradient(circle,color-mix(in srgb,var(--ac) 58%,transparent),transparent 72%);top:-110px;left:-90px}
        .karb-2{width:370px;height:370px;background:radial-gradient(circle,color-mix(in srgb,var(--org) 50%,transparent),transparent 72%);top:60px;right:-65px;animation-delay:-9s}
        .karb-3{width:280px;height:280px;background:radial-gradient(circle,color-mix(in srgb,#34D399 40%,transparent),transparent 72%);bottom:18%;left:30%;animation-delay:-15s}
        @keyframes karb{0%{transform:translate(0,0)}100%{transform:translate(20px,-16px)}}
        .carpw>*:not(.carpw-bg){position:relative;z-index:1}

        /* Hero */
        .carh{text-align:center;padding:5rem 1.5rem 3.5rem;max-width:640px;margin:0 auto}
        .carh-pill{
          display:inline-flex;align-items:center;gap:6px;
          font-size:.6rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;
          color:var(--ac);background:color-mix(in srgb,var(--ac) 10%,transparent);
          border:1px solid color-mix(in srgb,var(--ac) 28%,transparent);
          padding:5px 14px;border-radius:20px;margin-bottom:1.4rem;
        }
        .carh-h1{
          font-family:'DM Serif Display',serif;
          font-size:clamp(2.2rem,5vw,3.5rem);font-weight:400;line-height:1.1;
          letter-spacing:-.03em;color:var(--fg);margin-bottom:1rem;
        }
        .carh-h1 em{font-style:italic;color:var(--ac)}
        .carh-sub{font-size:.92rem;color:var(--mu);line-height:1.78;max-width:500px;margin:0 auto 2rem}
        .carh-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
        .carh-chip{
          display:inline-flex;align-items:center;gap:7px;
          padding:9px 20px;border-radius:40px;
          background:color-mix(in srgb,var(--su) 70%,transparent);
          border:1px solid var(--br2);backdrop-filter:blur(12px);
          font-size:.75rem;font-weight:600;color:var(--fg2);
        }

        /* Culture strip */
        .carculture{
          display:grid;grid-template-columns:1fr 1fr;gap:20px;
          max-width:1080px;margin:0 auto 4rem;padding:0 20px;
        }
        @media(max-width:680px){.carculture{grid-template-columns:1fr}}
        .carculture-main{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:22px;
          padding:2rem;position:relative;overflow:hidden;
        }
        [data-mode="light"] .carculture-main{background:#fff;border-color:#C8DDEF}
        .carculture-main::before{
          content:'';position:absolute;top:-60px;right:-60px;
          width:200px;height:200px;border-radius:50%;
          background:radial-gradient(circle,rgba(56,174,204,.12),transparent 70%);
          pointer-events:none;
        }
        .carculture-main h2{
          font-family:'DM Serif Display',serif;
          font-size:1.5rem;font-weight:400;color:#D4EEFF;margin-bottom:.8rem;
        }
        [data-mode="light"] .carculture-main h2{color:#091828}
        .carculture-main p{font-size:.84rem;color:#5B8FA8;line-height:1.8;margin-bottom:.8rem}
        [data-mode="light"] .carculture-main p{color:var(--mu)}
        .carculture-stats{display:flex;gap:24px;margin-top:1rem;padding-top:1rem;border-top:1px solid #1A3448}
        [data-mode="light"] .carculture-stats{border-color:var(--br)}
        .carstat-num{font-family:'DM Serif Display',serif;font-size:1.8rem;font-weight:400;color:var(--ac);line-height:1}
        .carstat-lbl{font-size:.68rem;font-weight:700;color:#5B8FA8;text-transform:uppercase;letter-spacing:.06em}
        [data-mode="light"] .carstat-lbl{color:var(--mu)}
        .carculture-imgs{display:flex;flex-direction:column;gap:14px}
        .carculture-img-card{
          flex:1;border-radius:16px;overflow:hidden;
          background:linear-gradient(135deg,#0D1E2E,#08131E);
          border:1px solid #1A3448;
          display:flex;align-items:center;justify-content:center;
          padding:1.2rem;gap:14px;
          min-height:80px;
        }
        [data-mode="light"] .carculture-img-card{background:#F0F8FF;border-color:#C8DDEF}
        .carculture-img-card span{font-size:.82rem;font-weight:600;color:#8BBAD6}
        [data-mode="light"] .carculture-img-card span{color:var(--fg2)}

        /* Benefits */
        .carbens{
          display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
          gap:14px;max-width:1080px;margin:0 auto 4rem;padding:0 20px;
        }
        .carben{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:16px;
          padding:1.4rem;transition:transform .22s;
        }
        [data-mode="light"] .carben{background:#fff;border-color:#C8DDEF}
        .carben:hover{transform:translateY(-3px)}
        .carben-ic{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;margin-bottom:.8rem}
        .carben h3{font-size:.88rem;font-weight:800;color:#C0DCF0;margin-bottom:.3rem}
        [data-mode="light"] .carben h3{color:var(--fg2)}
        .carben p{font-size:.77rem;color:#5B8FA8;line-height:1.68}
        [data-mode="light"] .carben p{color:var(--mu)}

        /* Dept filter */
        .cardepts{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;padding:0 20px 2rem}
        .cardept{
          padding:7px 18px;border:1.5px solid var(--br2);border-radius:40px;
          font-family:inherit;font-size:.75rem;font-weight:600;
          background:color-mix(in srgb,var(--su) 70%,transparent);
          color:var(--mu);cursor:pointer;transition:all .18s;
          backdrop-filter:blur(10px);
        }
        .cardept:hover{border-color:var(--ac);color:var(--ac)}
        .cardept.on{background:var(--ac);border-color:var(--ac);color:#fff;box-shadow:0 2px 16px color-mix(in srgb,var(--ac) 36%,transparent)}

        /* Roles list */
        .carroles{max-width:860px;margin:0 auto;padding:0 20px 5rem;display:flex;flex-direction:column;gap:12px}
        .carroles-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem}
        .carroles-label{font-size:.68rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}
        .carroles-count{font-size:.68rem;color:var(--mu);font-family:'Geist Mono',monospace}

        /* Role card */
        .rc{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:16px;
          overflow:hidden;transition:border-color .2s;
        }
        [data-mode="light"] .rc{background:#fff;border-color:#C8DDEF}
        .rc:hover,.rc--open{border-color:#1E3C58}
        [data-mode="light"] .rc:hover,[data-mode="light"] .rc--open{border-color:#BDD9F0}
        .rc-line{height:3px;width:100%}
        .rc-header{
          display:flex;align-items:center;justify-content:space-between;
          padding:16px 18px;cursor:pointer;gap:12px;
        }
        .rc-left{display:flex;align-items:center;gap:13px}
        .rc-ic{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .rc-title{font-size:.92rem;font-weight:800;color:#C0DCF0;margin-bottom:3px}
        [data-mode="light"] .rc-title{color:var(--fg2)}
        .rc-meta{display:flex;align-items:center;gap:5px;font-size:.72rem;color:#5B8FA8;flex-wrap:wrap}
        [data-mode="light"] .rc-meta{color:var(--mu)}
        .rc-dept{font-weight:700;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase}
        .rc-sep{color:#3D6880}
        .rc-right{display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:wrap}
        .rc-tag{
          font-size:.62rem;font-weight:600;
          color:#3D6880;background:#0F2030;
          padding:3px 9px;border-radius:20px;
          font-family:'Geist Mono',monospace;
        }
        [data-mode="light"] .rc-tag{color:var(--mu);background:color-mix(in srgb,var(--ac) 8%,transparent)}
        .rc-body{padding:0 18px 18px;border-top:1px solid #132234}
        [data-mode="light"] .rc-body{border-color:var(--br)}
        .rc-desc{font-size:.82rem;color:#5B8FA8;line-height:1.75;margin:14px 0 16px}
        [data-mode="light"] .rc-desc{color:var(--mu)}
        .rc-footer{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .rc-remote{font-size:.68rem;font-weight:700;padding:5px 12px;border-radius:20px;letter-spacing:.06em;text-transform:uppercase}
        .rc-apply{
          display:flex;align-items:center;gap:6px;
          padding:10px 22px;border-radius:11px;border:none;
          font-family:inherit;font-size:.8rem;font-weight:700;
          color:#fff;cursor:pointer;transition:all .17s;
        }
        .rc-apply:hover{opacity:.88;transform:translateY(-1px)}

        /* Open applications */
        .caropen{
          text-align:center;padding:3rem 20px 0;
          max-width:520px;margin:0 auto;
        }
        .caropen-card{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:20px;
          padding:2rem;
        }
        [data-mode="light"] .caropen-card{background:#fff;border-color:#C8DDEF}
        .caropen-h{font-family:'DM Serif Display',serif;font-size:1.3rem;font-weight:400;color:#D4EEFF;margin-bottom:.5rem}
        [data-mode="light"] .caropen-h{color:#091828}
        .caropen-p{font-size:.82rem;color:#5B8FA8;line-height:1.7;margin-bottom:1.2rem}
        [data-mode="light"] .caropen-p{color:var(--mu)}
        .caropen-btn{
          display:inline-flex;align-items:center;gap:7px;
          padding:11px 24px;border-radius:12px;
          background:color-mix(in srgb,var(--ac) 12%,transparent);
          border:1.5px solid color-mix(in srgb,var(--ac) 35%,transparent);
          color:var(--ac);font-family:inherit;font-size:.82rem;font-weight:700;
          text-decoration:none;transition:all .18s;cursor:pointer;
        }
        .caropen-btn:hover{background:color-mix(in srgb,var(--ac) 18%,transparent);border-color:var(--ac)}

        /* Application modal */
        .carmodal-overlay{
          position:fixed;inset:0;z-index:100;
          background:rgba(3,8,15,.85);backdrop-filter:blur(8px);
          display:flex;align-items:center;justify-content:center;padding:20px;
        }
        .carmodal{
          background:#0C1A28;border:1px solid #1A3448;border-radius:22px;
          padding:2rem;width:100%;max-width:480px;
          animation:carmodal-in .22s ease;
          max-height:90vh;overflow-y:auto;
        }
        [data-mode="light"] .carmodal{background:#fff;border-color:#C8DDEF}
        @keyframes carmodal-in{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .carmodal-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.4rem}
        .carmodal-role{font-size:.72rem;font-weight:700;color:var(--ac);margin-bottom:.3rem;letter-spacing:.04em;text-transform:uppercase}
        .carmodal-title{font-family:'DM Serif Display',serif;font-size:1.3rem;font-weight:400;color:#D4EEFF}
        [data-mode="light"] .carmodal-title{color:#091828}
        .carmodal-close{
          background:none;border:none;cursor:pointer;
          color:#5B8FA8;font-size:1.2rem;padding:4px;
          transition:color .15s;
        }
        .carmodal-close:hover{color:var(--ac)}
        .cmf-group{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
        .cmf-label{font-size:.72rem;font-weight:700;color:#8BBAD6;letter-spacing:.04em}
        [data-mode="light"] .cmf-label{color:var(--fg2)}
        .cmf-input,.cmf-textarea{
          padding:11px 14px;
          background:#0F2030;border:1.5px solid #1A3448;border-radius:11px;
          font-family:inherit;font-size:.84rem;color:#D4EEFF;
          outline:none;transition:border-color .2s;width:100%;
        }
        [data-mode="light"] .cmf-input,[data-mode="light"] .cmf-textarea{background:#F8FBFF;border-color:#C8DDEF;color:#091828}
        .cmf-input::placeholder,.cmf-textarea::placeholder{color:#3D6880}
        [data-mode="light"] .cmf-input::placeholder,[data-mode="light"] .cmf-textarea::placeholder{color:var(--mu)}
        .cmf-input:focus,.cmf-textarea:focus{border-color:var(--ac);box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 14%,transparent)}
        .cmf-textarea{min-height:100px;resize:vertical;line-height:1.6}
        .cmf-btn{
          width:100%;padding:12px;border-radius:12px;border:none;
          background:var(--ac);color:#fff;
          font-family:inherit;font-size:.86rem;font-weight:700;
          cursor:pointer;transition:all .17s;margin-top:4px;
          display:flex;align-items:center;justify-content:center;gap:7px;
          box-shadow:0 4px 20px color-mix(in srgb,var(--ac) 38%,transparent);
        }
        .cmf-btn:hover{opacity:.88;transform:translateY(-1px)}
        .cmsent{text-align:center;padding:2rem 1rem}
        .cmsent-icon{font-size:2.5rem;margin-bottom:.8rem}
        .cmsent-h{font-family:'DM Serif Display',serif;font-size:1.3rem;color:#D4EEFF;margin-bottom:.4rem}
        [data-mode="light"] .cmsent-h{color:#091828}
        .cmsent-p{font-size:.82rem;color:#5B8FA8;line-height:1.7}
        [data-mode="light"] .cmsent-p{color:var(--mu)}
      `}</style>

      <div className="carpw">
        <div className="carpw-bg" aria-hidden>
          <div className="karb karb-1"/><div className="karb karb-2"/><div className="karb karb-3"/>
        </div>

        <Navbar isDarkMode={isDark} onThemeToggle={toggleTheme}/>

        {/* Hero */}
        <section className="carh">
          <div className="carh-pill"><Zap size={9}/> Careers at Velamini</div>
          <h1 className="carh-h1">
            Build the <em>future of AI</em><br/>in Africa with us
          </h1>
          <p className="carh-sub">
            We&apos;re a small, high-trust team building AI infrastructure for African businesses. If you&apos;re excited about real impact, real equity, and real ownership — you&apos;ll fit right in.
          </p>
          <div className="carh-chips">
            <span className="carh-chip"><MapPin size={12} style={{ color:"var(--ac)" }}/>Kigali, Rwanda</span>
            <span className="carh-chip"><Users size={12} style={{ color:"#818CF8" }}/>Not hiring currently</span>
            <span className="carh-chip"><Sparkles size={12} style={{ color:"#34D399" }}/>Equity for all</span>
          </div>
        </section>

        {/* Culture */}
        <div className="carculture">
          <div className="carculture-main">
            <h2>A team that ships, learns, and cares</h2>
            <p>
              Velamini was founded by people who were frustrated that the best AI tools were built for Silicon Valley — not for Kigali, Lagos, or Nairobi or Anywhere in Africa. We&apos;re fixing that.
            </p>
            <p>
              We move fast, take ownership seriously, and genuinely celebrate each other&apos;s wins. If you&apos;ve spent time in corporate environments wondering why things take so long — you&apos;ll love it here.
            </p>
            <div className="carculture-stats">
              <div><div className="carstat-num">12</div><div className="carstat-lbl">Team members</div></div>
              <div><div className="carstat-num">4</div><div className="carstat-lbl">Countries</div></div>
              <div><div className="carstat-num">~2 yrs</div><div className="carstat-lbl">Avg tenure</div></div>
            </div>
          </div>
          <div className="carculture-imgs">
            {[
              { icon:"🖥️", text:"Weekly every day — remote-friendly" },
              { icon:"🚀", text:"Ship something real in your first two weeks" },
              { icon:"🌍", text:"Built for Africa, used across the continent" },
              { icon:"🤝", text:"Flat structure — direct access to founders" },
            ].map(({ icon, text }) => (
              <div key={text} className="carculture-img-card">
                <span style={{ fontSize:"1.4rem" }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div style={{ maxWidth:"1080px", margin:"0 auto", padding:"0 20px 1rem" }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:"1.5rem" }}>
            <div style={{ flex:1,height:1,background:"var(--br2)" }}/>
            <span style={{ fontSize:".62rem",fontWeight:800,letterSpacing:".18em",textTransform:"uppercase",color:"var(--mu)",whiteSpace:"nowrap" }}>Benefits & Perks</span>
            <div style={{ flex:1,height:1,background:"var(--br2)" }}/>
          </div>
        </div>
        <div className="carbens">
          {BENEFITS.map(({ Icon, color, title, body }) => (
            <div key={title} className="carben">
              <div className="carben-ic" style={{ background:`${color}18` }}>
                <Icon size={18} style={{ color }}/>
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>

        {/* Hiring status */}
        <div className="caropen" style={{ maxWidth:"860px", margin:"0 auto", padding:"0 20px 5rem" }}>
          <div className="caropen-card">
            <div className="caropen-h">We are not hiring right now</div>
            <p className="caropen-p">
              Thanks for your interest in Velamini. We are not accepting applications at the moment.
              Please check back later for future openings.
            </p>
            <Link className="caropen-btn" href="/contact">
              Contact Team <ArrowRight size={12}/>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

