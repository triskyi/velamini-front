"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FileText, Download, X, Loader, Sparkles, Lock, BookOpen } from "lucide-react";

const BASE64_LOGO = "data:image/png;base64,REPLACE_WITH_YOUR_BASE64_STRING";
const TEMPLATE = { id: "modern-yellow", name: "Modern Yellow", image: BASE64_LOGO };
const MIN_KNOWLEDGE = 4;

export default function ResumeView({ knowledgeItems = 0 }: { knowledgeItems?: number }) {
  const [showPreview, setShowPreview]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [resumeHtml, setResumeHtml]     = useState("");
  const [downloading, setDownloading]   = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const { data: session }               = useSession();

  const generate = async () => {
    setLoading(true); setShowPreview(true); setError(null); setResumeHtml("");
    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id, template: TEMPLATE.id }),
      });
      if (!res.ok) throw new Error("Failed to generate resume");
      const data = await res.json();
      let html = data.resumeHtml || "";
      if (html.trim().startsWith("```")) html = html.replace(/^```[a-zA-Z]*\n?|```$/g, "").trim();
      setResumeHtml(html || data.resumeText || "");
    } catch (e: any) { setError(e.message || "Unknown error"); }
    finally { setLoading(false); }
  };

  const download = async () => {
    if (!resumeHtml) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: resumeHtml }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"), { href: url, download: "resume.pdf" });
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { setError("PDF download failed"); }
    finally { setDownloading(false); }
  };

  return (
    <>
      <style>{`
        .rv { padding: 18px 14px 48px; background: var(--c-bg); min-height: 100%; transition: background .3s; }
        @media(min-width:600px){ .rv { padding: 28px 28px 56px; } }
        @media(min-width:1024px){ .rv { padding: 36px 40px 64px; } }
        .rv-inner { max-width: 620px; margin: 0 auto; }

        .rv-header { margin-bottom: 28px; }
        .rv-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(1.55rem, 4vw, 2rem); font-weight: 400;
          letter-spacing: -.02em; color: var(--c-text); margin-bottom: 4px;
        }
        .rv-sub { font-size: .8rem; color: var(--c-muted); }

        .rv-card {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: 16px; padding: 28px 24px;
          box-shadow: var(--shadow-sm); transition: background .3s, border-color .3s;
          margin-bottom: 16px;
        }
        .rv-card-title {
          font-family: 'DM Serif Display', serif; font-size: .95rem;
          color: var(--c-text); margin-bottom: 14px;
          display: flex; align-items: center; gap: 7px;
        }
        .rv-card-title svg { color: var(--c-accent); width: 14px; height: 14px; }

        .rv-tips { display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; }
        .rv-tip {
          display: flex; align-items: center; gap: 10px;
          font-size: .82rem; color: var(--c-muted); line-height: 1.5;
        }
        .rv-tip-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--c-accent); flex-shrink: 0;
        }

        .rv-btn {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          width: 100%; padding: 13px 20px; border-radius: 12px;
          background: var(--c-accent); color: #fff;
          border: none; font-size: .88rem; font-weight: 700;
          font-family: inherit; cursor: pointer; transition: all .15s;
          min-height: 48px;
        }
        .rv-btn:hover:not(:disabled) { background: var(--c-accent-dim); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(41,169,212,.28); }
        .rv-btn:disabled { opacity: .65; cursor: not-allowed; transform: none; }
        .rv-btn svg { width: 15px; height: 15px; }

        /* Locked gate */
        .rv-locked {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 32px 20px; gap: 16px;
        }
        .rv-locked-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: color-mix(in srgb, var(--c-accent) 12%, var(--c-surface-2));
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rv-locked-icon svg { color: var(--c-accent); }
        .rv-locked-title {
          font-family: 'DM Serif Display', serif; font-size: 1.05rem;
          color: var(--c-text); font-weight: 400;
        }
        .rv-locked-sub { font-size: .81rem; color: var(--c-muted); line-height: 1.6; max-width: 340px; }
        .rv-locked-progress {
          display: flex; align-items: center; gap: 10px;
          background: var(--c-surface-2); border: 1px solid var(--c-border);
          border-radius: 10px; padding: 12px 16px; width: 100%; max-width: 340px;
          font-size: .82rem; color: var(--c-text);
        }
        .rv-locked-bar-wrap {
          flex: 1; height: 6px; border-radius: 99px;
          background: var(--c-border); overflow: hidden;
        }
        .rv-locked-bar {
          height: 100%; border-radius: 99px;
          background: var(--c-accent); transition: width .4s ease;
        }
        .rv-locked-count { font-weight: 700; font-size: .82rem; color: var(--c-accent); white-space: nowrap; }

        /* Preview modal */
        .rv-modal {
          position: fixed; inset: 0; z-index: 300;
          display: flex; flex-direction: column;
        }
        .rv-modal-bg { position: absolute; inset: 0; background: rgba(8,20,32,.75); backdrop-filter: blur(5px); }
        .rv-modal-panel {
          position: relative; z-index: 1;
          width: min(900px, 96vw); max-height: 92dvh;
          margin: auto;
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: 18px; box-shadow: var(--shadow-md);
          display: flex; flex-direction: column; overflow: hidden;
          transition: background .3s, border-color .3s;
        }
        .rv-modal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-bottom: 1px solid var(--c-border);
          flex-shrink: 0;
        }
        .rv-modal-title {
          font-family: 'DM Serif Display', serif; font-size: .95rem; color: var(--c-text);
          display: flex; align-items: center; gap: 7px;
        }
        .rv-modal-title svg { color: var(--c-accent); width: 14px; height: 14px; }
        .rv-close {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 7px;
          border: 1px solid var(--c-border); background: var(--c-surface-2);
          color: var(--c-muted); cursor: pointer; transition: all .13s;
        }
        .rv-close:hover { color: var(--c-text); border-color: var(--c-text); }
        .rv-close svg { width: 12px; height: 12px; }

        .rv-modal-body {
          flex: 1; overflow-y: auto; padding: 20px;
          scrollbar-width: thin; scrollbar-color: var(--c-border) transparent;
          -webkit-overflow-scrolling: touch;
        }
        .rv-modal-body::-webkit-scrollbar { width: 4px; }
        .rv-modal-body::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 4px; }

        .rv-modal-foot {
          flex-shrink: 0; padding: 12px 18px; border-top: 1px solid var(--c-border);
          display: flex; align-items: center; justify-content: flex-end; gap: 8px;
          background: var(--c-surface-2);
        }
        .rv-dl-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 10px;
          background: var(--c-accent); color: #fff;
          border: none; font-size: .84rem; font-weight: 700;
          font-family: inherit; cursor: pointer; transition: all .14s;
        }
        .rv-dl-btn:hover:not(:disabled) { background: var(--c-accent-dim); }
        .rv-dl-btn:disabled { opacity: .6; cursor: not-allowed; }
        .rv-dl-btn svg { width: 13px; height: 13px; }

        .rv-loading {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 14px; padding: 60px 20px; color: var(--c-muted);
        }
        .rv-spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 3px solid var(--c-border); border-top-color: var(--c-accent);
          animation: rvspin .8s linear infinite;
        }
        @keyframes rvspin { to { transform: rotate(360deg); } }
        .rv-error {
          padding: 16px; border-radius: 10px; font-size: .82rem;
          background: #FEE2E2; border: 1px solid #FCA5A5; color: #DC2626;
          margin-top: 12px;
        }
      `}</style>

      <div className="rv">
        <div className="rv-inner">

          <div className="rv-header">
            <h1 className="rv-title">Resume Builder</h1>
            <p className="rv-sub">Generate a professional resume from your training data.</p>
          </div>

          <div className="rv-card">
            <div className="rv-card-title"><FileText /> Tips for a great resume</div>
            <div className="rv-tips">
              {["Fill in your training data thoroughly before generating.", "Use clear, concise language in your bio and Q&A.", "Add your location and website to your profile.", "Review and proofread before downloading."].map((t, i) => (
                <div key={i} className="rv-tip"><div className="rv-tip-dot" />{t}</div>
              ))}
            </div>

            {knowledgeItems >= MIN_KNOWLEDGE ? (
              <>
                <button className="rv-btn" onClick={generate} disabled={loading}>
                  {loading ? <><div className="rv-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating…</> : <><Sparkles size={15} /> Generate Resume</>}
                </button>
                {error && <div className="rv-error">{error}</div>}
              </>
            ) : (
              <div className="rv-locked">
                <div className="rv-locked-icon"><Lock size={24} /></div>
                <div className="rv-locked-title">Complete your knowledge base first</div>
                <div className="rv-locked-sub">
                  Resume generation requires at least <strong>{MIN_KNOWLEDGE} knowledge items</strong> so the AI has accurate information about you — no imagined content.
                </div>
                <div className="rv-locked-progress">
                  <BookOpen size={14} style={{ color: 'var(--c-accent)', flexShrink: 0 }} />
                  <div className="rv-locked-bar-wrap">
                    <div className="rv-locked-bar" style={{ width: `${Math.min((knowledgeItems / MIN_KNOWLEDGE) * 100, 100)}%` }} />
                  </div>
                  <span className="rv-locked-count">{knowledgeItems}/{MIN_KNOWLEDGE}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="rv-modal">
          <div className="rv-modal-bg" onClick={() => { if (!loading) setShowPreview(false); }} />
          <div className="rv-modal-panel">
            <div className="rv-modal-head">
              <div className="rv-modal-title"><FileText /> Resume Preview</div>
              <button className="rv-close" onClick={() => setShowPreview(false)}><X size={12} /></button>
            </div>

            <div className="rv-modal-body">
              {loading ? (
                <div className="rv-loading">
                  <div className="rv-spinner" />
                  <span style={{ fontSize: '.82rem' }}>Generating your resume…</span>
                </div>
              ) : resumeHtml ? (
                <div dangerouslySetInnerHTML={{ __html: resumeHtml }} />
              ) : (
                <div className="rv-loading"><span style={{ fontSize: '.82rem', color: 'var(--c-muted)' }}>No content generated.</span></div>
              )}
            </div>

            {resumeHtml && !loading && (
              <div className="rv-modal-foot">
                <button className="rv-dl-btn" onClick={download} disabled={downloading}>
                  {downloading ? <><div className="rv-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Downloading…</> : <><Download size={13} /> Download PDF</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}