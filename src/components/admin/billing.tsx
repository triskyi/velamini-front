"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, CreditCard, TrendingUp, AlertTriangle, CheckCircle,
  Clock, RefreshCw, ChevronLeft, ChevronRight, Building2, User,
  MoreHorizontal, X, Check, Crown, Zap, DollarSign, Receipt,
  XCircle, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────── */
type RecordKind   = "org" | "user";
type RecordStatus = "success" | "pending" | "failed";

interface BillingRow {
  id: string; kind: RecordKind; entityId: string;
  entityName: string; entityEmail: string;
  plan: string; amountRWF: number;
  txRef: string; flwRef: string | null;
  status: RecordStatus; createdAt: string;
}
interface Stats {
  totalRevenue: number; orgRevenue: number; userRevenue: number;
  pendingCount: number; failedCount: number;
  activePaidOrgs: number; activePaidUsers: number;
}

/* ── Helpers ───────────────────────────────────────────────────── */
const fmt     = (n: number) => n === 0 ? "Free" : n.toLocaleString("en-RW") + " RWF";
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-RW", { year:"numeric", month:"short", day:"numeric" });

const PLAN_META: Record<string, { color: string; bg: string }> = {
  free:    { color:"#34D399", bg:"rgba(52,211,153,.13)" },
  plus:    { color:"#818CF8", bg:"rgba(129,140,248,.13)" },
  starter: { color:"#38AECC", bg:"rgba(56,174,204,.13)" },
  pro:     { color:"#818CF8", bg:"rgba(129,140,248,.13)" },
  scale:   { color:"#FCD34D", bg:"rgba(252,211,77,.13)"  },
};

const STATUS_META: Record<RecordStatus, { label:string; icon:any; cls:string }> = {
  success: { label:"Paid",    icon:CheckCircle,  cls:"s-ok"  },
  pending: { label:"Pending", icon:Clock,        cls:"s-pend"},
  failed:  { label:"Failed",  icon:XCircle,      cls:"s-fail"},
};

const ORG_PLANS  = [
  { id:"free",    msgs:"500 msg/mo",    price:"0 RWF",      color:"#34D399", Icon:Zap   },
  { id:"starter", msgs:"2,000 msg/mo",  price:"5,000 RWF",  color:"#38AECC", Icon:TrendingUp },
  { id:"pro",     msgs:"8,000 msg/mo",  price:"15,000 RWF", color:"#818CF8", Icon:Crown },
  { id:"scale",   msgs:"25,000 msg/mo", price:"35,000 RWF", color:"#FCD34D", Icon:Crown },
];
const USER_PLANS = [
  { id:"free", msgs:"200 msg/mo",  price:"0 RWF",      color:"#34D399", Icon:Zap   },
  { id:"plus", msgs:"1,500 msg/mo",price:"3,000 RWF",  color:"#818CF8", Icon:Crown },
];

const PAGE_SIZE = 15;

/* ── Animated number ───────────────────────────────────────────── */
function AnimNum({ to, prefix="", suffix="" }: { to:number; prefix?:string; suffix?:string }) {
  const [v, setV] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return; ref.current = true;
    let cur = 0;
    const step = Math.ceil(to / 55);
    const id = setInterval(() => {
      cur += step;
      if (cur >= to) { setV(to); clearInterval(id); }
      else setV(cur);
    }, 14);
    return () => clearInterval(id);
  }, [to]);
  return <>{prefix}{v.toLocaleString("en-RW")}{suffix}</>;
}

/* ── Component ─────────────────────────────────────────────────── */
export default function AdminBilling() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [records, setRecords] = useState<BillingRow[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);

  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState<"all"|"org"|"user">("all");
  const [statusFilter, setStatusFilter] = useState<"all"|RecordStatus>("all");
  const [page, setPage] = useState(1);

  const [menu,      setMenu]      = useState<string | null>(null);
  const [planModal, setPlanModal] = useState<{ row: BillingRow } | null>(null);
  const [newPlan,   setNewPlan]   = useState("");
  const [saving,    setSaving]    = useState(false);

  /* ── Fetch ───────────────────────────────────────────────────── */
  const fetchData = useCallback((s:string, t:string, st:string, p:number) => {
    setLoading(true);
    const q = new URLSearchParams({ search:s, type:t, status:st, page:String(p), pageSize:String(PAGE_SIZE) });
    fetch(`/api/admin/billing?${q}`)
      .then(r => r.json())
      .then(d => { if (d.ok) { setStats(d.stats); setRecords(d.records); setTotal(d.total); setPages(d.pages); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchData(search, typeFilter, statusFilter, page), 300);
    return () => clearTimeout(id);
  }, [search, typeFilter, statusFilter, page, fetchData]);

  useEffect(() => {
    const fn = () => setMenu(null);
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* ── Actions ─────────────────────────────────────────────────── */
  const setRecordStatus = (row: BillingRow, status: RecordStatus) => {
    setMenu(null);
    fetch("/api/admin/billing", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ action:"set-record-status", kind:row.kind, id:row.id, status }),
    }).then(r => r.json()).then(d => {
      if (d.ok) setRecords(p => p.map(r => r.id === row.id ? { ...r, status } : r));
    }).catch(() => {});
  };

  const openPlanModal = (row: BillingRow) => { setPlanModal({ row }); setNewPlan(""); setMenu(null); };

  const savePlan = () => {
    if (!planModal || !newPlan) return;
    setSaving(true);
    const { row } = planModal;
    fetch("/api/admin/billing", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action: row.kind === "org" ? "set-org-plan" : "set-user-plan",
        [row.kind === "org" ? "orgId" : "userId"]: row.entityId,
        plan: newPlan,
      }),
    }).then(r => r.json()).then(d => {
      if (d.ok) { setPlanModal(null); fetchData(search, typeFilter, statusFilter, page); }
    }).catch(() => {}).finally(() => setSaving(false));
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        /* ─── Global resets (scoped) ─── */
        .ab-root *, .ab-root *::before, .ab-root *::after { box-sizing: border-box; }
        .ab-root {
          display: flex; flex-direction: column; gap: 22px;
          font-family: 'DM Sans', system-ui, sans-serif;
          padding-top: 28px;
        }

        /* ─── Spin keyframe ─── */
        @keyframes ab-spin { to { transform: rotate(360deg); } }
        @keyframes ab-fade-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes ab-scale-in { from { opacity:0; transform:scale(.95) translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes ab-menu-in { from { opacity:0; transform:translateY(-4px) scale(.97); } to { opacity:1; transform:none; } }
        @keyframes ab-sk { from { opacity:.4; } to { opacity:.85; } }
        .ab-spin { animation: ab-spin .7s linear infinite; }

        /* ─── Stats row ─── */
        .ab-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }
        .ab-stat {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: 16px;
          padding: 16px 16px 14px;
          display: flex; flex-direction: column; gap: 10px;
          position: relative; overflow: hidden;
          transition: border-color .2s, box-shadow .2s, transform .2s;
          animation: ab-fade-in .35s ease both;
        }
        .ab-stat:hover {
          border-color: color-mix(in srgb, var(--ac, #38AECC) 45%, var(--c-border));
          box-shadow: 0 4px 20px rgba(0,0,0,.1);
          transform: translateY(-2px);
        }
        /* subtle top accent line per card */
        .ab-stat::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--ac, #38AECC); opacity: .55;
          border-radius: 16px 16px 0 0;
        }
        .ab-stat-top { display: flex; align-items: center; justify-content: space-between; }
        .ab-stat-icon {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .ab-stat-trend {
          display: flex; align-items: center; gap: 2px;
          font-size: .65rem; font-weight: 700;
          padding: 2px 6px; border-radius: 5px;
        }
        .ab-stat-trend svg { width: 10px; height: 10px; }
        .ab-stat-val {
          font-size: 1.3rem; font-weight: 800;
          color: var(--c-text); line-height: 1; letter-spacing: -.02em;
        }
        .ab-stat-lbl {
          font-size: .67rem; font-weight: 600; letter-spacing: .07em;
          text-transform: uppercase; color: var(--c-muted);
          line-height: 1.3;
        }

        /* ─── Toolbar ─── */
        .ab-toolbar {
          display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
        }
        .ab-search-box {
          flex: 1; min-width: 180px; display: flex; align-items: center; gap: 8px;
          padding: 0 12px; height: 38px; border-radius: 10px;
          border: 1.5px solid var(--c-border); background: var(--c-surface);
          transition: border-color .15s, box-shadow .15s;
        }
        .ab-search-box:focus-within {
          border-color: var(--c-accent); box-shadow: 0 0 0 3px color-mix(in srgb,var(--c-accent) 14%,transparent);
        }
        .ab-search-box svg { color: var(--c-muted); flex-shrink: 0; }
        .ab-search-box input {
          flex: 1; border: none; outline: none; background: transparent;
          color: var(--c-text); font-size: .82rem; font-family: inherit;
        }
        .ab-search-box input::placeholder { color: var(--c-muted); }

        .ab-seg {
          display: flex; border-radius: 10px; overflow: hidden;
          border: 1.5px solid var(--c-border); flex-shrink: 0;
          background: var(--c-surface);
        }
        .ab-seg-btn {
          padding: 0 14px; height: 36px; font-size: .75rem; font-weight: 700;
          font-family: inherit; cursor: pointer; border: none;
          background: transparent; color: var(--c-muted);
          transition: all .15s; white-space: nowrap;
        }
        .ab-seg-btn + .ab-seg-btn { border-left: 1px solid var(--c-border); }
        .ab-seg-btn.on { background: var(--c-accent); color: #fff; }

        .ab-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          border: 1.5px solid var(--c-border); background: var(--c-surface);
          color: var(--c-muted); cursor: pointer; transition: all .15s;
        }
        .ab-icon-btn:hover {
          border-color: var(--c-accent); color: var(--c-accent);
          background: color-mix(in srgb,var(--c-accent) 8%,transparent);
        }

        /* ─── Table card ─── */
        .ab-card {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: 16px; overflow: hidden;
          animation: ab-fade-in .4s ease both .05s;
        }
        .ab-card-head {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 8px; padding: 14px 18px 13px;
          border-bottom: 1px solid var(--c-border);
          background: var(--c-surface-2);
        }
        .ab-card-title { font-size: .85rem; font-weight: 800; color: var(--c-text); }
        .ab-card-count {
          font-size: .72rem; font-weight: 600;
          color: var(--c-muted);
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          padding: 2px 9px; border-radius: 20px;
        }

        .ab-tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        table.ab-tbl {
          width: 100%; border-collapse: collapse; font-size: .8rem; min-width: 720px;
        }
        table.ab-tbl th {
          text-align: left; font-size: .62rem; font-weight: 800; letter-spacing: .09em;
          text-transform: uppercase; color: var(--c-muted); padding: 10px 16px;
          border-bottom: 1px solid var(--c-border); white-space: nowrap;
          background: color-mix(in srgb,var(--c-surface-2) 80%,transparent);
        }
        table.ab-tbl td {
          padding: 12px 16px; border-bottom: 1px solid var(--c-border);
          color: var(--c-muted); vertical-align: middle; transition: background .12s;
        }
        table.ab-tbl tr:last-child td { border-bottom: none; }
        table.ab-tbl tbody tr { transition: background .12s; }
        table.ab-tbl tbody tr:hover td { background: color-mix(in srgb,var(--c-accent) 4%,var(--c-surface)); }

        /* ─── Cell components ─── */
        .ab-kind-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 9px; border-radius: 7px; font-size: .68rem; font-weight: 800;
          letter-spacing: .02em;
        }
        .ab-kind-badge svg { width: 10px; height: 10px; }
        .ab-kind-badge.org  { background: rgba(56,174,204,.12); color:#38AECC; }
        .ab-kind-badge.user { background: rgba(129,140,248,.12); color:#818CF8; }

        .ab-entity-cell { display: flex; flex-direction: column; gap: 1px; }
        .ab-entity-name { font-size: .83rem; font-weight: 700; color: var(--c-text); }
        .ab-entity-email { font-size: .69rem; color: var(--c-muted); }

        .ab-plan-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px; font-size: .69rem; font-weight: 800;
          letter-spacing: .03em; text-transform: capitalize; border: 1px solid transparent;
        }
        .ab-plan-dot { width: 6px; height: 6px; border-radius: 50%; }

        .ab-amount { font-size: .84rem; font-weight: 800; color: var(--c-text); white-space: nowrap; }

        .ab-status {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 7px; font-size: .7rem; font-weight: 800;
        }
        .ab-status svg { width: 11px; height: 11px; }
        .s-ok   { background: var(--c-success-soft); color: var(--c-success); }
        .s-pend { background: var(--c-warn-soft);    color: var(--c-warn);    }
        .s-fail { background: var(--c-danger-soft);  color: var(--c-danger);  }

        .ab-ref {
          font-family: 'Geist Mono', ui-monospace, monospace;
          font-size: .69rem; color: var(--c-muted);
          max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          display: block;
        }

        /* ─── Context menu ─── */
        .ab-mw { position: relative; }
        .ab-mbtn {
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 8px;
          border: 1px solid transparent; background: none;
          color: var(--c-muted); cursor: pointer; transition: all .12s;
        }
        .ab-mbtn:hover {
          background: var(--c-surface-2); border-color: var(--c-border); color: var(--c-text);
        }
        .ab-menu {
          position: absolute; right: 0; top: calc(100% + 5px); z-index: 200;
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,.2);
          padding: 5px; min-width: 190px;
          animation: ab-menu-in .13s ease;
        }
        .ab-mi {
          display: flex; align-items: center; gap: 9px; padding: 8px 11px;
          border-radius: 8px; font-size: .79rem; font-weight: 600; cursor: pointer;
          color: var(--c-muted); background: none; border: none;
          width: 100%; text-align: left; font-family: inherit; transition: all .1s;
        }
        .ab-mi:hover { background: var(--c-surface-2); color: var(--c-text); }
        .ab-mi.ok:hover    { background: var(--c-success-soft); color: var(--c-success); }
        .ab-mi.danger:hover{ background: var(--c-danger-soft);  color: var(--c-danger);  }
        .ab-mi svg { width: 13px; height: 13px; flex-shrink: 0; }
        .ab-mdiv { height: 1px; background: var(--c-border); margin: 4px 6px; }
        .ab-msec {
          padding: 5px 11px 3px; font-size: .6rem; font-weight: 800;
          letter-spacing: .1em; text-transform: uppercase; color: var(--c-muted);
        }

        /* ─── Pagination ─── */
        .ab-pager {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 8px; padding: 12px 18px;
          border-top: 1px solid var(--c-border);
        }
        .ab-pager-info { font-size: .73rem; color: var(--c-muted); }
        .ab-pager-btns { display: flex; align-items: center; gap: 6px; }
        .ab-pbtn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--c-border); background: var(--c-surface);
          color: var(--c-muted); cursor: pointer; transition: all .13s;
        }
        .ab-pbtn:hover:not(:disabled) {
          border-color: var(--c-accent); color: var(--c-accent);
          background: color-mix(in srgb,var(--c-accent) 8%,transparent);
        }
        .ab-pbtn:disabled { opacity: .35; cursor: not-allowed; }
        .ab-pbtn svg { width: 13px; height: 13px; }
        .ab-pnum { font-size: .78rem; color: var(--c-muted); padding: 0 6px; }
        .ab-pnum-page {
          display: flex; align-items: center; justify-content: center;
          min-width: 32px; height: 32px; border-radius: 8px; padding: 0 4px;
          border: 1px solid var(--c-border); background: var(--c-surface);
          color: var(--c-muted); cursor: pointer; font-size: .78rem; font-weight: 600;
          transition: all .13s;
        }
        .ab-pnum-page:hover { border-color: var(--c-accent); color: var(--c-accent); background: color-mix(in srgb,var(--c-accent) 8%,transparent); }
        .ab-pnum-page.active { background: var(--c-accent); color: #fff; border-color: var(--c-accent); cursor: default; }
        .ab-pnum-ellipsis { font-size: .78rem; color: var(--c-muted); padding: 0 2px; line-height: 32px; }

        /* ─── Empty / loading ─── */
        .ab-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px; padding: 50px 20px; color: var(--c-muted); font-size: .82rem;
        }
        .ab-empty svg { width: 36px; height: 36px; opacity: .25; }
        .ab-sk { background: var(--c-surface-2); border-radius: 6px; animation: ab-sk 1.1s ease infinite alternate; }

        /* ─── Modal overlay ─── */
        .ab-ov {
          position: fixed; inset: 0; z-index: 400;
          background: rgba(6,14,24,.65); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: ab-fade-in .16s ease;
        }
        .ab-modal {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: 20px; padding: 26px; width: 100%; max-width: 400px;
          box-shadow: 0 24px 80px rgba(0,0,0,.35);
          animation: ab-scale-in .18s ease;
        }
        .ab-modal-hd {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 6px;
        }
        .ab-modal-title { font-size: 1rem; font-weight: 800; color: var(--c-text); }
        .ab-modal-sub { font-size: .75rem; color: var(--c-muted); margin-top: 3px; line-height: 1.4; }
        .ab-modal-close {
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 8px;
          border: 1px solid var(--c-border); background: var(--c-surface-2);
          color: var(--c-muted); cursor: pointer; transition: all .13s; flex-shrink: 0;
        }
        .ab-modal-close:hover { border-color: var(--c-danger); color: var(--c-danger); background: var(--c-danger-soft); }
        .ab-modal-close svg { width: 13px; height: 13px; }

        .ab-divider { height: 1px; background: var(--c-border); margin: 16px 0; }

        .ab-plan-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
        .ab-plan-opt {
          display: flex; align-items: center; gap: 12px; padding: 12px 14px;
          border-radius: 12px; border: 1.5px solid var(--c-border);
          background: var(--c-surface-2); cursor: pointer; transition: all .14s;
        }
        .ab-plan-opt:hover { border-color: var(--c-accent); background: color-mix(in srgb,var(--c-accent) 5%,var(--c-surface)); }
        .ab-plan-opt.sel  { border-color: var(--c-accent); background: color-mix(in srgb,var(--c-accent) 8%,var(--c-surface)); }
        .ab-plan-opt-icon {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .ab-plan-opt-icon svg { width: 14px; height: 14px; }
        .ab-plan-opt-name { font-size: .84rem; font-weight: 800; color: var(--c-text); text-transform: capitalize; }
        .ab-plan-opt-meta { font-size: .7rem; color: var(--c-muted); margin-top: 1px; }
        .ab-plan-chk { margin-left: auto; flex-shrink: 0; }
        .ab-plan-chk svg { width: 15px; height: 15px; }

        .ab-save-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 12px; border-radius: 11px; background: var(--c-accent); color: #fff;
          font-size: .85rem; font-weight: 800; font-family: inherit; border: none;
          cursor: pointer; transition: opacity .14s, transform .14s;
          box-shadow: 0 4px 18px color-mix(in srgb,var(--c-accent) 38%,transparent);
        }
        .ab-save-btn:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
        .ab-save-btn:disabled { opacity: .5; cursor: not-allowed; }
        .ab-save-btn svg { width: 14px; height: 14px; }
      `}</style>

      <div className="ab-root">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            STATS GRID
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="ab-stats">
          {stats ? (
            <>
              <StatCard Icon={DollarSign} color="#10B981"  label="Total Revenue"   val={<AnimNum to={stats.totalRevenue} suffix=" RWF"/>} trend="+12%" up />
              <StatCard Icon={Building2}  color="#38AECC"  label="Org Revenue"     val={<AnimNum to={stats.orgRevenue}   suffix=" RWF"/>} trend="+8%"  up />
              <StatCard Icon={User}       color="#818CF8"  label="User Revenue"    val={<AnimNum to={stats.userRevenue}  suffix=" RWF"/>} trend="+18%" up />
              <StatCard Icon={Crown}      color="#FCD34D"  label="Paid Orgs"       val={<AnimNum to={stats.activePaidOrgs}/>}             trend="+3%"  up />
              <StatCard Icon={TrendingUp} color="#818CF8"  label="Paid Users"      val={<AnimNum to={stats.activePaidUsers}/>}            trend="+9%"  up />
              <StatCard Icon={Clock}      color="var(--c-warn)"    label="Pending Txns"    val={<AnimNum to={stats.pendingCount}/>}               trend=""    />
              <StatCard Icon={AlertTriangle} color="var(--c-danger)" label="Failed Txns"  val={<AnimNum to={stats.failedCount}/>}               trend=""    />
            </>
          ) : (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="ab-stat" style={{ animationDelay: `${i * .04}s` }}>
                <div className="ab-sk" style={{ width:34, height:34, borderRadius:10 }}/>
                <div className="ab-sk" style={{ width:"60%", height:20, borderRadius:6 }}/>
                <div className="ab-sk" style={{ width:"45%", height:12, borderRadius:5 }}/>
              </div>
            ))
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TOOLBAR
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="ab-toolbar">
          <div className="ab-search-box">
            <Search size={13}/>
            <input
              placeholder="Search name, email, ref…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button style={{ background:"none",border:"none",cursor:"pointer",color:"var(--c-muted)",display:"flex",padding:0 }}
                onClick={() => { setSearch(""); setPage(1); }}>
                <X size={12}/>
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="ab-seg">
            {(["all","org","user"] as const).map(t => (
              <button key={t} className={`ab-seg-btn${typeFilter===t?" on":""}`}
                onClick={() => { setTypeFilter(t); setPage(1); }}>
                {t==="all" ? "All" : t==="org" ? "Orgs" : "Users"}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="ab-seg">
            {(["all","success","pending","failed"] as const).map(s => (
              <button key={s} className={`ab-seg-btn${statusFilter===s?" on":""}`}
                onClick={() => { setStatusFilter(s); setPage(1); }}>
                {s==="all" ? "All" : s==="success" ? "Paid" : s==="pending" ? "Pending" : "Failed"}
              </button>
            ))}
          </div>

          <button className="ab-icon-btn" title="Refresh"
            onClick={() => fetchData(search, typeFilter, statusFilter, page)}>
            <RefreshCw size={14} className={loading ? "ab-spin" : ""}/>
          </button>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TABLE
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="ab-card">
          <div className="ab-card-head">
            <span className="ab-card-title">Billing Records</span>
            <span className="ab-card-count">{total.toLocaleString()} total</span>
          </div>

          <div className="ab-tbl-wrap">
            {loading ? (
              <div className="ab-empty">
                <RefreshCw className="ab-spin" style={{ width:28,height:28 }}/>
                <span>Loading records…</span>
              </div>
            ) : records.length === 0 ? (
              <div className="ab-empty">
                <Receipt/>
                <span>No billing records match your filters</span>
              </div>
            ) : (
              <table className="ab-tbl">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Entity</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Date</th>
                    <th style={{ width:40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, idx) => {
                    const sm = STATUS_META[row.status] ?? STATUS_META.failed;
                    const pm = PLAN_META[row.plan]    ?? PLAN_META.free;
                    return (
                      <tr key={row.id} style={{ animationDelay: `${idx * .02}s` }}>

                        {/* Type */}
                        <td>
                          <span className={`ab-kind-badge ${row.kind}`}>
                            {row.kind === "org" ? <Building2 size={10}/> : <User size={10}/>}
                            {row.kind === "org" ? "Org" : "User"}
                          </span>
                        </td>

                        {/* Entity */}
                        <td>
                          <div className="ab-entity-cell">
                            <span className="ab-entity-name">{row.entityName}</span>
                            <span className="ab-entity-email">{row.entityEmail}</span>
                          </div>
                        </td>

                        {/* Plan */}
                        <td>
                          <span className="ab-plan-badge" style={{ background:pm.bg, color:pm.color, borderColor:`${pm.color}30` }}>
                            <span className="ab-plan-dot" style={{ background:pm.color }}/>
                            {row.plan}
                          </span>
                        </td>

                        {/* Amount */}
                        <td>
                          <span className="ab-amount" style={{ color: row.amountRWF === 0 ? "var(--c-muted)" : "var(--c-text)" }}>
                            {fmt(row.amountRWF)}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`ab-status ${sm.cls}`}>
                            <sm.icon size={11}/>
                            {sm.label}
                          </span>
                        </td>

                        {/* Ref */}
                        <td>
                          <span className="ab-ref" title={row.txRef}>{row.txRef}</span>
                          {row.flwRef && (
                            <span className="ab-ref" title={`FLW: ${row.flwRef}`} style={{ opacity:.55, marginTop:1 }}>
                              {row.flwRef}
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td style={{ whiteSpace:"nowrap", fontSize:".77rem" }}>{fmtDate(row.createdAt)}</td>

                        {/* Actions */}
                        <td>
                          <div className="ab-mw" onClick={e => e.stopPropagation()}>
                            <button className="ab-mbtn"
                              onClick={() => setMenu(m => m === row.id ? null : row.id)}>
                              <MoreHorizontal size={14}/>
                            </button>

                            {menu === row.id && (
                              <div className="ab-menu">
                                <div className="ab-msec">Override plan</div>
                                <button className="ab-mi" onClick={() => openPlanModal(row)}>
                                  <Crown size={13}/> Change plan
                                </button>
                                <div className="ab-mdiv"/>
                                <div className="ab-msec">Mark record as</div>
                                {row.status !== "success" && (
                                  <button className="ab-mi ok" onClick={() => setRecordStatus(row, "success")}>
                                    <CheckCircle size={13}/> Mark as paid
                                  </button>
                                )}
                                {row.status !== "pending" && (
                                  <button className="ab-mi" onClick={() => setRecordStatus(row, "pending")}>
                                    <Clock size={13}/> Mark as pending
                                  </button>
                                )}
                                {row.status !== "failed" && (
                                  <button className="ab-mi danger" onClick={() => setRecordStatus(row, "failed")}>
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
                Showing {Math.min((page-1)*PAGE_SIZE+1, total)}–{Math.min(page*PAGE_SIZE, total)} of {total.toLocaleString()}
              </span>
              <div className="ab-pager-btns">
                <button className="ab-pbtn" disabled={page<=1} onClick={() => setPage(p => p-1)}>
                  <ChevronLeft size={13}/>
                </button>

                {/* Numbered page buttons with ellipsis */}
                {(() => {
                  const delta = 1; // pages shown on each side of current
                  const range: (number | "…")[] = [];
                  const add = (n: number) => range.push(n);
                  // always show first
                  add(1);
                  if (page - delta > 2) range.push("…");
                  for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) add(i);
                  if (page + delta < pages - 1) range.push("…");
                  if (pages > 1) add(pages);
                  return range.map((item, i) =>
                    item === "…"
                      ? <span key={`e${i}`} className="ab-pnum-ellipsis">…</span>
                      : <button key={item} className={`ab-pnum-page${page === item ? " active" : ""}`}
                          onClick={() => page !== item && setPage(item as number)}>
                          {item}
                        </button>
                  );
                })()}

                <button className="ab-pbtn" disabled={page>=pages} onClick={() => setPage(p => p+1)}>
                  <ChevronRight size={13}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PLAN MODAL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {planModal && (
        <div className="ab-ov" onClick={() => !saving && setPlanModal(null)}>
          <div className="ab-modal" onClick={e => e.stopPropagation()}>

            <div className="ab-modal-hd">
              <div>
                <div className="ab-modal-title">Override Plan</div>
                <div className="ab-modal-sub">
                  {planModal.row.entityName}
                  <span style={{ opacity:.5, margin:"0 5px" }}>·</span>
                  {planModal.row.kind === "org" ? "Organisation" : "User account"}
                </div>
              </div>
              <button className="ab-modal-close" onClick={() => setPlanModal(null)} disabled={saving}>
                <X size={13}/>
              </button>
            </div>

            <div className="ab-divider"/>

            <div className="ab-plan-list">
              {(planModal.row.kind === "org" ? ORG_PLANS : USER_PLANS).map(p => (
                <div key={p.id}
                  className={`ab-plan-opt${newPlan===p.id?" sel":""}`}
                  onClick={() => setNewPlan(p.id)}>
                  <div className="ab-plan-opt-icon"
                    style={{ background:`color-mix(in srgb,${p.color} 16%,transparent)` }}>
                    <p.Icon size={14} style={{ color:p.color }}/>
                  </div>
                  <div>
                    <div className="ab-plan-opt-name">{p.id}</div>
                    <div className="ab-plan-opt-meta">{p.msgs} · {p.price}</div>
                  </div>
                  {newPlan === p.id && (
                    <span className="ab-plan-chk">
                      <Check size={15} style={{ color:"var(--c-accent)" }}/>
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button className="ab-save-btn" disabled={!newPlan || saving} onClick={savePlan}>
              {saving
                ? <><RefreshCw size={14} className="ab-spin"/> Applying…</>
                : <><Check size={14}/> Apply Plan</>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Stat card ─────────────────────────────────────────────────── */
function StatCard({
  Icon, color, label, val, trend, up,
}: {
  Icon: any; color: string; label: string;
  val: React.ReactNode; trend?: string; up?: boolean;
}) {
  return (
    <div className="ab-stat" style={{ ["--ac" as any]: color }}>
      <div className="ab-stat-top">
        <div className="ab-stat-icon" style={{ background:`color-mix(in srgb,${color} 14%,transparent)` }}>
          <Icon size={16} style={{ color }}/>
        </div>
        {trend && (
          <div className="ab-stat-trend"
            style={{
              background: up ? "var(--c-success-soft)" : "var(--c-danger-soft)",
              color:       up ? "var(--c-success)"      : "var(--c-danger)",
            }}>
            {up ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
            {trend}
          </div>
        )}
      </div>
      <div className="ab-stat-val">{val}</div>
      <div className="ab-stat-lbl">{label}</div>
    </div>
  );
}