"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Building2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  MoreHorizontal, ToggleLeft, ToggleRight, Trash2, RefreshCw, Save,
  Users, MessageSquare, Zap, TrendingUp, CreditCard, Crown, Brain,
  CheckCircle, XCircle, AlertCircle, Globe, Mail, Phone,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type PlanType = "free" | "trial" | "starter" | "pro" | "scale";

interface OrgOwner { id: string; name: string | null; email: string | null; image: string | null }
interface KBInfo   { id: string; isModelTrained: boolean; lastTrainedAt: string | null }
interface Org {
  id:                  string;
  name:                string;
  description:         string | null;
  isActive:            boolean;
  planType:            PlanType;
  monthlyMessageLimit: number;
  monthlyMessageCount: number;
  lastResetDate:       string;
  industry:            string | null;
  website:             string | null;
  contactEmail:        string | null;
  agentName:           string | null;
  billingEmail:        string | null;
  totalConversations:  number;
  totalMessages:       number;
  createdAt:           string;
  planRenewalDate:     string | null;
  owner:               OrgOwner;
  knowledgeBase:       KBInfo | null;
  _count:              { chats: number; billingRecords: number };
}

const PAGE_SIZE = 8;

const PLAN_META: Record<PlanType | string, { label: string; color: string; Icon: any }> = {
  free:    { label: "Free",    color: "#34D399", Icon: Zap       },
  trial:   { label: "Trial",   color: "#94A3B8", Icon: Zap       },
  starter: { label: "Starter", color: "#38AECC", Icon: TrendingUp},
  pro:     { label: "Pro",     color: "#818CF8", Icon: CreditCard},
  scale:   { label: "Scale",   color: "#FCD34D", Icon: Crown     },
};

function planMeta(p: string) {
  return PLAN_META[p] ?? { label: p, color: "#94A3B8", Icon: Zap };
}

function timeAgo(s: string) {
  const diff = Date.now() - new Date(s).getTime();
  const m = Math.floor(diff / 60e3);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function shortDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function usagePct(count: number, limit: number) {
  if (!limit) return 0;
  return Math.min(100, Math.round((count / limit) * 100));
}

function usageColor(pct: number) {
  if (pct >= 90) return "var(--c-danger)";
  if (pct >= 70) return "var(--c-warn)";
  return "var(--c-accent)";
}

// ── Row ────────────────────────────────────────────────────────────────────────
function OrgRow({ org, onUpdated, onDeleted }: {
  org: OrgOwner & Org;
  onUpdated: (o: Org) => void;
  onDeleted: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDel]      = useState(false);
  const [resetting, setReset]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [toast, setToast]       = useState<string | null>(null);

  // Editable fields
  const [editPlan,    setEditPlan]    = useState(org.planType);
  const [editLimit,   setEditLimit]   = useState(String(org.monthlyMessageLimit));
  const [editAgent,   setEditAgent]   = useState(org.agentName ?? "");
  const [editBilling, setEditBilling] = useState(org.billingEmail ?? "");
  const [editContact, setEditContact] = useState(org.contactEmail ?? "");

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(null), 3000);
  };

  const toggleActive = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/organizations/${org.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !org.isActive }),
      });
      const d = await r.json();
      if (d.ok) { onUpdated({ ...org, isActive: !org.isActive }); showToast(org.isActive ? "Suspended" : "Activated"); }
      else showToast("Failed");
    } catch { showToast("Error"); }
    setSaving(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/organizations/${org.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: editPlan,
          monthlyMessageLimit: Number(editLimit),
          agentName: editAgent,
          billingEmail: editBilling,
          contactEmail: editContact,
        }),
      });
      const d = await r.json();
      if (d.ok) { onUpdated({ ...org, ...d.org }); showToast("Saved"); }
      else showToast("Failed to save");
    } catch { showToast("Error"); }
    setSaving(false);
  };

  const resetUsage = async () => {
    setReset(true);
    try {
      const r = await fetch(`/api/admin/organizations/${org.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-usage" }),
      });
      const d = await r.json();
      if (d.ok) { onUpdated({ ...org, monthlyMessageCount: 0 }); showToast("Usage reset"); }
      else showToast("Failed");
    } catch { showToast("Error"); }
    setReset(false);
  };

  const deleteOrg = async () => {
    setDel(true);
    try {
      const r = await fetch(`/api/admin/organizations/${org.id}`, { method: "DELETE" });
      const d = await r.json();
      if (d.ok) onDeleted(org.id);
      else { showToast("Delete failed"); setDel(false); setConfirmDel(false); }
    } catch { showToast("Error"); setDel(false); setConfirmDel(false); }
  };

  const pm  = planMeta(org.planType);
  const pct = usagePct(org.monthlyMessageCount, org.monthlyMessageLimit);

  return (
    <>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "var(--c-surface)", border: "1px solid var(--c-border)", padding: "10px 18px", borderRadius: 10, fontSize: ".8rem", fontWeight: 600, color: "var(--c-text)", boxShadow: "var(--shadow-md)" }}>
          {toast}
        </div>
      )}
      <div className={`aorgs-row${!org.isActive ? " aorgs-row--inactive" : ""}`}>
        {/* Main row */}
        <div className="aorgs-row-main" onClick={() => setExpanded(p => !p)}>

          {/* Left: org info */}
          <div className="aorgs-ri">
            <div className="aorgs-avatar" style={{ background: `${pm.color}22`, border: `1.5px solid ${pm.color}44` }}>
              <Building2 size={14} style={{ color: pm.color }} />
            </div>
            <div className="aorgs-rinfo">
              <div className="aorgs-rname">{org.name}</div>
              <div className="aorgs-rmeta">
                {org.owner.email ?? "No owner"}
                {org.industry ? ` · ${org.industry}` : ""}
              </div>
            </div>
          </div>

          {/* Plan badge */}
          <div className="aorgs-plan" style={{ background: `${pm.color}18`, border: `1px solid ${pm.color}40`, color: pm.color }}>
            <pm.Icon size={9} />
            {pm.label}
          </div>

          {/* Usage */}
          <div className="aorgs-usage-col">
            <div className="aorgs-usage-bar-bg">
              <div className="aorgs-usage-bar-fg" style={{ width: `${pct}%`, background: usageColor(pct) }} />
            </div>
            <div className="aorgs-usage-txt">{org.monthlyMessageCount.toLocaleString()} / {org.monthlyMessageLimit.toLocaleString()}</div>
          </div>

          {/* Status toggle */}
          <button
            className="aorgs-toggle"
            onClick={e => { e.stopPropagation(); toggleActive(); }}
            disabled={saving}
            title={org.isActive ? "Suspend" : "Activate"}
          >
            {org.isActive
              ? <ToggleRight size={20} style={{ color: "var(--c-success)" }} />
              : <ToggleLeft  size={20} style={{ color: "var(--c-muted)"   }} />}
          </button>

          {/* Expand chevron */}
          <div className="aorgs-chevron">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>

        {/* Expanded panel */}
        {expanded && (
          <div className="aorgs-expand">
            <div className="aorgs-expand-grid">

              {/* ── Stats chips ── */}
              <div className="aorgs-chips">
                <div className="aorgs-chip">
                  <MessageSquare size={10} /> {org.totalMessages.toLocaleString()} msgs
                </div>
                <div className="aorgs-chip">
                  <Users size={10} /> {org._count.chats} chats
                </div>
                <div className="aorgs-chip">
                  <Brain size={10} /> {org.knowledgeBase?.isModelTrained ? "Trained" : "Not trained"}
                </div>
                <div className="aorgs-chip">
                  {org.isActive
                    ? <CheckCircle size={10} style={{ color: "var(--c-success)" }} />
                    : <XCircle    size={10} style={{ color: "var(--c-danger)"  }} />}
                  {org.isActive ? "Active" : "Suspended"}
                </div>
                <div className="aorgs-chip"><Globe size={10} /> Joined {shortDate(org.createdAt)}</div>
                {org.planRenewalDate && (
                  <div className="aorgs-chip"><CreditCard size={10} /> Renews {shortDate(org.planRenewalDate)}</div>
                )}
              </div>

              {/* ── Edit form ── */}
              <div className="aorgs-form">
                <div className="aorgs-form-row">
                  <div className="aorgs-form-group">
                    <label className="aorgs-label">Plan</label>
                    <select className="aorgs-select" value={editPlan} onChange={e => setEditPlan(e.target.value as PlanType)}>
                      <option value="free">Free (500 msgs)</option>
                      <option value="trial">Trial (100 msgs)</option>
                      <option value="starter">Starter (2,000 msgs)</option>
                      <option value="pro">Pro (8,000 msgs)</option>
                      <option value="scale">Scale (25,000 msgs)</option>
                    </select>
                  </div>
                  <div className="aorgs-form-group">
                    <label className="aorgs-label">Msg Limit / Month</label>
                    <input className="aorgs-input" type="number" min={0} value={editLimit} onChange={e => setEditLimit(e.target.value)} />
                  </div>
                  <div className="aorgs-form-group">
                    <label className="aorgs-label">Agent Name</label>
                    <input className="aorgs-input" value={editAgent} onChange={e => setEditAgent(e.target.value)} placeholder="AI Assistant" />
                  </div>
                </div>
                <div className="aorgs-form-row">
                  <div className="aorgs-form-group">
                    <label className="aorgs-label">Contact Email</label>
                    <input className="aorgs-input" type="email" value={editContact} onChange={e => setEditContact(e.target.value)} placeholder="contact@org.com" />
                  </div>
                  <div className="aorgs-form-group">
                    <label className="aorgs-label">Billing Email</label>
                    <input className="aorgs-input" type="email" value={editBilling} onChange={e => setEditBilling(e.target.value)} placeholder="billing@org.com" />
                  </div>
                </div>
              </div>

              {/* ── Action buttons ── */}
              <div className="aorgs-actions">
                <button className="aorgs-btn aorgs-btn--primary" onClick={saveChanges} disabled={saving}>
                  <Save size={12} /> {saving ? "Saving…" : "Save Changes"}
                </button>
                <button className="aorgs-btn aorgs-btn--warn" onClick={resetUsage} disabled={resetting}>
                  <RefreshCw size={12} /> {resetting ? "Resetting…" : "Reset Usage"}
                </button>
                {!confirmDel
                  ? <button className="aorgs-btn aorgs-btn--danger" onClick={() => setConfirmDel(true)}>
                      <Trash2 size={12} /> Delete Org
                    </button>
                  : <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: ".72rem", color: "var(--c-danger)", fontWeight: 600 }}>Confirm delete?</span>
                      <button className="aorgs-btn aorgs-btn--danger" onClick={deleteOrg} disabled={deleting}>
                        {deleting ? "Deleting…" : "Yes, Delete"}
                      </button>
                      <button className="aorgs-btn" onClick={() => setConfirmDel(false)}>Cancel</button>
                    </div>
                }
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminOrganizations() {
  const [orgs, setOrgs]       = useState<Org[]>([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");
  const [planFilter, setPlan] = useState("all");
  const [statusFilter, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchOrgs = useCallback((s: string, plan: string, status: string, p: number) => {
    setLoading(true);
    const q = new URLSearchParams({ search: s, plan, status, page: String(p), pageSize: String(PAGE_SIZE) });
    fetch(`/api/admin/organizations?${q}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) { setOrgs(d.organizations); setTotal(d.total); setPages(d.pages); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchOrgs(search, planFilter, statusFilter, page), 300);
    return () => clearTimeout(id);
  }, [search, planFilter, statusFilter, page, fetchOrgs]);

  const handleUpdated = (updated: Org) => setOrgs(p => p.map(o => o.id === updated.id ? { ...o, ...updated } : o));
  const handleDeleted = (id: string) => { setOrgs(p => p.filter(o => o.id !== id)); setTotal(t => t - 1); };

  return (
    <>
      <style>{`
        .aorgs{padding:18px 14px 48px;background:var(--c-bg);min-height:100%;transition:background .3s}
        @media(min-width:600px){.aorgs{padding:24px 24px 56px}}
        @media(min-width:1024px){.aorgs{padding:28px 36px 64px}}
        .aorgs-inner{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:20px}

        /* header */
        .aorgs-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .aorgs-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.5rem,4vw,2rem);font-weight:400;letter-spacing:-.022em;color:var(--c-text);margin-bottom:4px}
        .aorgs-sub{font-size:.79rem;color:var(--c-muted)}
        .aorgs-total-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;background:var(--c-accent-soft);border:1px solid color-mix(in srgb,var(--c-accent) 30%,transparent);font-size:.68rem;font-weight:700;color:var(--c-accent);flex-shrink:0;margin-top:4px}

        /* toolbar */
        .aorgs-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .aorgs-search-wrap{flex:1;min-width:160px;display:flex;align-items:center;gap:8px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:10px;padding:0 11px;height:36px}
        .aorgs-search-wrap svg{flex-shrink:0;color:var(--c-muted)}
        .aorgs-search{flex:1;border:none;background:none;outline:none;font-family:inherit;font-size:.8rem;color:var(--c-text)}
        .aorgs-search::placeholder{color:var(--c-muted)}
        .aorgs-filter-group{display:flex;gap:5px;flex-wrap:wrap}
        .aorgs-pill{padding:5px 12px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);font-size:.72rem;font-weight:600;cursor:pointer;transition:all .13s;font-family:inherit}
        .aorgs-pill:hover{border-color:var(--c-accent);color:var(--c-accent)}
        .aorgs-pill--on{background:var(--c-accent-soft)!important;border-color:var(--c-accent)!important;color:var(--c-accent)!important}

        /* list */
        .aorgs-list{display:flex;flex-direction:column;gap:8px}
        .aorgs-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:48px 16px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;color:var(--c-muted);font-size:.82rem}

        /* row */
        .aorgs-row{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-sm);transition:background .3s,border-color .3s}
        .aorgs-row--inactive{opacity:.65}
        .aorgs-row-main{display:flex;align-items:center;gap:10px;padding:13px 16px;cursor:pointer;transition:background .13s;flex-wrap:nowrap;min-height:60px}
        .aorgs-row-main:hover{background:var(--c-surface-2)}

        .aorgs-ri{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
        .aorgs-avatar{width:34px;height:34px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .aorgs-rinfo{flex:1;min-width:0}
        .aorgs-rname{font-size:.83rem;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .aorgs-rmeta{font-size:.68rem;color:var(--c-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

        .aorgs-plan{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:.65rem;font-weight:700;flex-shrink:0;white-space:nowrap}

        .aorgs-usage-col{display:flex;flex-direction:column;gap:3px;min-width:90px;flex-shrink:0}
        @media(max-width:520px){.aorgs-usage-col{display:none}}
        .aorgs-usage-bar-bg{height:4px;background:var(--c-surface-2);border-radius:4px;overflow:hidden;border:1px solid var(--c-border)}
        .aorgs-usage-bar-fg{height:100%;border-radius:4px;transition:width .4s}
        .aorgs-usage-txt{font-size:.63rem;color:var(--c-muted);text-align:right}

        .aorgs-toggle{background:none;border:none;cursor:pointer;padding:4px;flex-shrink:0;display:flex;align-items:center;transition:opacity .13s}
        .aorgs-toggle:hover{opacity:.75}
        .aorgs-toggle:disabled{opacity:.4;cursor:not-allowed}
        .aorgs-chevron{color:var(--c-muted);flex-shrink:0}

        /* expand */
        .aorgs-expand{border-top:1px solid var(--c-border);padding:16px;background:var(--c-surface-2)}
        .aorgs-expand-grid{display:flex;flex-direction:column;gap:14px}

        .aorgs-chips{display:flex;flex-wrap:wrap;gap:6px}
        .aorgs-chip{display:flex;align-items:center;gap:5px;padding:4px 10px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:20px;font-size:.68rem;color:var(--c-muted);font-weight:500}

        .aorgs-form{display:flex;flex-direction:column;gap:10px}
        .aorgs-form-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
        .aorgs-form-group{display:flex;flex-direction:column;gap:5px}
        .aorgs-label{font-size:.68rem;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:.07em}
        .aorgs-input,.aorgs-select{height:34px;padding:0 10px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:8px;color:var(--c-text);font-family:inherit;font-size:.8rem;outline:none;transition:border-color .13s;width:100%}
        .aorgs-input:focus,.aorgs-select:focus{border-color:var(--c-accent)}
        .aorgs-select{cursor:pointer}

        .aorgs-actions{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
        .aorgs-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface);color:var(--c-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:inherit;transition:all .13s}
        .aorgs-btn:hover{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-soft)}
        .aorgs-btn:disabled{opacity:.5;cursor:not-allowed}
        .aorgs-btn--primary{background:var(--c-accent);border-color:var(--c-accent);color:#fff}
        .aorgs-btn--primary:hover{opacity:.87;color:#fff;background:var(--c-accent)}
        .aorgs-btn--warn{border-color:var(--c-warn);color:var(--c-warn);background:var(--c-warn-soft)}
        .aorgs-btn--warn:hover{opacity:.8;color:var(--c-warn);background:var(--c-warn-soft)}
        .aorgs-btn--danger{border-color:var(--c-danger);color:var(--c-danger);background:var(--c-danger-soft)}
        .aorgs-btn--danger:hover{opacity:.8;color:var(--c-danger);background:var(--c-danger-soft)}

        /* pagination */
        .aorgs-pg{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
        .aorgs-pg-info{font-size:.75rem;color:var(--c-muted)}
        .aorgs-pg-btns{display:flex;gap:5px}
        .aorgs-pg-btn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface);color:var(--c-muted);cursor:pointer;transition:all .13s;font-family:inherit}
        .aorgs-pg-btn:hover:not(:disabled){border-color:var(--c-accent);color:var(--c-accent)}
        .aorgs-pg-btn:disabled{opacity:.35;cursor:not-allowed}

        /* skeleton */
        .aorgs-skel{height:60px;background:linear-gradient(90deg,var(--c-surface) 25%,var(--c-surface-2) 50%,var(--c-surface) 75%);background-size:200% 100%;animation:aoskel 1.5s ease infinite;border-radius:14px;border:1px solid var(--c-border)}
        @keyframes aoskel{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      <div className="aorgs">
        <div className="aorgs-inner">

          {/* Header */}
          <div className="aorgs-hd">
            <div>
              <div className="aorgs-title">Organizations</div>
              <div className="aorgs-sub">Manage plans, limits, usage, and status for every organisation.</div>
            </div>
            <span className="aorgs-total-badge">
              <Building2 size={11} /> {total.toLocaleString()} orgs
            </span>
          </div>

          {/* Toolbar */}
          <div className="aorgs-toolbar">
            <div className="aorgs-search-wrap">
              <Search size={13} />
              <input
                className="aorgs-search"
                placeholder="Search name, email…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="aorgs-filter-group">
              {["all","free","trial","starter","pro","scale"].map(p => (
                <button key={p} className={`aorgs-pill${planFilter === p ? " aorgs-pill--on" : ""}`}
                  onClick={() => { setPlan(p); setPage(1); }}>
                  {p === "all" ? "All plans" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <div className="aorgs-filter-group">
              {[["all","All"],["active","Active"],["inactive","Suspended"]].map(([v,l]) => (
                <button key={v} className={`aorgs-pill${statusFilter === v ? " aorgs-pill--on" : ""}`}
                  onClick={() => { setStatus(v); setPage(1); }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="aorgs-list">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="aorgs-skel" />)
              : orgs.length === 0
                ? <div className="aorgs-empty">
                    <Building2 size={28} />
                    <span>No organisations found</span>
                  </div>
                : orgs.map(o => (
                    <OrgRow key={o.id} org={o as any} onUpdated={handleUpdated} onDeleted={handleDeleted} />
                  ))
            }
          </div>

          {/* Pagination */}
          {!loading && pages > 1 && (
            <div className="aorgs-pg">
              <span className="aorgs-pg-info">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="aorgs-pg-btns">
                <button className="aorgs-pg-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={13} />
                </button>
                <button className="aorgs-pg-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
