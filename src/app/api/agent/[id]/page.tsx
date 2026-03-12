"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Bot, User, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */
interface Msg {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface OrgInfo {
  agentName: string;
  orgName:   string;
  welcome:   string | null;
}

/* ── Helpers ──────────────────────────────────────────────────── */
function randomId() {
  return Math.random().toString(36).slice(2);
}

/* ── Typing indicator ─────────────────────────────────────────── */
function Typing() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "12px 16px" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: "block", width: 7, height: 7, borderRadius: "50%",
          background: "var(--c-accent)",
          animation: `vbounce 1.1s ease-in-out ${i * .18}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ── Message bubble ───────────────────────────────────────────── */
function Bubble({ msg, agentName, onFeedback }: { msg: Msg; agentName: string; onFeedback?: (r: 1 | -1) => void }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", gap: 10, padding: "4px 0",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end",
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isUser
          ? "color-mix(in srgb,var(--c-accent) 20%,transparent)"
          : "color-mix(in srgb,var(--c-bot) 20%,transparent)",
        color: isUser ? "var(--c-accent)" : "var(--c-bot)",
        fontSize: ".65rem",
      }}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      {/* Bubble only, no feedback */}
      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 4, alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div style={{
          padding: "10px 14px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser ? "var(--c-user-bubble)" : "var(--c-bot-bubble)",
          color: isUser ? "var(--c-user-fg)" : "var(--c-fg)",
          border: isUser ? "none" : "1px solid var(--c-border)",
          fontSize: ".86rem", lineHeight: 1.65, fontWeight: 400,
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}>
          {msg.content}
        </div>
      </div>
    </div>
  );
}
const feedBtn: React.CSSProperties = {
  background: "none", border: "1px solid var(--c-border)", borderRadius: 6,
  padding: "3px 6px", cursor: "pointer", color: "var(--c-muted)",
  display: "flex", alignItems: "center", transition: "color .12s, border-color .12s",
};

/* ─────────────────────────────────────────────────────────────── */
/*  PAGE                                                           */
/* ─────────────────────────────────────────────────────────────── */
export default function AgentChatPage({ params }: { params: Promise<{ id: string }> }) {
  const [orgId,     setOrgId]     = useState<string>("");
  const [orgInfo,   setOrgInfo]   = useState<OrgInfo | null>(null);
  const [notFound,  setNotFound]  = useState(false);
  const [messages,  setMessages]  = useState<Msg[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isDark,    setIsDark]    = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  /* ── Resolve params & fetch org info ────────────────────────── */
  useEffect(() => {
    params.then(({ id }) => {
      setOrgId(id);
      fetch(`/api/agent/${id}/info`)
        .then(r => r.json())
        .then(d => {
          if (d.error) { setNotFound(true); return; }
          setOrgInfo(d);
          if (d.welcome) {
            setMessages([{ role: "assistant", content: d.welcome, id: randomId() }]);
          } else {
            setMessages([{ role: "assistant", content: `Hi! I'm ${d.agentName}. How can I help you today?`, id: randomId() }]);
          }
        })
        .catch(() => setNotFound(true));
    });
  }, [params]);

  /* ── Dark mode ───────────────────────────────────────────────── */
  useEffect(() => {
    const prefer = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = localStorage.getItem("vela-chat-theme");
    setIsDark(stored ? stored === "dark" : prefer);
  }, []);

  const toggleTheme = () => setIsDark(p => {
    const n = !p;
    localStorage.setItem("vela-chat-theme", n ? "dark" : "light");
    return n;
  });

  /* ── Auto-scroll ─────────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── Send ────────────────────────────────────────────────────── */
  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !orgId) return;

    setInput("");
    setMessages(m => [...m, { role: "user", content: text, id: randomId() }]);
    setLoading(true);

    try {
      const res  = await fetch(`/api/agent/${orgId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages(m => [...m, { role: "assistant", content: data.error || "Sorry, something went wrong.", id: randomId() }]);
      } else {
        setSessionId(data.sessionId);
        setMessages(m => [...m, { role: "assistant", content: data.reply, id: randomId() }]);
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Sorry, I couldn't connect. Please try again.", id: randomId() }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, loading, orgId, sessionId]);

  /* ── Feedback ────────────────────────────────────────────────── */
  // Feedback logic removed

  /* ── Keyboard handler ────────────────────────────────────────── */
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  /* ── Auto-resize textarea ────────────────────────────────────── */
  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  /* ── Not found state ─────────────────────────────────────────── */
  if (notFound) {
    return (
      <>
        <style>{baseStyles(isDark)}</style>
        <div className={`vc-wrap${isDark ? " vdark" : ""}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <AlertCircle size={42} style={{ color: "var(--c-muted)", marginBottom: 12 }} />
            <h2 style={{ color: "var(--c-fg)", margin: "0 0 8px", fontSize: "1.1rem" }}>Agent not found</h2>
            <p style={{ color: "var(--c-muted)", fontSize: ".84rem" }}>This agent link may be invalid or the organisation has been disabled.</p>
          </div>
        </div>
      </>
    );
  }

  const agentName = orgInfo?.agentName ?? "…";

  return (
    <>
      <style>{baseStyles(isDark)}</style>

      <div className={`vc-wrap${isDark ? " vdark" : ""}`}>

        {/* ── Header ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "var(--c-surface)", borderBottom: "1px solid var(--c-border)",
          padding: "0 1.25rem", height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "color-mix(in srgb,var(--c-bot) 18%,transparent)",
              color: "var(--c-bot)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--c-fg)", lineHeight: 1.2 }}>{agentName}</div>
              {orgInfo && (
                <div style={{ fontSize: ".68rem", color: "var(--c-muted)" }}>{orgInfo.orgName}</div>
              )}
            </div>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
              boxShadow: "0 0 0 2px var(--c-surface)", marginLeft: 4,
            }} />
          </div>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            background: "var(--c-surface2)", border: "1px solid var(--c-border)",
            borderRadius: 8, padding: "6px 10px", cursor: "pointer",
            color: "var(--c-muted)", fontSize: ".7rem", fontFamily: "inherit",
          }}>
            {isDark ? "☀ Light" : "☾ Dark"}
          </button>
        </header>

        {/* ── Messages ── */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "1.25rem 1rem 1rem",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {!orgInfo && (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
              <Loader2 size={24} style={{ color: "var(--c-muted)", animation: "vspin 1s linear infinite" }} />
            </div>
          )}

          {messages.map(msg => (
            <Bubble
              key={msg.id}
              msg={msg}
              agentName={agentName}
            />
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "color-mix(in srgb,var(--c-bot) 20%,transparent)",
                color: "var(--c-bot)",
              }}>
                <Bot size={14} />
              </div>
              <div style={{
                background: "var(--c-bot-bubble)", border: "1px solid var(--c-border)",
                borderRadius: "18px 18px 18px 4px",
              }}>
                <Typing />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input area ── */}
        <div style={{
          padding: "12px 1rem 1rem",
          borderTop: "1px solid var(--c-border)",
          background: "var(--c-surface)",
        }}>
          <div style={{
            display: "flex", gap: 8, alignItems: "flex-end",
            background: "var(--c-surface2)", border: "1px solid var(--c-border)",
            borderRadius: 14, padding: "8px 8px 8px 14px",
            transition: "border-color .15s",
          }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={autoResize}
              onKeyDown={onKey}
              placeholder={orgInfo ? `Message ${agentName}…` : "Loading…"}
              disabled={!orgInfo || loading}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                resize: "none", fontFamily: "inherit", fontSize: ".88rem",
                color: "var(--c-fg)", lineHeight: 1.6, maxHeight: 140,
                overflowY: "auto", paddingTop: 3,
              } as React.CSSProperties}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading || !orgInfo}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "none",
                background: input.trim() && orgInfo ? "var(--c-accent)" : "var(--c-surface2)",
                color: input.trim() && orgInfo ? "#fff" : "var(--c-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() && orgInfo ? "pointer" : "default",
                transition: "background .15s, color .15s", flexShrink: 0,
              }}
            >
              {loading ? <Loader2 size={16} style={{ animation: "vspin 1s linear infinite" }} /> : <Send size={16} />}
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: ".6rem", color: "var(--c-muted)", margin: "8px 0 0" }}>
            Powered by <strong style={{ color: "var(--c-accent)" }}>Velamini</strong>
          </p>
        </div>

      </div>
    </>
  );
}

/* ── Base styles ─────────────────────────────────────────────── */
function baseStyles(isDark: boolean) {
  void isDark;
  return `
    @keyframes vbounce {
      0%,80%,100%{transform:translateY(0)}
      40%{transform:translateY(-6px)}
    }
    @keyframes vspin {
      from{transform:rotate(0deg)}
      to{transform:rotate(360deg)}
    }
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;padding:0;height:100%}
    :root{
      --c-page:    #f4f7fb;
      --c-surface: rgba(255,255,255,.92);
      --c-surface2:#f0f4f8;
      --c-border:  #d8e6f0;
      --c-fg:      #0c1a26;
      --c-muted:   #5a88a0;
      --c-accent:  #0ea5e9;
      --c-bot:     #7c3aed;
      --c-user-bubble: #0ea5e9;
      --c-user-fg:#fff;
      --c-bot-bubble:  #fff;
    }
    .vdark{
      --c-page:    #090e18;
      --c-surface: rgba(10,17,28,.95);
      --c-surface2:#0c1624;
      --c-border:  #1a2e44;
      --c-fg:      #e4f0fb;
      --c-muted:   #7097b8;
      --c-accent:  #38bdf8;
      --c-bot:     #a78bfa;
      --c-user-bubble: #0ea5e9;
      --c-user-fg:#fff;
      --c-bot-bubble:  #0d1e30;
    }
    .vc-wrap{
      display:flex;flex-direction:column;
      height:100dvh;max-height:100dvh;
      background:var(--c-page);
      font-family:system-ui,-apple-system,sans-serif;
      transition:background .3s,color .3s;
    }
    textarea::placeholder{color:var(--c-muted)}
    textarea:disabled::placeholder{opacity:.5}
    button:disabled{opacity:.5}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:4px}
  `;
}
