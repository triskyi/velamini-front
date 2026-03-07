"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Key, Globe, Code2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { Organization } from "@/types/organization/org-type";

interface Props {
  org: Organization;
  onKeyRotated?: (newKey: string) => void;
}

type CodeTab = "rest" | "embed" | "react";

export default function OrgApi({ org, onKeyRotated }: Props) {
  const [codeTab,     setCodeTab]     = useState<CodeTab>("rest");
  const [copied,      setCopied]      = useState<string | null>(null);
  const [showKey,     setShowKey]     = useState(false);
  const [rotating,    setRotating]    = useState(false);
  const [rotateError, setRotateError] = useState("");

  const [currentKey, setCurrentKey] = useState(org.apiKey || "");

  const apiKey     = currentKey || "vela_live_xxxxxxxxxxxxxxxxxxxx";
  const agentName  = org.agentName || org.name;
  const maskedKey  = apiKey.slice(0, 10) + "••••••••••••••••" + apiKey.slice(-4);

  const copy = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1600); } catch {}
  };

  const rotateKey = async () => {
    if (!confirm("Rotating your API key will invalidate the current one. All existing integrations will break until updated. Continue?")) return;
    setRotating(true);
    setRotateError("");
    try {
      const r = await fetch(`/api/organizations/${org.id}/api-key`, { method: "POST" });
      const d = await r.json();
      if (d.ok && d.apiKey) {
        setCurrentKey(d.apiKey);
        onKeyRotated?.(d.apiKey);
      } else {
        setRotateError(d.error || "Failed to rotate key.");
      }
    } catch {
      setRotateError("Network error. Please try again.");
    } finally {
      setRotating(false);
    }
  };

  const restSnippet =
`// POST /api/agent/chat
fetch("https://velamini-front.vercel.app/api/agent/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Agent-Key": "${apiKey}"
  },
  body: JSON.stringify({
    message: "What are your business hours?",
    sessionId: "user_abc123"  // keeps conversation context
  })
})
.then(r => r.json())
.then(d => console.log(d.reply));

// Response shape
// { reply: string, sessionId: string, agentName: string }`;

  const embedSnippet =
`<!-- Paste before </body> on any page -->
<script
  src="https://velamini-front.vercel.app/embed/agent.js"
  data-agent-key="${apiKey}"
  data-agent-name="${agentName}"
  data-theme="auto"
  data-position="bottom-right"
  defer>
</script>`;

  const reactSnippet =
`import { useState } from "react";

export default function AgentChat() {
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState("");

  const ask = async () => {
    const res = await fetch("/api/agent/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Agent-Key": "${apiKey}"
      },
      body: JSON.stringify({ message: msg, sessionId: "user_1" })
    });
    const data = await res.json();
    setReply(data.reply);
  };

  return (
    <div>
      <input value={msg} onChange={e => setMsg(e.target.value)} />
      <button onClick={ask}>Ask ${agentName}</button>
      {reply && <p>{reply}</p>}
    </div>
  );
}`;

  const snippets: Record<CodeTab, string> = { rest: restSnippet, embed: embedSnippet, react: reactSnippet };

  const codeTabs: { id: CodeTab; label: string }[] = [
    { id: "rest",  label: "REST API"     },
    { id: "embed", label: "Embed Widget" },
    { id: "react", label: "React"        },
  ];

  const endpoints = [
    { method: "POST", path: "/api/agent/chat",     desc: "Send a message, get a reply"     },
    { method: "GET",  path: "/api/agent/sessions", desc: "List conversation sessions"       },
    { method: "GET",  path: "/api/agent/history",  desc: "Get messages for a session"      },
    { method: "POST", path: "/api/agent/feedback", desc: "Submit thumbs up/down feedback"  },
  ];

  return (
    <>
      <style>{`
        .oapi{display:flex;flex-direction:column;gap:16px}

        /* key card */
        .oapi-key-row{display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:12px;background:var(--c-surface-2);border:1px solid var(--c-border)}
        .oapi-key-ic{width:28px;height:28px;border-radius:8px;background:var(--c-org-soft);border:1px solid color-mix(in srgb,var(--c-org) 20%,transparent);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--c-org)}
        .oapi-key-ic svg{width:12px;height:12px}
        .oapi-key-val{flex:1;font-family:ui-monospace,'Cascadia Code',monospace;font-size:.78rem;color:var(--c-accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .oapi-key-actions{display:flex;gap:5px;flex-shrink:0}
        .oapi-icon-btn{display:flex;align-items:center;justify-content:center;width:27px;height:27px;border-radius:7px;border:1px solid var(--c-border);background:var(--c-surface);color:var(--c-muted);cursor:pointer;transition:all .13s}
        .oapi-icon-btn:hover{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-soft)}
        .oapi-icon-btn--done{border-color:var(--c-success);color:var(--c-success);background:var(--c-success-soft)}
        .oapi-icon-btn svg{width:11px;height:11px}

        /* code tabs */
        .oapi-code-tabs{display:flex;gap:4px;margin-bottom:10px}
        .oapi-code-tab{padding:6px 12px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);font-size:.72rem;font-weight:700;color:var(--c-muted);cursor:pointer;font-family:inherit;transition:all .13s}
        .oapi-code-tab:hover{border-color:var(--c-accent);color:var(--c-accent)}
        .oapi-code-tab--on{background:var(--c-org-soft);border-color:var(--c-org);color:var(--c-org)}

        /* code block wrapper */
        .oapi-code-wrap{position:relative}
        .oapi-copy-float{position:absolute;top:8px;right:8px}

        /* endpoints table */
        .oapi-endpoints{display:flex;flex-direction:column;gap:6px}
        .oapi-ep{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:var(--c-surface-2);border:1px solid var(--c-border)}
        .oapi-ep-method{font-size:.62rem;font-weight:800;letter-spacing:.06em;padding:3px 7px;border-radius:5px;flex-shrink:0}
        .oapi-ep-method--post{background:color-mix(in srgb,var(--c-org) 12%,transparent);color:var(--c-org)}
        .oapi-ep-method--get{background:color-mix(in srgb,var(--c-success) 12%,transparent);color:var(--c-success)}
        .oapi-ep-path{font-family:ui-monospace,monospace;font-size:.75rem;color:var(--c-accent);flex-shrink:0}
        .oapi-ep-desc{font-size:.74rem;color:var(--c-muted);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

        /* warning */
        .oapi-warn{display:flex;align-items:flex-start;gap:8px;padding:11px 13px;border-radius:10px;background:var(--c-warn-soft);border:1px solid color-mix(in srgb,var(--c-warn) 25%,transparent);font-size:.74rem;color:var(--c-muted);line-height:1.5}
        .oapi-warn svg{width:13px;height:13px;color:var(--c-warn);flex-shrink:0;margin-top:2px}
        .oapi-warn strong{color:var(--c-warn)}
      `}</style>

      <div className="oapi">
        {/* ── API Key ── */}
        <motion.div className="od-card od-card-accent"
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
          <div className="od-card-title">API Key</div>
          <div className="od-card-sub">Use this key to authenticate all requests to your agent. Keep it secret — treat it like a password.</div>

          <div className="oapi-key-row">
            <div className="oapi-key-ic"><Key size={12}/></div>
            <span className="oapi-key-val">{showKey ? apiKey : maskedKey}</span>
            <div className="oapi-key-actions">
              <button className="oapi-icon-btn" title={showKey ? "Hide key" : "Show key"}
                onClick={() => setShowKey(v => !v)}>
                {showKey ? <EyeOff size={11}/> : <Eye size={11}/>}
              </button>
              <button className={`oapi-icon-btn ${copied === "key" ? "oapi-icon-btn--done" : ""}`}
                title="Copy key" onClick={() => copy(apiKey, "key")}>
                {copied === "key" ? <Check size={11}/> : <Copy size={11}/>}
              </button>
              <button className="oapi-icon-btn" title="Rotate key" onClick={rotateKey} disabled={rotating}>
                <RefreshCw size={11} style={rotating ? { animation:"odspin .9s linear infinite" } : {}}/>
              </button>
            </div>
          </div>

          {rotateError && (
            <div style={{ marginTop:8, fontSize:".74rem", color:"var(--c-danger)" }}>{rotateError}</div>
          )}
          <div className="oapi-warn" style={{ marginTop:12 }}>
            <AlertTriangle size={13}/>
            <span><strong>Keep this key private.</strong> Do not expose it in front-end code or public repos. Use environment variables on your server.</span>
          </div>
        </motion.div>

        {/* ── Code examples ── */}
        <motion.div className="od-card"
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.07 }}>
          <div className="od-card-title">Integration Examples</div>
          <div className="od-card-sub">Copy-paste ready code to connect your agent to any platform.</div>

          <div className="oapi-code-tabs">
            {codeTabs.map(({ id, label }) => (
              <button key={id} className={`oapi-code-tab ${codeTab === id ? "oapi-code-tab--on" : ""}`}
                onClick={() => setCodeTab(id)}>
                {label}
              </button>
            ))}
          </div>

          <div className="oapi-code-wrap">
            <pre className="od-code">{snippets[codeTab]}</pre>
            <button className={`oapi-icon-btn oapi-copy-float ${copied === codeTab ? "oapi-icon-btn--done" : ""}`}
              style={{ width:28, height:28 }}
              onClick={() => copy(snippets[codeTab], codeTab)}>
              {copied === codeTab ? <Check size={11}/> : <Copy size={11}/>}
            </button>
          </div>
        </motion.div>

        {/* ── Endpoints ── */}
        <motion.div className="od-card"
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.13 }}>
          <div className="od-card-title">Available Endpoints</div>
          <div className="od-card-sub">All requests go to <code style={{ fontFamily:"monospace", fontSize:".78rem", color:"var(--c-accent)" }}>https://velamini-front.vercel.app</code> with your <code style={{ fontFamily:"monospace", fontSize:".78rem", color:"var(--c-org)" }}>X-Agent-Key</code> header.</div>

          <div className="oapi-endpoints">
            {endpoints.map(({ method, path, desc }) => (
              <div key={path} className="oapi-ep">
                <span className={`oapi-ep-method oapi-ep-method--${method.toLowerCase()}`}>{method}</span>
                <span className="oapi-ep-path">{path}</span>
                <span className="oapi-ep-desc">{desc}</span>
                <button className={`oapi-icon-btn ${copied === path ? "oapi-icon-btn--done" : ""}`}
                  title="Copy path" onClick={() => copy(`https://velamini-front.vercel.app${path}`, path)}>
                  {copied === path ? <Check size={11}/> : <Copy size={11}/>}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Base URL ── */}
        <motion.div className="od-card"
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.18 }}>
          <div className="od-card-title">Base URL</div>
          <div className="od-card-sub">Your agent's unique endpoint for this organisation.</div>
          <div className="oapi-key-row">
            <div className="oapi-key-ic"><Globe size={12}/></div>
            <span className="oapi-key-val">https://velamini-front.vercel.app/api/agent/{org.id}</span>
            <div className="oapi-key-actions">
              <button className={`oapi-icon-btn ${copied === "url" ? "oapi-icon-btn--done" : ""}`}
                onClick={() => copy(`https://velamini-front.vercel.app/api/agent/${org.id}`, "url")}>
                {copied === "url" ? <Check size={11}/> : <Copy size={11}/>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}