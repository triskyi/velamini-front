'use client';
import { useState, useRef, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Send, AlertCircle, RefreshCw,
  Moon, Sun, MessageSquarePlus, PanelLeftOpen, PanelLeftClose, Trash2, Clock, MessageCircle, X
} from "lucide-react";
import FeedbackModal from "@/components/chat-ui/FeedbackModal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  status?: "sending" | "sent" | "failed";
  timestamp?: Date;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

interface ChatInputProps {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  isTyping: boolean;
  placeholder?: string;
}

function ChatInput({ input, setInput, onSend, isTyping, placeholder }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  };
  const isDisabled = !input.trim() || isTyping;

  return (
    <div className="ci-inner">
      <textarea
        ref={ref}
        className="ci-area"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Type a message...'}
        rows={1}
      />
      <button className={`ci-btn ${isDisabled ? 'ci-btn--off' : 'ci-btn--on'}`} onClick={onSend} disabled={isDisabled}>
        {isTyping ? <Loader2 size={14} className="ci-spin" /> : <Send size={14} />}
      </button>
    </div>
  );
}

export default function SharedChatPage({ params }: PageProps) {
  // FIX 1: Use React.use() to unwrap the params Promise synchronously
  // This is the correct Next.js 15 way — avoids the async race condition
  const { slug } = use(params);

  const [virtualSelf, setVirtualSelf]     = useState<{ name: string; image?: string } | null>(null);
  const [virtualSelfId, setVirtualSelfId] = useState<string | null>(null);
  // Ref mirrors state so sendMessage closure always sees latest value, not stale capture
  const virtualSelfIdRef = useRef<string | null>(null);
  const [qaPairs, setQaPairs]             = useState<{ question: string; answer: string }[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // FIX 2: slug is now always available on first render — no empty string race
  useEffect(() => {
    if (!slug) return;
    setIsLoading(true); setError(null);
    (async () => {
      try {
        const res  = await fetch(`/api/swag/resolve?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error('Failed to load virtual self');
        const data = await res.json();
        if (data?.userId) {
          virtualSelfIdRef.current = data.userId;
          setVirtualSelfId(data.userId);
          setVirtualSelf({ name: data.name, image: data.image });
          const qaRes = await fetch(`/api/knowledgebase/qa?userId=${data.userId}`);
          if (qaRes.ok) {
            const qd = await qaRes.json();
            setQaPairs(Array.isArray(qd.qaPairs) ? qd.qaPairs : []);
          }
        } else throw new Error('Virtual self not found');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
        virtualSelfIdRef.current = null;
        setVirtualSelfId(null); setVirtualSelf(null); setQaPairs([]);
      } finally { setIsLoading(false); }
    })();
  }, [slug]);

  const [input, setInput]               = useState("");
  const [messages, setMessages]         = useState<Message[]>([]);
  const [isTyping, setIsTyping]         = useState(false);
  const [retryMessage, setRetryMessage] = useState<Message | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating]             = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isDarkMode, setIsDarkMode]     = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [sessions, setSessions]         = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('theme');
    const dark = t === 'dark' || (!t && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches);
    setIsDarkMode(dark);
    document.documentElement.setAttribute('data-mode', dark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.setAttribute('data-mode', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // FIX 3: Guard localStorage reads/writes — only run when slug is a real value
  useEffect(() => {
    if (!slug) return;
    try {
      const raw = localStorage.getItem(`vela_sessions_${slug}`);
      if (raw) setSessions(JSON.parse(raw));
    } catch {}
  }, [slug]);

  useEffect(() => {
    if (!slug) return; // FIX 3b: Don't write to localStorage with empty slug key
    localStorage.setItem(`vela_sessions_${slug}`, JSON.stringify(sessions));
  }, [sessions, slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!activeSessionId || messages.length === 0) return;
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId
        ? { ...s, messages, title: messages[0]?.content.slice(0, 42) || s.title }
        : s
    ));
  }, [messages]);

  // FIX 4: Only lock body scroll on mobile (sidebar overlay), not always
  // And always clean up on unmount to prevent freeze
  useEffect(() => {
    const isMobile = window.innerWidth <= 640;
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const startNewSession = () => {
    setMessages([]); setInput(""); setActiveSessionId(null); setSidebarOpen(false);
  };

  const openSession = (session: ChatSession) => {
    setMessages(session.messages);
    setActiveSessionId(session.id);
    setSidebarOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) startNewSession();
  };

  const sendMessage = async (messageToRetry?: Message) => {
    const content = messageToRetry?.content || input.trim();
    if (!content) return;

    // Use ref to get latest virtualSelfId — avoids stale closure bug on iOS
    const currentVirtualSelfId = virtualSelfIdRef.current ?? virtualSelfId;
    if (!currentVirtualSelfId) {
      setError("Still loading — please wait a moment and try again.");
      return;
    }

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = `session_${Date.now()}`;
      setSessions(prev => [{ id: sessionId!, title: content.slice(0, 42), messages: [], createdAt: Date.now() }, ...prev]);
      setActiveSessionId(sessionId);
    }

    const userMessage: Message = messageToRetry || {
      id: Date.now(), role: "user", content, status: "sending", timestamp: new Date(),
    };

    if (!messageToRetry) { setMessages(prev => [...prev, userMessage]); setInput(""); }
    else setMessages(prev => prev.map(m => m.id === messageToRetry.id ? { ...m, status: "sending" } : m));

    setIsTyping(true); setRetryMessage(null);

    try {
      // Filter out failed messages so error text never leaks into the AI conversation history
      const recentHistory = messages
        .filter(m => m.status !== "failed")
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      // Guard: abort if content is somehow empty (prevents the "missing message" 400 loop)
      if (!userMessage.content) {
        setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, status: "failed" } : m));
        return;
      }

      const res  = await fetch("/api/chat/shared", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, history: recentHistory, virtualSelfId: currentVirtualSelfId }),
      });
      const data = await res.json();

      if (!res.ok) {
        // API returned an error — mark the message failed so user can retry; never add error text as an assistant turn
        setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, status: "failed" } : m));
        setRetryMessage(userMessage);
      } else {
        setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, status: "sent" } : m));
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: "assistant",
          content: data.text ?? "Sorry, something went wrong.",
          timestamp: new Date(),
        }]);
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, status: "failed" } : m));
      setRetryMessage(userMessage);
    } finally { setIsTyping(false); }
  };

  const hasMessages = messages.length > 0;

  const formatDate = (ts: number) => {
    const d = new Date(ts), now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        :root,[data-mode="light"]{
          --c-bg:#EFF7FF;--c-surface:#FFFFFF;--c-surface-2:#E2F0FC;
          --c-border:#C5DCF2;--c-text:#0B1E2E;--c-muted:#7399BA;
          --c-accent:#29A9D4;--c-accent-dim:#1D8BB2;--c-accent-soft:#DDF1FA;
          --c-user-bg:#0B1E2E;--c-user-text:#E8F5FD;
          --c-bot-bg:#FFFFFF;--c-bot-text:#0B1E2E;
          --c-sidebar:#F5FAFE;
          --shadow-sm:0 1px 3px rgba(10,40,70,.07);
          --shadow-md:0 6px 28px rgba(10,40,70,.10);
          --font-display:'Lora',Georgia,serif;
          --font-body:'Plus Jakarta Sans',system-ui,sans-serif;
        }
        [data-mode="dark"]{
          --c-bg:#081420;--c-surface:#0F1E2D;--c-surface-2:#162435;
          --c-border:#1A3045;--c-text:#CEEAF8;--c-muted:#3D6580;
          --c-accent:#38AECC;--c-accent-dim:#2690AB;--c-accent-soft:#0C2535;
          --c-user-bg:#38AECC;--c-user-text:#04131E;
          --c-bot-bg:#162435;--c-bot-text:#CEEAF8;
          --c-sidebar:#0A1825;
          --shadow-sm:0 1px 4px rgba(0,0,0,.3);
          --shadow-md:0 6px 28px rgba(0,0,0,.4);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{font-family:var(--font-body);background:var(--c-bg);color:var(--c-text)}

        .page{display:flex;flex-direction:column;height:100dvh;overflow:hidden;background:var(--c-bg);/* navbar is first flex child, body-row is second — no fixed/padding needed */}
        .body-row{display:flex;flex:1;overflow:hidden;position:relative;min-height:0;min-width:0}

        /* ── Navbar ── */
        .navbar{
          display:flex;align-items:center;justify-content:space-between;
          padding:0 12px;height:52px;
          background:var(--c-surface);border-bottom:1px solid var(--c-border);
          flex-shrink:0;gap:8px;z-index:30;
          /* Stay in normal flex flow — page is height:100dvh so no fixed needed */
          position:relative;
        }
        .nb-left{display:flex;align-items:center;gap:8px;min-width:0;flex:1}
        .nb-logo{
          width:32px;height:32px;border-radius:8px;overflow:hidden;flex-shrink:0;
          border:1.5px solid var(--c-border);background:var(--c-surface-2);
        }
        .nb-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .nb-name{
          font-family:var(--font-display);font-size:.95rem;font-weight:600;
          color:var(--c-text);letter-spacing:-.01em;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;
        }
        .nb-badge{
          font-size:.58rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
          background:var(--c-accent-soft);color:var(--c-accent);
          padding:2px 7px;border-radius:20px;flex-shrink:0;
        }
        @media(max-width:360px){.nb-badge{display:none}}
        .nb-right{display:flex;align-items:center;gap:5px;flex-shrink:0}
        .icon-btn{
          display:flex;align-items:center;justify-content:center;
          width:32px;height:32px;border-radius:8px;
          border:1px solid var(--c-border);background:var(--c-surface-2);
          color:var(--c-muted);cursor:pointer;transition:all .15s;flex-shrink:0;
        }
        .icon-btn:hover{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-accent-soft)}
        .icon-btn svg{width:14px;height:14px}
        .nb-feedback{
          display:flex;align-items:center;gap:5px;height:32px;border-radius:8px;
          border:1px solid var(--c-accent);background:var(--c-accent-soft);
          color:var(--c-accent);cursor:pointer;
          font-size:.75rem;font-weight:600;font-family:var(--font-body);
          transition:all .15s;flex-shrink:0;padding:0 11px;
        }
        .nb-feedback:hover{background:var(--c-accent);color:#fff;transform:scale(1.03)}
        .nb-feedback svg{width:13px;height:13px}
        @media(max-width:480px){
          .nb-feedback{width:32px;padding:0;justify-content:center}
          .nb-feedback-label{display:none}
        }
        .nb-divider{width:1px;height:18px;background:var(--c-border);flex-shrink:0}
        @media(max-width:400px){.nb-divider{display:none}}

        /* ── Sidebar desktop inline ── */
        .sidebar-desktop{
          flex-shrink:0;overflow:hidden;
          background:var(--c-sidebar);border-right:1px solid var(--c-border);
          display:flex;flex-direction:column;
          transition:width .28s cubic-bezier(.4,0,.2,1);
        }
        .sidebar-desktop--open{width:260px}
        .sidebar-desktop--closed{width:0}

        /* ── Sidebar mobile overlay ── */
        .sidebar-overlay{
          display:none;
          position:fixed;inset:0;z-index:100;
        }
        .sidebar-backdrop{
          position:absolute;inset:0;
          background:rgba(8,20,32,.55);
          backdrop-filter:blur(3px);
        }
        .sidebar-drawer{
          position:absolute;top:0;left:0;bottom:0;
          width:min(280px, 85vw);
          background:var(--c-sidebar);
          border-right:1px solid var(--c-border);
          display:flex;flex-direction:column;
          box-shadow:var(--shadow-md);
        }
        @media(max-width:640px){
          .sidebar-desktop{display:none!important}
          .sidebar-overlay{display:block}
        }
        @media(min-width:641px){
          .sidebar-overlay{display:none!important}
        }

        /* Sidebar internals */
        .sb-head{
          display:flex;align-items:center;justify-content:space-between;
          padding:14px 14px 10px;border-bottom:1px solid var(--c-border);flex-shrink:0;
        }
        .sb-head-left{display:flex;align-items:center;gap:8px}
        .sb-title{font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-muted)}
        .sb-new{
          display:flex;align-items:center;gap:4px;padding:5px 10px;border-radius:7px;
          background:var(--c-accent);color:#fff;border:none;cursor:pointer;
          font-size:.72rem;font-family:var(--font-body);font-weight:600;
          transition:background .15s,transform .15s;
        }
        .sb-new:hover{background:var(--c-accent-dim);transform:scale(1.03)}
        .sb-new svg{width:11px;height:11px}
        .sb-close-btn{
          display:flex;align-items:center;justify-content:center;
          width:28px;height:28px;border-radius:7px;
          border:1px solid var(--c-border);background:var(--c-surface-2);
          color:var(--c-muted);cursor:pointer;transition:all .14s;
        }
        .sb-close-btn:hover{color:var(--c-text);border-color:var(--c-text)}
        .sb-close-btn svg{width:13px;height:13px}
        .sb-list{
          flex:1;overflow-y:auto;padding:8px;
          display:flex;flex-direction:column;gap:3px;
          scrollbar-width:thin;scrollbar-color:var(--c-border) transparent;
          -webkit-overflow-scrolling:touch;
        }
        .sb-list::-webkit-scrollbar{width:3px}
        .sb-list::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:3px}
        .sb-empty{
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:10px;flex:1;color:var(--c-muted);font-size:.78rem;opacity:.65;
          text-align:center;padding:24px;
        }
        .sb-empty svg{opacity:.4}
        .sb-item{
          display:flex;align-items:center;gap:8px;padding:10px;border-radius:9px;
          cursor:pointer;transition:background .12s;border:1px solid transparent;
          min-width:0;min-height:44px;
        }
        .sb-item:hover,.sb-item:active{background:var(--c-surface-2)}
        .sb-item--active{background:var(--c-accent-soft);border-color:color-mix(in srgb,var(--c-accent) 35%,transparent)}
        .sb-text{flex:1;min-width:0}
        .sb-ttl{font-size:.79rem;font-weight:500;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sb-item--active .sb-ttl{color:var(--c-accent)}
        .sb-ts{font-size:.65rem;color:var(--c-muted);margin-top:2px}
        .sb-del{
          flex-shrink:0;display:flex;align-items:center;justify-content:center;
          width:26px;height:26px;border-radius:6px;border:none;
          background:transparent;cursor:pointer;color:var(--c-muted);transition:all .12s;
          opacity:0;
        }
        .sb-item:hover .sb-del,.sb-item:active .sb-del{opacity:1}
        @media(hover:none){.sb-del{opacity:.4}}
        .sb-del:hover,.sb-del:active{background:#FEE2E2;color:#E53E3E;opacity:1}
        .sb-del svg{width:12px;height:12px}

        /* ── Main ── */
        .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;min-height:0}

        /* ── Overlays ── */
        .overlay{
          position:fixed;inset:0;z-index:50;
          display:flex;align-items:center;justify-content:center;
          background:color-mix(in srgb,var(--c-bg) 80%,transparent);
          backdrop-filter:blur(8px);
          padding:20px;
        }
        .ov-card{
          display:flex;flex-direction:column;align-items:center;gap:14px;
          padding:32px 36px;background:var(--c-surface);
          border:1px solid var(--c-border);border-radius:22px;
          box-shadow:var(--shadow-md);text-align:center;
          max-width:320px;width:100%;
        }
        .ov-spin{color:var(--c-accent);animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ov-title{font-family:var(--font-display);font-size:1.1rem;color:var(--c-text)}
        .ov-sub{font-size:.77rem;color:var(--c-muted);margin-top:4px}
        .err-icon{width:50px;height:50px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;color:#E53E3E}
        .retry-btn{
          display:inline-flex;align-items:center;gap:6px;padding:9px 20px;border-radius:10px;
          background:var(--c-accent);color:#fff;border:none;cursor:pointer;
          font-size:.84rem;font-family:var(--font-body);
          transition:background .15s,transform .15s;
          min-height:44px;margin-top:10px;
        }
        .retry-btn:hover{background:var(--c-accent-dim);transform:scale(1.02)}

        /* FIX: dismiss button on error overlay so page never freezes */
        .dismiss-btn{
          display:inline-flex;align-items:center;gap:5px;padding:7px 16px;
          border-radius:9px;border:1px solid var(--c-border);
          background:var(--c-surface-2);color:var(--c-muted);
          font-size:.78rem;font-family:var(--font-body);cursor:pointer;
          transition:all .14s;min-height:40px;
        }
        .dismiss-btn:hover{border-color:var(--c-text);color:var(--c-text)}

        /* ── Welcome ── */
        .welcome{
          flex:1;display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          padding:24px 16px;overflow-y:auto;
          -webkit-overflow-scrolling:touch;
          /* Ensure welcome fills remaining height on iOS */
          min-height:0;
        }
        .wc-inner{width:100%;max-width:460px;display:flex;flex-direction:column;align-items:center;text-align:center;}
        .av-wrap{position:relative;margin-bottom:18px}
        .av-ring{
          width:82px;height:82px;border-radius:50%;padding:3px;
          background:linear-gradient(135deg,var(--c-accent),#7DD3FC);
          box-shadow:0 0 0 4px var(--c-accent-soft);
        }
        @media(max-width:360px){.av-ring{width:68px;height:68px}}
        .av-img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;background:var(--c-surface-2)}
        .av-dot{position:absolute;bottom:4px;right:4px;width:13px;height:13px;border-radius:50%;background:#22C55E;border:2px solid var(--c-bg)}
        .wc-name{font-family:var(--font-display);font-size:clamp(1.4rem,5vw,1.9rem);font-weight:600;letter-spacing:-.02em;color:var(--c-text);margin-bottom:5px;}
        .wc-sub{font-size:.75rem;color:var(--c-muted);margin-bottom:10px;letter-spacing:.05em;text-transform:uppercase}
        .wc-line{width:36px;height:2px;background:var(--c-accent);border-radius:2px;margin:0 auto 22px}

        /* ── Conversation ── */
        .conversation{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0}
        .msg-list{
          flex:1;overflow-y:auto;
          padding:16px 12px;
          display:flex;flex-direction:column;align-items:center;
          scrollbar-width:thin;scrollbar-color:var(--c-border) transparent;
          -webkit-overflow-scrolling:touch;
        }
        @media(min-width:480px){.msg-list{padding:20px 16px}}
        .msg-list::-webkit-scrollbar{width:3px}
        .msg-list::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:3px}
        .msgs-inner{width:100%;max-width:620px;display:flex;flex-direction:column;gap:12px;padding-bottom:8px;}

        /* Message rows */
        .msg-row{display:flex;align-items:flex-end;gap:7px}
        .msg-row--user{flex-direction:row-reverse}
        .msg-av{width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid var(--c-border);background:var(--c-surface-2);}
        @media(max-width:360px){.msg-av{display:none}}
        .msg-col{display:flex;flex-direction:column;gap:3px;max-width:80%}
        @media(min-width:480px){.msg-col{max-width:74%}}
        .msg-row--user .msg-col{align-items:flex-end}
        .msg-meta{display:flex;align-items:center;gap:4px}
        .msg-who{font-size:.67rem;font-weight:600;color:var(--c-muted);letter-spacing:.02em}
        .msg-ts{font-size:.62rem;color:var(--c-muted);opacity:.65}
        .msg-bub{padding:9px 13px;border-radius:16px;font-size:.855rem;line-height:1.62;box-shadow:var(--shadow-sm);word-break:break-word;}
        @media(min-width:480px){.msg-bub{padding:10px 14px;font-size:.875rem}}
        .msg-bub--user{background:var(--c-user-bg);color:var(--c-user-text);-webkit-text-fill-color:var(--c-user-text);border-bottom-right-radius:4px}
        .msg-bub--bot{background:var(--c-bot-bg);color:var(--c-bot-text);-webkit-text-fill-color:var(--c-bot-text);border:1px solid var(--c-border);border-bottom-left-radius:4px}
        .msg-bub--failed{opacity:.5}
        .msg-retry{
          display:inline-flex;align-items:center;gap:4px;
          margin-top:5px;padding:4px 10px;border-radius:7px;
          border:1px solid color-mix(in srgb,var(--c-danger) 40%,transparent);
          background:var(--c-danger-soft,#fee2e2);color:var(--c-danger,#ef4444);
          font-size:.68rem;font-family:var(--font-body);font-weight:600;
          cursor:pointer;transition:all .14s;
        }
        .msg-retry:hover{background:var(--c-danger,#ef4444);color:#fff}
        .msg-retry svg{width:9px;height:9px}

        /* Typing */
        .t-row{display:flex;align-items:flex-end;gap:7px}
        .t-dots{display:flex;align-items:center;gap:4px;padding:11px 14px;background:var(--c-bot-bg);border:1px solid var(--c-border);border-radius:16px;border-bottom-left-radius:4px;box-shadow:var(--shadow-sm);}
        .t-dot{width:5px;height:5px;border-radius:50%;background:var(--c-accent);animation:tdot .9s ease-in-out infinite}
        .t-dot:nth-child(2){animation-delay:.15s}
        .t-dot:nth-child(3){animation-delay:.3s}
        @keyframes tdot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}

        /* Input bar */
        .input-bar{
          border-top:1px solid var(--c-border);background:var(--c-surface);
          padding:10px 12px;
          padding-bottom:max(10px, env(safe-area-inset-bottom));
          display:flex;justify-content:center;flex-shrink:0;
        }
        @media(min-width:480px){.input-bar{padding:12px 20px}}
        .input-bar-inner{width:100%;max-width:620px}

        /* ChatInput */
        .ci-inner{
          display:flex;align-items:flex-end;gap:8px;padding:9px 11px;
          background:var(--c-surface);border-radius:14px;border:1.5px solid var(--c-border);
          transition:border-color .18s,box-shadow .18s;
        }
        @media(min-width:480px){.ci-inner{padding:11px 13px;gap:10px}}
        .ci-inner:focus-within{border-color:var(--c-accent);box-shadow:0 0 0 3px var(--c-accent-soft)}
        .ci-area{
          flex:1;background:transparent;border:none;outline:none;
          resize:none;min-height:20px;max-height:120px;
          font-family:var(--font-body);line-height:1.5;color:var(--c-text);-webkit-text-fill-color:var(--c-text);
          font-size:max(.85rem, 16px);
        }
        @media(min-width:480px){.ci-area{font-size:.88rem}}
        .ci-area::placeholder{color:var(--c-muted)}
        .ci-btn{flex-shrink:0;display:flex;align-items:center;justify-content:center;width:44px;height:44px;min-width:44px;min-height:44px;border-radius:9px;border:none;cursor:pointer;transition:all .16s;-webkit-tap-highlight-color:transparent;}
        .ci-btn--off{background:var(--c-surface-2);color:var(--c-muted);cursor:not-allowed}
        .ci-btn--on{background:var(--c-accent);color:#fff}
        .ci-btn--on:hover{background:var(--c-accent-dim)}
        .ci-btn--on:active{transform:scale(.94)}
        .ci-spin{animation:spin 1s linear infinite}
      `}</style>

      <div className="page">

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ov-card">
                <Loader2 size={28} className="ov-spin" />
                <div>
                  <p className="ov-title">One moment…</p>
                  <p className="ov-sub">Waking up your virtual self</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error overlay — FIX: always has a dismiss button so page never freezes */}
        <AnimatePresence>
          {error && !isLoading && (
            <motion.div className="overlay" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="ov-card">
                <div className="err-icon"><AlertCircle size={22} /></div>
                <div>
                  <p className="ov-title">Something went wrong</p>
                  <p className="ov-sub">{error}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  <button className="retry-btn" onClick={() => { setError(null); window.location.reload(); }}>
                    <RefreshCw size={13} /> Try again
                  </button>
                  {/* Dismiss without reload — unblocks the UI */}
                  <button className="dismiss-btn" onClick={() => setError(null)}>
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navbar */}
        <nav className="navbar">
          <div className="nb-left">
            <button className="icon-btn" onClick={() => setSidebarOpen(o => !o)} title="Toggle history">
              {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            </button>
            <div className="nb-logo"><img src="/logo.png" alt="Logo" /></div>
            <span className="nb-name">{virtualSelf?.name ?? 'Virtual Self'}</span>
            {!isLoading && !error && virtualSelf && <span className="nb-badge">Online</span>}
          </div>
          <div className="nb-right">
            <button className="nb-feedback" onClick={() => setShowFeedback(true)}>
              <MessageCircle size={13} />
              <span className="nb-feedback-label">Feedback</span>
            </button>
            <div className="nb-divider" />
            <button className="icon-btn" onClick={startNewSession} title="New chat"><MessageSquarePlus size={14} /></button>
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </nav>

        {/* Body */}
        <div className="body-row">

          {/* Desktop inline sidebar */}
          <div className={`sidebar-desktop ${sidebarOpen ? 'sidebar-desktop--open' : 'sidebar-desktop--closed'}`}>
            <SidebarContents
              sessions={sessions} activeSessionId={activeSessionId}
              onNew={startNewSession} onOpen={openSession} onDelete={deleteSession}
              onClose={() => setSidebarOpen(false)} formatDate={formatDate} showClose={false}
            />
          </div>

          {/* Mobile overlay sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <div className="sidebar-overlay">
                <motion.div
                  className="sidebar-backdrop"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.div
                  className="sidebar-drawer"
                  initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                >
                  <SidebarContents
                    sessions={sessions} activeSessionId={activeSessionId}
                    onNew={startNewSession} onOpen={openSession} onDelete={deleteSession}
                    onClose={() => setSidebarOpen(false)} formatDate={formatDate} showClose={true}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Main */}
          <div className="main">
            <AnimatePresence>
              {!hasMessages ? (
                <motion.div key="welcome" className="welcome"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                  {!isLoading && !error && virtualSelf && (
                    <div className="wc-inner">
                      <motion.div className="av-wrap"
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.05 }}>
                        <div className="av-ring">
                          <img src={virtualSelf.image || "/logo.png"} alt={virtualSelf.name} className="av-img" />
                        </div>
                        <div className="av-dot" />
                      </motion.div>
                      <motion.h1 className="wc-name"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
                        {virtualSelf.name}
                      </motion.h1>
                      <motion.p className="wc-sub"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.17 }}>
                        Ready to chat
                      </motion.p>
                      <motion.div className="wc-line"
                        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.22 }} />
                      <motion.div style={{ width: '100%' }}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                        <ChatInput input={input} setInput={setInput} onSend={sendMessage}
                          isTyping={isTyping || !virtualSelfId} placeholder={`Ask ${virtualSelf.name} anything…`} />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="conversation" className="conversation"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
                  <div className="msg-list">
                    <div className="msgs-inner">
                      {messages.map(msg => {
                        const isUser = msg.role === "user";
                        const avatar = isUser ? "/logo.png" : (virtualSelf?.image || "/logo.png");
                        const name   = isUser ? "You" : (virtualSelf?.name || "Assistant");
                        const time   = msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : new Date(msg.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        return (
                          <motion.div key={msg.id}
                            className={`msg-row ${isUser ? 'msg-row--user' : ''}`}
                            initial={{ opacity: 0, y: 10, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 340, damping: 26 }}>
                            <img src={avatar} alt={name} className="msg-av" />
                            <div className="msg-col">
                              <div className="msg-meta">
                                {!isUser && <span className="msg-who">{name}</span>}
                                <span className="msg-ts">{time}</span>
                                {isUser && <span className="msg-who">You</span>}
                              </div>
                              <div className={`msg-bub ${isUser ? 'msg-bub--user' : 'msg-bub--bot'} ${msg.status === 'failed' ? 'msg-bub--failed' : ''}`}>
                                {msg.content}
                              </div>
                              {msg.status === 'failed' && isUser && (
                                <button className="msg-retry" onClick={() => sendMessage(msg)}>
                                  <RefreshCw size={9} /> Retry
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                      <AnimatePresence>
                        {isTyping && (
                          <motion.div className="t-row"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                            <img src={virtualSelf?.image || "/logo.png"} alt="typing" className="msg-av" />
                            <div className="t-dots">
                              <div className="t-dot" /><div className="t-dot" /><div className="t-dot" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div ref={bottomRef} />
                    </div>
                  </div>
                  <div className="input-bar">
                    <div className="input-bar-inner">
                      <ChatInput input={input} setInput={setInput} onSend={sendMessage}
                        isTyping={isTyping || !virtualSelfId}
                        placeholder={virtualSelf ? `Message ${virtualSelf.name}…` : "Type a message…"} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <FeedbackModal
          isOpen={showFeedback} onClose={() => setShowFeedback(false)}
          rating={rating} setRating={setRating}
          feedbackText={feedbackText} setFeedbackText={setFeedbackText}
        />
      </div>
    </>
  );
}

function SidebarContents({
  sessions, activeSessionId, onNew, onOpen, onDelete, onClose, formatDate, showClose
}: {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNew: () => void;
  onOpen: (s: ChatSession) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClose: () => void;
  formatDate: (ts: number) => string;
  showClose: boolean;
}) {
  return (
    <>
      <div className="sb-head">
        <div className="sb-head-left">
          {showClose && (
            <button className="sb-close-btn" onClick={onClose}><X size={13} /></button>
          )}
          <span className="sb-title">History</span>
        </div>
        <button className="sb-new" onClick={onNew}>
          <MessageSquarePlus size={11} /> New
        </button>
      </div>
      <div className="sb-list">
        {sessions.length === 0 ? (
          <div className="sb-empty">
            <Clock size={26} />
            <span>No conversations yet.<br />Start chatting to see history here.</span>
          </div>
        ) : sessions.map(session => (
          <motion.div
            key={session.id}
            className={`sb-item ${activeSessionId === session.id ? 'sb-item--active' : ''}`}
            onClick={() => onOpen(session)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <div className="sb-text">
              <div className="sb-ttl">{session.title || "New conversation"}</div>
              <div className="sb-ts">{formatDate(session.createdAt)}</div>
            </div>
            <button className="sb-del" onClick={e => onDelete(session.id, e)} title="Delete">
              <Trash2 size={12} />
            </button>
          </motion.div>
        ))}
      </div>
    </>
  );
}