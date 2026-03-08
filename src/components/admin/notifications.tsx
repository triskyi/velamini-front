"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Bell, Trash2, ChevronLeft, ChevronRight, Search, RotateCcw } from "lucide-react";

type NotifType  = "info" | "system" | "billing" | "warning";
type SendScope  = "all" | "personal" | "org" | "user" | "orgone";
type FilterScope = "all" | "personal" | "org" | "user" | "orgone";
type FilterType  = "all" | "info" | "system" | "billing" | "warning";

interface Notif {
  id: string;
  type: NotifType;
  scope: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  user?: { id: string; name: string | null; email: string | null } | null;
  organization?: { id: string; name: string } | null;
}

const TYPE_COLORS: Record<NotifType | string, string> = {
  system:  "an-badge--system",
  billing: "an-badge--billing",
  info:    "an-badge--info",
  warning: "an-badge--warning",
};

const SCOPE_LABELS: Record<string, string> = {
  all:     "Broadcast",
  personal:"All Users",
  org:     "All Orgs",
  user:    "User",
  orgone:  "Org",
};

const PAGE_SIZE = 15;

export default function AdminNotifications() {
  // ── List state ─────────────────────────────────────────────────────────
  const [notifs, setNotifs]       = useState<Notif[]>([]);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [fScope, setFScope]       = useState<FilterScope>("all");
  const [fType,  setFType]        = useState<FilterType>("all");

  // ── Compose state ──────────────────────────────────────────────────────
  const [showCompose, setShowCompose]   = useState(false);
  const [cScope, setCScope]             = useState<SendScope>("all");
  const [cType,  setCType]              = useState<NotifType>("info");
  const [cTitle, setCTitle]             = useState("");
  const [cBody,  setCBody]              = useState("");
  const [cTarget, setCTarget]           = useState("");  // userId or orgId for targeted
  const [sending, setSending]           = useState(false);
  const [sendResult, setSendResult]     = useState<string | null>(null);

  // ── Users/Orgs for targeted picker ────────────────────────────────────
  const [userOptions,  setUserOptions]  = useState<{ id: string; name: string | null; email: string | null }[]>([]);
  const [orgOptions,   setOrgOptions]   = useState<{ id: string; name: string }[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");

  const fetchList = useCallback((p: number, s: FilterScope, t: FilterType) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE), scope: s, type: t });
    fetch(`/api/admin/notifications?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setNotifs(d.notifications);
          setTotal(d.total);
          setPages(d.pages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchList(page, fScope, fType); }, [page, fScope, fType, fetchList]);

  // Load user/org lists when compose opens with targeted scope
  useEffect(() => {
    if (!showCompose) return;
    if (cScope === "user")   fetch("/api/admin/users?pageSize=200").then(r => r.json()).then(d => d.ok && setUserOptions(d.users));
    if (cScope === "orgone") fetch("/api/admin/organizations?pageSize=200").then(r => r.json()).then(d => d.ok && setOrgOptions(d.organizations ?? d.orgs ?? []));
  }, [showCompose, cScope]);

  const handleDelete = (id: string) => {
    fetch(`/api/admin/notifications?id=${id}`, { method: "DELETE" })
      .then(r => r.json())
      .then(d => { if (d.ok) setNotifs(p => p.filter(n => n.id !== id)); })
      .catch(() => {});
  };

  const handleSend = () => {
    if (!cTitle.trim() || !cBody.trim()) { setSendResult("Title and message body are required."); return; }
    if ((cScope === "user") && !cTarget)   { setSendResult("Please select a user."); return; }
    if ((cScope === "orgone") && !cTarget) { setSendResult("Please select an organization."); return; }

    setSending(true);
    setSendResult(null);

    const payload: Record<string, string> = { scope: cScope, type: cType, title: cTitle, body: cBody };
    if (cScope === "user")   payload.userId = cTarget;
    if (cScope === "orgone") payload.orgId  = cTarget;

    fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setSendResult(`✓ Sent to ${d.count ?? 1} recipient(s).`);
          setCTitle(""); setCBody(""); setCTarget(""); setPickerSearch("");
          fetchList(1, fScope, fType);
          setPage(1);
        } else {
          setSendResult(d.error ?? "Failed to send.");
        }
      })
      .catch(() => setSendResult("Network error."))
      .finally(() => setSending(false));
  };

  const filteredUsers = userOptions.filter(u =>
    !pickerSearch || (u.name ?? u.email ?? "").toLowerCase().includes(pickerSearch.toLowerCase())
  );
  const filteredOrgs = orgOptions.filter(o =>
    !pickerSearch || o.name.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <>
      <style>{`
        .an{padding:18px 14px 48px;background:var(--c-bg);min-height:100%;transition:background .3s}
        @media(min-width:600px){.an{padding:26px 24px 56px}}
        @media(min-width:1024px){.an{padding:32px 36px 64px}}
        .an-inner{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:20px}

        .an-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .an-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.4rem,4vw,2rem);font-weight:400;letter-spacing:-.022em;color:var(--c-text);margin-bottom:2px}
        .an-sub{font-size:.8rem;color:var(--c-muted)}
        .an-compose-btn{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;background:var(--c-accent);color:#fff;border:none;cursor:pointer;font-size:.82rem;font-weight:600;font-family:inherit;transition:opacity .15s}
        .an-compose-btn:hover{opacity:.88}

        /* Filters */
        .an-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
        .an-seg{display:inline-flex;background:var(--c-surface-2);border-radius:8px;padding:2px;gap:2px}
        .an-seg-btn{padding:5px 11px;border:none;background:transparent;border-radius:6px;font-size:.75rem;font-weight:600;color:var(--c-muted);cursor:pointer;font-family:inherit;transition:background .12s,color .12s;white-space:nowrap}
        .an-seg-btn--on{background:var(--c-bg);color:var(--c-text);box-shadow:0 1px 3px rgba(0,0,0,.08)}

        /* Compose panel */
        .an-compose{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;padding:20px 18px 18px;display:flex;flex-direction:column;gap:14px}
        .an-compose-title{font-size:.92rem;font-weight:700;color:var(--c-text);margin-bottom:2px}
        .an-field{display:flex;flex-direction:column;gap:5px}
        .an-label{font-size:.75rem;font-weight:600;color:var(--c-muted);text-transform:uppercase;letter-spacing:.04em}
        .an-input,.an-textarea,.an-select{padding:8px 11px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-bg);color:var(--c-text);font-size:.82rem;font-family:inherit;outline:none;transition:border-color .12s}
        .an-input:focus,.an-textarea:focus,.an-select:focus{border-color:var(--c-accent)}
        .an-textarea{resize:vertical;min-height:90px}
        .an-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:540px){.an-row2{grid-template-columns:1fr}}
        .an-picker-wrap{position:relative}
        .an-picker-search{display:flex;align-items:center;gap:7px;padding:7px 10px;border-radius:8px 8px 0 0;border:1px solid var(--c-border);border-bottom:none;background:var(--c-bg)}
        .an-picker-search svg{color:var(--c-muted);flex-shrink:0}
        .an-picker-search input{border:none;outline:none;background:transparent;color:var(--c-text);font-size:.8rem;font-family:inherit;flex:1}
        .an-picker-list{border:1px solid var(--c-border);border-radius:0 0 8px 8px;max-height:160px;overflow-y:auto;background:var(--c-bg)}
        .an-picker-item{padding:7px 11px;font-size:.8rem;cursor:pointer;color:var(--c-text);border-bottom:1px solid var(--c-border);transition:background .1s}
        .an-picker-item:last-child{border-bottom:none}
        .an-picker-item:hover,.an-picker-item--sel{background:var(--c-surface-2)}
        .an-picker-sub{font-size:.68rem;color:var(--c-muted)}
        .an-compose-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
        .an-send-btn{display:flex;align-items:center;gap:6px;padding:9px 18px;border-radius:10px;background:var(--c-accent);color:#fff;border:none;cursor:pointer;font-size:.82rem;font-weight:600;font-family:inherit;transition:opacity .15s}
        .an-send-btn:disabled{opacity:.55;cursor:not-allowed}
        .an-cancel-btn{padding:9px 14px;border-radius:10px;border:1px solid var(--c-border);background:transparent;color:var(--c-muted);cursor:pointer;font-size:.82rem;font-family:inherit}
        .an-result{font-size:.8rem;color:var(--c-success)}
        .an-result--err{color:var(--c-danger)}

        /* Table */
        .an-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;overflow:hidden}
        .an-table-wrap{overflow-x:auto}
        .an-t{width:100%;border-collapse:collapse;font-size:.8rem}
        .an-t th{padding:10px 14px;text-align:left;font-size:.68rem;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--c-border);white-space:nowrap}
        .an-t td{padding:10px 14px;border-bottom:1px solid var(--c-border);vertical-align:middle}
        .an-t tr:last-child td{border-bottom:none}
        .an-t tr:hover td{background:var(--c-surface-2)}

        .an-badge{display:inline-block;padding:2px 9px;border-radius:20px;font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
        .an-badge--system{background:color-mix(in srgb,#8B5CF6 15%,transparent);color:#8B5CF6}
        .an-badge--billing{background:color-mix(in srgb,#0EA5E9 15%,transparent);color:#0EA5E9}
        .an-badge--info{background:color-mix(in srgb,#10B981 15%,transparent);color:#10B981}
        .an-badge--warning{background:color-mix(in srgb,#F59E0B 15%,transparent);color:#D97706}
        .an-scope-badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:.62rem;font-weight:600;background:var(--c-surface-2);color:var(--c-muted)}

        .an-notif-title{font-weight:600;color:var(--c-text);font-size:.8rem}
        .an-notif-body{color:var(--c-muted);font-size:.72rem;margin-top:2px;max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .an-target{font-size:.72rem;color:var(--c-muted)}
        .an-del-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;background:transparent;color:var(--c-muted);border-radius:6px;cursor:pointer;transition:background .12s,color .12s}
        .an-del-btn:hover{background:var(--c-danger-soft);color:var(--c-danger)}

        .an-empty{padding:40px 20px;text-align:center;color:var(--c-muted);font-size:.82rem}
        .an-page{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-top:1px solid var(--c-border);gap:10px;flex-wrap:wrap}
        .an-page-info{font-size:.74rem;color:var(--c-muted)}
        .an-page-btns{display:flex;gap:5px}
        .an-pbtn{padding:5px 10px;border-radius:7px;border:1px solid var(--c-border);background:var(--c-bg);color:var(--c-text);cursor:pointer;font-size:.76rem;font-family:inherit;transition:background .12s;display:flex;align-items:center;gap:3px}
        .an-pbtn:disabled{opacity:.4;cursor:default}
      `}</style>

      <div className="an">
        <div className="an-inner">

          {/* Header */}
          <div className="an-head">
            <div>
              <div className="an-title">Notifications</div>
              <div className="an-sub">Send system, billing, and info alerts to personal users and organizations.</div>
            </div>
            <button className="an-compose-btn" onClick={() => { setShowCompose(v => !v); setSendResult(null); }}>
              <Send size={14} /> {showCompose ? "Hide Compose" : "New Notification"}
            </button>
          </div>

          {/* Compose panel */}
          {showCompose && (
            <div className="an-compose">
              <div className="an-compose-title"><Bell size={14} style={{ display:"inline",marginRight:5 }} />Compose Notification</div>

              <div className="an-row2">
                <div className="an-field">
                  <label className="an-label">Audience</label>
                  <select className="an-select" value={cScope} onChange={e => { setCScope(e.target.value as SendScope); setCTarget(""); setPickerSearch(""); }}>
                    <option value="all">Broadcast — all users &amp; orgs</option>
                    <option value="personal">All personal users</option>
                    <option value="org">All organizations</option>
                    <option value="user">Specific user</option>
                    <option value="orgone">Specific organization</option>
                  </select>
                </div>
                <div className="an-field">
                  <label className="an-label">Type</label>
                  <select className="an-select" value={cType} onChange={e => setCType(e.target.value as NotifType)}>
                    <option value="info">Info</option>
                    <option value="system">System</option>
                    <option value="billing">Billing</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
              </div>

              {/* Targeted picker */}
              {(cScope === "user" || cScope === "orgone") && (
                <div className="an-field">
                  <label className="an-label">{cScope === "user" ? "Select User" : "Select Organization"}</label>
                  <div className="an-picker-wrap">
                    <div className="an-picker-search">
                      <Search size={12} />
                      <input
                        placeholder={cScope === "user" ? "Search by name or email…" : "Search by name…"}
                        value={pickerSearch}
                        onChange={e => setPickerSearch(e.target.value)}
                      />
                      {cTarget && <span style={{ fontSize:".7rem", color:"var(--c-success)" }}>✓ selected</span>}
                    </div>
                    <div className="an-picker-list">
                      {cScope === "user" && (filteredUsers.length === 0
                        ? <div className="an-picker-item" style={{ color:"var(--c-muted)" }}>No users found</div>
                        : filteredUsers.slice(0, 50).map(u => (
                          <div key={u.id}
                            className={`an-picker-item ${cTarget === u.id ? "an-picker-item--sel" : ""}`}
                            onClick={() => { setCTarget(u.id); setPickerSearch(u.name ?? u.email ?? u.id); }}>
                            {u.name ?? "(no name)"}
                            <div className="an-picker-sub">{u.email}</div>
                          </div>
                        ))
                      )}
                      {cScope === "orgone" && (filteredOrgs.length === 0
                        ? <div className="an-picker-item" style={{ color:"var(--c-muted)" }}>No orgs found</div>
                        : filteredOrgs.slice(0, 50).map(o => (
                          <div key={o.id}
                            className={`an-picker-item ${cTarget === o.id ? "an-picker-item--sel" : ""}`}
                            onClick={() => { setCTarget(o.id); setPickerSearch(o.name); }}>
                            {o.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="an-field">
                <label className="an-label">Title</label>
                <input className="an-input" placeholder="Notification title…" value={cTitle} onChange={e => setCTitle(e.target.value)} />
              </div>
              <div className="an-field">
                <label className="an-label">Message</label>
                <textarea className="an-textarea" placeholder="Write your message here…" value={cBody} onChange={e => setCBody(e.target.value)} />
              </div>

              <div className="an-compose-actions">
                <div>
                  {sendResult && (
                    <span className={`an-result ${sendResult.startsWith("✓") ? "" : "an-result--err"}`}>{sendResult}</span>
                  )}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="an-cancel-btn" onClick={() => { setShowCompose(false); setSendResult(null); }}>Cancel</button>
                  <button className="an-send-btn" disabled={sending} onClick={handleSend}>
                    {sending ? <RotateCcw size={13} style={{ animation:"spin 1s linear infinite" }} /> : <Send size={13} />}
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="an-filters">
            <div className="an-seg">
              {(["all", "personal", "org", "user", "orgone"] as FilterScope[]).map(s => (
                <button key={s} className={`an-seg-btn ${fScope === s ? "an-seg-btn--on" : ""}`}
                  onClick={() => { setFScope(s); setPage(1); }}>
                  {s === "all" ? "All" : SCOPE_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="an-seg">
              {(["all", "system", "billing", "info", "warning"] as FilterType[]).map(t => (
                <button key={t} className={`an-seg-btn ${fType === t ? "an-seg-btn--on" : ""}`}
                  onClick={() => { setFType(t); setPage(1); }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="an-card">
            <div className="an-table-wrap">
              <table className="an-t">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Scope</th>
                    <th>Notification</th>
                    <th>Recipient</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="an-empty">Loading…</td></tr>
                  ) : notifs.length === 0 ? (
                    <tr><td colSpan={6} className="an-empty">No notifications sent yet.</td></tr>
                  ) : notifs.map(n => (
                    <tr key={n.id}>
                      <td><span className={`an-badge ${TYPE_COLORS[n.type] ?? "an-badge--info"}`}>{n.type}</span></td>
                      <td><span className="an-scope-badge">{SCOPE_LABELS[n.scope] ?? n.scope}</span></td>
                      <td>
                        <div className="an-notif-title">{n.title}</div>
                        <div className="an-notif-body">{n.body}</div>
                      </td>
                      <td className="an-target">
                        {n.user        ? <span>{n.user.name ?? n.user.email}</span>
                        : n.organization ? <span>🏢 {n.organization.name}</span>
                        : <span style={{ color:"var(--c-muted)" }}>—</span>}
                      </td>
                      <td className="an-target">
                        {new Date(n.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                      </td>
                      <td>
                        <button className="an-del-btn" title="Delete" onClick={() => handleDelete(n.id)}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="an-page">
              <span className="an-page-info">{total} notification{total !== 1 ? "s" : ""}</span>
              <div className="an-page-btns">
                <button className="an-pbtn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={12} /> Prev
                </button>
                <button className="an-pbtn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
