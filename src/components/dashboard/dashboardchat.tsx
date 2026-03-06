"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Bot, User as UserIcon } from "lucide-react";

type Message = { id: number; role: "user" | "assistant"; content: string };

interface DashboardChatProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  knowledgeBase?: any;
}

export default function DashboardChat({ user, knowledgeBase }: DashboardChatProps) {
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const textareaRef             = useRef<HTMLTextAreaElement>(null);

  // Persist chat
  useEffect(() => {
    try {
      const saved = localStorage.getItem("v_dash_chat");
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (messages.length > 0) localStorage.setItem("v_dash_chat", JSON.stringify(messages));
      else localStorage.removeItem("v_dash_chat");
    } catch {}
  }, [messages]);

  // Auto scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleNew = () => { setMessages([]); setInput(""); };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input.trim() };
    setMessages(p => [...p, userMsg]);
    setInput("");
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
    setIsTyping(true);

    // Save Q&A if prior message was a question
    const lastAI = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAI && /\?$/.test(lastAI.content.trim())) {
      fetch("/api/knowledgebase/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: lastAI.content.trim(), answer: userMsg.content }),
      }).catch(() => {});
    }

    const systemPrompt = `You are a digital twin being trained by ${user?.name || "the user"}. 
Always refer to them as your trainer/creator. You are their virtual self and are here to learn from them. 
Respond concisely and helpfully.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          knowledgeBase: knowledgeBase || null,
          systemPrompt,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages(p => [...p, { id: Date.now() + 1, role: "assistant", content: data.reply ?? data.text ?? data.message ?? "Sorry, I couldn't respond." }]);
    } catch {
      setMessages(p => [...p, { id: Date.now() + 1, role: "assistant", content: "Connection issue. Please try again." }]);
    } finally { setIsTyping(false); }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        .dc {
          display: flex; flex-direction: column;
          height: 100%; min-height: calc(100dvh - 52px);
          background: var(--c-bg); transition: background .3s;
        }
        @media(min-width:1024px){ .dc { min-height: calc(100vh - 56px); } }

        /* Header */
        .dc-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid var(--c-border);
          background: var(--c-surface); flex-shrink: 0;
          transition: background .3s, border-color .3s;
        }
        @media(min-width:600px){ .dc-head { padding: 16px 24px; } }
        .dc-head-left { display: flex; align-items: center; gap: 10px; }
        .dc-head-av {
          width: 36px; height: 36px; border-radius: 10px; object-fit: cover;
          border: 2px solid var(--c-accent); flex-shrink: 0;
        }
        .dc-head-name { font-size: .9rem; font-weight: 700; color: var(--c-text); }
        .dc-head-role { font-size: .7rem; color: var(--c-muted); margin-top: 1px; }
        .dc-head-online {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: .65rem; font-weight: 700; color: #22C55E;
          background: rgba(34,197,94,.1); padding: 2px 8px; border-radius: 20px;
        }
        .dc-head-online-dot { width: 5px; height: 5px; border-radius: 50%; background: #22C55E; }

        .dc-new-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 0 12px; height: 32px; border-radius: 8px;
          border: 1px solid var(--c-border); background: var(--c-surface-2);
          color: var(--c-muted); font-size: .75rem; font-weight: 600;
          cursor: pointer; transition: all .14s; font-family: inherit;
        }
        .dc-new-btn:hover { color: var(--c-accent); border-color: var(--c-accent); background: var(--c-accent-soft); }
        .dc-new-btn svg { width: 12px; height: 12px; }

        /* Messages */
        .dc-msgs {
          flex: 1; overflow-y: auto; padding: 18px 14px;
          display: flex; flex-direction: column; gap: 14px;
          scrollbar-width: thin; scrollbar-color: var(--c-border) transparent;
          -webkit-overflow-scrolling: touch;
        }
        @media(min-width:600px){ .dc-msgs { padding: 24px 24px; } }
        .dc-msgs::-webkit-scrollbar { width: 3px; }
        .dc-msgs::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 3px; }

        /* Empty state */
        .dc-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          opacity: .65; user-select: none; text-align: center;
          padding: 40px 20px;
        }
        .dc-empty-av {
          width: 64px; height: 64px; border-radius: 18px; object-fit: cover;
          border: 2px solid var(--c-border);
        }
        .dc-empty-title { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: var(--c-text); }
        .dc-empty-sub { font-size: .8rem; color: var(--c-muted); }

        /* Message rows */
        .dc-row { display: flex; gap: 10px; max-width: 680px; }
        .dc-row--user { align-self: flex-end; flex-direction: row-reverse; }
        .dc-row--ai { align-self: flex-start; }

        .dc-av-wrap {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--c-surface-2); border: 1px solid var(--c-border); overflow: hidden;
          margin-top: 2px;
        }
        .dc-av-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .dc-av-wrap svg { width: 14px; height: 14px; color: var(--c-muted); }

        .dc-bubble-wrap { display: flex; flex-direction: column; gap: 3px; }
        .dc-sender { font-size: .68rem; font-weight: 600; color: var(--c-muted); padding: 0 3px; }
        .dc-row--user .dc-sender { text-align: right; }

        .dc-bubble {
          padding: 10px 14px; border-radius: 14px;
          font-size: .855rem; line-height: 1.6; color: var(--c-text);
          max-width: min(72vw, 440px); word-break: break-word;
          transition: background .3s;
        }
        .dc-bubble--ai {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: 14px 14px 14px 3px;
        }
        .dc-bubble--user {
          background: var(--c-accent);
          color: #fff;
          border-radius: 14px 14px 3px 14px;
        }
        .dc-time { font-size: .62rem; color: var(--c-muted); padding: 0 3px; }
        .dc-row--user .dc-time { text-align: right; }

        /* Typing dots */
        .dc-typing {
          display: flex; align-items: center; gap: 5px;
          padding: 10px 14px; border-radius: 14px 14px 14px 3px;
          background: var(--c-surface); border: 1px solid var(--c-border);
        }
        .dc-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--c-muted);
          animation: dcbounce 1.2s infinite;
        }
        .dc-dot:nth-child(2) { animation-delay: .18s; }
        .dc-dot:nth-child(3) { animation-delay: .36s; }
        @keyframes dcbounce { 0%,80%,100%{transform:scale(.8);opacity:.5} 40%{transform:scale(1.15);opacity:1} }

        /* Input */
        .dc-input-wrap {
          flex-shrink: 0; padding: 12px 14px 14px;
          border-top: 1px solid var(--c-border);
          background: var(--c-surface); transition: background .3s, border-color .3s;
        }
        @media(min-width:600px){ .dc-input-wrap { padding: 14px 24px 18px; } }
        .dc-input-row {
          display: flex; align-items: flex-end; gap: 8px;
          background: var(--c-surface-2);
          border: 1.5px solid var(--c-border);
          border-radius: 13px; padding: 8px 8px 8px 14px;
          transition: border-color .15s;
        }
        .dc-input-row:focus-within { border-color: var(--c-accent); }
        .dc-textarea {
          flex: 1; background: none; border: none; outline: none; resize: none;
          font-size: .88rem; line-height: 1.5; color: var(--c-text);
          font-family: inherit; min-height: 24px; max-height: 120px;
          padding: 0; overflow-y: auto;
        }
        .dc-textarea::placeholder { color: var(--c-muted); }
        .dc-send {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--c-accent); color: #fff;
          border: none; cursor: pointer; transition: all .14s;
        }
        .dc-send:hover { background: var(--c-accent-dim); }
        .dc-send:disabled { opacity: .45; cursor: not-allowed; }
        .dc-send svg { width: 14px; height: 14px; }
        .dc-hint { font-size: .68rem; color: var(--c-muted); text-align: center; margin-top: 7px; }
      `}</style>

      <div className="dc">
        {/* Header */}
        <div className="dc-head">
          <div className="dc-head-left">
            <img src={user?.image || "/logo.png"} alt={user?.name ?? "AI"} className="dc-head-av" />
            <div>
              <div className="dc-head-name">{user?.name ?? "Velamini AI"}</div>
              <div className="dc-head-role">Digital twin · AI assistant</div>
            </div>
            <div className="dc-head-online"><span className="dc-head-online-dot" /> Online</div>
          </div>
          <button className="dc-new-btn" onClick={handleNew}><Plus size={12} /> New chat</button>
        </div>

        {/* Messages */}
        <div className="dc-msgs">
          {messages.length === 0 ? (
            <div className="dc-empty">
              <img src="/logo.png" alt="AI" className="dc-empty-av" />
              <div className="dc-empty-title">Start a conversation</div>
              <div className="dc-empty-sub">Ask anything — your AI twin is ready to learn.</div>
            </div>
          ) : (
            messages.map(msg => {
              const isUser = msg.role === "user";
              const t = new Date(msg.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={msg.id} className={`dc-row ${isUser ? "dc-row--user" : "dc-row--ai"}`}>
                  <div className="dc-av-wrap">
                    {isUser
                      ? (user?.image ? <img src={user.image} alt="You" /> : <UserIcon />)
                      : (user?.image ? <img src={user.image} alt="AI" /> : <Bot />)
                    }
                  </div>
                  <div className="dc-bubble-wrap">
                    <div className="dc-sender">{isUser ? "You" : user?.name ?? "AI"}</div>
                    <div className={`dc-bubble ${isUser ? "dc-bubble--user" : "dc-bubble--ai"}`}>{msg.content}</div>
                    <div className="dc-time">{t}</div>
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="dc-row dc-row--ai">
              <div className="dc-av-wrap">
                {user?.image ? <img src={user.image} alt="AI" /> : <Bot />}
              </div>
              <div className="dc-typing">
                <div className="dc-dot" /><div className="dc-dot" /><div className="dc-dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="dc-input-wrap">
          <div className="dc-input-row">
            <textarea
              ref={textareaRef}
              className="dc-textarea"
              value={input}
              onChange={handleInput}
              onKeyDown={onKey}
              placeholder="Ask anything…"
              rows={1}
            />
            <button className="dc-send" onClick={sendMessage} disabled={!input.trim()}>
              <Send size={14} />
            </button>
          </div>
          <div className="dc-hint">Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </>
  );
}