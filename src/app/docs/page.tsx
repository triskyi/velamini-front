"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PUBLIC_APP_URL } from "@/lib/app-url";

import {
  MessageSquare, List, History, ThumbsUp,
  Puzzle, Code2, Key, Zap, BookOpen,
  Globe, Lock, Copy, Check, Layers,
  ChevronLeft, ChevronRight, Moon, Sun, Menu, X,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   SECTIONS CONFIG
───────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "overview",   label: "Overview",             Icon: BookOpen,      group: "Getting Started" },
  { id: "quickstart", label: "Quick Start",          Icon: Zap,           group: "Getting Started" },
  { id: "auth",       label: "Authentication",       Icon: Key,           group: "Getting Started" },
  { id: "chat",       label: "POST /agent/chat",     Icon: MessageSquare, group: "Endpoints"       },
  { id: "sessions",   label: "GET /agent/sessions",  Icon: List,          group: "Endpoints"       },
  { id: "history",    label: "GET /agent/history",   Icon: History,       group: "Endpoints"       },
  { id: "feedback",   label: "POST /agent/feedback", Icon: ThumbsUp,      group: "Endpoints"       },
  { id: "embed",      label: "Embed Widget",         Icon: Puzzle,        group: "Integrations"    },
  { id: "react",      label: "React / JS",           Icon: Code2,         group: "Integrations"    },
  { id: "widget-ref", label: "Widget Options",       Icon: Layers,        group: "Reference"       },
  { id: "errors",     label: "Error Codes",          Icon: Globe,         group: "Reference"       },
  { id: "security",   label: "Security",             Icon: Lock,          group: "Reference"       },
];
const GROUPS = ["Getting Started", "Endpoints", "Integrations", "Reference"];
const API_BASE_URL = PUBLIC_APP_URL;

/* ─────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────────────────────── */
function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };
  return (
    <div className="cb">
      {lang && <span className="cb-lang">{lang}</span>}
      <pre className="cb-pre"><code>{code}</code></pre>
      <button className={`cb-copy${copied ? " done" : ""}`} onClick={copy}>
        {copied ? <Check size={10}/> : <Copy size={10}/>}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function Note({ children, warn, success }: { children: React.ReactNode; warn?: boolean; success?: boolean }) {
  const col = warn ? "#f59e0b" : success ? "#10b981" : "var(--a)";
  const bg  = warn ? "rgba(245,158,11,.08)" : success ? "rgba(16,185,129,.08)" : "color-mix(in srgb,var(--a) 8%,transparent)";
  return (
    <div style={{ borderLeft:`3px solid ${col}`, borderRadius:"0 10px 10px 0", background:bg, padding:"10px 14px", fontSize:".8rem", color:"var(--mu)", lineHeight:1.65, marginBottom:14 }}>
      {children}
    </div>
  );
}

function IC({ v }: { v: string }) {
  return <code style={{ fontFamily:"ui-monospace,monospace", fontSize:".75rem", color:"var(--a)", background:"color-mix(in srgb,var(--a) 10%,transparent)", padding:"1px 6px", borderRadius:4, whiteSpace:"nowrap" }}>{v}</code>;
}

function H({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom:20 }}>
      <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(1.35rem,4vw,1.85rem)", fontWeight:400, color:"var(--fg)", margin:0, letterSpacing:"-.02em", lineHeight:1.2 }}>{title}</h2>
      {sub && <p style={{ color:"var(--mu)", fontSize:".82rem", marginTop:6, marginBottom:0, lineHeight:1.6 }}>{sub}</p>}
    </div>
  );
}

function H3({ t }: { t: string }) {
  return <h3 style={{ fontSize:".88rem", fontWeight:700, color:"var(--fg)", margin:"20px 0 8px" }}>{t}</h3>;
}

function P({ c }: { c: string }) {
  return <p style={{ fontSize:".82rem", color:"var(--mu)", lineHeight:1.8, marginBottom:14 }}>{c}</p>;
}

function Method({ m }: { m: "POST"|"GET" }) {
  const col: Record<string,string> = { POST:"#0b84c6", GET:"#22c55e" };
  return <span style={{ background:`${col[m]}1a`, color:col[m], fontWeight:800, fontSize:".58rem", letterSpacing:".06em", padding:"3px 8px", borderRadius:5, textTransform:"uppercase" as const, flexShrink:0 }}>{m}</span>;
}

function EP({ method, path, desc }: { method:"POST"|"GET"; path:string; desc:string }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"11px 14px", border:"1px solid var(--br)", borderRadius:10, background:"var(--s2)", marginBottom:8 }}>
      <Method m={method}/>
      <div>
        <code style={{ fontFamily:"ui-monospace,monospace", fontSize:".79rem", color:"var(--a)", display:"block" }}>{path}</code>
        <p style={{ margin:"3px 0 0", fontSize:".75rem", color:"var(--mu)" }}>{desc}</p>
      </div>
    </div>
  );
}

function Badge({ label, c }: { label:string; c:string }) {
  return <span style={{ background:`${c}18`, color:c, fontSize:".58rem", fontWeight:800, letterSpacing:".06em", textTransform:"uppercase" as const, padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap" as const }}>{label}</span>;
}

function ParamTable({ rows }: { rows: [string,string,boolean,string][] }) {
  return (
    <div style={{ overflowX:"auto", borderRadius:10, border:"1px solid var(--br)", marginBottom:14 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".78rem", minWidth:420 }}>
        <thead>
          <tr>{["Field","Type","Required","Description"].map(h => (
            <th key={h} style={{ textAlign:"left", padding:"7px 12px", background:"var(--s2)", color:"var(--mu)", fontSize:".6rem", fontWeight:800, letterSpacing:".08em", textTransform:"uppercase" as const, borderBottom:"1px solid var(--br)" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map(([field,type,req,desc]) => (
            <tr key={field}>
              <td style={{ padding:"8px 12px", borderBottom:"1px solid color-mix(in srgb,var(--br) 50%,transparent)", verticalAlign:"top" }}><IC v={field}/></td>
              <td style={{ padding:"8px 12px", borderBottom:"1px solid color-mix(in srgb,var(--br) 50%,transparent)", color:"var(--mu)", verticalAlign:"top" }}>{type}</td>
              <td style={{ padding:"8px 12px", borderBottom:"1px solid color-mix(in srgb,var(--br) 50%,transparent)", verticalAlign:"top" }}><Badge label={req?"yes":"no"} c={req?"#f59e0b":"#64748b"}/></td>
              <td style={{ padding:"8px 12px", borderBottom:"1px solid color-mix(in srgb,var(--br) 50%,transparent)", color:"var(--mu)", verticalAlign:"top", lineHeight:1.5 }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Step({ n, title, desc }: { n:number; title:string; desc:string }) {
  return (
    <div style={{ display:"flex", gap:12, padding:"12px 14px", marginBottom:8, border:"1px solid var(--br)", borderRadius:10, background:"var(--s2)" }}>
      <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0, background:"color-mix(in srgb,var(--a) 14%,transparent)", color:"var(--a)", fontSize:".7rem", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{n}</div>
      <div>
        <div style={{ fontSize:".84rem", fontWeight:700, color:"var(--fg)", marginBottom:2 }}>{title}</div>
        <div style={{ fontSize:".77rem", color:"var(--mu)", lineHeight:1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ONE COMPONENT PER SECTION
───────────────────────────────────────────────────────────── */
const PAGES: Record<string, React.FC> = {

  overview: () => (
    <>
      <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:"color-mix(in srgb,var(--org) 10%,transparent)", border:"1px solid color-mix(in srgb,var(--org) 22%,transparent)", color:"var(--org)", fontSize:".65rem", fontWeight:700, letterSpacing:".04em", marginBottom:16 }}>v1.0 · Public API</div>
      <H title="Velamini Public API" sub="Integrate your trained AI agent into any platform using 4 simple REST endpoints."/>
      <Note>
        <strong>Base URL — </strong><IC v={`${API_BASE_URL}/api`}/><br/>
        All public endpoints live under <IC v="/api/agent/"/> and authenticate via <IC v="X-Agent-Key"/>.
      </Note>
      <P c="Every organisation gets a unique API key (format: vela_xxxx…). Use it to chat with your agent, list sessions, retrieve history, and collect feedback — without exposing your dashboard credentials."/>
      <EP method="POST" path="/api/agent/chat"     desc="Send a message, receive an AI reply"/>
      <EP method="GET"  path="/api/agent/sessions" desc="List all conversation sessions"/>
      <EP method="GET"  path="/api/agent/history"  desc="Get all messages in a session"/>
      <EP method="POST" path="/api/agent/feedback" desc="Submit thumbs up / thumbs down feedback"/>
    </>
  ),

  quickstart: () => (
    <>
      <H title="Quick Start" sub="Your agent responding to real users in under 60 seconds."/>
      <Step n={1} title="Open your dashboard"     desc="Go to Dashboard → your organisation → API & Embed tab."/>
      <Step n={2} title="Copy your API key"       desc="Copy the key shown (vela_xxxx…). Treat it like a password — never commit to git."/>
      <Step n={3} title="Make your first request" desc="Run the cURL below, replacing the key with yours."/>
      <CodeBlock lang="bash" code={`curl -X POST ${API_BASE_URL}/api/agent/chat \\
  -H "Content-Type: application/json" \\
  -H "X-Agent-Key: vela_your_key_here" \\
  -d '{"message": "Hello, what can you help me with?"}'`}/>
      <Note success>
        You should get a reply within ~1 second. The response includes a <IC v="sessionId"/> — save it to continue the conversation.
      </Note>
      <CodeBlock lang="json" code={`{
  "reply":     "Hi! I'm your AI assistant. I can help you with product questions, orders, and more.",
  "sessionId": "cm9abc123def456",
  "agentName": "Support Bot"
}`}/>
    </>
  ),

  auth: () => (
    <>
      <H title="Authentication" sub="All endpoints use a single header — no OAuth, no tokens to refresh."/>
      <P c="Include your organisation's API key in the X-Agent-Key HTTP header on every request. A wrong key, expired key, or disabled org returns 401 or 403."/>
      <CodeBlock lang="http" code={`X-Agent-Key: vela_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}/>
      <Note warn>
        <strong>Never expose your key in public client-side JS or git repositories.</strong>{" "}
        Use the Embed Widget (key management handled safely), or proxy calls through your own server. Rotate your key any time in the API &amp; Embed tab.
      </Note>
      <H3 t="Key format"/>
      <P c="Keys start with vela_ followed by 43 URL-safe base64 characters — 256 bits of cryptographic randomness. They cannot be guessed or brute-forced."/>
      <H3 t="Key rotation"/>
      <P c="Go to your organisation's API & Embed tab and click Rotate Key. The old key is immediately invalidated."/>
    </>
  ),

  chat: () => (
    <>
      <H title="POST /api/agent/chat" sub="Send a user message to your agent and receive an AI-generated reply."/>
      <EP method="POST" path="/api/agent/chat" desc="The core endpoint. Send a message, get the agent's response."/>
      <H3 t="Request body"/>
      <ParamTable rows={[
        ["message",   "string", true,  "The user's message. Maximum 2,000 characters."],
        ["sessionId", "string", false, "Session ID from a previous response. Re-using it continues the conversation."],
        ["history",   "array",  false, "Fallback context: [{ role: 'user'|'assistant', content: string }]. Used only if sessionId is absent."],
      ]}/>
      <H3 t="cURL example"/>
      <CodeBlock lang="bash" code={`curl -X POST ${API_BASE_URL}/api/agent/chat \\
  -H "Content-Type: application/json" \\
  -H "X-Agent-Key: vela_your_key_here" \\
  -d '{
    "message":   "Do you offer free shipping?",
    "sessionId": "cm9abc123def456"
  }'`}/>
      <H3 t="Response"/>
      <CodeBlock lang="json" code={`{
  "reply":     "Yes! Free standard shipping on all orders over 50,000 RWF.",
  "sessionId": "cm9abc123def456",
  "agentName": "Support Bot"
}`}/>
      <H3 t="Multi-turn conversation"/>
      <P c="Re-send the same sessionId on every follow-up. The agent automatically has the full conversation history as context."/>
      <CodeBlock lang="js" code={`// Turn 1 — omit sessionId to start a new conversation
const r1 = await fetch("${API_BASE_URL}/api/agent/chat", {
  method:  "POST",
  headers: { "Content-Type": "application/json", "X-Agent-Key": KEY },
  body:    JSON.stringify({ message: "What products do you sell?" }),
});
const { sessionId } = await r1.json();

// Turn 2 — pass the same sessionId to continue
const r2 = await fetch("${API_BASE_URL}/api/agent/chat", {
  method:  "POST",
  headers: { "Content-Type": "application/json", "X-Agent-Key": KEY },
  body:    JSON.stringify({ message: "Which one is cheapest?", sessionId }),
});`}/>
    </>
  ),

  sessions: () => (
    <>
      <H title="GET /api/agent/sessions" sub="List all conversation sessions for your organisation, newest first."/>
      <EP method="GET" path="/api/agent/sessions" desc="Returns a paginated list of sessions."/>
      <H3 t="Query parameters"/>
      <ParamTable rows={[
        ["limit", "number", false, "Results per page. Default 20, max 100."],
        ["page",  "number", false, "Page number (1-based). Default 1."],
      ]}/>
      <H3 t="cURL example"/>
      <CodeBlock lang="bash" code={`curl "${API_BASE_URL}/api/agent/sessions?limit=10&page=1" \\
  -H "X-Agent-Key: vela_your_key_here"`}/>
      <H3 t="Response"/>
      <CodeBlock lang="json" code={`{
  "sessions": [
    {
      "sessionId":    "cm9abc123def456",
      "messageCount": 6,
      "createdAt":    "2026-03-07T10:00:00.000Z",
      "updatedAt":    "2026-03-07T10:05:00.000Z",
      "lastMessage": {
        "role":      "assistant",
        "content":   "Is there anything else I can help you with?",
        "createdAt": "2026-03-07T10:05:00.000Z"
      }
    }
  ],
  "total": 142,
  "page":  1,
  "limit": 10
}`}/>
    </>
  ),

  history: () => (
    <>
      <H title="GET /api/agent/history" sub="Retrieve every message in a specific conversation, in chronological order."/>
      <EP method="GET" path="/api/agent/history" desc="Returns all messages for a given sessionId."/>
      <H3 t="Query parameters"/>
      <ParamTable rows={[
        ["sessionId", "string", true, "The session ID returned by POST /api/agent/chat."],
      ]}/>
      <H3 t="cURL example"/>
      <CodeBlock lang="bash" code={`curl "${API_BASE_URL}/api/agent/history?sessionId=cm9abc123def456" \\
  -H "X-Agent-Key: vela_your_key_here"`}/>
      <H3 t="Response"/>
      <CodeBlock lang="json" code={`{
  "sessionId":    "cm9abc123def456",
  "messageCount": 4,
  "messages": [
    { "id": "msg_1", "role": "user",      "content": "Do you offer free shipping?",      "createdAt": "2026-03-07T10:00:00.000Z" },
    { "id": "msg_2", "role": "assistant", "content": "Yes! Orders over 50,000 RWF…",     "createdAt": "2026-03-07T10:00:01.000Z" },
    { "id": "msg_3", "role": "user",      "content": "What about returns?",               "createdAt": "2026-03-07T10:04:00.000Z" },
    { "id": "msg_4", "role": "assistant", "content": "We accept returns within 30 days…", "createdAt": "2026-03-07T10:04:01.000Z" }
  ]
}`}/>
    </>
  ),

  feedback: () => (
    <>
      <H title="POST /api/agent/feedback" sub="Record a thumbs up or thumbs down rating for any conversation."/>
      <EP method="POST" path="/api/agent/feedback" desc="Submit user satisfaction feedback, optionally linked to a session."/>
      <H3 t="Request body"/>
      <ParamTable rows={[
        ["rating",    "number", true,  "1 = thumbs up, -1 = thumbs down. Only 1 or -1 accepted."],
        ["sessionId", "string", false, "Session to attach this feedback to."],
        ["comment",   "string", false, "Optional free-text comment from the user."],
      ]}/>
      <H3 t="cURL example"/>
      <CodeBlock lang="bash" code={`curl -X POST ${API_BASE_URL}/api/agent/feedback \\
  -H "Content-Type: application/json" \\
  -H "X-Agent-Key: vela_your_key_here" \\
  -d '{
    "rating":    1,
    "sessionId": "cm9abc123def456",
    "comment":   "Very helpful, answered quickly!"
  }'`}/>
      <H3 t="Response"/>
      <CodeBlock lang="json" code={`{ "ok": true, "id": "feedback_cm9xyz" }`}/>
      <H3 t="Typical usage — show thumbs after each reply"/>
      <CodeBlock lang="ts" code={`async function submitFeedback(rating: 1 | -1, sessionId: string) {
  await fetch("${API_BASE_URL}/api/agent/feedback", {
    method:  "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Key": KEY },
    body:    JSON.stringify({ rating, sessionId }),
  });
}`}/>
    </>
  ),

  embed: () => (
    <>
      <H title="Embed Widget" sub="One script tag — instant chat bubble on any webpage, no build step."/>
      <P c="The widget is self-contained vanilla JS. It calls /api/agent/chat automatically, persists sessions across page loads, adapts to dark/light mode, and is fully mobile-responsive."/>
      <H3 t="Installation"/>
      <CodeBlock lang="html" code={`<!-- Paste before </body> on any HTML page -->
<script
  src="${API_BASE_URL}/embed/agent.js"
  data-agent-key="vela_your_key_here"
  data-agent-name="Support Bot"
  data-theme="auto"
  defer>
</script>`}/>
      <H3 t="Configuration attributes"/>
      <ParamTable rows={[
        ["data-agent-key",  "string", true,  "Your organisation's API key."],
        ["data-agent-name", "string", false, "Name shown in the chat header."],
        ["data-theme",      "string", false, "auto (default) | light | dark."],
        ["data-position",   "string", false, "bottom-right (default) | bottom-left."],
        ["data-api-base",   "string", false, "Override the API origin for self-hosted setups."],
      ]}/>
      <H3 t="Next.js injection"/>
      <CodeBlock lang="ts" code={`"use client";
import { useEffect } from "react";
export function AgentWidget() {
  useEffect(() => {
    if (document.getElementById("vela-widget")) return;
    const s = Object.assign(document.createElement("script"), {
      id: "vela-widget", src: "${API_BASE_URL}/embed/agent.js", defer: true,
    });
    s.dataset.agentKey = process.env.NEXT_PUBLIC_AGENT_KEY!;
    s.dataset.theme    = "auto";
    document.body.appendChild(s);
  }, []);
  return null;
}`}/>
      <H3 t="Programmatic open / close"/>
      <CodeBlock lang="js" code={`window.dispatchEvent(new CustomEvent("vela:open"));
window.dispatchEvent(new CustomEvent("vela:close"));`}/>
    </>
  ),

  react: () => (
    <>
      <H title="React / JavaScript" sub="Build the same widget-style UX in React with the public endpoints."/>
      <H3 t="Reusable useAgentChat hook"/>
      <CodeBlock lang="ts" code={`// src/hooks/useAgentChat.ts
"use client";

import { useCallback, useMemo, useRef, useState } from "react";

const KEY  = process.env.NEXT_PUBLIC_AGENT_KEY!;
const BASE = "${API_BASE_URL}/api/agent";

export function useAgentChat() {
  const [messages, setMessages] = useState<{ role:string; content:string }[]>([]);
  const [loading,  setLoading]  = useState(false);
  const sessionId = useRef<string | undefined>(undefined);
  const headers = useMemo(
    () => ({ "Content-Type":"application/json", "X-Agent-Key": KEY }),
    [],
  );

  const send = useCallback(async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;

    setMessages(m => [...m, { role:"user", content: message }]);
    setLoading(true);

    try {
      const res = await fetch(\`\${BASE}/chat\`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message, sessionId: sessionId.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      sessionId.current = data.sessionId;
      setMessages(m => [...m, { role:"assistant", content:data.reply }]);
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "Network error. Please try again.";
      setMessages(m => [...m, { role:"assistant", content: fallback }]);
    } finally {
      setLoading(false);
    }
  }, [headers, loading]);

  const submitFeedback = useCallback(async (rating: 1 | -1) => {
    if (!sessionId.current) return;
    await fetch(\`\${BASE}/feedback\`, {
      method: "POST",
      headers,
      body:    JSON.stringify({ rating, sessionId:sessionId.current }),
    });
  }, [headers]);

  const loadSessions = useCallback(async (page = 1, limit = 20) => {
    const res = await fetch(\`\${BASE}/sessions?page=\${page}&limit=\${limit}\`, {
      headers: { "X-Agent-Key": KEY },
    });
    return res.json();
  }, []);

  const loadHistory = useCallback(async (id: string) => {
    const res = await fetch(\`\${BASE}/history?sessionId=\${encodeURIComponent(id)}\`, {
      headers: { "X-Agent-Key": KEY },
    });
    const data = await res.json();
    sessionId.current = id;
    setMessages(data.messages || []);
    return data.messages || [];
  }, []);

  return { messages, loading, send, submitFeedback, loadSessions, loadHistory };
}`}/>
      <H3 t="Widget-style component usage"/>
      <CodeBlock lang="tsx" code={`"use client";

import AgentChatWidget from "@/components/chat-ui/AgentChatWidget";

export default function SupportPage() {
  return (
    <AgentChatWidget
      agentKey={process.env.NEXT_PUBLIC_AGENT_KEY!}
      agentName="Support Bot"
      baseUrl="/api/agent"
      theme="auto"
    />
  );
}`}/>
    </>
  ),

  "widget-ref": () => (
    <>
      <H title="Widget Options Reference" sub="All configuration attributes for the embed script tag."/>
      <ParamTable rows={[
        ["data-agent-key",  "string", true,  "Organisation API key starting with vela_."],
        ["data-agent-name", "string", false, "Header title in chat panel. Falls back to org agentName."],
        ["data-theme",      "string", false, "auto | light | dark. auto follows prefers-color-scheme."],
        ["data-position",   "string", false, "bottom-right | bottom-left. Default bottom-right."],
        ["data-api-base",   "string", false, "Full origin override e.g. https://my-instance.com."],
      ]}/>
      <H3 t="Widget behaviour"/>
      <div style={{ overflowX:"auto", borderRadius:10, border:"1px solid var(--br)", marginBottom:14 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".78rem", minWidth:340 }}>
          <thead><tr>{["Feature","Detail"].map(h => <th key={h} style={{ textAlign:"left", padding:"7px 12px", background:"var(--s2)", color:"var(--mu)", fontSize:".6rem", fontWeight:800, letterSpacing:".08em", textTransform:"uppercase" as const, borderBottom:"1px solid var(--br)" }}>{h}</th>)}</tr></thead>
          <tbody>
            {[
              ["Session persistence", "Stored in localStorage + Velamini DB. Survives page refresh."],
              ["Mobile layout",       "Full-width bottom drawer on screens narrower than 480 px."],
              ["Keyboard shortcuts",  "Enter to send · Shift+Enter for newline · Esc to close."],
              ["Context window",      "Sends last 8 messages as history for coherent multi-turn replies."],
              ["Typing indicator",    "Animated dots while the agent is thinking."],
              ["API compatibility",   "sessionId from the widget works with /sessions and /history."],
            ].map(([f,d]) => (
              <tr key={f}>
                <td style={{ padding:"8px 12px", borderBottom:"1px solid color-mix(in srgb,var(--br) 50%,transparent)", color:"var(--fg)", fontWeight:600, whiteSpace:"nowrap" as const }}>{f}</td>
                <td style={{ padding:"8px 12px", borderBottom:"1px solid color-mix(in srgb,var(--br) 50%,transparent)", color:"var(--mu)" }}>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ),

  errors: () => (
    <>
      <H title="Error Codes" sub="All endpoints return errors in a consistent shape."/>
      <CodeBlock lang="json" code={`{ "error": "Human-readable error message" }`}/>
      <div style={{ overflowX:"auto", borderRadius:10, border:"1px solid var(--br)", marginBottom:14 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".78rem", minWidth:380 }}>
          <thead><tr>{["Status","Meaning","Cause"].map(h => <th key={h} style={{ textAlign:"left", padding:"7px 12px", background:"var(--s2)", color:"var(--mu)", fontSize:".6rem", fontWeight:800, letterSpacing:".08em", textTransform:"uppercase" as const, borderBottom:"1px solid var(--br)" }}>{h}</th>)}</tr></thead>
          <tbody>
            {[
              ["400","Bad Request",          "Missing or invalid field in request body or query params."],
              ["401","Unauthorized",          "Missing X-Agent-Key, or the key doesn't match any organisation."],
              ["403","Forbidden",             "Organisation is disabled (isActive = false)."],
              ["404","Not Found",             "Session ID not found or belongs to a different organisation."],
              ["429","Too Many Requests",     "Monthly message limit reached. Upgrade your plan to continue."],
              ["500","Internal Server Error", "Unexpected error — retry after a moment."],
              ["502","Bad Gateway",           "The AI service returned an error."],
              ["503","Service Unavailable",   "AI service temporarily unavailable — retry with backoff."],
            ].map(([code,name,cause]) => (
              <tr key={code}>
                <td style={{ padding:"8px 12px", borderBottom:"1px solid color-mix(in srgb,var(--br) 50%,transparent)" }}>
                  <Badge label={code} c={code.startsWith("2")?"#22c55e":code.startsWith("4")?"#f59e0b":"#ef4444"}/>
                </td>
                <td style={{ padding:"8px 12px", borderBottom:"1px solid color-mix(in srgb,var(--br) 50%,transparent)", fontWeight:600, color:"var(--fg)" }}>{name}</td>
                <td style={{ padding:"8px 12px", borderBottom:"1px solid color-mix(in srgb,var(--br) 50%,transparent)", color:"var(--mu)" }}>{cause}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ),

  security: () => (
    <>
      <H title="Security" sub="Best practices for protecting your API key and agent."/>
      {[
        ["Store keys in environment variables", "Use NEXT_PUBLIC_AGENT_KEY for embed or AGENT_KEY (server-only) for proxied calls. Never hard-code in source files or commit to git."],
        ["Rotate regularly",                    "Generate a new key any time in the API & Embed tab. The old key is instantly invalidated. Rotate whenever you suspect exposure."],
        ["Disable unused organisations",        "Set isActive: false from Settings to instantly reject all requests from that org's key."],
        ["CORS policy",                         "Only /api/agent/* accepts cross-origin requests. Dashboard admin routes require a session cookie."],
        ["Message length limit",                "Messages over 2,000 characters are rejected to prevent prompt injection and abuse."],
        ["HTTPS only",                          "Always use https:// — plain HTTP requests are redirected or rejected."],
      ].map(([title, desc]) => (
        <div key={title} style={{ padding:"12px 14px", marginBottom:8, border:"1px solid var(--br)", borderRadius:10, background:"var(--s2)" }}>
          <div style={{ fontSize:".83rem", fontWeight:700, color:"var(--fg)", marginBottom:3 }}>{title}</div>
          <div style={{ fontSize:".76rem", color:"var(--mu)", lineHeight:1.6 }}>{desc}</div>
        </div>
      ))}
    </>
  ),
};

/* ─────────────────────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────────────────── */
export default function DocsPage() {
  const [current,  setCurrent]  = useState(0);
  const [isDark,   setIsDark]   = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return (localStorage.getItem("theme") || "light") === "dark";
    } catch {
      return false;
    }
  });
  const [sideOpen, setSideOpen] = useState(false);
  const [visible,  setVisible]  = useState(true);
  const [dir,      setDir]      = useState<"l"|"r">("r");

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    const n = !isDark; setIsDark(n);
    document.documentElement.setAttribute("data-mode", n ? "dark" : "light");
    try { localStorage.setItem("theme", n ? "dark" : "light"); } catch {}
  };

  const goTo = (idx: number, direction: "l"|"r") => {
    if (idx < 0 || idx >= SECTIONS.length || idx === current) return;
    setDir(direction);
    setVisible(false);
    setTimeout(() => {
      setCurrent(idx);
      setSideOpen(false);
      setVisible(true);
      window.scrollTo({ top:0, behavior:"smooth" });
    }, 180);
  };

  const prev     = current > 0                  ? SECTIONS[current - 1] : null;
  const next     = current < SECTIONS.length - 1 ? SECTIONS[current + 1] : null;
  const progress = (current / (SECTIONS.length - 1)) * 100;
  const Content  = PAGES[SECTIONS[current].id];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        :root,[data-mode="light"]{
          --bg:#f2f7fc;--su:#ffffff;--s2:#eaf2fb;
          --br:#c8dae9;--fg:#0b1e2e;--mu:#5d7c94;
          --a:#0b84c6;--org:#3d5afe;
          --cb:#081724;--code:#b1def5;
        }
        [data-mode="dark"]{
          --bg:#0a1420;--su:#101e2c;--s2:#162838;
          --br:#23384b;--fg:#d9ecf8;--mu:#88a7bf;
          --a:#14a7ff;--org:#8b9cff;
          --cb:#0b1926;--code:#c2e8fb;
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--fg);-webkit-font-smoothing:antialiased;min-height:100dvh;transition:background .3s,color .3s}

        /* topbar */
        .dn{position:fixed;top:0;left:0;right:0;z-index:200;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:color-mix(in srgb,var(--su) 88%,transparent);border-bottom:1px solid var(--br);backdrop-filter:blur(16px);transition:background .3s,border-color .3s}
        .dn-l{display:flex;align-items:center;gap:10px}
        .dn-brand{display:flex;align-items:center;gap:7px;text-decoration:none}
        .dn-logo{width:26px;height:26px;border-radius:7px;overflow:hidden;border:1.5px solid var(--br)}
        .dn-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .dn-name{font-family:'DM Serif Display',serif;font-size:.85rem;color:var(--fg)}
        .dn-sep{color:var(--br);margin:0 2px}
        .dn-tag{font-size:.7rem;font-weight:700;color:var(--mu)}
        .dn-r{display:flex;align-items:center;gap:8px}
        .dib{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid var(--br);background:var(--s2);color:var(--mu);cursor:pointer;transition:all .13s}
        .dib:hover{border-color:var(--a);color:var(--a);background:color-mix(in srgb,var(--a) 8%,transparent)}
        .dib svg{width:13px;height:13px}
        .dmb{display:none}
        @media(max-width:820px){.dmb{display:flex!important}}

        /* progress */
        .prog{position:fixed;top:52px;left:0;right:0;z-index:199;height:2px;background:color-mix(in srgb,var(--br) 60%,transparent)}
        .prog-fill{height:100%;background:linear-gradient(90deg,var(--a),var(--org));transition:width .45s cubic-bezier(.4,0,.2,1)}

        /* sidebar */
        .ds{position:fixed;top:54px;left:0;bottom:0;width:228px;overflow-y:auto;overflow-x:hidden;padding:18px 0 40px;background:var(--su);border-right:1px solid var(--br);z-index:150;transition:transform .25s cubic-bezier(.4,0,.2,1),background .3s;scrollbar-width:thin;scrollbar-color:var(--br) transparent}
        .ds::-webkit-scrollbar{width:3px}
        .ds::-webkit-scrollbar-thumb{background:var(--br);border-radius:3px}
        .ds-g{font-size:.57rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--mu);padding:0 14px 5px;margin-top:18px}
        .ds-g:first-child{margin-top:0}
        .ds-btn{display:flex;align-items:center;gap:8px;width:100%;padding:7px 14px;border:none;border-left:2.5px solid transparent;background:none;text-align:left;font-size:.77rem;color:var(--mu);cursor:pointer;font-family:inherit;transition:all .12s}
        .ds-btn:hover{color:var(--fg)}
        .ds-btn.on{color:var(--a)!important;border-left-color:var(--a);background:color-mix(in srgb,var(--a) 8%,transparent);font-weight:600}
        .ds-btn svg{width:12px;height:12px;flex-shrink:0}
        .ds-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:149;backdrop-filter:blur(3px)}
        @media(max-width:820px){
          .ds{transform:translateX(-100%)}
          .ds.open{transform:translateX(0)}
          .ds-ov.open{display:block}
        }

        /* main layout */
        .dm{margin-left:228px;padding-top:54px;min-height:100dvh;display:flex;flex-direction:column}
        @media(max-width:820px){.dm{margin-left:0}}

        /* page content panel */
        .dp{flex:1;max-width:760px;width:100%;margin:0 auto;padding:36px 28px 28px;transition:opacity .18s ease,transform .18s ease}
        .dp.hide-l{opacity:0;transform:translateX(-16px)}
        .dp.hide-r{opacity:0;transform:translateX(16px)}
        .dp.show  {opacity:1;transform:translateX(0)}
        @media(max-width:600px){.dp{padding:24px 16px 20px}}

        /* breadcrumb */
        .bc{display:flex;align-items:center;gap:6px;margin-bottom:22px;flex-wrap:wrap}
        .bc-g{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--mu)}
        .bc-s{color:var(--br);font-size:.7rem}
        .bc-p{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--a)}
        .bc-n{margin-left:auto;font-size:.65rem;color:var(--mu);font-variant-numeric:tabular-nums;background:var(--s2);border:1px solid var(--br);padding:2px 8px;border-radius:20px}

        /* divider */
        .div{height:1px;background:var(--br);margin:0 28px}
        @media(max-width:600px){.div{margin:0 16px}}

        /* prev/next */
        .pn{max-width:960px;margin:0 auto;padding:24px 28px 48px;display:flex;align-items:stretch;gap:12px}
        @media(max-width:600px){.pn{padding:16px 16px 36px;flex-direction:column}}
        .pn-btn{flex:1;display:flex;align-items:center;gap:10px;padding:18px 24px;border-radius:14px;border:1px solid var(--br);background:var(--su);cursor:pointer;font-family:inherit;transition:border-color .18s,box-shadow .18s,transform .18s,background .18s;text-align:left;position:relative;overflow:hidden;width:100%}
        .pn-btn:hover{border-color:color-mix(in srgb,var(--a) 55%,transparent);background:color-mix(in srgb,var(--a) 5%,var(--su));box-shadow:0 6px 24px color-mix(in srgb,var(--a) 14%,transparent),0 1px 4px rgba(0,0,0,.08);transform:translateY(-2px)}
        .pn-btn:active{transform:translateY(0)}
        .pn-r{justify-content:flex-end;text-align:right}
        .pn-arrow{color:var(--a);flex-shrink:0;transition:color .15s,transform .18s}
        .pn-prev:hover .pn-arrow{transform:translateX(-3px)}
        .pn-next:hover .pn-arrow{transform:translateX(3px)}
        .pn-nm{font-size:1rem;font-weight:700;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

        /* code block */
        .cb{position:relative;margin-bottom:14px;border-radius:11px;overflow:hidden;border:1px solid color-mix(in srgb,var(--a) 25%,var(--br))}
        .cb-lang{position:absolute;top:0;left:0;font-size:.56rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#9ecbe4;padding:5px 10px;background:rgba(0,0,0,.32);border-bottom-right-radius:7px;z-index:1}
        .cb-pre{background:var(--cb);padding:12px 44px 12px 12px;margin:0;overflow-x:auto;font-size:.74rem;line-height:1.8;color:var(--code);font-family:ui-monospace,'Cascadia Code',monospace;white-space:pre;scrollbar-width:thin;scrollbar-color:#1a3248 transparent}
        .cb-pre::-webkit-scrollbar{height:3px}
        .cb-pre::-webkit-scrollbar-thumb{background:#1a3248}
        .cb-copy{position:absolute;top:7px;right:7px;background:rgba(255,255,255,.06);border:1px solid #2a4760;border-radius:7px;padding:4px 8px;cursor:pointer;color:#9ecbe4;display:flex;align-items:center;gap:4px;font-size:.6rem;font-family:inherit;transition:all .14s}
        .cb-copy:hover{border-color:#14a7ff;color:#14a7ff}
        .cb-copy.done{border-color:#10b981!important;color:#10b981!important}
      `}</style>

      {/* ── Topbar ── */}
      <nav className="dn">
        <div className="dn-l">
          <button className="dib dmb" style={{ display:"none" }} onClick={() => setSideOpen(v => !v)}>
            {sideOpen ? <X size={13}/> : <Menu size={13}/>}
          </button>
          <Link href="/" className="dn-brand">
            <div className="dn-logo"><Image src="/logo.png" alt="Velamini" width={26} height={26} /></div>
            <span className="dn-name">Velamini</span>
            <span className="dn-sep">/</span>
            <span className="dn-tag">API Docs</span>
          </Link>
        </div>
        <div className="dn-r">
          <button className="dib" onClick={toggleTheme} title="Toggle theme">
            {isDark ? <Sun size={13}/> : <Moon size={13}/>}
          </button>
          <Link href="/Dashboard" style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:8, background:"var(--a)", color:"#fff", fontSize:".72rem", fontWeight:700, textDecoration:"none" }}>
            Dashboard <ChevronRight size={11}/>
          </Link>
        </div>
      </nav>

      {/* ── Progress bar ── */}
      <div className="prog">
        <div className="prog-fill" style={{ width:`${progress}%` }}/>
      </div>

      {/* ── Sidebar overlay ── */}
      <div className={`ds-ov${sideOpen?" open":""}`} onClick={() => setSideOpen(false)}/>

      {/* ── Sidebar ── */}
      <aside className={`ds${sideOpen?" open":""}`}>
        {GROUPS.map(group => (
          <div key={group}>
            <div className="ds-g">{group}</div>
            {SECTIONS.filter(s => s.group === group).map(({ id, label, Icon }) => {
              const idx = SECTIONS.findIndex(s => s.id === id);
              return (
                <button key={id} className={`ds-btn${current === idx ? " on" : ""}`}
                  onClick={() => goTo(idx, idx > current ? "r" : "l")}>
                  <Icon size={12}/>{label}
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      {/* ── Main ── */}
      <div className="dm">

        {/* Page content */}
        <div className={`dp ${visible ? "show" : (dir === "r" ? "hide-r" : "hide-l")}`}>
          {/* Breadcrumb */}
          <div className="bc">
            <span className="bc-g">{SECTIONS[current].group}</span>
            <ChevronRight size={9} className="bc-s" style={{ color:"var(--br)" }}/>
            <span className="bc-p">{SECTIONS[current].label}</span>
            <span className="bc-n">{current + 1} / {SECTIONS.length}</span>
          </div>

          {/* Section */}
          <Content/>
        </div>

        <div className="div"/>

        {/* ── Prev / Next ── */}
        <div className="pn">
          {prev ? (
            <button className="pn-btn pn-prev" onClick={() => goTo(current - 1, "l")}>
              <ChevronLeft size={18} className="pn-arrow"/>
              <span className="pn-nm">{prev.label}</span>
            </button>
          ) : <div style={{ flex:1 }}/>}

          {next ? (
            <button className="pn-btn pn-next pn-r" onClick={() => goTo(current + 1, "r")}>
              <span className="pn-nm" style={{ flex:1 }}>{next.label}</span>
              <ChevronRight size={18} className="pn-arrow"/>
            </button>
          ) : (
            <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
              <div style={{ padding:"16px 20px", borderRadius:14, border:"1px solid color-mix(in srgb,var(--a) 30%,var(--br))", background:"color-mix(in srgb,var(--a) 6%,var(--su))", display:"flex", alignItems:"center", gap:12, minWidth:160 }}>
                <span style={{ fontSize:"1.4rem", lineHeight:1 }}>🎉</span>
                <div>
                  <div style={{ fontSize:".82rem", fontWeight:700, color:"var(--fg)" }}>All done!</div>
                  <div style={{ fontSize:".7rem", color:"var(--mu)", marginTop:2, lineHeight:1.4 }}>You&apos;ve read the full docs</div>
                </div>
              </div>
            </div>
          )}
        </div>
     
      </div>
    </>
  );
}

