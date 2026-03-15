"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, Mail, ArrowUpRight, Zap, Globe } from "lucide-react";

/* ── Footer data ─────────────────────────────────────────────────── */
const LINKS = {
  Product: [
    { label: "Home",          href: "/" },
    { label: "Pricing",       href: "/pricing" },
    { label: "Documentation", href: "/docs" },
    { label: "Changelog",     href: "/changelog" },
    { label: "Status",        href: "https://status.velamini.com", external: true },
  ],
  Company: [
    { label: "About Us",   href: "/about" },
    { label: "Blog",       href: "/blog" },
    { label: "Careers",    href: "/careers", badge: "Hiring" },
    { label: "Contact",    href: "/contact" },
  ],
  Resources: [
    { label: "API Reference",   href: "/docs/api" },
    { label: "Embed Guide",     href: "/docs/embed" },
    { label: "Use Cases",       href: "/docs/use-cases" },
    { label: "Agent Templates", href: "/docs/templates" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy",   href: "/privacy" },
    { label: "Cookie Policy",    href: "/cookies" },
    { label: "Security",         href: "/security" },
  ],
};

const SOCIAL = [
  {
    Icon: MessageSquare,
    label: "Slack",
    href: "https://coodic.slack.com/archives/C08MQ8XJ8AV",
    color: "#C0DCF0",
    hoverColor: "#ECB22E",
    desc: "Join the community",
  },
  {
    Icon: Mail,
    label: "Newsletter",
    href: "https://velamini.com/blog#newsletter",
    color: "#C0DCF0",
    hoverColor: "#38AECC",
    desc: "Weekly digest",
  },
];

/* ── Footer component ────────────────────────────────────────────── */
export default function Footer() {
  const [locale, setLocale] = useState("EN");
  const [currency, setCurrency] = useState("RWF");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem("velamini_locale");
      const savedCurrency = localStorage.getItem("velamini_currency");
      if (savedLocale) queueMicrotask(() => setLocale(savedLocale));
      if (savedCurrency) queueMicrotask(() => setCurrency(savedCurrency));
    } catch {}
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const setLocaleAndSave = (value: string) => {
    setLocale(value);
    try { localStorage.setItem("velamini_locale", value); } catch {}
  };

  const setCurrencyAndSave = (value: string) => {
    setCurrency(value);
    try { localStorage.setItem("velamini_currency", value); } catch {}
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Geist+Mono:wght@400;500&display=swap');

        /* ── Footer base ─────────────────────────────────────────── */
        .vf{
          position:relative;overflow:hidden;
          background:#060E18;
          border-top:1px solid #132234;
          font-family:'DM Sans',system-ui,sans-serif;
        }
        [data-mode="light"] .vf{
          background:#EAF4FD;
          border-top:1px solid #BDD9F0;
        }

        /* Subtle top glow */
        .vf::before{
          content:'';position:absolute;
          top:0;left:50%;transform:translateX(-50%);
          width:600px;height:1px;
          background:linear-gradient(90deg,transparent,rgba(56,174,204,.5),transparent);
        }
        /* Background atmosphere */
        .vf::after{
          content:'';position:absolute;inset:0;pointer-events:none;
          background:
            radial-gradient(ellipse 60% 40% at 10% 0%,rgba(56,174,204,.06) 0%,transparent 60%),
            radial-gradient(ellipse 50% 35% at 90% 0%,rgba(129,140,248,.05) 0%,transparent 55%);
        }
        [data-mode="light"] .vf::after{
          background:
            radial-gradient(ellipse 60% 40% at 10% 0%,rgba(41,169,212,.05) 0%,transparent 60%),
            radial-gradient(ellipse 50% 35% at 90% 0%,rgba(99,102,241,.04) 0%,transparent 55%);
        }

        .vf-inner{
          position:relative;z-index:1;
          max-width:1160px;margin:0 auto;padding:0 24px;
        }

        /* ── Top bar: community CTA ───────────────────────────────── */
        .vf-community{
          display:flex;align-items:center;justify-content:space-between;
          flex-wrap:wrap;gap:16px;
          padding:28px 0 28px;
          border-bottom:1px solid #132234;
        }
        [data-mode="light"] .vf-community{border-color:#C8DDEF}

        .vf-community-left{
          display:flex;align-items:center;gap:14px;
        }
        .vf-community-icon{
          width:40px;height:40px;border-radius:12px;flex-shrink:0;
          background:rgba(56,174,204,.12);border:1px solid rgba(56,174,204,.22);
          display:flex;align-items:center;justify-content:center;
        }
        [data-mode="light"] .vf-community-icon{background:rgba(41,169,212,.1);border-color:rgba(41,169,212,.2)}
        .vf-community-title{
          font-size:.86rem;font-weight:700;color:#C0DCF0;
          margin-bottom:2px;
        }
        [data-mode="light"] .vf-community-title{color:#1C3A52}
        .vf-community-sub{font-size:.74rem;color:#5B8FA8}
        [data-mode="light"] .vf-community-sub{color:#527A96}

        .vf-community-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .vf-comm-btn{
          display:inline-flex;align-items:center;gap:7px;
          padding:9px 18px;border-radius:10px;
          font-family:inherit;font-size:.76rem;font-weight:700;
          text-decoration:none;transition:all .18s;cursor:pointer;border:none;
        }
        .vf-comm-btn--slack{
          background:rgba(236,178,46,.12);
          border:1px solid rgba(236,178,46,.25);
          color:#ECB22E;
        }
        .vf-comm-btn--slack:hover{background:rgba(236,178,46,.2);border-color:rgba(236,178,46,.45);transform:translateY(-1px)}
        .vf-comm-btn--gh{
          background:rgba(192,220,240,.08);
          border:1px solid rgba(192,220,240,.18);
          color:#C0DCF0;
        }
        [data-mode="light"] .vf-comm-btn--gh{background:rgba(10,50,90,.05);border-color:#BDD9F0;color:#1C3A52}
        .vf-comm-btn--gh:hover{background:rgba(192,220,240,.15);border-color:rgba(192,220,240,.3);transform:translateY(-1px)}

        /* ── Main grid ───────────────────────────────────────────── */
        .vf-grid{
          display:grid;
          grid-template-columns:2fr 1fr 1fr 1fr 1fr;
          gap:40px;
          padding:44px 0 40px;
          border-bottom:1px solid #132234;
        }
        [data-mode="light"] .vf-grid{border-color:#C8DDEF}
        @media(max-width:900px){
          .vf-grid{grid-template-columns:1fr 1fr;gap:32px}
          .vf-brand{grid-column:1/-1}
        }
        @media(max-width:520px){
          .vf-grid{grid-template-columns:1fr 1fr}
          .vf-brand{grid-column:1/-1}
        }

        /* Brand column */
        .vf-brand{}
        .vf-logo{
          display:flex;align-items:center;gap:10px;
          text-decoration:none;margin-bottom:14px;
        }
        .vf-logo-orb{
          width:36px;height:36px;border-radius:10px;
          background:linear-gradient(135deg,#38AECC,#1B90B8);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 18px rgba(56,174,204,.3);
          flex-shrink:0;
        }
        .vf-logo-name{
          font-family:'DM Serif Display',serif;
          font-size:1.25rem;font-weight:400;
          color:#D4EEFF;letter-spacing:-.02em;
        }
        [data-mode="light"] .vf-logo-name{color:#091828}
        .vf-tagline{
          font-size:.8rem;color:#5B8FA8;line-height:1.72;
          margin-bottom:18px;max-width:240px;
        }
        [data-mode="light"] .vf-tagline{color:#527A96}

        /* Status badge */
        .vf-status{
          display:inline-flex;align-items:center;gap:7px;
          font-size:.68rem;font-weight:700;
          color:#34D399;font-family:'Geist Mono',monospace;
          background:rgba(52,211,153,.08);
          border:1px solid rgba(52,211,153,.2);
          padding:5px 12px;border-radius:20px;margin-bottom:18px;
        }
        .vf-status-dot{
          width:6px;height:6px;border-radius:50%;background:#34D399;
          animation:vf-pulse 2.4s ease-in-out infinite;
          flex-shrink:0;
        }
        @keyframes vf-pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(52,211,153,.4)}50%{opacity:.7;box-shadow:0 0 0 4px rgba(52,211,153,0)}}

        /* Social icons */
        .vf-socials{display:flex;gap:8px;flex-wrap:wrap}
        .vf-social{
          width:34px;height:34px;border-radius:9px;
          display:flex;align-items:center;justify-content:center;
          background:rgba(255,255,255,.05);
          border:1px solid #1A3448;
          color:#5B8FA8;
          text-decoration:none;
          transition:all .18s;
          position:relative;
        }
        [data-mode="light"] .vf-social{background:rgba(0,0,0,.03);border-color:#C8DDEF;color:#527A96}
        .vf-social:hover{
          border-color:rgba(56,174,204,.4);
          background:rgba(56,174,204,.08);
          color:#38AECC;
          transform:translateY(-2px);
        }

        /* Link columns */
        .vf-col-title{
          font-size:.62rem;font-weight:800;letter-spacing:.16em;
          text-transform:uppercase;color:#5B8FA8;
          margin-bottom:14px;
        }
        [data-mode="light"] .vf-col-title{color:#527A96}
        .vf-col-links{list-style:none;display:flex;flex-direction:column;gap:9px}
        .vf-link{
          display:inline-flex;align-items:center;gap:5px;
          font-size:.8rem;color:#8BBAD6;text-decoration:none;
          transition:color .15s;width:fit-content;
        }
        [data-mode="light"] .vf-link{color:#1C3A52}
        .vf-link:hover{color:#38AECC}
        [data-mode="light"] .vf-link:hover{color:#29A9D4}
        .vf-link-badge{
          font-size:.55rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
          background:#38AECC;color:#fff;padding:2px 7px;border-radius:20px;
        }
        .vf-ext-icon{opacity:.5;flex-shrink:0}

        /* ── Bottom bar ──────────────────────────────────────────── */
        .vf-bottom{
          display:flex;align-items:center;justify-content:space-between;
          flex-wrap:wrap;gap:14px;
          padding:18px 0 22px;
        }
        .vf-copy{
          font-size:.74rem;color:#3D6880;
          display:flex;align-items:center;gap:8px;flex-wrap:wrap;
        }
        [data-mode="light"] .vf-copy{color:#527A96}
        .vf-copy-sep{width:3px;height:3px;border-radius:50%;background:#2A4D68;flex-shrink:0}
        [data-mode="light"] .vf-copy-sep{background:#BDD9F0}
        .vf-copy-love{color:#EC4899}
        .vf-copy-link{
          color:#38AECC;text-decoration:underline;
        }
        [data-mode="light"] .vf-copy-link{color:#29A9D4}
        .vf-copy-loc{
          display:inline-flex;align-items:center;gap:4px;
          font-family:'Geist Mono',monospace;font-size:.68rem;color:#2A4D68;
        }
        [data-mode="light"] .vf-copy-loc{color:#9CC0D8}

        .vf-bottom-links{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
        .vf-bot-link{
          font-size:.74rem;color:#3D6880;text-decoration:none;
          transition:color .15s;
        }
        [data-mode="light"] .vf-bot-link{color:#527A96}
        .vf-bot-link:hover{color:#38AECC}
        [data-mode="light"] .vf-bot-link:hover{color:#29A9D4}

        /* ── Language / region selector ─────────────────────────── */
        .vf-region-wrap{position:relative}
        .vf-region{
          display:flex;align-items:center;gap:6px;
          font-size:.72rem;color:#3D6880;font-family:'Geist Mono',monospace;
          background:rgba(255,255,255,.04);
          border:1px solid #1A3448;
          padding:5px 12px;border-radius:20px;
          cursor:pointer;transition:border-color .15s;
        }
        [data-mode="light"] .vf-region{background:rgba(0,0,0,.03);border-color:#C8DDEF;color:#527A96}
        .vf-region:hover{border-color:rgba(56,174,204,.35);color:#38AECC}
        [data-mode="light"] .vf-region:hover{color:#29A9D4}

        .vf-region-menu{
          position:absolute;right:0;top:calc(100% + 8px);
          width:210px;padding:12px;
          border-radius:14px;
          background:rgba(8,17,28,.96);
          border:1px solid rgba(255,255,255,.14);
          box-shadow:0 18px 40px rgba(0,0,0,.35);
          z-index:10;
        }
        [data-mode="light"] .vf-region-menu{
          background:rgba(255,255,255,.95);
          border-color:rgba(21,83,132,.12);
          box-shadow:0 18px 40px rgba(10,50,90,.14);
        }
        .vf-region-menu h4{
          font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
          margin:0 0 8px;color:#8BBAD6;
        }
        [data-mode="light"] .vf-region-menu h4{color:#5A8AA8}
        .vf-region-option{
          display:flex;align-items:center;justify-content:space-between;
          padding:8px 10px;border-radius:10px;
          cursor:pointer;transition:background .13s;
        }
        .vf-region-option:hover{background:rgba(56,174,204,.12)}
        [data-mode="light"] .vf-region-option:hover{background:rgba(41,169,212,.1)}
        .vf-region-option--active{font-weight:700;color:#38AECC}
        [data-mode="light"] .vf-region-option--active{color:#29A9D4}
      `}</style>

      <footer className="vf">
        <div className="vf-inner">

          {/* ── Community CTA strip ── */}
          <div className="vf-community">
            <div className="vf-community-left">
              <div className="vf-community-icon">
                <Zap size={16} style={{ color:"#38AECC" }}/>
              </div>
              <div>
                <div className="vf-community-title">Join the Velamini community</div>
                <div className="vf-community-sub">Connect with builders, get help, and share what you&apos;re creating</div>
              </div>
            </div>
            <div className="vf-community-right">
              <a href="https://coodic.slack.com/archives/C08MQ8XJ8AV" target="_blank" rel="noopener noreferrer" className="vf-comm-btn vf-comm-btn--slack">
                <MessageSquare size={13}/> Join Slack
              </a>
              <a href="/contact" className="vf-comm-btn vf-comm-btn--gh">
                <Mail size={13}/> Contact Support
              </a>
            </div>
          </div>

          {/* ── Main grid ── */}
          <div className="vf-grid">

            {/* Brand column */}
            <div className="vf-brand">
              <Link href="/" className="vf-logo">
                <div className="vf-logo-orb">
                  <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1rem", color:"#fff", fontWeight:400 }}>V</span>
                </div>
                <span className="vf-logo-name">Velamini</span>
              </Link>

              <p className="vf-tagline">
                AI agents and business intelligence for African organisations and individuals. Built in Kigali.
              </p>

              <div className="vf-status">
                <div className="vf-status-dot"/>
                All systems operational
              </div>

              <div className="vf-socials">
                {SOCIAL.map(({ Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="vf-social" title={label}>
                    <Icon size={14}/>
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(LINKS).map(([heading, links]) => (
              <div key={heading}>
                <div className="vf-col-title">{heading}</div>
                <ul className="vf-col-links">
                  {links.map(({ label, href, external, badge }: { label: string; href: string; external?: boolean; badge?: string }) => (
                    <li key={label}>
                      {external ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="vf-link">
                          {label}
                          <ArrowUpRight size={10} className="vf-ext-icon"/>
                        </a>
                      ) : (
                        <Link href={href} className="vf-link">
                          {label}
                          {badge && <span className="vf-link-badge">{badge}</span>}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>

          {/* ── Bottom bar ── */}
          <div className="vf-bottom">
            <div className="vf-copy">
              <span>© 2026 Velamini.</span>
              <span className="vf-copy-sep"/>
              
              <span>coodic <span className="vf-copy-love">made</span> it</span>
              <span className="vf-copy-sep"/>
              <span className="vf-copy-loc">
                <Globe size={10}/>
                Kigali, Rwanda
              </span>
            </div>

            <div className="vf-bottom-links">
              <a href="/terms"   className="vf-bot-link">Terms</a>
              <a href="/privacy" className="vf-bot-link">Privacy</a>
              <a href="/cookies" className="vf-bot-link">Cookies</a>
              <a href="/security" className="vf-bot-link">Security</a>
              <div className="vf-region-wrap" ref={menuRef}>
                <button className="vf-region" onClick={() => setMenuOpen(p => !p)}>
                  <Globe size={11}/> {locale} · {currency}
                </button>

                {menuOpen && (
                  <div className="vf-region-menu" role="menu">
                    <h4>Language</h4>
                    {[
                      { label: "English", value: "EN" },
                      { label: "Kinyarwanda", value: "RW" },
                    ].map(opt => (
                      <div
                        key={opt.value}
                        role="menuitem"
                        className={`vf-region-option${locale === opt.value ? " vf-region-option--active" : ""}`}
                        onClick={() => { setLocaleAndSave(opt.value); setMenuOpen(false); }}
                      >
                        <span>{opt.label}</span>
                        {locale === opt.value && <span>✓</span>}
                      </div>
                    ))}

                    <h4 style={{ marginTop: 12 }}>Currency</h4>
                    {[
                      { label: "RWF", value: "RWF" },
                      { label: "USD", value: "USD" },
                    ].map(opt => (
                      <div
                        key={opt.value}
                        role="menuitem"
                        className={`vf-region-option${currency === opt.value ? " vf-region-option--active" : ""}`}
                        onClick={() => { setCurrencyAndSave(opt.value); setMenuOpen(false); }}
                      >
                        <span>{opt.label}</span>
                        {currency === opt.value && <span>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="vf-region">
                <Globe size={11}/> EN 
              </button>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
