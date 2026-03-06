"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles, FileText, Download, RefreshCw, Copy, Check,
  ChevronDown, Loader2, Zap, Brain, User, Briefcase,
  GraduationCap, Code, Star, Globe, Mail, Phone, MapPin,
  AlertCircle, ArrowRight
} from "lucide-react";

/* ─── Types ────────────────────────────────────────────────── */
type ResumeSection =
  | "header" | "summary" | "experience" | "education"
  | "skills" | "projects" | "certifications";

type GenerationPhase =
  | "idle" | "thinking" | "fetching" | "streaming" | "done" | "error";

type ResumeStyle = "modern" | "classic" | "minimal" | "bold";

interface ResumeData {
  raw: string;          // full markdown/text from AI
  sections: Record<ResumeSection, string>;
  generatedAt: Date;
}

interface ResumeViewProps {
  user?: { name?: string | null; email?: string | null; image?: string | null; id?: string };
  knowledgeBase?: any;
  knowledgeItems?: number; // backwards compat — ignored, we fetch live
}

/* ─── Thinking messages ─────────────────────────────────────── */
const THINKING_MESSAGES = [
  "Analysing your knowledge base…",
  "Identifying key skills and strengths…",
  "Crafting your professional story…",
  "Optimising for ATS systems…",
  "Polishing language and tone…",
  "Structuring your experience…",
  "Adding impact metrics…",
  "Finalising your resume…",
];

const STYLE_OPTIONS: { id: ResumeStyle; label: string; desc: string }[] = [
  { id: "modern",  label: "Modern",  desc: "Clean lines, accent colours" },
  { id: "classic", label: "Classic", desc: "Traditional, ATS-safe"       },
  { id: "minimal", label: "Minimal", desc: "Ultra-clean, white space"    },
  { id: "bold",    label: "Bold",    desc: "Strong headers, high impact" },
];

const TONE_OPTIONS = ["Professional", "Conversational", "Technical", "Creative", "Executive"];
const FOCUS_OPTIONS = ["Balanced", "Leadership", "Technical Skills", "Achievements", "Projects"];

/* ─── Word-by-word streaming text ───────────────────────────── */
function StreamingText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    idxRef.current = 0;
    setDisplayed("");
    if (!text) return;

    timerRef.current = setInterval(() => {
      if (idxRef.current >= text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      // Advance by a word boundary for natural reading feel
      let next = idxRef.current + 1;
      // Snap to next space for word-by-word effect
      while (next < text.length && text[next] !== ' ' && text[next] !== '\n') next++;
      if (next < text.length) next++; // include the space
      idxRef.current = next;
      setDisplayed(text.slice(0, next));
    }, speed);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [text, speed]);

  return <>{displayed}<span className="rv-cursor" /></>;
}

/* ─── Resume renderer ───────────────────────────────────────── */
function ResumeDocument({
  content, style, streaming
}: { content: string; style: ResumeStyle; streaming: boolean }) {
  if (!content) return null;

  // Detect if the AI returned HTML (starts with a tag or doctype)
  const isHtml = /^\s*(<(!DOCTYPE|html|div|section|article|body|style|head|table|ul|ol|h[1-6]|p|span)\b)/i.test(content);

  return (
    <div className={`rv-doc rv-doc--${style}`}>
      {streaming ? (
        isHtml ? (
          <div className="rv-rendered" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div className="rv-raw-stream">
            <StreamingText text={content} speed={12} />
          </div>
        )
      ) : isHtml ? (
        <div className="rv-rendered" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="rv-rendered">
          {content.split('\n').map((line, i) => {
            if (!line.trim()) return <div key={i} className="rv-spacer" />;
            if (line.startsWith('# '))  return <h1 key={i} className="rv-h1">{line.slice(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} className="rv-h2">{line.slice(3)}</h2>;
            if (line.startsWith('### '))return <h3 key={i} className="rv-h3">{line.slice(4)}</h3>;
            if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={i} className="rv-bold">{line.slice(2, -2)}</p>;
            }
            if (line.startsWith('- ') || line.startsWith('• ')) {
              return <li key={i} className="rv-li">{line.slice(2)}</li>;
            }
            return <p key={i} className="rv-p">{line}</p>;
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────── */
export default function ResumeView({ user, knowledgeBase, knowledgeItems: _ }: ResumeViewProps) {
  const [phase, setPhase]             = useState<GenerationPhase>("idle");
  const [streamedText, setStreamedText] = useState("");
  const [resumeData, setResumeData]   = useState<ResumeData | null>(null);
  const [style, setStyle]             = useState<ResumeStyle>("modern");
  const [tone, setTone]               = useState("Professional");
  const [focus, setFocus]             = useState("Balanced");
  const [thinkingMsg, setThinkingMsg] = useState(THINKING_MESSAGES[0]);
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [errorMsg, setErrorMsg]       = useState("");
  const [copied, setCopied]           = useState(false);
  const [jobTitle, setJobTitle]       = useState("");
  const [showConfig, setShowConfig]   = useState(true);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    const html = resumeData?.raw;
    if (!html || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"), { href: url, download: "resume.pdf" });
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { /* silent */ }
    finally { setDownloading(false); }
  };

  const thinkTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef       = useRef<AbortController | null>(null);
  const previewRef     = useRef<HTMLDivElement>(null);

  /* Thinking ticker */
  const startThinkingTicker = useCallback(() => {
    let idx = 0;
    setThinkingMsg(THINKING_MESSAGES[0]);
    thinkTimerRef.current = setInterval(() => {
      idx = (idx + 1) % THINKING_MESSAGES.length;
      setThinkingIdx(idx);
      setThinkingMsg(THINKING_MESSAGES[idx]);
    }, 1800);
  }, []);

  const stopThinkingTicker = useCallback(() => {
    if (thinkTimerRef.current) clearInterval(thinkTimerRef.current);
  }, []);

  /* Simulate word-by-word streaming from a full response */
  const streamText = useCallback((fullText: string, onDone: () => void) => {
    setPhase("streaming");
    setStreamedText("");
    let pos = 0;

    streamTimerRef.current = setInterval(() => {
      // Move 2–5 chars at a time (word chunks feel natural)
      let next = pos + Math.floor(Math.random() * 4) + 2;
      // Snap to word boundary
      while (next < fullText.length && fullText[next] !== ' ' && fullText[next] !== '\n') next++;
      if (next >= fullText.length) {
        next = fullText.length;
        clearInterval(streamTimerRef.current!);
        setStreamedText(fullText);
        setTimeout(onDone, 300);
      } else {
        pos = next + 1;
        setStreamedText(fullText.slice(0, pos));
      }
    }, 22);
  }, []);

  const generate = useCallback(async () => {
    if (phase === "thinking" || phase === "streaming" || phase === "fetching") return;

    abortRef.current = new AbortController();
    setPhase("thinking");
    setStreamedText("");
    setResumeData(null);
    setShowConfig(false);
    startThinkingTicker();

    try {
      // Build prompt
      const kbSummary = knowledgeBase
        ? JSON.stringify(knowledgeBase).slice(0, 3000)
        : "No knowledge base provided.";

      const prompt = `You are an expert resume writer. Generate a complete, professional resume in clean markdown format.

USER INFO:
- Name: ${user?.name || "Not provided"}
- Email: ${user?.email || "Not provided"}
${jobTitle ? `- Target Role: ${jobTitle}` : ""}

KNOWLEDGE BASE (skills, experience, projects):
${kbSummary}

INSTRUCTIONS:
- Style: ${style} (${STYLE_OPTIONS.find(s => s.id === style)?.desc})
- Tone: ${tone}
- Focus: ${focus}
- Use # for name, ## for sections (Experience, Education, Skills, Projects, Summary)
- Use ### for job titles/companies
- Use - for bullet points
- Include contact line after name (email, phone placeholder, location placeholder)
- Make bullet points achievement-focused with metrics where possible
- Keep it to one page equivalent of content
- Do NOT include markdown code fences, just the resume content directly

Generate a complete, polished resume now:`;

      setPhase("fetching");

      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          userId: user?.id,
          template: style,
          tone,
          focus,
          jobTitle: jobTitle || undefined,
          // Pass the prompt directly so the API uses it instead of rebuilding
          prompt,
        }),
      });

      stopThinkingTicker();

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${response.status}`);
      }

      // Handle both streaming (text/plain) and JSON responses
      const contentType = response.headers.get("content-type") ?? "";
      let fullText = "";

      if (contentType.includes("text/plain") || contentType.includes("text/html")) {
        // Streaming response — read chunks directly
        if (!response.body) throw new Error("No response body");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        stopThinkingTicker();
        setPhase("streaming");
        setStreamedText("");
        let pos = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          // Strip code fences
          const clean = fullText.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "").trim();
          setStreamedText(clean);
        }
        // Done streaming
        setResumeData({ raw: fullText.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "").trim(), sections: {} as any, generatedAt: new Date() });
        setPhase("done");
        return; // skip the streamText() call below
      } else {
        const data = await response.json();
        fullText = data.text ?? data.content?.[0]?.text ?? data.resumeHtml ?? "";
      }

      if (!fullText) throw new Error("Empty response from AI");

      // Stream it word by word
      streamText(fullText, () => {
        setResumeData({
          raw: fullText,
          sections: {} as any,
          generatedAt: new Date(),
        });
        setPhase("done");
      });

    } catch (err: any) {
      stopThinkingTicker();
      if (err?.name === "AbortError") {
        setPhase("idle");
        setShowConfig(true);
      } else {
        setErrorMsg(err?.message || "Something went wrong");
        setPhase("error");
      }
    }
  }, [phase, style, tone, focus, jobTitle, user, knowledgeBase, startThinkingTicker, stopThinkingTicker, streamText]);

  const handleCopy = useCallback(() => {
    if (!resumeData?.raw) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = resumeData.raw;
    const raw = tmp.innerText || tmp.textContent || "";
    const plainText = raw
      .split("\n")
      .map(l => l.trim())
      .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
      .join("\n")
      .trim();
    navigator.clipboard.writeText(plainText)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [resumeData]);

  const handleReset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (thinkTimerRef.current) clearInterval(thinkTimerRef.current);
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    setPhase("idle");
    setStreamedText("");
    setResumeData(null);
    setShowConfig(true);
    setErrorMsg("");
  }, []);

  const isGenerating = phase === "thinking" || phase === "fetching" || phase === "streaming";

  return (
    <>
      <style>{`
        /* ── Design tokens (inherits from DashboardWrapper) ── */
        .rv-wrap {
          display: flex; flex-direction: column;
          height: 100%; background: var(--c-bg);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          overflow: hidden;
        }

        /* ── Top bar ── */
        .rv-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px 12px;
          border-bottom: 1px solid var(--c-border);
          background: var(--c-surface);
          flex-shrink: 0;
          gap: 12px;
        }
        .rv-topbar-left { display: flex; align-items: center; gap: 10px; }
        .rv-topbar-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--c-accent-soft); border: 1px solid var(--c-border);
          display: flex; align-items: center; justify-content: center;
          color: var(--c-accent); flex-shrink: 0;
        }
        .rv-topbar-title {
          font-size: .95rem; font-weight: 700; color: var(--c-text);
          letter-spacing: -.01em;
        }
        .rv-topbar-sub {
          font-size: .72rem; color: var(--c-muted); margin-top: 1px;
        }
        .rv-topbar-actions { display: flex; align-items: center; gap: 7px; }

        /* ── Buttons ── */
        .rv-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0 14px; height: 34px; border-radius: 9px;
          font-size: .78rem; font-weight: 600;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          cursor: pointer; border: none; transition: all .15s;
          white-space: nowrap;
        }
        .rv-btn svg { flex-shrink: 0; }
        .rv-btn--primary {
          background: var(--c-accent); color: #fff;
          box-shadow: 0 2px 10px rgba(41,169,212,.3);
        }
        .rv-btn--primary:hover:not(:disabled) {
          background: var(--c-accent-dim); transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(41,169,212,.4);
        }
        .rv-btn--primary:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
        .rv-btn--ghost {
          background: var(--c-surface-2); color: var(--c-muted);
          border: 1px solid var(--c-border);
        }
        .rv-btn--ghost:hover { color: var(--c-text); border-color: var(--c-text); }
        .rv-btn--danger { background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; }
        .rv-btn--danger:hover { background: #FCA5A5; }
        .rv-btn--green { background: #DCFCE7; color: #16A34A; border: 1px solid #86EFAC; }

        /* ── Scrollable body ── */
        .rv-body {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin; scrollbar-color: var(--c-border) transparent;
        }

        /* ── Config panel ── */
        .rv-config {
          max-width: 680px; margin: 0 auto;
          padding: 24px 20px;
        }

        .rv-config-title {
          font-size: .68rem; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--c-muted); margin-bottom: 10px;
        }

        /* Job title input */
        .rv-input-wrap {
          position: relative; margin-bottom: 20px;
        }
        .rv-input {
          width: 100%; height: 42px;
          padding: 0 14px 0 38px;
          background: var(--c-surface); border: 1.5px solid var(--c-border);
          border-radius: 10px; outline: none;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: .85rem; color: var(--c-text);
          transition: border-color .15s, box-shadow .15s;
        }
        .rv-input::placeholder { color: var(--c-muted); }
        .rv-input:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px var(--c-accent-soft); }
        .rv-input-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: var(--c-muted); pointer-events: none;
        }

        /* Option grid */
        .rv-opts {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 8px; margin-bottom: 20px;
        }
        .rv-opt {
          padding: 10px 12px; border-radius: 10px;
          border: 1.5px solid var(--c-border);
          background: var(--c-surface); cursor: pointer;
          transition: all .14s; text-align: left;
        }
        .rv-opt:hover { border-color: var(--c-accent); background: var(--c-accent-soft); }
        .rv-opt--active {
          border-color: var(--c-accent); background: var(--c-accent-soft);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--c-accent) 20%, transparent);
        }
        .rv-opt-label { font-size: .8rem; font-weight: 600; color: var(--c-text); }
        .rv-opt-desc  { font-size: .68rem; color: var(--c-muted); margin-top: 2px; }
        .rv-opt--active .rv-opt-label { color: var(--c-accent); }

        /* Pill opts (tone/focus) */
        .rv-pills { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 20px; }
        .rv-pill {
          padding: 5px 12px; border-radius: 20px;
          border: 1.5px solid var(--c-border);
          background: var(--c-surface); cursor: pointer;
          font-size: .76rem; font-weight: 500; color: var(--c-muted);
          transition: all .13s;
        }
        .rv-pill:hover { border-color: var(--c-accent); color: var(--c-accent); }
        .rv-pill--active {
          border-color: var(--c-accent); background: var(--c-accent);
          color: #fff; font-weight: 600;
        }

        /* Generate CTA */
        .rv-generate-wrap {
          background: linear-gradient(135deg, var(--c-accent-soft), var(--c-surface-2));
          border: 1.5px solid var(--c-border);
          border-radius: 14px; padding: 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .rv-generate-info { display: flex; flex-direction: column; gap: 3px; }
        .rv-generate-title { font-size: .88rem; font-weight: 700; color: var(--c-text); }
        .rv-generate-sub   { font-size: .74rem; color: var(--c-muted); }
        .rv-generate-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0 22px; height: 42px; border-radius: 11px;
          background: var(--c-accent); color: #fff; border: none;
          font-size: .85rem; font-weight: 700;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          cursor: pointer; transition: all .15s; white-space: nowrap;
          box-shadow: 0 3px 14px rgba(41,169,212,.35);
        }
        .rv-generate-btn:hover { background: var(--c-accent-dim); transform: translateY(-1px); box-shadow: 0 5px 20px rgba(41,169,212,.45); }
        .rv-generate-btn:active { transform: scale(.97); }

        /* ── Generation progress ── */
        .rv-progress-wrap {
          max-width: 680px; margin: 0 auto;
          padding: 32px 20px 0;
        }

        .rv-phase-card {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: 16px; padding: 20px 22px;
          margin-bottom: 16px;
        }

        /* Phase indicator */
        .rv-phases {
          display: flex; align-items: center; gap: 0;
          margin-bottom: 20px;
        }
        .rv-phase-step {
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; flex: 1; position: relative;
        }
        .rv-phase-step:not(:last-child)::after {
          content: ''; position: absolute;
          top: 14px; left: calc(50% + 14px); right: calc(-50% + 14px);
          height: 2px;
          background: var(--c-border);
          z-index: 0;
          transition: background .4s;
        }
        .rv-phase-step--done:not(:last-child)::after { background: var(--c-accent); }
        .rv-phase-dot {
          width: 28px; height: 28px; border-radius: 50%;
          border: 2px solid var(--c-border);
          background: var(--c-surface-2);
          display: flex; align-items: center; justify-content: center;
          color: var(--c-muted); transition: all .3s; z-index: 1;
          font-size: .7rem; font-weight: 700;
        }
        .rv-phase-step--active .rv-phase-dot {
          border-color: var(--c-accent); background: var(--c-accent-soft); color: var(--c-accent);
          animation: rv-pulse 1.5s ease-in-out infinite;
        }
        .rv-phase-step--done .rv-phase-dot {
          border-color: var(--c-accent); background: var(--c-accent); color: #fff;
        }
        @keyframes rv-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(41,169,212,.4); }
          50%       { box-shadow: 0 0 0 6px rgba(41,169,212,0); }
        }
        .rv-phase-label {
          font-size: .62rem; font-weight: 600; color: var(--c-muted);
          text-align: center; letter-spacing: .03em;
          text-transform: uppercase;
        }
        .rv-phase-step--active .rv-phase-label,
        .rv-phase-step--done .rv-phase-label { color: var(--c-accent); }

        /* Thinking message */
        .rv-thinking {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 0 4px;
        }
        .rv-thinking-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: var(--c-accent-soft); border: 1px solid var(--c-border);
          display: flex; align-items: center; justify-content: center;
          color: var(--c-accent); flex-shrink: 0;
        }
        .rv-thinking-icon svg { animation: rv-spin 1.2s linear infinite; }
        @keyframes rv-spin { to { transform: rotate(360deg); } }
        .rv-thinking-text {
          font-size: .85rem; color: var(--c-text); font-weight: 500;
          animation: rv-fade .4s ease;
        }
        @keyframes rv-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .rv-thinking-dots span {
          animation: rv-dot 1.2s infinite;
          opacity: 0;
        }
        .rv-thinking-dots span:nth-child(2) { animation-delay: .2s; }
        .rv-thinking-dots span:nth-child(3) { animation-delay: .4s; }
        @keyframes rv-dot { 0%,80%,100%{opacity:0}40%{opacity:1} }

        /* Progress bar */
        .rv-progbar-wrap {
          height: 4px; background: var(--c-border); border-radius: 2px;
          margin-top: 16px; overflow: hidden;
        }
        .rv-progbar {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, var(--c-accent), #7DD3FC);
          transition: width .6s ease;
          position: relative; overflow: hidden;
        }
        .rv-progbar::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
          animation: rv-shimmer 1.4s infinite;
        }
        @keyframes rv-shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }

        /* ── Streaming preview ── */
        .rv-preview-wrap {
          max-width: 780px; margin: 0 auto;
          padding: 0 20px 24px;
        }

        .rv-preview-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px; gap: 10px;
        }
        .rv-preview-label {
          font-size: .7rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: var(--c-muted);
          display: flex; align-items: center; gap: 6px;
        }
        .rv-preview-label-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--c-accent);
          animation: rv-blink 1s ease-in-out infinite;
        }
        @keyframes rv-blink { 0%,100%{opacity:1}50%{opacity:.3} }

        /* ── Paper wrapper (desk effect) ── */
        .rv-paper-desk {
          background: #d0d5dd;
          border-radius: 18px;
          padding: 24px 20px;
          box-shadow: inset 0 2px 12px rgba(0,0,0,.12);
        }

        /* ── The paper itself ── */
        .rv-doc {
          background: #ffffff !important;
          border: none;
          border-radius: 4px;
          padding: 44px 48px;
          box-shadow:
            0 1px 4px rgba(0,0,0,.10),
            0 6px 24px rgba(0,0,0,.13),
            0 18px 56px rgba(0,0,0,.08);
          min-height: 400px;
          font-size: .875rem; line-height: 1.75;
          color: #1a1a2e;
          position: relative;
          /* top punch holes feel */
        }
        .rv-doc::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #29a9d4, #7DD3FC, #29a9d4);
          border-radius: 4px 4px 0 0;
        }
        @media(max-width:600px){ .rv-doc{ padding: 28px 22px; } }

        /* Override text colours inside paper to always be dark */
        .rv-doc .rv-h1, .rv-doc .rv-h2, .rv-doc .rv-h3,
        .rv-doc .rv-p, .rv-doc .rv-bold, .rv-doc .rv-li { color: #1a1a2e; }
        .rv-doc .rv-h2 { color: #29a9d4; border-bottom-color: #e2e8f0; }
        .rv-doc.rv-doc--classic .rv-h2 { color: #1a1a2e; border-bottom-color: #1a1a2e; }
        .rv-doc.rv-doc--minimal .rv-h2 { color: #64748b; }
        .rv-doc .rv-contact-line { color: #4a5568; }
        .rv-doc .rv-li::before { color: #29a9d4; }
        .rv-doc.rv-doc--classic .rv-li::before { color: #1a1a2e; }
        .rv-doc.rv-doc--minimal .rv-li::before { color: #94a3b8; }

        /* Writing cursor on paper */
        .rv-cursor {
          display: inline-block; width: 2px; height: 1em;
          background: #29a9d4; margin-left: 1px;
          vertical-align: text-bottom;
          animation: rv-blink 0.6s steps(1) infinite;
        }
        /* paper pen effect during streaming */
        .rv-doc .rv-rendered { animation: rv-appear .15s ease; }
        @keyframes rv-appear { from{opacity:.7} to{opacity:1} }

        /* Streaming raw text */
        .rv-raw-stream {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: .875rem; line-height: 1.8;
          white-space: pre-wrap; color: #1a1a2e;
        }

        /* Rendered resume styles */
        .rv-h1 {
          font-size: 1.6rem; font-weight: 800; letter-spacing: -.02em;
          color: var(--c-text); margin-bottom: 4px; line-height: 1.2;
        }
        .rv-doc--bold .rv-h1 { font-size: 2rem; }
        .rv-doc--minimal .rv-h1 { font-weight: 300; letter-spacing: .05em; text-transform: uppercase; }

        .rv-h2 {
          font-size: .72rem; font-weight: 800; letter-spacing: .12em;
          text-transform: uppercase; color: var(--c-accent);
          border-bottom: 2px solid var(--c-border); padding-bottom: 4px;
          margin: 20px 0 10px;
        }
        .rv-doc--classic .rv-h2 { color: var(--c-text); border-bottom-color: var(--c-text); }
        .rv-doc--minimal .rv-h2 { border: none; color: var(--c-muted); font-weight: 600; }
        .rv-doc--bold .rv-h2 {
          background: var(--c-accent); color: #fff; padding: 4px 10px;
          border-radius: 4px; border: none; display: inline-block; margin-bottom: 12px;
        }

        .rv-h3 {
          font-size: .88rem; font-weight: 700; color: var(--c-text);
          margin: 10px 0 2px;
        }
        .rv-contact-line {
          font-size: .78rem; color: var(--c-muted); margin: 2px 0;
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .rv-p   { margin: 4px 0; color: var(--c-text); }
        .rv-bold{ font-weight: 700; color: var(--c-text); margin: 4px 0; }
        .rv-li  {
          margin: 3px 0 3px 16px; color: var(--c-text);
          position: relative; list-style: none;
        }
        .rv-li::before {
          content: '▸'; position: absolute; left: -14px;
          color: var(--c-accent); font-size: .7rem; top: 3px;
        }
        .rv-doc--classic .rv-li::before { content: '•'; color: var(--c-text); top: 0; }
        .rv-doc--minimal .rv-li::before { content: '—'; color: var(--c-muted); }
        .rv-spacer { height: 8px; }

        /* ── Done state actions ── */
        .rv-actions {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }

        /* ── Error ── */
        .rv-error {
          max-width: 460px; margin: 40px auto; text-align: center;
          padding: 0 20px;
        }
        .rv-error-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: #FEE2E2; display: flex; align-items: center;
          justify-content: center; color: #DC2626; margin: 0 auto 14px;
        }
        .rv-error-title { font-size: 1rem; font-weight: 700; color: var(--c-text); margin-bottom: 6px; }
        .rv-error-msg   { font-size: .8rem; color: var(--c-muted); margin-bottom: 20px; }

        /* ── Responsive ── */
        @media(max-width:480px){
          .rv-topbar { padding: 12px 14px 10px; }
          .rv-config { padding: 16px 14px; }
          .rv-progress-wrap { padding: 20px 14px 0; }
          .rv-preview-wrap { padding: 0 14px 20px; }
          .rv-generate-wrap { flex-direction: column; align-items: stretch; }
          .rv-generate-btn { justify-content: center; }
          .rv-opts { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="rv-wrap">

        {/* ── Top bar ── */}
        <div className="rv-topbar">
          <div className="rv-topbar-left">
            <div className="rv-topbar-icon"><FileText size={17} /></div>
            <div>
              <div className="rv-topbar-title">Resume Builder</div>
              <div className="rv-topbar-sub">AI-powered · generates in seconds</div>
            </div>
          </div>
          <div className="rv-topbar-actions">
            {phase === "done" && resumeData && (
              <>
                <button className={`rv-btn ${copied ? "rv-btn--green" : "rv-btn--ghost"}`} onClick={handleCopy}>
                  {copied ? <><Check size={13}/> Copied</> : <><Copy size={13}/> Copy</>}
                </button>
                <button className="rv-btn rv-btn--ghost" onClick={handleReset}>
                  <RefreshCw size={13}/> Regenerate
                </button>
              </>
            )}
            {isGenerating && (
              <button className="rv-btn rv-btn--danger" onClick={handleReset}>
                Cancel
              </button>
            )}
            {(phase === "idle" || phase === "error") && resumeData === null && (
              <button className="rv-btn rv-btn--ghost" onClick={() => setShowConfig(v => !v)}>
                <ChevronDown size={13} style={{transform: showConfig ? "rotate(180deg)" : "none", transition: "transform .2s"}} />
                {showConfig ? "Collapse" : "Options"}
              </button>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="rv-body" ref={previewRef}>

          {/* ── Config ── */}
          {showConfig && phase === "idle" && (
            <div className="rv-config">

              {/* Job title */}
              <div className="rv-config-title">Target role (optional)</div>
              <div className="rv-input-wrap">
                <Briefcase size={14} className="rv-input-icon" />
                <input
                  className="rv-input"
                  placeholder="e.g. Senior Software Engineer, Product Designer…"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                />
              </div>

              {/* Style */}
              <div className="rv-config-title">Resume style</div>
              <div className="rv-opts">
                {STYLE_OPTIONS.map(s => (
                  <button
                    key={s.id}
                    className={`rv-opt ${style === s.id ? "rv-opt--active" : ""}`}
                    onClick={() => setStyle(s.id)}
                  >
                    <div className="rv-opt-label">{s.label}</div>
                    <div className="rv-opt-desc">{s.desc}</div>
                  </button>
                ))}
              </div>

              {/* Tone */}
              <div className="rv-config-title">Tone</div>
              <div className="rv-pills">
                {TONE_OPTIONS.map(t => (
                  <button
                    key={t}
                    className={`rv-pill ${tone === t ? "rv-pill--active" : ""}`}
                    onClick={() => setTone(t)}
                  >{t}</button>
                ))}
              </div>

              {/* Focus */}
              <div className="rv-config-title">Emphasis</div>
              <div className="rv-pills">
                {FOCUS_OPTIONS.map(f => (
                  <button
                    key={f}
                    className={`rv-pill ${focus === f ? "rv-pill--active" : ""}`}
                    onClick={() => setFocus(f)}
                  >{f}</button>
                ))}
              </div>

              {/* Generate CTA */}
              <div className="rv-generate-wrap">
                <div className="rv-generate-info">
                  <div className="rv-generate-title">
                    <Zap size={14} style={{display:"inline",verticalAlign:"middle",marginRight:4}} />
                    Ready to generate
                  </div>
                  <div className="rv-generate-sub">
                    {style.charAt(0).toUpperCase() + style.slice(1)} · {tone} · {focus} focus
                  </div>
                </div>
                <button className="rv-generate-btn" onClick={generate}>
                  <Sparkles size={16} />
                  Generate Resume
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── Progress ── */}
          {(phase === "thinking" || phase === "fetching" || phase === "streaming") && (
            <div className="rv-progress-wrap">
              <div className="rv-phase-card">
                {/* Phase steps */}
                <div className="rv-phases">
                  {[
                    { id: "thinking",  icon: <Brain size={12}/>,    label: "Analysing"  },
                    { id: "fetching",  icon: <Zap size={12}/>,      label: "Writing"    },
                    { id: "streaming", icon: <FileText size={12}/>,  label: "Building"  },
                  ].map((step, i) => {
                    const phaseOrder = ["thinking","fetching","streaming"];
                    const currentIdx = phaseOrder.indexOf(phase);
                    const stepIdx    = phaseOrder.indexOf(step.id);
                    const isDone   = stepIdx < currentIdx;
                    const isActive = stepIdx === currentIdx;
                    return (
                      <div key={step.id} className={`rv-phase-step ${isDone ? "rv-phase-step--done" : ""} ${isActive ? "rv-phase-step--active" : ""}`}>
                        <div className="rv-phase-dot">
                          {isDone ? <Check size={11}/> : step.icon}
                        </div>
                        <div className="rv-phase-label">{step.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Thinking message */}
                <div className="rv-thinking">
                  <div className="rv-thinking-icon">
                    <Loader2 size={15} />
                  </div>
                  <div className="rv-thinking-text" key={thinkingIdx}>
                    {thinkingMsg}
                    <span className="rv-thinking-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="rv-progbar-wrap">
                  <div className="rv-progbar" style={{
                    width: phase === "thinking" ? "25%" : phase === "fetching" ? "60%" : "90%"
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* ── Streaming / Done preview ── */}
          {(phase === "streaming" || phase === "done") && (
            <div className="rv-preview-wrap" style={{paddingTop: phase === "done" ? 20 : 8}}>
              <div className="rv-preview-header">
                <div className="rv-preview-label">
                  {phase === "streaming" && <div className="rv-preview-label-dot" />}
                  {phase === "streaming" ? "Generating" : "Your Resume"}
                </div>
              </div>

              <div className="rv-paper-desk">
                <ResumeDocument
                  content={phase === "streaming" ? streamedText : (resumeData?.raw ?? "")}
                  style={style}
                  streaming={phase === "streaming"}
                />
              </div>

              {phase === "done" && (
                <div style={{marginTop: 14, display:"flex", alignItems:"center", justifyContent:"space-between", gap: 10, flexWrap:"wrap"}}>
                  <div style={{fontSize:".72rem", color:"var(--c-muted)", display:"flex", alignItems:"center", gap: 5}}>
                    <Check size={11} style={{color:"var(--c-accent)"}}/>
                    Generated {resumeData?.generatedAt.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
                    {" · "}{style.charAt(0).toUpperCase()+style.slice(1)}
                    {" · "}{tone}
                  </div>
                  <button
                    className="rv-btn rv-btn--primary"
                    onClick={download}
                    disabled={downloading}
                    style={{gap: 7}}
                  >
                    {downloading
                      ? <><Loader2 size={13} style={{animation:"rv-spin 1s linear infinite"}}/> Preparing PDF…</>
                      : <><Download size={13}/> Download PDF</>}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Error ── */}
          {phase === "error" && (
            <div className="rv-error">
              <div className="rv-error-icon"><AlertCircle size={22}/></div>
              <div className="rv-error-title">Generation failed</div>
              <div className="rv-error-msg">{errorMsg}</div>
              <button className="rv-btn rv-btn--primary" onClick={() => { setPhase("idle"); setShowConfig(true); setErrorMsg(""); }}>
                <RefreshCw size={13}/> Try again
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}