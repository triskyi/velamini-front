"use client";

import { useEffect, useState, useRef } from "react";
import Navbar, { applyTheme } from "@/components/Navbar";
import Footer from "@/components/footer";
import { Mail, MessageSquare, Phone, MapPin, Building, BookOpen, ChevronDown, Send, Check } from "lucide-react";

const CHANNELS = [
  {
    Icon: Mail,
    color: "#38AECC",
    title: "Email Support",
    value: "support@velamini.com",
    desc: "For billing, account issues, and general questions",
    response: "< 4 hours",
    href: "mailto:support@velamini.com",
  },
  {
    Icon: MessageSquare,
    color: "#818CF8",
    title: "Live Chat",
    value: "Open the chat widget",
    desc: "Talk to the Vela agent or get routed to the team",
    response: "Instant",
    href: "#",
  },
  {
    Icon: Building,
    color: "#34D399",
    title: "Sales & Partnerships",
    value: "hello@velamini.com",
    desc: "Custom plans, enterprise deals, and integrations",
    response: "< 1 business day",
    href: "mailto:hello@velamini.com",
  },
  {
    Icon: BookOpen,
    color: "#F59E0B",
    title: "Documentation",
    value: "docs.velamini.com",
    desc: "API reference, guides, and integration tutorials",
    response: "Self-serve 24/7",
    href: "/docs",
  },
];

const FAQS = [
  { q:"How do I get started?",             a:"Sign up at velamini.com — no credit card required. Your first agent can be live in under 10 minutes." },
  { q:"What payment methods do you accept?",a:"MTN MoMo, Airtel Money, Visa, Mastercard, and bank transfer — all via Flutterwave." },
  { q:"Do you offer custom enterprise plans?",a:"Yes. Contact hello@velamini.com and we'll put together a custom plan for your team or organisation." },
  { q:"Is my data secure?",                a:"Yes. We never train on your conversation data. All data is encrypted in transit and at rest." },
  { q:"Do you have a free plan?",          a:"Both Personal and Organisation accounts have free tiers — no time limit, no credit card needed." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="cf-item">
      <button className="cf-q" onClick={() => setOpen(p => !p)}>
        <span>{q}</span>
        <ChevronDown size={14} style={{ color:"var(--ac)", transform:open?"rotate(180deg)":"rotate(0deg)", transition:"transform .22s", flexShrink:0 }}/>
      </button>
      <div className="cf-body" style={{ maxHeight: open ? 200 : 0 }}>
        <p className="cf-a">{a}</p>
      </div>
    </div>
  );
}

type FormState = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [isDark, setIsDark] = useState(true);
  const [form, setForm] = useState({ name:"", email:"", subject:"general", message:"" });
  const [status, setStatus] = useState<FormState>("idle");
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

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

        .cpw{min-height:100dvh;padding-top:3.75rem;overflow-x:hidden;position:relative}
        .cpw-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
        .cpw-bg::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 70% 50% at 8% 5%,   color-mix(in srgb,var(--ac) 12%,transparent),transparent 55%),
            radial-gradient(ellipse 55% 45% at 92% 15%, color-mix(in srgb,var(--org) 9%,transparent),transparent 50%),
            var(--bg);
        }
        .cpw-bg::after{
          content:'';position:absolute;inset:0;
          background-image:radial-gradient(circle,color-mix(in srgb,var(--fg) 16%,transparent) 1px,transparent 1px);
          background-size:28px 28px;opacity:.09;
          mask-image:radial-gradient(ellipse 80% 70% at 50% 40%,black 20%,transparent 100%);
        }
        [data-mode="light"] .cpw-bg::after{opacity:.05}
        .corb{position:absolute;border-radius:50%;filter:blur(85px);opacity:.46;pointer-events:none;animation:corb 22s ease-in-out infinite alternate}
        [data-mode="light"] .corb{opacity:.17}
        .corb-1{width:500px;height:500px;background:radial-gradient(circle,color-mix(in srgb,var(--ac) 58%,transparent),transparent 72%);top:-110px;left:-90px}
        .corb-2{width:380px;height:380px;background:radial-gradient(circle,color-mix(in srgb,var(--org) 50%,transparent),transparent 72%);top:60px;right:-70px;animation-delay:-9s}
        @keyframes corb{0%{transform:translate(0,0)}100%{transform:translate(20px,-16px)}}
        .cpw>*:not(.cpw-bg){position:relative;z-index:1}

        /* Hero */
        .ch{text-align:center;padding:5rem 1.5rem 3.5rem;max-width:580px;margin:0 auto}
        .ch-pill{
          display:inline-flex;align-items:center;gap:6px;
          font-size:.6rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;
          color:var(--ac);background:color-mix(in srgb,var(--ac) 10%,transparent);
          border:1px solid color-mix(in srgb,var(--ac) 28%,transparent);
          padding:5px 14px;border-radius:20px;margin-bottom:1.4rem;
        }
        .ch-h1{
          font-family:'DM Serif Display',serif;
          font-size:clamp(2.2rem,5vw,3.4rem);font-weight:400;line-height:1.1;
          letter-spacing:-.03em;color:var(--fg);margin-bottom:1rem;
        }
        .ch-h1 em{font-style:italic;color:var(--ac)}
        .ch-sub{font-size:.9rem;color:var(--mu);line-height:1.78}

        /* Channels grid */
        .cchannels{
          display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
          gap:14px;max-width:1080px;margin:0 auto 3.5rem;padding:0 20px;
        }
        .cch{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:18px;
          padding:1.5rem;text-decoration:none;
          transition:transform .22s,box-shadow .22s,border-color .22s;
          display:flex;flex-direction:column;gap:.5rem;
        }
        [data-mode="light"] .cch{background:#fff;border-color:#C8DDEF}
        .cch:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.26);border-color:#1E3C58}
        [data-mode="light"] .cch:hover{box-shadow:0 12px 30px rgba(10,50,90,.1);border-color:#BDD9F0}
        .cch-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.3rem}
        .cch-ic{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center}
        .cch-resp{
          font-size:.62rem;font-weight:700;font-family:'Geist Mono',monospace;
          color:#3D6880;
        }
        [data-mode="light"] .cch-resp{color:var(--mu)}
        .cch-title{font-size:.9rem;font-weight:800;color:#C0DCF0;margin-bottom:.1rem}
        [data-mode="light"] .cch-title{color:var(--fg2)}
        .cch-val{font-size:.8rem;font-weight:600;color:var(--ac);margin-bottom:.2rem;font-family:'Geist Mono',monospace}
        .cch-desc{font-size:.76rem;color:#5B8FA8;line-height:1.6}
        [data-mode="light"] .cch-desc{color:var(--mu)}
        .cch-resp-row{display:flex;align-items:center;gap:5px;margin-top:.4rem}
        .cch-dot{width:6px;height:6px;border-radius:50%;background:#34D399;flex-shrink:0}

        /* Main layout */
        .cmain{
          display:grid;grid-template-columns:1fr 420px;
          gap:24px;max-width:1080px;margin:0 auto;padding:0 20px 5rem;
        }
        @media(max-width:840px){.cmain{grid-template-columns:1fr}}

        /* Form card */
        .cform-card{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:22px;
          padding:2rem;
        }
        [data-mode="light"] .cform-card{background:#fff;border-color:#C8DDEF}
        .cform-title{
          font-family:'DM Serif Display',serif;
          font-size:1.4rem;font-weight:400;color:#D4EEFF;margin-bottom:.4rem;
        }
        [data-mode="light"] .cform-title{color:#091828}
        .cform-sub{font-size:.8rem;color:#5B8FA8;margin-bottom:1.6rem;line-height:1.65}
        [data-mode="light"] .cform-sub{color:var(--mu)}
        .cform-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
        @media(max-width:600px){.cform-row{grid-template-columns:1fr}}
        .cform-group{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
        .cform-label{font-size:.72rem;font-weight:700;color:#8BBAD6;letter-spacing:.04em}
        [data-mode="light"] .cform-label{color:var(--fg2)}
        .cform-input,.cform-select,.cform-textarea{
          padding:11px 14px;
          background:#0F2030;border:1.5px solid #1A3448;border-radius:11px;
          font-family:inherit;font-size:.84rem;color:#D4EEFF;
          outline:none;transition:border-color .2s,box-shadow .2s;
          width:100%;
        }
        [data-mode="light"] .cform-input,[data-mode="light"] .cform-select,[data-mode="light"] .cform-textarea{
          background:#F8FBFF;border-color:#C8DDEF;color:#091828;
        }
        .cform-input::placeholder,.cform-textarea::placeholder{color:#3D6880}
        [data-mode="light"] .cform-input::placeholder,[data-mode="light"] .cform-textarea::placeholder{color:var(--mu)}
        .cform-input:focus,.cform-select:focus,.cform-textarea:focus{
          border-color:var(--ac);
          box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 14%,transparent);
        }
        .cform-textarea{resize:vertical;min-height:120px;line-height:1.6}
        .cform-select option{background:#0C1A28;color:#D4EEFF}
        [data-mode="light"] .cform-select option{background:#fff;color:#091828}
        .cform-btn{
          width:100%;padding:13px;border-radius:13px;border:none;
          background:var(--ac);color:#fff;
          font-family:inherit;font-size:.88rem;font-weight:700;
          cursor:pointer;transition:all .17s;
          display:flex;align-items:center;justify-content:center;gap:8px;
          box-shadow:0 4px 22px color-mix(in srgb,var(--ac) 38%,transparent);
          margin-top:4px;
        }
        .cform-btn:hover:not(:disabled){opacity:.88;transform:translateY(-1px);box-shadow:0 8px 30px color-mix(in srgb,var(--ac) 45%,transparent)}
        .cform-btn:disabled{opacity:.6;cursor:not-allowed}
        .cform-btn--sent{background:#34D399;box-shadow:0 4px 22px rgba(52,211,153,.35)}
        .cform-sending{animation:cspin .8s linear infinite}
        @keyframes cspin{to{transform:rotate(360deg)}}

        /* Sent state */
        .csent{
          text-align:center;padding:3rem 1rem;
          display:flex;flex-direction:column;align-items:center;gap:1rem;
        }
        .csent-icon{
          width:60px;height:60px;border-radius:50%;
          background:rgba(52,211,153,.15);border:2px solid #34D399;
          display:flex;align-items:center;justify-content:center;
        }
        .csent-h{font-family:'DM Serif Display',serif;font-size:1.5rem;font-weight:400;color:#D4EEFF}
        [data-mode="light"] .csent-h{color:#091828}
        .csent-sub{font-size:.84rem;color:#5B8FA8;line-height:1.7;max-width:280px}
        [data-mode="light"] .csent-sub{color:var(--mu)}

        /* Sidebar */
        .cside{display:flex;flex-direction:column;gap:16px}

        /* Office card */
        .coffice{
          background:#0D1E2E;border:1px solid #1A3448;border-radius:18px;
          padding:1.5rem;
        }
        [data-mode="light"] .coffice{background:#fff;border-color:#C8DDEF}
        .coffice-title{font-size:.9rem;font-weight:800;color:#C0DCF0;margin-bottom:1rem}
        [data-mode="light"] .coffice-title{color:var(--fg2)}
        .coffice-row{display:flex;gap:10px;align-items:flex-start;margin-bottom:.8rem}
        .coffice-row:last-child{margin-bottom:0}
        .coffice-ic{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .coffice-label{font-size:.72rem;font-weight:700;color:#5B8FA8;margin-bottom:.1rem;letter-spacing:.04em}
        [data-mode="light"] .coffice-label{color:var(--mu)}
        .coffice-val{font-size:.82rem;color:#C0DCF0;font-family:'Geist Mono',monospace}
        [data-mode="light"] .coffice-val{color:var(--fg2)}

        /* Map placeholder */
        .cmap{
          border-radius:16px;overflow:hidden;
          border:1px solid #1A3448;
          background:linear-gradient(135deg, #0D1E2E 0%, #08131E 100%);
          height:140px;display:flex;align-items:center;justify-content:center;
          flex-direction:column;gap:.5rem;
          position:relative;
        }
        [data-mode="light"] .cmap{background:linear-gradient(135deg, #E8F4FD 0%, #D8ECF9 100%);border-color:#C8DDEF}
        /* Dot grid inside map */
        .cmap::before{
          content:'';position:absolute;inset:0;
          background-image:radial-gradient(circle,color-mix(in srgb,var(--ac) 30%,transparent) 1px,transparent 1px);
          background-size:20px 20px;opacity:.25;
        }
        .cmap-pin{
          position:relative;z-index:1;
          width:36px;height:36px;border-radius:50%;background:color-mix(in srgb,var(--ac) 15%,transparent);
          border:2px solid var(--ac);display:flex;align-items:center;justify-content:center;
          animation:cpin 2s ease-in-out infinite;
        }
        @keyframes cpin{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .cmap-label{position:relative;z-index:1;font-size:.72rem;color:var(--ac);font-family:'Geist Mono',monospace;font-weight:600}

        /* Hours card */
        .chours{background:#0D1E2E;border:1px solid #1A3448;border-radius:18px;padding:1.5rem}
        [data-mode="light"] .chours{background:#fff;border-color:#C8DDEF}
        .chours-title{font-size:.9rem;font-weight:800;color:#C0DCF0;margin-bottom:1rem}
        [data-mode="light"] .chours-title{color:var(--fg2)}
        .chours-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem;font-size:.78rem}
        .chours-day{color:#5B8FA8}
        [data-mode="light"] .chours-day{color:var(--mu)}
        .chours-time{color:#C0DCF0;font-family:'Geist Mono',monospace;font-size:.72rem}
        [data-mode="light"] .chours-time{color:var(--fg2)}
        .chours-badge{
          display:inline-flex;align-items:center;gap:5px;
          font-size:.65rem;font-weight:700;color:#34D399;
          background:rgba(52,211,153,.12);padding:4px 10px;border-radius:20px;
          margin-top:.6rem;
        }
        .chours-dot{width:6px;height:6px;border-radius:50%;background:#34D399;animation:cpulse 2s ease-in-out infinite}
        @keyframes cpulse{0%,100%{opacity:1}50%{opacity:.4}}

        /* FAQ */
        .cfaq-wrap{max-width:1080px;margin:0 auto;padding:0 20px 5rem}
        .cfaq-hd{
          font-family:'DM Serif Display',serif;
          font-size:clamp(1.4rem,2.8vw,1.9rem);font-weight:400;
          text-align:center;margin-bottom:1.5rem;color:var(--fg);
        }
        .cfaq-card{
          max-width:640px;margin:0 auto;
          border-radius:18px;overflow:hidden;
          border:1px solid #1A3448;
          background:#0D1E2E;
          backdrop-filter:blur(14px);
          padding:0 22px;
        }
        [data-mode="light"] .cfaq-card{background:#fff;border-color:#C8DDEF}
        .cf-item{border-bottom:1px solid #132234}
        [data-mode="light"] .cf-item{border-color:var(--br)}
        .cf-item:last-child{border-bottom:none}
        .cf-q{
          width:100%;background:none;border:none;cursor:pointer;
          display:flex;justify-content:space-between;align-items:center;
          padding:16px 0;color:#C0DCF0;font-family:inherit;
          font-size:.86rem;font-weight:600;text-align:left;gap:12px;
          transition:color .15s;
        }
        [data-mode="light"] .cf-q{color:var(--fg)}
        .cf-q:hover{color:var(--ac)}
        .cf-body{overflow:hidden;transition:max-height .3s ease}
        .cf-a{margin:0 0 16px;font-size:.81rem;color:#5B8FA8;line-height:1.78}
        [data-mode="light"] .cf-a{color:var(--mu)}
      `}</style>

      <div className="cpw">
        <div className="cpw-bg" aria-hidden>
          <div className="corb corb-1"/><div className="corb corb-2"/>
        </div>

        <Navbar isDarkMode={isDark} onThemeToggle={toggleTheme}/>

        {/* Hero */}
        <section className="ch">
          <div className="ch-pill"><Mail size={9}/> Contact</div>
          <h1 className="ch-h1">We&apos;re here to <em>help</em></h1>
          <p className="ch-sub">
            From a quick question to a complex integration — reach out and the team will get back to you fast.
          </p>
        </section>

        {/* Contact channels */}
        <div className="cchannels">
          {CHANNELS.map(({ Icon, color, title, value, desc, response, href }) => (
            <a key={title} href={href} className="cch">
              <div className="cch-top">
                <div className="cch-ic" style={{ background:`${color}18` }}>
                  <Icon size={16} style={{ color }}/>
                </div>
              </div>
              <div className="cch-title">{title}</div>
              <div className="cch-val">{value}</div>
              <div className="cch-desc">{desc}</div>
              <div className="cch-resp-row">
                <div className="cch-dot"/>
                <span className="cch-resp">{response} response</span>
              </div>
            </a>
          ))}
        </div>

        {/* Main: form + sidebar */}
        <div className="cmain">
          {/* Form */}
          <div className="cform-card">
            {status === "sent" ? (
              <div className="csent">
                <div className="csent-icon"><Check size={26} style={{ color:"#34D399" }}/></div>
                <div className="csent-h">Message sent!</div>
                <p className="csent-sub">We&apos;ll get back to you at {form.email} within a few hours.</p>
                <button
                  onClick={() => { setStatus("idle"); setForm({ name:"", email:"", subject:"general", message:"" }); }}
                  style={{ fontSize:".78rem", color:"var(--ac)", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="cform-title">Send us a message</div>
                <p className="cform-sub">Fill in the form and we&apos;ll reply within 4 hours on business days.</p>
                <form ref={formRef} onSubmit={handleSubmit}>
                  <div className="cform-row">
                    <div className="cform-group">
                      <label className="cform-label">Your Name</label>
                      <input className="cform-input" placeholder="Mugisha Emmanuel" value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))} required/>
                    </div>
                    <div className="cform-group">
                      <label className="cform-label">Email Address</label>
                      <input className="cform-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email:e.target.value }))} required/>
                    </div>
                  </div>
                  <div className="cform-group">
                    <label className="cform-label">Subject</label>
                    <select className="cform-select" value={form.subject} onChange={e => setForm(p => ({ ...p, subject:e.target.value }))}>
                      <option value="general">General Question</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="technical">Technical Support</option>
                      <option value="enterprise">Enterprise & Partnerships</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Report a Bug</option>
                    </select>
                  </div>
                  <div className="cform-group">
                    <label className="cform-label">Message</label>
                    <textarea className="cform-textarea" placeholder="Tell us what you need..." value={form.message} onChange={e => setForm(p => ({ ...p, message:e.target.value }))} required/>
                  </div>
                  <button type="submit" className={`cform-btn${status === "sending" ? " cform-btn--sent" : ""}`} disabled={status === "sending"}>
                    {status === "sending"
                      ? <><span className="cform-sending">⟳</span> Sending…</>
                      : <><Send size={14}/> Send Message</>
                    }
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="cside">
            {/* Office info */}
            <div className="coffice">
              <div className="coffice-title">Our Office</div>
              {[
                { Icon:MapPin, color:"#38AECC", label:"Address",   val:"Kigali Innovation City\nKigali, Rwanda" },
                { Icon:Mail,   color:"#818CF8", label:"Email",     val:"support@velamini.com" },
                { Icon:Phone,  color:"#34D399", label:"WhatsApp",  val:"+250 783 897 863" },
              ].map(({ Icon, color, label, val }) => (
                <div key={label} className="coffice-row">
                  <div className="coffice-ic" style={{ background:`${color}18` }}>
                    <Icon size={14} style={{ color }}/>
                  </div>
                  <div>
                    <div className="coffice-label">{label}</div>
                    <div className="coffice-val">{val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map visual */}
            <div className="cmap">
              <div className="cmap-pin"><MapPin size={16} style={{ color:"var(--ac)" }}/></div>
              <span className="cmap-label">Kigali, Rwanda</span>
            </div>

            {/* Hours */}
            <div className="chours">
              <div className="chours-title">Support Hours</div>
              {[
                { day:"Monday – Friday",   time:"8:00 AM – 8:00 PM EAT" },
                { day:"Saturday",          time:"9:00 AM – 5:00 PM EAT" },
                { day:"Sunday",            time:"Emergency only" },
              ].map(({ day, time }) => (
                <div key={day} className="chours-row">
                  <span className="chours-day">{day}</span>
                  <span className="chours-time">{time}</span>
                </div>
              ))}
              <div className="chours-badge">
                <div className="chours-dot"/>
                AI agent online 24/7
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="cfaq-wrap">
          <div className="cfaq-hd">Quick answers</div>
          <div className="cfaq-card">
            {FAQS.map(f => <FaqItem key={f.q} {...f}/>)}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
