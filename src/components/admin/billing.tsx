"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, CreditCard, TrendingUp, AlertTriangle, CheckCircle,
  Clock, RefreshCw, ChevronLeft, ChevronRight, Building2, User,
  MoreHorizontal, Edit3, X, Check, Crown, Zap, Filter,
  DollarSign, Receipt, XCircle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────

type RecordKind = "org" | "user";
type RecordStatus = "success" | "pending" | "failed";

interface BillingRow {
  id:          string;
  kind:        RecordKind;
  entityId:    string;
  entityName:  string;
  entityEmail: string;
  plan:        string;
  amountRWF:   number;
  txRef:       string;
  flwRef:      string | null;
  status:      RecordStatus;
  createdAt:   string;
}

interface Stats {
  totalRevenue:    number;
  orgRevenue:      number;
  userRevenue:     number;
  pendingCount:    number;
  failedCount:     number;
  activePaidOrgs:  number;
  activePaidUsers: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString() + " RWF"; }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-RW", { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_META: Record<RecordStatus, { label: string; color: string; Icon: any }> = {
  success: { label: "Paid",    color: "var(--c-success)", Icon: CheckCircle  },
  pending: { label: "Pending", color: "var(--c-warn)",    Icon: Clock        },
  failed:  { label: "Failed",  color: "var(--c-danger)",  Icon: XCircle      },
};

const ORG_PLANS  = ["free", "starter", "pro", "scale"];
const USER_PLANS = ["free", "plus"];

const PAGE_SIZE = 15;

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminBilling() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [records, setRecords] = useState<BillingRow[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);

  const [search,  setSearch]  = useState("");
  const [typeFilter,  setType]  = useState<"all" | "org" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | RecordStatus>("all");
  const [page,    setPage]    = useState(1);

  // Context menu state
  const [menu,      setMenu]      = useState<string | null>(null);
  // Plan override modal
  const [planModal, setPlanModal] = useState<{ row: BillingRow } | null>(null);
  const [newPlan,   setNewPlan]   = useState("");
  const [saving,    setSaving]    = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────

  const fetchData = useCallback((s: string, t: string, st: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({
      search: s, type: t, status: st,
      page: String(p), pageSize: String(PAGE_SIZE),
    });
    fetch(`/api/admin/billing?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setStats(d.stats);
          setRecords(d.records);
          setTotal(d.total);
          setPages(d.pages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchData(search, typeFilter, statusFilter, page), 300);
    return () => clearTimeout(id);
  }, [search, typeFilter, statusFilter, page, fetchData]);

  // Close menu on outside click
  useEffect(() => {
    const fn = () => setMenu(null);
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────

  const setRecordStatus = (row: BillingRow, status: RecordStatus) => {
    setMenu(null);
    fetch("/api/admin/billing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-record-status", kind: row.kind, id: row.id, status }),
    })
      .then(r => r.json())
      .then(d => { if (d.ok) setRecords(p => p.map(r => r.id === row.id ? { ...r, status } : r)); })
      .catch(() => {});
  };

  const openPlanModal = (row: BillingRow) => {
    setPlanModal({ row });
    setNewPlan("");
    setMenu(null);
  };

  const savePlan = () => {
    if (!planModal || !newPlan) return;
    setSaving(true);
    const { row } = planModal;
    const action = row.kind === "org" ? "set-org-plan" : "set-user-plan";
    const idKey  = row.kind === "org" ? "orgId" : "userId";
    fetch("/api/admin/billing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, [idKey]: row.entityId, plan: newPlan }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setPlanModal(null);
          fetchData(search, typeFilter, statusFilter, page);
        }
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .ab { display:flex; flex-direction:column; gap:20px; }

        /* ── Stats grid ── */
        .ab-stats{ display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
        .ab-stat{
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:14px; padding:16px;
          display:flex; flex-direction:column; gap:8px;
          transition:background .3s,border-color .3s;
        }
        .ab-stat-icon{
          width:36px; height:36px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .ab-stat-icon svg{ width:16px; height:16px; }
        .ab-stat-val{ font-size:1.25rem; font-weight:800; color:var(--c-text); line-height:1; }
        .ab-stat-lbl{ font-size:.7rem; font-weight:600; color:var(--c-muted); text-transform:uppercase; letter-spacing:.06em; }

        /* ── Toolbar ── */
        .ab-toolbar{
          display:flex; flex-wrap:wrap; gap:8px; align-items:center;
        }
        .ab-search{
          flex:1; min-width:160px; display:flex; align-items:center; gap:8px;
          padding:0 12px; height:36px; border-radius:9px;
          border:1.5px solid var(--c-border); background:var(--c-surface);
          color:var(--c-text); font-size:.82rem; font-family:inherit;
        }
        .ab-search svg{ color:var(--c-muted); width:13px; height:13px; flex-shrink:0; }
        .ab-search input{
          flex:1; border:none; outline:none; background:transparent;
          color:var(--c-text); font-size:.82rem; font-family:inherit;
        }
        .ab-seg{
          display:flex; border-radius:9px; overflow:hidden;
          border:1.5px solid var(--c-border); flex-shrink:0;
        }
        .ab-seg-btn{
          padding:0 13px; height:34px; font-size:.74rem; font-weight:600;
          font-family:inherit; cursor:pointer; border:none; background:var(--c-surface);
          color:var(--c-muted); transition:all .13s; white-space:nowrap;
        }
        .ab-seg-btn + .ab-seg-btn{ border-left:1px solid var(--c-border); }
        .ab-seg-btn--on{ background:var(--c-accent); color:#fff; }
        .ab-refresh{
          display:flex; align-items:center; justify-content:center;
          width:36px; height:36px; border-radius:9px; flex-shrink:0;
          border:1.5px solid var(--c-border); background:var(--c-surface);
          color:var(--c-muted); cursor:pointer; transition:all .13s;
        }
        .ab-refresh:hover{ border-color:var(--c-accent); color:var(--c-accent); background:var(--c-accent-soft); }
        .ab-refresh svg{ width:14px; height:14px; }

        /* ── Table ── */
        .ab-table-card{
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:14px; overflow:hidden;
        }
        .ab-table-head{
          display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;
          padding:14px 16px 12px;
          border-bottom:1px solid var(--c-border);
        }
        .ab-table-title{ font-size:.78rem; font-weight:700; color:var(--c-text); }
        .ab-table-count{ font-size:.72rem; color:var(--c-muted); }
        .ab-table-wrap{ overflow-x:auto; -webkit-overflow-scrolling:touch; }
        table.ab-table{ width:100%; border-collapse:collapse; font-size:.8rem; min-width:680px; }
        table.ab-table th{
          text-align:left; font-size:.64rem; font-weight:700; letter-spacing:.08em;
          text-transform:uppercase; color:var(--c-muted); padding:9px 12px;
          border-bottom:1px solid var(--c-border); background:var(--c-surface-2);
          white-space:nowrap;
        }
        table.ab-table td{ padding:11px 12px; border-bottom:1px solid var(--c-border); color:var(--c-muted); vertical-align:middle; }
        table.ab-table tr:last-child td{ border-bottom:none; }
        table.ab-table tbody tr:hover td{ background:var(--c-surface-2); }

        /* Kind badge */
        .ab-kind{
          display:inline-flex; align-items:center; gap:4px;
          padding:3px 8px; border-radius:6px; font-size:.68rem; font-weight:700;
        }
        .ab-kind--org{  background:color-mix(in srgb,#38AECC 14%,transparent); color:#38AECC; }
        .ab-kind--user{ background:color-mix(in srgb,#818CF8 14%,transparent); color:#818CF8; }
        .ab-kind svg{ width:10px; height:10px; }

        /* Status badge */
        .ab-status{
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 9px; border-radius:7px; font-size:.7rem; font-weight:700;
        }
        .ab-status svg{ width:11px; height:11px; }
        .ab-status--success{ background:var(--c-success-soft); color:var(--c-success); }
        .ab-status--pending{ background:var(--c-warn-soft);    color:var(--c-warn);    }
        .ab-status--failed{  background:var(--c-danger-soft);  color:var(--c-danger);  }

        /* Plan pill */
        .ab-plan{
          display:inline-flex; align-items:center; gap:4px;
          padding:3px 9px; border-radius:20px; font-size:.68rem; font-weight:700;
          background:var(--c-surface-2); border:1px solid var(--c-border); color:var(--c-muted);
          text-transform:capitalize;
        }

        /* Entity cell */
        .ab-entity{ display:flex; flex-direction:column; gap:1px; }
        .ab-entity-name{ font-size:.82rem; font-weight:600; color:var(--c-text); }
        .ab-entity-email{ font-size:.7rem; color:var(--c-muted); }

        /* Amount */
        .ab-amount{ font-weight:700; color:var(--c-text); white-space:nowrap; }

        /* Ref */
        .ab-ref{ font-family:monospace; font-size:.7rem; color:var(--c-muted); max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        /* Context menu */
        .ab-menu-wrap{ position:relative; }
        .ab-menu-btn{
          display:flex; align-items:center; justify-content:center; width:28px; height:28px;
          border-radius:6px; border:1px solid transparent; background:none;
          color:var(--c-muted); cursor:pointer; transition:all .12s;
        }
        .ab-menu-btn:hover{ background:var(--c-surface-2); border-color:var(--c-border); color:var(--c-text); }
        .ab-menu-btn svg{ width:14px; height:14px; }
        .ab-menu{
          position:absolute; right:0; top:calc(100% + 4px); z-index:100;
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:10px; box-shadow:var(--shadow-lg);
          padding:5px; min-width:180px; animation:abMenuIn .12s ease;
        }
        @keyframes abMenuIn{from{opacity:0;transform:translateY(-5px) scale(.97)}to{opacity:1;transform:none}}
        .ab-menu-item{
          display:flex; align-items:center; gap:8px; padding:8px 10px;
          border-radius:7px; font-size:.78rem; font-weight:600; cursor:pointer;
          transition:background .11s; color:var(--c-muted); background:none; border:none;
          width:100%; text-align:left; font-family:inherit;
        }
        .ab-menu-item:hover{ background:var(--c-surface-2); color:var(--c-text); }
        .ab-menu-item--danger:hover{ background:var(--c-danger-soft); color:var(--c-danger); }
        .ab-menu-item--success:hover{ background:var(--c-success-soft); color:var(--c-success); }
        .ab-menu-item svg{ width:13px; height:13px; flex-shrink:0; }
        .ab-menu-divider{ height:1px; background:var(--c-border); margin:3px 4px; }
        .ab-menu-section{ padding:4px 10px 2px; font-size:.62rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--c-muted); }

        /* Pagination */
        .ab-pager{ display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:12px 16px; border-top:1px solid var(--c-border); }
        .ab-pager-info{ font-size:.74rem; color:var(--c-muted); }
        .ab-pager-right{ display:flex; align-items:center; gap:5px; }
        .ab-pbtn{
          display:flex; align-items:center; justify-content:center; width:32px; height:32px;
          border-radius:7px; border:1px solid var(--c-border); background:var(--c-surface);
          color:var(--c-muted); cursor:pointer; transition:all .13s;
        }
        .ab-pbtn:hover:not(:disabled){ border-color:var(--c-accent); color:var(--c-accent); background:var(--c-accent-soft); }
        .ab-pbtn:disabled{ opacity:.4; cursor:not-allowed; }
        .ab-pbtn svg{ width:13px; height:13px; }
        .ab-page-num{ font-size:.8rem; color:var(--c-muted); padding:0 4px; }

        /* Empty / loading */
        .ab-empty{ text-align:center; padding:40px; color:var(--c-muted); font-size:.82rem; }
        .ab-empty svg{ width:36px; height:36px; opacity:.3; margin-bottom:10px; display:block; margin-inline:auto; }
        .ab-skeleton{ background:var(--c-surface-2); border-radius:6px; animation:abSk 1.2s ease infinite alternate; }
        @keyframes abSk{from{opacity:.5}to{opacity:1}}

        /* ── Plan Modal ── */
        .ab-modal-ov{
          position:fixed; inset:0; z-index:300;
          background:rgba(8,20,32,.6); backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center; padding:20px;
          animation:abFade .16s ease;
        }
        @keyframes abFade{from{opacity:0}to{opacity:1}}
        .ab-modal{
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:16px; padding:24px; width:100%; max-width:380px;
          box-shadow:var(--shadow-lg); animation:abSlide .18s ease;
        }
        @keyframes abSlide{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
        .ab-modal-head{ display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:18px; }
        .ab-modal-title{ font-size:.95rem; font-weight:700; color:var(--c-text); }
        .ab-modal-sub{ font-size:.74rem; color:var(--c-muted); margin-top:3px; }
        .ab-modal-close{
          display:flex; align-items:center; justify-content:center;
          width:28px; height:28px; border-radius:7px; border:1px solid var(--c-border);
          background:var(--c-surface-2); color:var(--c-muted); cursor:pointer; transition:all .13s;
        }
        .ab-modal-close:hover{ border-color:var(--c-danger); color:var(--c-danger); background:var(--c-danger-soft); }
        .ab-modal-close svg{ width:13px; height:13px; }
        .ab-plan-opts{ display:flex; flex-direction:column; gap:8px; margin-bottom:18px; }
        .ab-plan-opt{
          display:flex; align-items:center; gap:10px; padding:11px 14px;
          border-radius:10px; border:1.5px solid var(--c-border); cursor:pointer;
          transition:all .12s; background:var(--c-surface-2);
        }
        .ab-plan-opt:hover{ border-color:var(--c-accent); background:var(--c-accent-soft); }
        .ab-plan-opt--on{ border-color:var(--c-accent); background:var(--c-accent-soft); }
        .ab-plan-opt-dot{
          width:30px; height:30px; border-radius:8px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .ab-plan-opt-dot svg{ width:14px; height:14px; }
        .ab-plan-opt-name{ font-size:.84rem; font-weight:700; color:var(--c-text); text-transform:capitalize; }
        .ab-plan-opt-desc{ font-size:.7rem; color:var(--c-muted); }
        .ab-modal-save{
          width:100%; display:flex; align-items:center; justify-content:center; gap:7px;
          padding:11px; border-radius:10px; background:var(--c-accent); color:#fff;
          font-size:.84rem; font-weight:700; font-family:inherit; border:none;
          cursor:pointer; transition:background .13s;
        }
        .ab-modal-save:hover:not(:disabled){ background:var(--c-accent-dim); }
        .ab-modal-save:disabled{ opacity:.6; cursor:not-allowed; }
        .ab-modal-save svg{ width:14px; height:14px; }
      `}</style>

      <div className="ab">

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        {stats && (
          <div className="ab-stats">
            <StatCard
              Icon={DollarSign} color="#10B981"
              label="Total Revenue"
              value={fmt(stats.totalRevenue)}
            />
            <StatCard
              Icon={Building2} color="#38AECC"
              label="Org Revenue"
              value={fmt(stats.orgRevenue)}
            />
            <StatCard
              Icon={User} color="#818CF8"
              label="User Revenue"
              value={fmt(stats.userRevenue)}
            />
            <StatCard
              Icon={Crown} color="#FCD34D"
              label="Paid Orgs"
              value={String(stats.activePaidOrgs)}
            />
            <StatCard
              Icon={TrendingUp} color="#818CF8"
              label="Paid Users"
              value={String(stats.activePaidUsers)}
            />
            <StatCard
              Icon={Clock} color="var(--c-warn)"
              label="Pending"
              value={String(stats.pendingCount)}
            />
            <StatCard
              Icon={AlertTriangle} color="var(--c-danger)"
              label="Failed"
              value={String(stats.failedCount)}
            />
          </div>
        )}

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <div className="ab-toolbar">
          <div className="ab-search">
            <Search size={13}/>
            <input
              placeholder="Search by name, email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="ab-seg">
            {(["all", "org", "user"] as const).map(t => (
              <button key={t} className={`ab-seg-btn${typeFilter === t ? " ab-seg-btn--on" : ""}`}
                onClick={() => { setType(t); setPage(1); }}>
                {t === "all" ? "All" : t === "org" ? "Orgs" : "Users"}
              </button>
            ))}
          </div>

          <div className="ab-seg">
            {(["all", "success", "pending", "failed"] as const).map(s => (
              <button key={s} className={`ab-seg-btn${statusFilter === s ? " ab-seg-btn--on" : ""}`}
                onClick={() => { setStatusFilter(s); setPage(1); }}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <button className="ab-refresh" title="Refresh" onClick={() => fetchData(search, typeFilter, statusFilter, page)}>
            <RefreshCw size={14} className={loading ? "spin" : ""}/>
          </button>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="ab-table-card">
          <div className="ab-table-head">
            <span className="ab-table-title">Billing Records</span>
            <span className="ab-table-count">{total.toLocaleString()} total</span>
          </div>

          <div className="ab-table-wrap">
            {loading ? (
              <div className="ab-empty">
                <RefreshCw className="spin" style={{ opacity: .4, marginBottom: 10, display: "block", marginInline: "auto" }}/>
                Loading…
              </div>
            ) : records.length === 0 ? (
              <div className="ab-empty">
                <Receipt/>
                No billing records found
              </div>
            ) : (
              <table className="ab-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Entity</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Transaction ref</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(row => {
                    const sm = STATUS_META[row.status] ?? STATUS_META.failed;
                    return (
                      <tr key={row.id}>
                        <td>
                          <span className={`ab-kind ab-kind--${row.kind}`}>
                            {row.kind === "org" ? <Building2 size={10}/> : <User size={10}/>}
                            {row.kind === "org" ? "Org" : "User"}
                          </span>
                        </td>
                        <td>
                          <div className="ab-entity">
                            <span className="ab-entity-name">{row.entityName}</span>
                            <span className="ab-entity-email">{row.entityEmail}</span>
                          </div>
                        </td>
                        <td><span className="ab-plan">{row.plan}</span></td>
                        <td><span className="ab-amount">{row.amountRWF > 0 ? fmt(row.amountRWF) : "Free"}</span></td>
                        <td>
                          <span className={`ab-status ab-status--${row.status}`}>
                            <sm.Icon size={11}/>
                            {sm.label}
                          </span>
                        </td>
                        <td>
                          <span className="ab-ref" title={row.txRef}>{row.txRef}</span>
                          {row.flwRef && (
                            <span className="ab-ref" title={`FLW: ${row.flwRef}`} style={{ opacity: .6 }}>&nbsp;·&nbsp;{row.flwRef}</span>
                          )}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>{fmtDate(row.createdAt)}</td>
                        <td>
                          <div className="ab-menu-wrap" onClick={e => e.stopPropagation()}>
                            <button className="ab-menu-btn" onClick={() => setMenu(m => m === row.id ? null : row.id)}>
                              <MoreHorizontal size={14}/>
                            </button>
                            {menu === row.id && (
                              <div className="ab-menu">
                                <div className="ab-menu-section">Override plan</div>
                                <button className="ab-menu-item" onClick={() => openPlanModal(row)}>
                                  <Crown size={13}/> Change plan
                                </button>
                                <div className="ab-menu-divider"/>
                                <div className="ab-menu-section">Mark record</div>
                                {row.status !== "success" && (
                                  <button className="ab-menu-item ab-menu-item--success" onClick={() => setRecordStatus(row, "success")}>
                                    <CheckCircle size={13}/> Mark as paid
                                  </button>
                                )}
                                {row.status !== "pending" && (
                                  <button className="ab-menu-item" onClick={() => setRecordStatus(row, "pending")}>
                                    <Clock size={13}/> Mark as pending
                                  </button>
                                )}
                                {row.status !== "failed" && (
                                  <button className="ab-menu-item ab-menu-item--danger" onClick={() => setRecordStatus(row, "failed")}>
                                    <XCircle size={13}/> Mark as failed
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="ab-pager">
              <span className="ab-pager-info">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
              </span>
              <div className="ab-pager-right">
                <button className="ab-pbtn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={13}/>
                </button>
                <span className="ab-page-num">{page} / {pages}</span>
                <button className="ab-pbtn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={13}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Plan override modal ───────────────────────────────────────── */}
      {planModal && (
        <div className="ab-modal-ov" onClick={() => !saving && setPlanModal(null)}>
          <div className="ab-modal" onClick={e => e.stopPropagation()}>
            <div className="ab-modal-head">
              <div>
                <div className="ab-modal-title">Override Plan</div>
                <div className="ab-modal-sub">
                  {planModal.row.entityName} · {planModal.row.kind === "org" ? "Organisation" : "User"}
                </div>
              </div>
              <button className="ab-modal-close" onClick={() => setPlanModal(null)} disabled={saving}>
                <X size={13}/>
              </button>
            </div>

            <div className="ab-plan-opts">
              {(planModal.row.kind === "org" ? ORG_PLANS : USER_PLANS).map(p => (
                <div key={p}
                  className={`ab-plan-opt${newPlan === p ? " ab-plan-opt--on" : ""}`}
                  onClick={() => setNewPlan(p)}
                >
                  <div className="ab-plan-opt-dot"
                    style={{ background: `color-mix(in srgb, ${p === "free" ? "#34D399" : p === "plus" ? "#818CF8" : p === "starter" ? "#38AECC" : p === "pro" ? "#818CF8" : "#FCD34D"} 16%, transparent)` }}>
                    {p === "free" ? <Zap size={14} style={{ color: "#34D399" }}/> : <Crown size={14} style={{ color: p === "plus" ? "#818CF8" : p === "starter" ? "#38AECC" : p === "pro" ? "#818CF8" : "#FCD34D" }}/>}
                  </div>
                  <div>
                    <div className="ab-plan-opt-name">{p}</div>
                    <div className="ab-plan-opt-desc">
                      {p === "free"    ? (planModal.row.kind === "org" ? "500 msg/mo · 0 RWF" : "200 msg/mo · 0 RWF") :
                       p === "plus"    ? "1,500 msg/mo · 2,000 RWF" :
                       p === "starter" ? "2,000 msg/mo · 4,000 RWF" :
                       p === "pro"     ? "8,000 msg/mo · 12,000 RWF" :
                                         "25,000 msg/mo · 28,000 RWF"}
                    </div>
                  </div>
                  {newPlan === p && <Check size={14} style={{ marginLeft: "auto", color: "var(--c-accent)" }}/>}
                </div>
              ))}
            </div>

            <button className="ab-modal-save" disabled={!newPlan || saving} onClick={savePlan}>
              {saving ? <RefreshCw size={14} className="spin"/> : <Check size={14}/>}
              {saving ? "Saving…" : "Apply plan"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ Icon, color, label, value }: { Icon: any; color: string; label: string; value: string }) {
  return (
    <div className="ab-stat">
      <div className="ab-stat-icon" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}>
        <Icon size={16} style={{ color }}/>
      </div>
      <div className="ab-stat-val">{value}</div>
      <div className="ab-stat-lbl">{label}</div>
    </div>
  );
}
