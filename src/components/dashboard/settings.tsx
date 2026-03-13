import React, { useState, useEffect } from "react";
import { signOut } from "@/lib/auth-client";
import { Settings, Share2, Plus, Copy, Check, Package, Trash2, AlertTriangle, X } from "lucide-react";

const SettingsPage: React.FC = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [isSharingLoading, setIsSharingLoading] = useState(false);
  const [swagName, setSwagName] = useState("");
  const [swagSuccess, setSwagSuccess] = useState(false);
  const [swagList, setSwagList] = useState<{ id: string; content: string }[]>([]);
  const [copiedSwagId, setCopiedSwagId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingSwag, setIsDeletingSwag] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleCreateSwag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swagName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/swag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: swagName.trim() }),
      });
      if (res.ok) {
        setSwagSuccess(true);
        setSwagName("");
        await fetchSwagList();
        setTimeout(() => setSwagSuccess(false), 2500);
      }
    } catch {
      // handle silently
    } finally {
      setIsCreating(false);
    }
  };

  const fetchSwagList = async () => {
    const res = await fetch("/api/swag");
    if (res.ok) {
      const data = await res.json();
      setSwagList(Array.isArray(data.swag) ? data.swag : []);
    }
  };

  useEffect(() => {
    fetchSwagList();
    // Load real sharing status from server
    fetch("/api/share")
      .then(r => r.json())
      .then(d => { if (d.ok) setIsSharing(d.isPubliclyShared); })
      .catch(() => {});
  }, []);

  const handleDeleteSwag = async () => {
    if (!confirm("Delete your swag? This will also clear your share link.")) return;
    setIsDeletingSwag(true);
    try {
      const res = await fetch("/api/swag", { method: "DELETE" });
      if (res.ok) { setSwagList([]); setIsSharing(false); }
    } catch {}
    finally { setIsDeletingSwag(false); }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/auth/signin?loggedOut=1" });
      }
    } catch {}
    finally { setIsDeletingAccount(false); }
  };

  const getSwagUrl = (content: string) =>
    `${typeof window !== "undefined" ? window.location.origin : "https://velamini.com"}/chat/${encodeURIComponent(content.replace(/\s+/g, "-").toLowerCase())}`;

  const handleCopySwagUrl = async (swagId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(getSwagUrl(content));
      setCopiedSwagId(swagId);
      setTimeout(() => setCopiedSwagId(null), 1500);
    } catch {
      setCopiedSwagId(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .sp-wrap {
          width: 100%; min-height: 100%;
          padding: 32px 20px 52px;
          background: var(--c-bg, #EFF7FF);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: var(--c-text, #0B1E2E);
        }
        .sp-inner {
          max-width: 780px;
          margin: 0 auto;
          display: flex; flex-direction: column; gap: 24px;
        }

        /* Header */
        .sp-header {
          display: flex; align-items: center; gap: 14px;
        }
        .sp-header-icon {
          width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0;
          background: var(--c-accent, #29A9D4);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 22px color-mix(in srgb, var(--c-accent, #29A9D4) 30%, transparent);
        }
        .sp-header-icon svg { color: #fff; }
        .sp-header-title {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(1.4rem, 3vw, 1.9rem);
          font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;
          color: var(--c-text, #0B1E2E);
        }
        .sp-header-sub { font-size: 0.83rem; color: var(--c-muted, #7399BA); margin-top: 2px; }

        /* Card */
        .sp-card {
          background: var(--c-surface, #fff);
          border: 1px solid var(--c-border, #C5DCF2);
          border-radius: 18px; overflow: hidden;
        }
        .sp-card-head {
          display: flex; align-items: center; gap: 12px;
          padding: 18px 22px;
          border-bottom: 1px solid var(--c-border, #C5DCF2);
          background: color-mix(in srgb, var(--c-accent, #29A9D4) 5%, var(--c-surface, #fff));
        }
        .sp-card-head-icon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          background: var(--c-accent, #29A9D4);
          display: flex; align-items: center; justify-content: center;
        }
        .sp-card-head-icon svg { color: #fff; }
        .sp-card-head-title {
          font-family: 'Lora', serif; font-size: 1.05rem; font-weight: 600;
          color: var(--c-text, #0B1E2E);
        }
        .sp-card-head-sub { font-size: 0.76rem; color: var(--c-muted, #7399BA); margin-top: 1px; }
        .sp-card-body { padding: 22px; }

        /* Share toggle row */
        .sp-share-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px;
          background: var(--c-surface-2, #E2F0FC);
          border: 1.5px solid var(--c-border, #C5DCF2);
          border-radius: 12px;
          gap: 12px;
        }
        .sp-share-label { font-size: 0.88rem; font-weight: 600; color: var(--c-text, #0B1E2E); }
        .sp-share-sub { font-size: 0.76rem; color: var(--c-muted, #7399BA); margin-top: 2px; }
        .sp-toggle-wrap { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .sp-badge {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 3px 10px; border-radius: 20px;
          transition: all 0.2s;
        }
        .sp-badge--on {
          background: color-mix(in srgb, #22c55e 15%, transparent);
          color: #166534; border: 1px solid color-mix(in srgb, #22c55e 30%, transparent);
        }
        [data-mode="dark"] .sp-badge--on { color: #86efac; }
        .sp-badge--off {
          background: var(--c-surface-2, #E2F0FC);
          color: var(--c-muted, #7399BA);
          border: 1px solid var(--c-border, #C5DCF2);
        }

        /* Custom toggle switch */
        .sp-switch { position: relative; width: 44px; height: 24px; }
        .sp-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
        .sp-switch-track {
          position: absolute; inset: 0; border-radius: 99px; cursor: pointer;
          background: var(--c-border, #C5DCF2);
          transition: background 0.25s;
        }
        .sp-switch input:checked + .sp-switch-track {
          background: var(--c-accent, #29A9D4);
        }
        .sp-switch-track::after {
          content: ''; position: absolute;
          top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
          transition: transform 0.25s;
        }
        .sp-switch input:checked + .sp-switch-track::after {
          transform: translateX(20px);
        }

        /* Swag form */
        .sp-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .sp-label { font-size: 0.78rem; font-weight: 600; color: var(--c-text, #0B1E2E); }
        .sp-input {
          width: 100%; padding: 10px 13px;
          background: var(--c-surface-2, #E2F0FC);
          border: 1.5px solid var(--c-border, #C5DCF2);
          border-radius: 10px; outline: none;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.855rem; color: var(--c-text, #0B1E2E);
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .sp-input::placeholder { color: var(--c-muted, #7399BA); }
        .sp-input:focus {
          border-color: var(--c-accent, #29A9D4);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent, #29A9D4) 18%, transparent);
        }

        .sp-btn-submit {
          width: 100%; height: 42px; border-radius: 10px; border: none;
          background: var(--c-accent, #29A9D4); color: #fff;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.85rem; font-weight: 700;
          cursor: pointer; transition: background 0.18s, transform 0.18s, opacity 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--c-accent, #29A9D4) 30%, transparent);
        }
        .sp-btn-submit:hover:not(:disabled) { background: var(--c-accent-dim, #1D8BB2); transform: scale(1.02); }
        .sp-btn-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .sp-spin {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          animation: spSpin 0.7s linear infinite;
        }
        @keyframes spSpin { to { transform: rotate(360deg); } }

        /* Toast */
        .sp-toast {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 10px; margin-top: 12px;
          font-size: 0.82rem; font-weight: 600;
          background: color-mix(in srgb, #22c55e 12%, var(--c-surface-2, #E2F0FC));
          border: 1px solid color-mix(in srgb, #22c55e 30%, transparent);
          color: #166534; animation: spFadeIn 0.2s ease;
        }
        [data-mode="dark"] .sp-toast { color: #86efac; }
        @keyframes spFadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }

        /* Swag list */
        .sp-list-head {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.82rem; font-weight: 700;
          color: var(--c-text, #0B1E2E);
          padding: 14px 22px 10px;
          border-top: 1px solid var(--c-border, #C5DCF2);
          margin-top: 8px;
        }
        .sp-list-head svg { color: var(--c-accent, #29A9D4); }
        .sp-list { display: flex; flex-direction: column; gap: 0; padding: 0 22px 18px; }
        .sp-list-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border-radius: 11px; gap: 12px;
          border: 1px solid var(--c-border, #C5DCF2);
          background: var(--c-surface-2, #E2F0FC);
          margin-bottom: 8px;
          transition: border-color 0.18s;
        }
        .sp-list-item:last-child { margin-bottom: 0; }
        .sp-list-item:hover { border-color: var(--c-accent, #29A9D4); }
        .sp-list-name {
          font-size: 0.85rem; font-weight: 600;
          color: var(--c-text, #0B1E2E);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          min-width: 0; flex: 1;
        }
        .sp-copy-btn {
          display: flex; align-items: center; gap: 5px;
          height: 32px; padding: 0 12px; border-radius: 8px; border: none;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.76rem; font-weight: 700; cursor: pointer;
          transition: all 0.18s; flex-shrink: 0;
          white-space: nowrap;
        }
        .sp-copy-btn--idle {
          background: var(--c-surface, #fff);
          color: var(--c-accent, #29A9D4);
          border: 1.5px solid var(--c-accent, #29A9D4);
        }
        .sp-copy-btn--idle:hover {
          background: color-mix(in srgb, var(--c-accent, #29A9D4) 10%, transparent);
        }
        .sp-copy-btn--copied {
          background: color-mix(in srgb, #22c55e 15%, transparent);
          color: #166534;
          border: 1.5px solid color-mix(in srgb, #22c55e 30%, transparent);
        }
        [data-mode="dark"] .sp-copy-btn--copied { color: #86efac; }

        /* Delete swag btn */
        .sp-del-btn {
          display: flex; align-items: center; gap: 5px;
          height: 32px; padding: 0 12px; border-radius: 8px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.76rem; font-weight: 700; cursor: pointer;
          transition: all 0.18s; flex-shrink: 0; white-space: nowrap;
          background: color-mix(in srgb, #ef4444 10%, transparent);
          color: #b91c1c; border: 1.5px solid color-mix(in srgb, #ef4444 30%, transparent);
        }
        .sp-del-btn:hover:not(:disabled) { background: #ef4444; color: #fff; }
        .sp-del-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        [data-mode="dark"] .sp-del-btn { color: #fca5a5; }

        /* Danger zone card */
        .sp-danger-head { background: color-mix(in srgb, #ef4444 8%, var(--c-surface, #fff)); }
        .sp-danger-head-icon { background: #ef4444; }
        .sp-danger-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 20px; border-radius: 10px; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.85rem; font-weight: 700;
          background: color-mix(in srgb, #ef4444 10%, transparent);
          color: #b91c1c;
          border: 1.5px solid color-mix(in srgb, #ef4444 35%, transparent);
          transition: all 0.18s;
        }
        .sp-danger-btn:hover { background: #ef4444; color: #fff; }
        [data-mode="dark"] .sp-danger-btn { color: #fca5a5; }

        /* Confirm modal */
        .sp-modal-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .sp-modal {
          background: var(--c-surface, #fff);
          border: 1px solid var(--c-border, #C5DCF2);
          border-radius: 18px; padding: 28px 24px;
          max-width: 420px; width: 100%;
          box-shadow: 0 24px 60px rgba(0,0,0,0.22);
          animation: spFadeIn 0.18s ease;
        }
        .sp-modal-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: color-mix(in srgb, #ef4444 15%, transparent);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .sp-modal-icon svg { color: #ef4444; }
        .sp-modal-title {
          font-family: 'Lora', serif; font-size: 1.15rem; font-weight: 600;
          color: var(--c-text, #0B1E2E); margin-bottom: 6px;
        }
        .sp-modal-sub { font-size: 0.82rem; color: var(--c-muted, #7399BA); line-height: 1.5; margin-bottom: 18px; }
        .sp-modal-sub strong { color: var(--c-text, #0B1E2E); }
        .sp-modal-actions { display: flex; gap: 10px; }
        .sp-modal-cancel {
          flex: 1; height: 40px; border-radius: 10px; border: 1.5px solid var(--c-border, #C5DCF2);
          background: transparent; color: var(--c-text, #0B1E2E);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.18s;
        }
        .sp-modal-cancel:hover { background: var(--c-surface-2, #E2F0FC); }
        .sp-modal-confirm {
          flex: 1; height: 40px; border-radius: 10px; border: none;
          background: #ef4444; color: #fff;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: background 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .sp-modal-confirm:hover:not(:disabled) { background: #dc2626; }
        .sp-modal-confirm:disabled { opacity: 0.45; cursor: not-allowed; }

        /* NEW badge */
        .sp-new-badge {
          font-size: 0.6rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; padding: 2px 8px; border-radius: 99px;
          background: var(--c-accent, #29A9D4);
          color: #fff; margin-left: 6px;
        }
      `}</style>

      <div className="sp-wrap">
        <div className="sp-inner">

          {/* Header */}
          <div className="sp-header">
            <div className="sp-header-icon">
              <Settings size={24} />
            </div>
            <div>
              <div className="sp-header-title">Settings</div>
              <div className="sp-header-sub">Manage your virtual self and preferences</div>
            </div>
          </div>

          {/* Share card */}
          <div className="sp-card">
            <div className="sp-card-head">
              <div className="sp-card-head-icon">
                <Share2 size={18} />
              </div>
              <div>
                <div className="sp-card-head-title">Share Your Virtual Self</div>
                <div className="sp-card-head-sub">Allow others to chat with your AI-powered virtual self</div>
              </div>
            </div>
            <div className="sp-card-body">
              <div className="sp-share-row">
                <div>
                  <div className="sp-share-label">Public access</div>
                  <div className="sp-share-sub">Anyone with your link can start a conversation</div>
                </div>
                <div className="sp-toggle-wrap">
                  <span className={`sp-badge ${isSharing ? "sp-badge--on" : "sp-badge--off"}`}>
                    {isSharing ? "Active" : "Inactive"}
                  </span>
                  <label className="sp-switch">
                    <input
                      type="checkbox"
                      checked={isSharing}
                      disabled={isSharingLoading}
                      onChange={async () => {
                        setIsSharingLoading(true);
                        try {
                          const endpoint = isSharing ? "/api/share/disable" : "/api/share/enable";
                          // Derive slug from the first swag (swag content = slug)
                          const firstSwag = swagList[0];
                          const shareSlug = firstSwag
                            ? firstSwag.content.trim().replace(/\s+/g, "-").toLowerCase()
                            : undefined;
                          const res = await fetch(endpoint, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(shareSlug ? { shareSlug } : {}),
                          });
                          const data = await res.json();
                          if (data.ok) setIsSharing(v => !v);
                        } catch {
                          // silent fail — state stays unchanged
                        } finally {
                          setIsSharingLoading(false);
                        }
                      }}
                    />
                    <span className="sp-switch-track" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Swag card */}
          <div className="sp-card">
            <div className="sp-card-head">
              <div className="sp-card-head-icon">
                <Package size={18} />
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <div className="sp-card-head-title" style={{ display: "flex", alignItems: "center" }}>
                    Create Swag
                    <span className="sp-new-badge">New</span>
                  </div>
                  <div className="sp-card-head-sub">Create personalized shareable links</div>
                </div>
              </div>
            </div>

            <div className="sp-card-body">
              {swagList.length > 0 ? (
                <div className="sp-toast" style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)', borderColor: 'color-mix(in srgb, var(--c-accent) 30%, transparent)' }}>
                  <Check size={14} />
                  Your swag is set. Only one swag per account is allowed.
                </div>
              ) : (
              <form onSubmit={handleCreateSwag}>
                <div className="sp-field">
                  <label className="sp-label">Swag name</label>
                  <input
                    className="sp-input"
                    type="text"
                    placeholder="e.g. Velamini T-shirt, Custom Mug…"
                    value={swagName}
                    onChange={(e) => setSwagName(e.target.value)}
                  />
                </div>
                <button
                  className="sp-btn-submit"
                  type="submit"
                  disabled={!swagName.trim() || isCreating}
                >
                  {isCreating ? (
                    <><span className="sp-spin" /> Creating…</>
                  ) : (
                    <><Plus size={15} /> Create Swag</>
                  )}
                </button>
                {swagSuccess && (
                  <div className="sp-toast">
                    <Check size={14} />
                    Swag created successfully!
                  </div>
                )}
              </form>
              )}
            </div>

            {swagList.length > 0 && (
              <>
                <div className="sp-list-head">
                  <Package size={14} />
                  Your Swag Collection ({swagList.length})
                </div>
                <div className="sp-list">
                  {swagList.map((swag) => (
                    <div className="sp-list-item" key={swag.id}>
                      <span className="sp-list-name">{swag.content}</span>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button
                          type="button"
                          className={`sp-copy-btn ${copiedSwagId === swag.id ? "sp-copy-btn--copied" : "sp-copy-btn--idle"}`}
                          onClick={() => handleCopySwagUrl(swag.id, swag.content)}
                        >
                          {copiedSwagId === swag.id
                            ? <><Check size={12} /> Copied</>
                            : <><Copy size={12} /> Copy URL</>
                          }
                        </button>
                        <button
                          type="button"
                          className="sp-del-btn"
                          disabled={isDeletingSwag}
                          onClick={handleDeleteSwag}
                        >
                          {isDeletingSwag ? <span className="sp-spin" style={{ borderColor: "rgba(185,28,28,.3)", borderTopColor: "#b91c1c" }} /> : <Trash2 size={12} />}
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Danger zone card */}
          <div className="sp-card">
            <div className="sp-card-head sp-danger-head">
              <div className="sp-card-head-icon sp-danger-head-icon">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="sp-card-head-title">Danger Zone</div>
                <div className="sp-card-head-sub">Irreversible actions — proceed with caution</div>
              </div>
            </div>
            <div className="sp-card-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--c-text)" }}>Delete Account</div>
                  <div style={{ fontSize: "0.76rem", color: "var(--c-muted)", marginTop: 2 }}>Permanently remove your account and all associated data</div>
                </div>
                <button className="sp-danger-btn" onClick={() => setShowDeleteAccount(true)}>
                  <Trash2 size={14} /> Delete Account
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete account confirmation modal */}
      {showDeleteAccount && (
        <div className="sp-modal-overlay" onClick={() => !isDeletingAccount && setShowDeleteAccount(false)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-modal-icon"><AlertTriangle size={22} /></div>
            <div className="sp-modal-title">Delete your account?</div>
            <div className="sp-modal-sub">
              This will permanently delete your account, all training data, swag, knowledge base, and chat history. <strong>This cannot be undone.</strong>
              <br /><br />
              Type <strong>delete my account</strong> below to confirm:
            </div>
            <input
              className="sp-input"
              style={{ marginBottom: 16 }}
              placeholder="delete my account"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              disabled={isDeletingAccount}
            />
            <div className="sp-modal-actions">
              <button className="sp-modal-cancel" onClick={() => { setShowDeleteAccount(false); setDeleteConfirmText(""); }} disabled={isDeletingAccount}>
                <X size={13} style={{ display: "inline", marginRight: 4 }} /> Cancel
              </button>
              <button
                className="sp-modal-confirm"
                disabled={deleteConfirmText.toLowerCase().trim() !== "delete my account" || isDeletingAccount}
                onClick={handleDeleteAccount}
              >
                {isDeletingAccount
                  ? <><span className="sp-spin" /> Deleting…</>
                  : <><Trash2 size={13} /> Delete Forever</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
