"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Bot, User as UserIcon, FlaskConical } from "lucide-react";
import type { Organization } from "@/types/organization/org-type";

type Message = { id: number; role: "user" | "assistant"; content: string };

interface OrgChatProps {
  org: Organization;
}

export default function OrgChat({ org }: OrgChatProps) {
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const textareaRef             = useRef<HTMLTextAreaElement>(null);

  const agentName = org.agentName || org.displayName || org.name;
  const hasApiKey = Boolean(org.apiKey);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`oc_chat_${org.id}`);
      if (raw) {
        const stored = JSON.parse(raw);
        if (stored.messages) setMessages(stored.messages);
        if (stored.sessionId) setSessionId(stored.sessionId);
      }
    } catch {}
  }, [org.id]);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(`oc_chat_${org.id}`, JSON.stringify({ messages, sessionId }));
      } else {
        localStorage.removeItem(`oc_chat_${org.id}`);
      }
    } catch {}
  }, [messages, sessionId, org.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleNew = () => { setMessages([]); setInput(""); setSessionId(null); };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input.trim() };
    setMessages(p => [...p, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Agent-Key": org.apiKey || "",
        },
        body: JSON.stringify({
          message: userMsg.content,
          sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Unable to send message");
      }
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages(p => [...p, {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply ?? "Sorry, I couldn't respond.",
      }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Connection issue. Please try again.";
      setMessages(p => [...p, {
        id: Date.now() + 1,
        role: "assistant",
        content: message,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        .oc{display:flex;flex-direction:column;flex:1;min-height:0;height:100%;background:var(--c-bg);transition:background .3s}

        .oc-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--c-border);background:var(--c-surface);flex-shrink:0;transition:background .3s,border-color .3s}
        @media(min-width:600px){.oc-head{padding:16px 24px}}
        .oc-head-left{display:flex;align-items:center;gap:10px}
        .oc-head-av{width:36px;height:36px;border-radius:10px;background:var(--c-org-soft);border:2px solid color-mix(in srgb,var(--c-org) 30%,transparent);display:flex;align-items:center;justify-content:center;color:var(--c-org);flex-shrink:0}
        .oc-head-av svg{width:16px;height:16px}
        .oc-head-name{font-size:.9rem;font-weight:700;color:var(--c-text)}
        .oc-head-role{font-size:.7rem;color:var(--c-muted);margin-top:1px}
        .oc-badge{display:inline-flex;align-items:center;gap:5px;font-size:.62rem;font-weight:700;letter-spacing:.04em;padding:2px 8px;border-radius:20px;background:color-mix(in srgb,var(--c-org) 12%,transparent);color:var(--c-org)}
        .oc-badge-dot{width:5px;height:5px;border-radius:50%;background:var(--c-org)}
        .oc-new-btn{display:flex;align-items:center;gap:5px;padding:0 12px;height:32px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);font-size:.75rem;font-weight:600;cursor:pointer;transition:all .14s;font-family:inherit}
        .oc-new-btn:hover{color:var(--c-org);border-color:var(--c-org);background:var(--c-org-soft)}
        .oc-new-btn svg{width:12px;height:12px}

        .oc-test-banner{margin:12px 14px 0;padding:9px 13px;border-radius:10px;background:color-mix(in srgb,var(--c-org) 8%,transparent);border:1px solid color-mix(in srgb,var(--c-org) 20%,transparent);font-size:.74rem;color:var(--c-muted);display:flex;align-items:center;gap:8px;flex-shrink:0}
        .oc-test-banner svg{width:13px;height:13px;color:var(--c-org);flex-shrink:0}
        @media(min-width:600px){.oc-test-banner{margin:12px 24px 0}}

        .oc-msgs{flex:1;overflow-y:auto;padding:18px 14px;display:flex;flex-direction:column;gap:14px;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent;-webkit-overflow-scrolling:touch}
        @media(min-width:600px){.oc-msgs{padding:20px 24px}}
        .oc-msgs::-webkit-scrollbar{width:3px}
        .oc-msgs::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:3px}

        .oc-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;opacity:.7;user-select:none;text-align:center;padding:40px 20px}
        .oc-empty-ic{width:56px;height:56px;border-radius:16px;background:var(--c-org-soft);border:2px solid color-mix(in srgb,var(--c-org) 25%,transparent);display:flex;align-items:center;justify-content:center;color:var(--c-org)}
        .oc-empty-ic svg{width:22px;height:22px}
        .oc-empty-title{font-family:'DM Serif Display',serif;font-size:1.1rem;color:var(--c-text)}
        .oc-empty-sub{font-size:.78rem;color:var(--c-muted);max-width:280px;line-height:1.5}

        .oc-row{display:flex;gap:10px;max-width:680px}
        .oc-row--user{align-self:flex-end;flex-direction:row-reverse}
        .oc-row--ai{align-self:flex-start}
        .oc-av{width:30px;height:30px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1px solid var(--c-border);overflow:hidden;margin-top:2px}
        .oc-av--ai{background:var(--c-org-soft);color:var(--c-org);border-color:color-mix(in srgb,var(--c-org) 25%,transparent)}
        .oc-av--user{background:var(--c-surface-2);color:var(--c-muted)}
        .oc-av svg{width:14px;height:14px}
        .oc-bwrap{display:flex;flex-direction:column;gap:3px}
        .oc-sender{font-size:.68rem;font-weight:600;color:var(--c-muted);padding:0 3px}
        .oc-row--user .oc-sender{text-align:right}
        .oc-bubble{padding:10px 14px;border-radius:14px;font-size:.855rem;line-height:1.6;color:var(--c-text);max-width:min(72vw,440px);word-break:break-word;transition:background .3s}
        .oc-bubble--ai{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px 14px 14px 3px}
        .oc-bubble--user{background:var(--c-org);color:#fff;border-radius:14px 14px 3px 14px}
        .oc-time{font-size:.62rem;color:var(--c-muted);padding:0 3px}
        .oc-row--user .oc-time{text-align:right}

        .oc-typing{display:flex;align-items:center;gap:5px;padding:10px 14px;border-radius:14px 14px 14px 3px;background:var(--c-surface);border:1px solid var(--c-border)}
        .oc-dot{width:7px;height:7px;border-radius:50%;background:var(--c-muted);animation:ocbounce 1.2s infinite}
        .oc-dot:nth-child(2){animation-delay:.18s}
        .oc-dot:nth-child(3){animation-delay:.36s}
        @keyframes ocbounce{0%,80%,100%{transform:scale(.8);opacity:.5}40%{transform:scale(1.15);opacity:1}}

        .oc-input-wrap{flex-shrink:0;padding:12px 14px 14px;border-top:1px solid var(--c-border);background:var(--c-surface);transition:background .3s,border-color .3s}
        @media(min-width:600px){.oc-input-wrap{padding:14px 24px 18px}}
        .oc-input-row{display:flex;align-items:flex-end;gap:8px;background:var(--c-surface-2);border:1.5px solid var(--c-border);border-radius:13px;padding:8px 8px 8px 14px;transition:border-color .15s}
        .oc-input-row:focus-within{border-color:var(--c-org)}
        .oc-textarea{flex:1;background:none;border:none;outline:none;resize:none;font-size:.88rem;line-height:1.5;color:var(--c-text);font-family:inherit;min-height:24px;max-height:120px;padding:0;overflow-y:auto}
        .oc-textarea::placeholder{color:var(--c-muted)}
        .oc-send{width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--c-org);color:#fff;border:none;cursor:pointer;transition:all .14s}
        .oc-send:hover{background:color-mix(in srgb,var(--c-org) 80%,black)}
        .oc-send:disabled{opacity:.45;cursor:not-allowed}
        .oc-send svg{width:14px;height:14px}
        .oc-hint{font-size:.68rem;color:var(--c-muted);text-align:center;margin-top:7px}
      `}</style>

      <div className="oc">
        {/* Header */}
        <div className="oc-head">
          <div className="oc-head-left">
            <div className="oc-head-av"><Bot /></div>
            <div>
              <div className="oc-head-name">{agentName}</div>
              <div className="oc-head-role">AI agent · {org.displayName ?? org.name}</div>
            </div>
            <div className="oc-badge"><span className="oc-badge-dot" /> Test mode</div>
          </div>
          <button className="oc-new-btn" onClick={handleNew}><Plus size={12} /> New chat</button>
        </div>

        {/* Test banner */}
        <div className="oc-test-banner">
          <FlaskConical />
          This is a private test session using your public agent endpoint.
        </div>

        {/* Messages */}
        <div className="oc-msgs">
          {messages.length === 0 ? (
            <div className="oc-empty">
              <div className="oc-empty-ic"><Bot /></div>
              <div className="oc-empty-title">Test your agent</div>
              <div className="oc-empty-sub">
                Send a message to see how <strong>{agentName}</strong> responds to your customers.
                {!org.knowledgeBase?.isModelTrained && (
                  <span style={{ display: "block", marginTop: 8, color: "var(--c-warn)" }}>
                    ⚠ Agent not yet trained — responses will be generic until you train it.
                  </span>
                )}
              </div>
            </div>
          ) : (
            messages.map(msg => {
              const isUser = msg.role === "user";
              const t = new Date(msg.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={msg.id} className={`oc-row ${isUser ? "oc-row--user" : "oc-row--ai"}`}>
                  <div className={`oc-av ${isUser ? "oc-av--user" : "oc-av--ai"}`}>
                    {isUser ? <UserIcon /> : <Bot />}
                  </div>
                  <div className="oc-bwrap">
                    <div className="oc-sender">{isUser ? "You" : agentName}</div>
                    <div className={`oc-bubble ${isUser ? "oc-bubble--user" : "oc-bubble--ai"}`}>
                      {msg.content}
                    </div>
                    <div className="oc-time">{t}</div>
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="oc-row oc-row--ai">
              <div className="oc-av oc-av--ai"><Bot /></div>
              <div className="oc-typing">
                <div className="oc-dot" /><div className="oc-dot" /><div className="oc-dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="oc-input-wrap">
          {!hasApiKey && (
            <div style={{
              marginBottom: 10,
              fontSize: ".75rem",
              color: "var(--c-danger)",
              background: "var(--c-danger-soft)",
              border: "1px solid color-mix(in srgb,var(--c-danger) 30%,transparent)",
              borderRadius: 10,
              padding: "8px 10px"
            }}>
              Missing API key for this organization. Generate one from API & Embed tab.
            </div>
          )}
          <div className="oc-input-row">
            <textarea
              ref={textareaRef}
              className="oc-textarea"
              value={input}
              onChange={handleInput}
              onKeyDown={onKey}
              placeholder={`Message ${agentName}…`}
              rows={1}
            />
            <button className="oc-send" onClick={sendMessage} disabled={!input.trim() || isTyping || !hasApiKey}>
              <Send size={14} />
            </button>
          </div>
          <div className="oc-hint">Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </>
  );
}
