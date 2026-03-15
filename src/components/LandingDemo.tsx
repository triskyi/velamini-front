"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, MessageSquare, Wifi, Battery, Signal } from "lucide-react";
import { useAgentChat } from "@/hooks/useAgentChat";

const GREETING = "Hey! I'm Codi, Coodic's AI assistant. Ask me anything about what we do 👋";

const SUGGESTIONS = [
  "What does Coodic do?",
  "How do I get started?",
];

function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 0" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "var(--accent)", display: "inline-block",
          animation: `ld-dot 1.3s ${i * 0.2}s ease-in-out infinite`,
        }}/>
      ))}
    </span>
  );
}

export default function LandingDemo() {
  const { messages, loading, send } = useAgentChat({
    agentKey: process.env.NEXT_PUBLIC_EMBED_AGENT_KEY_DEMO,
    baseUrl: "/api/agent",
  });
  const [input, setInput]   = useState("");
  const [time,  setTime]    = useState("--:--");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTime(nowTime());
    const t = setInterval(() => setTime(nowTime()), 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await send(text);
  };

  const handleSuggestion = async (text: string) => {
    if (loading) return;
    await send(text);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <style>{`
        @keyframes ld-dot {
          0%,60%,100%{transform:translateY(0);opacity:.4}
          30%{transform:translateY(-4px);opacity:1}
        }
        @keyframes ld-msg-in {
          from{opacity:0;transform:translateY(6px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes ld-orb-pulse {
          0%,100%{opacity:.4} 50%{opacity:.7}
        }

        .ld-section{
          padding:6rem 0 5rem;
          position:relative;
          overflow:hidden;
          font-family:'DM Sans',system-ui,sans-serif;
        }
        .ld-orb{
          position:absolute;border-radius:50%;
          filter:blur(90px);pointer-events:none;
          animation:ld-orb-pulse 5s ease-in-out infinite;
        }
        .ld-inner{
          max-width:1060px;margin:0 auto;padding:0 24px;
          display:grid;grid-template-columns:1fr 300px;
          gap:64px;align-items:center;
        }
        @media(max-width:760px){
          .ld-inner{grid-template-columns:1fr;gap:36px;}
          .ld-left{text-align:center;}
          .ld-phone-col{display:flex;justify-content:center;}
        }

        /* ── Left text ── */
        .ld-badge{
          display:inline-flex;align-items:center;gap:7px;
          padding:5px 13px;border-radius:20px;
          background:color-mix(in srgb,var(--accent) 12%,transparent);
          color:var(--accent);font-size:.66rem;font-weight:700;
          letter-spacing:.1em;text-transform:uppercase;margin-bottom:1.2rem;
        }
        .ld-h2{
          font-family:'DM Serif Display',serif;
          font-size:clamp(2rem,4.5vw,3.2rem);
          font-weight:400;line-height:1.1;
          color:var(--fg);margin-bottom:1rem;
        }
        .ld-h2 em{font-style:italic;color:var(--accent);}
        .ld-sub{
          font-size:.95rem;color:var(--muted);line-height:1.7;
          max-width:400px;margin-bottom:2rem;
        }
        .ld-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:2rem;}
        .ld-pill{
          display:flex;align-items:center;gap:6px;
          padding:7px 13px;border-radius:100px;
          border:1px solid var(--border2);background:var(--bg-card);
          font-size:.76rem;font-weight:500;color:var(--fg);
        }
        .ld-pdot{
          width:6px;height:6px;border-radius:50%;background:#22c55e;
          box-shadow:0 0 0 3px rgba(34,197,94,.18);
        }
        .ld-cta{
          display:inline-flex;align-items:center;gap:7px;
          padding:12px 24px;border-radius:100px;
          background:var(--accent);color:#fff;
          font-size:.86rem;font-weight:700;text-decoration:none;
          border:none;cursor:pointer;font-family:inherit;
          transition:transform .16s,box-shadow .16s;
          box-shadow:0 5px 20px color-mix(in srgb,var(--accent) 32%,transparent);
        }
        .ld-cta:hover{
          transform:translateY(-2px);
          box-shadow:0 10px 28px color-mix(in srgb,var(--accent) 42%,transparent);
        }

        /* ── Phone ── */
        .ld-phone{
          width:280px;
          height:560px;
          border-radius:42px;
          background:var(--bg-card);
          border:1.5px solid color-mix(in srgb,var(--fg) 14%,transparent);
          box-shadow:
            0 0 0 5px color-mix(in srgb,var(--fg) 5%,transparent),
            0 32px 64px rgba(0,0,0,.35),
            inset 0 1px 0 color-mix(in srgb,var(--fg) 10%,transparent);
          overflow:hidden;
          display:flex;flex-direction:column;
          position:relative;
        }
        .ld-island{
          position:absolute;top:11px;left:50%;
          transform:translateX(-50%);
          width:80px;height:22px;
          background:#000;border-radius:100px;z-index:10;
        }
        .ld-statusbar{
          display:flex;align-items:center;justify-content:space-between;
          padding:44px 18px 3px;
          font-size:.62rem;font-weight:600;color:var(--fg);
          flex-shrink:0;
        }
        .ld-statusbar-r{display:flex;align-items:center;gap:4px;}

        .ld-chathead{
          display:flex;align-items:center;gap:9px;
          padding:8px 14px 10px;
          border-bottom:1px solid var(--border);
          flex-shrink:0;
        }
        .ld-av{
          width:32px;height:32px;border-radius:50%;
          background:linear-gradient(135deg,var(--accent),#38bdf8);
          display:flex;align-items:center;justify-content:center;
          font-size:.68rem;font-weight:800;color:#fff;flex-shrink:0;
        }
        .ld-agname{font-size:.78rem;font-weight:700;color:var(--fg);margin-bottom:1px;}
        .ld-agstatus{display:flex;align-items:center;gap:4px;font-size:.6rem;color:var(--muted);}
        .ld-greendot{width:5px;height:5px;border-radius:50%;background:#22c55e;}

        /* msgs scroll */
        .ld-msgs{
          flex:1;overflow-y:auto;
          padding:12px 12px 6px;
          display:flex;flex-direction:column;gap:8px;
          scrollbar-width:none;
        }
        .ld-msgs::-webkit-scrollbar{display:none;}

        /* empty */
        .ld-empty{
          flex:1;display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          gap:10px;text-align:center;padding:8px;
        }
        .ld-empty-ic{
          width:44px;height:44px;border-radius:13px;
          background:color-mix(in srgb,var(--accent) 12%,transparent);
          display:flex;align-items:center;justify-content:center;
        }
        .ld-empty-title{font-size:.76rem;font-weight:700;color:var(--fg);margin-bottom:2px;}
        .ld-empty-sub{font-size:.66rem;color:var(--muted);line-height:1.5;}
        .ld-sugs{display:flex;flex-direction:column;gap:4px;width:100%;margin-top:4px;}
        .ld-sug{
          padding:6px 11px;border-radius:9px;
          border:1px solid var(--border2);background:var(--bg2);
          font-size:.65rem;color:var(--muted);
          cursor:pointer;text-align:left;
          transition:border-color .13s,color .13s;
          font-family:inherit;
        }
        .ld-sug:hover:not(:disabled){border-color:var(--accent);color:var(--accent);}
        .ld-sug:disabled{opacity:.5;cursor:not-allowed;}

        /* bubbles */
        .ld-row{display:flex;gap:5px;align-items:flex-end;animation:ld-msg-in .2s ease both;}
        .ld-row--user{justify-content:flex-end;}
        .ld-row--asst{justify-content:flex-start;}
        .ld-bub{
          max-width:80%;padding:8px 12px;
          border-radius:16px;font-size:.74rem;line-height:1.5;
        }
        .ld-bub--user{
          background:var(--accent);color:#fff;
          border-bottom-right-radius:3px;
          box-shadow:0 2px 10px color-mix(in srgb,var(--accent) 28%,transparent);
        }
        .ld-bub--asst{
          background:var(--bg2);color:var(--fg);
          border:1px solid var(--border);
          border-bottom-left-radius:3px;
        }
        .ld-ts{
          font-size:.52rem;color:var(--muted);
          margin-top:2px;padding:0 3px;flex-shrink:0;align-self:flex-end;
        }
        .ld-mini-av{
          width:20px;height:20px;border-radius:50%;
          background:linear-gradient(135deg,var(--accent),#38bdf8);
          display:flex;align-items:center;justify-content:center;
          font-size:.46rem;font-weight:800;color:#fff;flex-shrink:0;
        }

        /* input */
        .ld-inputbar{
          display:flex;align-items:center;gap:7px;
          padding:8px 12px 14px;
          border-top:1px solid var(--border);
          flex-shrink:0;
        }
        .ld-inp{
          flex:1;padding:8px 12px;border-radius:100px;
          border:1.5px solid var(--border2);
          background:var(--bg2);color:var(--fg);
          font-size:.74rem;font-family:inherit;outline:none;
          transition:border-color .14s;
        }
        .ld-inp:focus{border-color:var(--accent);}
        .ld-inp::placeholder{color:var(--muted);}
        .ld-inp:disabled{opacity:.6;}
        .ld-sendbtn{
          width:32px;height:32px;border-radius:50%;
          border:none;cursor:pointer;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          transition:transform .14s,box-shadow .14s;
        }
        .ld-sendbtn--on{
          background:var(--accent);color:#fff;
          box-shadow:0 3px 12px color-mix(in srgb,var(--accent) 38%,transparent);
        }
        .ld-sendbtn--on:hover{transform:scale(1.07);}
        .ld-sendbtn--off{background:var(--border);color:var(--muted);cursor:not-allowed;}

        .ld-homebar{
          height:18px;display:flex;align-items:center;justify-content:center;
          flex-shrink:0;
        }
        .ld-homebar-line{
          width:88px;height:3px;border-radius:100px;
          background:color-mix(in srgb,var(--fg) 18%,transparent);
        }
      `}</style>

      <section className="ld-section">

        {/* Orbs — static, no movement */}
        <div className="ld-orb" style={{
          width:440,height:440,
          background:"color-mix(in srgb,var(--accent) 16%,transparent)",
          top:-120,right:-60,animationDelay:"0s",
        }}/>
        <div className="ld-orb" style={{
          width:360,height:360,
          background:"color-mix(in srgb,var(--org) 10%,transparent)",
          bottom:-80,left:-60,animationDelay:"2.5s",
        }}/>

        <div className="ld-inner">

          {/* Left copy */}
          <motion.div
            className="ld-left"
            initial={{ opacity:0, x:-24 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:.5 }}
          >
            <div className="ld-badge"><Sparkles size={10}/> Live Demo</div>

            <h2 className="ld-h2">
              See your AI agent<br/><em>in action</em>
            </h2>

            <p className="ld-sub">
              This is exactly what your customers see — instant, intelligent replies on WhatsApp and web chat, around the clock. No signup needed to try it.
            </p>

            <div className="ld-pills">
              <div className="ld-pill"><div className="ld-pdot"/> Under 1 second reply</div>
              <div className="ld-pill"><div className="ld-pdot"/> Trained on your content</div>
              <div className="ld-pill"><div className="ld-pdot"/> Works on WhatsApp</div>
            </div>

            <a href="/onboarding" className="ld-cta">
              Build your agent free →
            </a>
          </motion.div>

          {/* Phone */}
          <motion.div
            className="ld-phone-col"
            initial={{ opacity:0, y:24 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:.55, delay:.12 }}
          >
            <div className="ld-phone">

              <div className="ld-island"/>

              {/* Status bar */}
              <div className="ld-statusbar">
                <span>{time}</span>
                <div className="ld-statusbar-r">
                  <Signal size={10}/><Wifi size={10}/><Battery size={10}/>
                </div>
              </div>

              {/* Chat header */}
              <div className="ld-chathead">
                <div className="ld-av">C</div>
                <div style={{ flex:1 }}>
                  <div className="ld-agname">codi</div>
                  <div className="ld-agstatus">
                    <div className="ld-greendot"/>
                    <span>Online now</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="ld-msgs" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="ld-empty">
                    <div className="ld-empty-ic">
                      <MessageSquare size={20} style={{ color:"var(--accent)" }}/>
                    </div>
                    <div>
                      <div className="ld-empty-title">Chat with Codi</div>
                      <div className="ld-empty-sub">{GREETING}</div>
                    </div>
                    <div className="ld-sugs">
                      {SUGGESTIONS.map(s => (
                        <button
                          key={s}
                          className="ld-sug"
                          disabled={loading}
                          onClick={() => handleSuggestion(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <div key={i} className={`ld-row ld-row--${msg.role === "user" ? "user" : "asst"}`}>
                        {msg.role === "assistant" && <div className="ld-mini-av">C</div>}
                        <div>
                          <div className={`ld-bub ld-bub--${msg.role === "user" ? "user" : "asst"}`}>
                            {msg.content}
                          </div>
                          <div className="ld-ts" style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
                            {time}
                          </div>
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="ld-row ld-row--asst">
                        <div className="ld-mini-av">C</div>
                        <div className="ld-bub ld-bub--asst">
                          <TypingDots/>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              <div className="ld-inputbar">
                <input
                  className="ld-inp"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Message Codi…"
                  disabled={loading}
                />
                <button
                  className={`ld-sendbtn ${input.trim() && !loading ? "ld-sendbtn--on" : "ld-sendbtn--off"}`}
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                >
                  <Send size={13}/>
                </button>
              </div>

              <div className="ld-homebar"><div className="ld-homebar-line"/></div>

            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
}
