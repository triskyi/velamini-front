"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, User, ChevronLeft, ChevronRight, RefreshCw,
  Zap, Crown, MoreHorizontal, MessageSquare,
  Users, UserX, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  X, ShieldOff, ShieldCheck, Flag,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */
type Status   = "active" | "pending" | "banned" | "flagged";
type PlanType = "free" | "plus";

interface PersonalUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  status: Status;
  role: string;
  onboardingComplete: boolean;
  personalPlanType: PlanType;
  personalMonthlyMsgCount: number;
  personalMonthlyMsgLimit: number;
  personalPlanRenewalDate: string | null;
  creditsExhaustedAt: string | null;
  _count: { virtualSelfChats: number };
}

interface Stats {
  total: number;
  activePlus: number;
  activeFree: number;
  banned: number;
}

/* ── Constants ──────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

const PLAN_META: Record<PlanType, { label: string; color: string; Icon: any }> = {
  free: { label: "Free", color: "#34D399", Icon: Zap   },
  plus: { label: "Plus", color: "#818CF8", Icon: Crown },
};

const STATUS_META: Record<Status, { label: string; color: string; bg: string }> = {
  active:  { label: "Active",  color: "#10B981", bg: "rgba(16,185,129,.12)"  },
  pending: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,.12)"  },
  banned:  { label: "Banned",  color: "#EF4444", bg: "rgba(239,68,68,.12)"   },
  flagged: { label: "Flagged", color: "#F97316", bg: "rgba(249,115,22,.12)"  },
};

/* ── Helpers ────────────────────────────────────────────────────── */
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-RW", { year: "numeric", month: "short", day: "numeric" });

const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

function UsageBar({ used, limit, color }: { used: number; limit: number; color: string }) {
  const pct    = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const danger = pct >= 90;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 90 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".64rem", color: "var(--c-muted)" }}>
        <span>{fmtK(used)}</span><span>{fmtK(limit)}</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: "var(--c-surface-2)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: danger ? "#EF4444" : color, transition: "width .4s" }}/>
      </div>
    </div>
  );
}

function Avatar({ name, image, size = 32 }: { name: string | null; image: string | null; size?: number }) {
  const initials = (name ?? "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (image) return <img src={image} alt={name ?? ""} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}/>;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--c-accent)", color: "#fff", fontSize: size * .38, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────── */
export default function AdminPersonal() {
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [users,    setUsers]    = useState<PersonalUser[]>([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(true);

  const [search,   setSearch]   = useState("");
  const [plan,     setPlan]     = useState<"all" | PlanType>("all");
  const [status,   setStatus]   = useState<"all" | Status>("all");
  const [page,     setPage]     = useState(1);

  const [menu,      setMenu]      = useState<string | null>(null);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  /* ── Fetch ──────────────────────────────────────────────────── */
  const fetchUsers = useCallback((s: string, pl: string, st: string, p: number) => {
    setLoading(true);
    const q = new URLSearchParams({ search: s, plan: pl, status: st, page: String(p), pageSize: String(PAGE_SIZE) });
    fetch(`/api/admin/users?${q}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setUsers(d.users);
          setTotal(d.total);
          setPages(d.pages);
          if (d.stats) setStats(d.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchUsers(search, plan, status, page), 300);
    return () => clearTimeout(id);
  }, [search, plan, status, page, fetchUsers]);

  useEffect(() => {
    const fn = () => setMenu(null);
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* ── Actions ─────────────────────────────────────────────────── */
  const patch = (id: string, body: object) => {
    setActioning(id);
    return fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(r => r.json())
      .then(d => { if (d.ok) fetchUsers(search, plan, status, page); })
      .catch(() => {})
      .finally(() => { setActioning(null); setMenu(null); });
  };

  /* ── JSX ──────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        .ap-root *, .ap-root *::before, .ap-root *::after { box-sizing: border-box; }
        .ap-root {
          display: flex; flex-direction: column; gap: 20px;
          font-family: 'DM Sans', system-ui, sans-serif;
          padding-top: 28px;
        }
        @keyframes ap-fade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes ap-sk   { from { opacity:.4; } to { opacity:.85; } }
        @keyframes ap-spin { to { transform:rotate(360deg); } }
        .ap-spin { animation: ap-spin .7s linear infinite; }

        /* Stats */
        .ap-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
        .ap-stat {
          background:var(--c-surface); border:1px solid var(--c-border); border-radius:16px;
          padding:16px 16px 14px; display:flex; flex-direction:column; gap:10px;
          position:relative; overflow:hidden; animation: ap-fade .35s ease both;
        }
        .ap-stat::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:var(--ac,#38AECC); opacity:.55; border-radius:16px 16px 0 0;
        }
        .ap-stat-top { display:flex; align-items:center; justify-content:space-between; }
        .ap-stat-icon {
          width:34px; height:34px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .ap-stat-val { font-size:1.3rem; font-weight:800; color:var(--c-text); line-height:1; }
        .ap-stat-lbl { font-size:.67rem; font-weight:600; letter-spacing:.07em; text-transform:uppercase; color:var(--c-muted); }

        /* Toolbar */
        .ap-toolbar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .ap-search {
          flex:1; min-width:180px; display:flex; align-items:center; gap:8px;
          padding:0 12px; height:38px; border-radius:10px;
          border:1.5px solid var(--c-border); background:var(--c-surface);
          transition:border-color .15s, box-shadow .15s;
        }
        .ap-search:focus-within {
          border-color:var(--c-accent);
          box-shadow:0 0 0 3px color-mix(in srgb,var(--c-accent) 14%,transparent);
        }
        .ap-search svg { color:var(--c-muted); flex-shrink:0; }
        .ap-search input {
          flex:1; border:none; outline:none; background:transparent;
          color:var(--c-text); font-size:.82rem; font-family:inherit;
        }
        .ap-search input::placeholder { color:var(--c-muted); }
        .ap-seg {
          display:flex; border-radius:10px; overflow:hidden;
          border:1.5px solid var(--c-border); flex-shrink:0; background:var(--c-surface);
        }
        .ap-seg-btn {
          padding:0 14px; height:36px; font-size:.75rem; font-weight:700;
          font-family:inherit; cursor:pointer; border:none;
          background:transparent; color:var(--c-muted); transition:all .15s; white-space:nowrap;
        }
        .ap-seg-btn + .ap-seg-btn { border-left:1px solid var(--c-border); }
        .ap-seg-btn.on { background:var(--c-accent); color:#fff; }
        .ap-icon-btn {
          display:flex; align-items:center; justify-content:center;
          width:38px; height:38px; border-radius:10px; flex-shrink:0;
          border:1.5px solid var(--c-border); background:var(--c-surface);
          color:var(--c-muted); cursor:pointer; transition:all .15s;
        }
        .ap-icon-btn:hover { border-color:var(--c-accent); color:var(--c-accent); background:color-mix(in srgb,var(--c-accent) 8%,transparent); }

        /* Card / table */
        .ap-card {
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:16px; overflow:hidden; animation:ap-fade .4s ease both .05s;
        }
        .ap-card-head {
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:8px; padding:14px 18px 13px;
          border-bottom:1px solid var(--c-border); background:var(--c-surface-2);
        }
        .ap-card-title { font-size:.85rem; font-weight:800; color:var(--c-text); }
        .ap-card-count {
          font-size:.72rem; font-weight:600; color:var(--c-muted);
          background:var(--c-surface); border:1px solid var(--c-border);
          padding:2px 9px; border-radius:20px;
        }
        .ap-tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        table.ap-tbl { width:100%; border-collapse:collapse; font-size:.8rem; min-width:600px; }
        table.ap-tbl th {
          text-align:left; font-size:.62rem; font-weight:800; letter-spacing:.09em;
          text-transform:uppercase; color:var(--c-muted); padding:10px 16px;
          border-bottom:1px solid var(--c-border); white-space:nowrap;
          background:color-mix(in srgb,var(--c-surface-2) 80%,transparent);
        }
        table.ap-tbl td {
          padding:11px 16px; border-bottom:1px solid var(--c-border);
          color:var(--c-muted); vertical-align:middle;
        }
        table.ap-tbl tr:last-child td { border-bottom:none; }
        table.ap-tbl tbody tr:hover td { background:color-mix(in srgb,var(--c-accent) 4%,var(--c-surface)); }

        /* Cells */
        .ap-user-cell { display:flex; align-items:center; gap:10px; }
        .ap-user-info { display:flex; flex-direction:column; gap:1px; }
        .ap-user-name  { font-size:.83rem; font-weight:700; color:var(--c-text); }
        .ap-user-email { font-size:.69rem; color:var(--c-muted); }
        .ap-plan-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:3px 9px; border-radius:20px; font-size:.68rem; font-weight:800;
          text-transform:capitalize; border:1px solid transparent;
        }
        .ap-plan-dot { width:5px; height:5px; border-radius:50%; }
        .ap-status-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:3px 9px; border-radius:7px; font-size:.68rem; font-weight:800;
        }

        /* Expand row */
        .ap-expand-td { padding:0 !important; }
        .ap-expand-inner {
          padding:16px 20px;
          background:color-mix(in srgb,var(--c-accent) 4%,var(--c-surface));
          border-top:1px solid var(--c-border);
          display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px;
        }
        .ap-detail-item { display:flex; flex-direction:column; gap:3px; }
        .ap-detail-lbl { font-size:.62rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--c-muted); }
        .ap-detail-val { font-size:.82rem; font-weight:600; color:var(--c-text); }

        /* Context menu */
        .ap-mw { position:relative; }
        .ap-mbtn {
          display:flex; align-items:center; justify-content:center;
          width:30px; height:30px; border-radius:8px;
          border:1px solid transparent; background:none;
          color:var(--c-muted); cursor:pointer; transition:all .12s;
        }
        .ap-mbtn:hover { background:var(--c-surface-2); border-color:var(--c-border); color:var(--c-text); }
        .ap-menu {
          position:absolute; right:0; top:calc(100% + 5px); z-index:200;
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,.2);
          padding:5px; min-width:195px;
        }
        .ap-mi {
          display:flex; align-items:center; gap:9px; padding:8px 11px;
          border-radius:8px; font-size:.79rem; font-weight:600; cursor:pointer;
          color:var(--c-muted); background:none; border:none;
          width:100%; text-align:left; font-family:inherit; transition:all .1s;
        }
        .ap-mi:hover           { background:var(--c-surface-2);      color:var(--c-text);    }
        .ap-mi.ok:hover        { background:var(--c-success-soft);   color:var(--c-success); }
        .ap-mi.danger:hover    { background:var(--c-danger-soft);    color:var(--c-danger);  }
        .ap-mi.warn:hover      { background:var(--c-warn-soft);      color:var(--c-warn);    }
        .ap-mi svg { width:13px; height:13px; flex-shrink:0; }
        .ap-mdiv  { height:1px; background:var(--c-border); margin:4px 6px; }
        .ap-msec  { padding:5px 11px 3px; font-size:.6rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--c-muted); }

        /* Expand toggle */
        .ap-expbtn {
          display:flex; align-items:center; justify-content:center;
          width:24px; height:24px; border-radius:6px; cursor:pointer;
          border:1px solid var(--c-border); background:var(--c-surface-2);
          color:var(--c-muted); transition:all .12s;
        }
        .ap-expbtn:hover { border-color:var(--c-accent); color:var(--c-accent); }

        /* Pagination */
        .ap-pager {
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:8px; padding:12px 18px;
          border-top:1px solid var(--c-border);
        }
        .ap-pager-info { font-size:.73rem; color:var(--c-muted); }
        .ap-pager-btns { display:flex; align-items:center; gap:6px; }
        .ap-pbtn {
          display:flex; align-items:center; justify-content:center; gap:5px;
          padding:0 14px; height:32px; border-radius:8px;
          border:1px solid var(--c-border); background:var(--c-surface);
          color:var(--c-muted); cursor:pointer; transition:all .13s;
          font-size:.78rem; font-weight:600; font-family:inherit; white-space:nowrap;
        }
        .ap-pbtn:hover:not(:disabled) { border-color:var(--c-accent); color:var(--c-accent); background:color-mix(in srgb,var(--c-accent) 8%,transparent); }
        .ap-pbtn:disabled { opacity:.35; cursor:not-allowed; }
        .ap-pbtn svg { width:13px; height:13px; }
        .ap-pnum-page {
          display:flex; align-items:center; justify-content:center;
          min-width:32px; height:32px; border-radius:8px; padding:0 4px;
          border:1px solid var(--c-border); background:var(--c-surface);
          color:var(--c-muted); cursor:pointer; font-size:.78rem; font-weight:600; transition:all .13s;
        }
        .ap-pnum-page:hover { border-color:var(--c-accent); color:var(--c-accent); background:color-mix(in srgb,var(--c-accent) 8%,transparent); }
        .ap-pnum-page.active { background:var(--c-text); color:var(--c-surface); border-color:var(--c-text); cursor:default; }
        .ap-pnum-ellipsis { font-size:.78rem; color:var(--c-muted); padding:0 2px; line-height:32px; }

        /* Empty / loading */
        .ap-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:50px 20px; color:var(--c-muted); font-size:.82rem; }
        .ap-empty svg { width:36px; height:36px; opacity:.25; }
        .ap-sk { background:var(--c-surface-2); border-radius:6px; animation:ap-sk 1.1s ease infinite alternate; }
      `}</style>

      <div className="ap-root">

        {/* ── Stats ── */}
        <div className="ap-stats">
          {stats ? (
            <>
              <StatCard Icon={Users} color="#38AECC"         label="Total Users" val={stats.total.toLocaleString()}      delay={0}/>
              <StatCard Icon={Crown} color="#818CF8"         label="Plus Plan"   val={stats.activePlus.toLocaleString()} delay={1}/>
              <StatCard Icon={Zap}   color="#34D399"         label="Free Plan"   val={stats.activeFree.toLocaleString()} delay={2}/>
              <StatCard Icon={UserX} color="var(--c-danger)" label="Banned"      val={stats.banned.toLocaleString()}     delay={3}/>
            </>
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="ap-stat" style={{ animationDelay: `${i * .04}s` }}>
                <div className="ap-sk" style={{ width: 34, height: 34, borderRadius: 10 }}/>
                <div className="ap-sk" style={{ width: "55%", height: 20, borderRadius: 6 }}/>
                <div className="ap-sk" style={{ width: "40%", height: 11, borderRadius: 5 }}/>
              </div>
            ))
          )}
        </div>

        {/* ── Toolbar ── */}
        <div className="ap-toolbar">
          <div className="ap-search">
            <Search size={13}/>
            <input
              placeholder="Search name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button style={{ background:"none", border:"none", cursor:"pointer", color:"var(--c-muted)", display:"flex", padding:0 }}
                onClick={() => { setSearch(""); setPage(1); }}>
                <X size={12}/>
              </button>
            )}
          </div>

          <div className="ap-seg">
            {(["all","free","plus"] as const).map(p => (
              <button key={p} className={`ap-seg-btn${plan === p ? " on" : ""}`}
                onClick={() => { setPlan(p); setPage(1); }}>
                {p === "all" ? "All Plans" : p === "plus" ? "Plus" : "Free"}
              </button>
            ))}
          </div>

          <div className="ap-seg">
            {(["all","active","banned","flagged","pending"] as const).map(s => (
              <button key={s} className={`ap-seg-btn${status === s ? " on" : ""}`}
                onClick={() => { setStatus(s); setPage(1); }}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <button className="ap-icon-btn" title="Refresh"
            onClick={() => fetchUsers(search, plan, status, page)}>
            <RefreshCw size={14} className={loading ? "ap-spin" : ""}/>
          </button>
        </div>

        {/* ── Table ── */}
        <div className="ap-card">
          <div className="ap-card-head">
            <span className="ap-card-title">Personal Users</span>
            <span className="ap-card-count">{total.toLocaleString()} total</span>
          </div>

          <div className="ap-tbl-wrap">
            {loading ? (
              <div className="ap-empty">
                <RefreshCw className="ap-spin" style={{ width: 28, height: 28 }}/>
                <span>Loading users…</span>
              </div>
            ) : users.length === 0 ? (
              <div className="ap-empty">
                <User/>
                <span>No users match your filters</span>
              </div>
            ) : (
              <table className="ap-tbl">
                <thead>
                  <tr>
                    <th style={{ width: 28 }}></th>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Messages</th>
                    <th>Chats</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => {
                    const pm = PLAN_META[u.personalPlanType] ?? PLAN_META.free;
                    const sm = STATUS_META[u.status] ?? STATUS_META.active;
                    const isExpanded = expanded === u.id;
                    return (
                      <React.Fragment key={u.id}>
                        <tr style={{ animationDelay: `${idx * .02}s` }}>

                          {/* Expand toggle */}
                          <td>
                            <button className="ap-expbtn"
                              onClick={() => setExpanded(p => p === u.id ? null : u.id)}>
                              {isExpanded ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                            </button>
                          </td>

                          {/* User */}
                          <td>
                            <div className="ap-user-cell">
                              <Avatar name={u.name} image={u.image}/>
                              <div className="ap-user-info">
                                <span className="ap-user-name">{u.name ?? "—"}</span>
                                <span className="ap-user-email">{u.email ?? "—"}</span>
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td>
                            <span className="ap-plan-badge"
                              style={{ background: `${pm.color}18`, color: pm.color, borderColor: `${pm.color}30` }}>
                              <span className="ap-plan-dot" style={{ background: pm.color }}/>
                              <pm.Icon size={10}/>
                              {pm.label}
                            </span>
                          </td>

                          {/* Messages */}
                          <td>
                            <UsageBar
                              used={u.personalMonthlyMsgCount}
                              limit={u.personalMonthlyMsgLimit}
                              color="#38AECC"
                            />
                          </td>

                          {/* Chats */}
                          <td>
                            <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:".8rem", color:"var(--c-text)", fontWeight:700 }}>
                              <MessageSquare size={12} style={{ color:"var(--c-muted)" }}/>
                              {u._count.virtualSelfChats}
                            </span>
                          </td>

                          {/* Status */}
                          <td>
                            <span className="ap-status-badge" style={{ background: sm.bg, color: sm.color }}>
                              {sm.label}
                            </span>
                          </td>

                          {/* Joined */}
                          <td style={{ whiteSpace: "nowrap", fontSize: ".77rem" }}>
                            {fmtDate(u.createdAt)}
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="ap-mw" onClick={e => e.stopPropagation()}>
                              <button className="ap-mbtn"
                                disabled={actioning === u.id}
                                onClick={() => setMenu(m => m === u.id ? null : u.id)}>
                                {actioning === u.id
                                  ? <RefreshCw size={12} className="ap-spin"/>
                                  : <MoreHorizontal size={14}/>}
                              </button>

                              {menu === u.id && (
                                <div className="ap-menu">
                                  <div className="ap-msec">Change plan</div>
                                  {u.personalPlanType !== "plus" && (
                                    <button className="ap-mi ok"
                                      onClick={() => patch(u.id, { personalPlanType: "plus" })}>
                                      <Crown size={13}/> Upgrade to Plus
                                    </button>
                                  )}
                                  {u.personalPlanType !== "free" && (
                                    <button className="ap-mi"
                                      onClick={() => patch(u.id, { personalPlanType: "free" })}>
                                      <Zap size={13}/> Downgrade to Free
                                    </button>
                                  )}
                                  <div className="ap-mdiv"/>
                                  <div className="ap-msec">Account status</div>
                                  {u.status !== "active" && (
                                    <button className="ap-mi ok"
                                      onClick={() => patch(u.id, { status: "active" })}>
                                      <CheckCircle size={13}/> Set Active
                                    </button>
                                  )}
                                  {u.status !== "flagged" && (
                                    <button className="ap-mi warn"
                                      onClick={() => patch(u.id, { status: "flagged" })}>
                                      <Flag size={13}/> Flag User
                                    </button>
                                  )}
                                  {u.status !== "banned" && (
                                    <button className="ap-mi danger"
                                      onClick={() => patch(u.id, { status: "banned" })}>
                                      <ShieldOff size={13}/> Ban User
                                    </button>
                                  )}
                                  {u.status === "banned" && (
                                    <button className="ap-mi ok"
                                      onClick={() => patch(u.id, { status: "active" })}>
                                      <ShieldCheck size={13}/> Unban User
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isExpanded && (
                          <tr key={`${u.id}-exp`}>
                            <td colSpan={8} className="ap-expand-td">
                              <div className="ap-expand-inner">
                                <DetailItem label="User ID"          val={u.id} mono />
                                <DetailItem label="Role"             val={u.role} />
                                <DetailItem label="Onboarded"        val={u.onboardingComplete ? "Yes" : "No"} />
                                <DetailItem label="Plan Renewal"     val={u.personalPlanRenewalDate ? fmtDate(u.personalPlanRenewalDate) : "—"} />
                                <DetailItem label="Credits XH At"    val={u.creditsExhaustedAt ? fmtDate(u.creditsExhaustedAt) : "—"} />
                                <DetailItem label="Msgs Used / Limit" val={`${u.personalMonthlyMsgCount} / ${u.personalMonthlyMsgLimit}`} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {users.length > 0 && (
            <div className="ap-pager">
              <span className="ap-pager-info">
                Showing {Math.min((page-1)*PAGE_SIZE+1, total)}–{Math.min(page*PAGE_SIZE, total)} of {total.toLocaleString()}
              </span>
              <div className="ap-pager-btns">
                <button className="ap-pbtn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={13}/> Back
                </button>
                {(() => {
                  const delta = 1;
                  const range: (number | "…")[] = [];
                  range.push(1);
                  if (page - delta > 2) range.push("…");
                  for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) range.push(i);
                  if (page + delta < pages - 1) range.push("…");
                  if (pages > 1) range.push(pages);
                  return range.map((item, i) =>
                    item === "…"
                      ? <span key={`e${i}`} className="ap-pnum-ellipsis">…</span>
                      : <button key={item}
                          className={`ap-pnum-page${page === item ? " active" : ""}`}
                          onClick={() => page !== item && setPage(item as number)}>
                          {item}
                        </button>
                  );
                })()}
                <button className="ap-pbtn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight size={13}/>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */
function StatCard({ Icon, color, label, val, delay }: { Icon: any; color: string; label: string; val: string; delay: number }) {
  return (
    <div className="ap-stat" style={{ ["--ac" as any]: color, animationDelay: `${delay * .05}s` }}>
      <div className="ap-stat-top">
        <div className="ap-stat-icon" style={{ background: `color-mix(in srgb,${color} 14%,transparent)` }}>
          <Icon size={16} style={{ color }}/>
        </div>
      </div>
      <div className="ap-stat-val">{val}</div>
      <div className="ap-stat-lbl">{label}</div>
    </div>
  );
}

function DetailItem({ label, val, mono }: { label: string; val: string; mono?: boolean }) {
  return (
    <div className="ap-detail-item">
      <span className="ap-detail-lbl">{label}</span>
      <span className="ap-detail-val" style={mono ? { fontFamily: "ui-monospace,monospace", fontSize: ".75rem" } : {}}>
        {val}
      </span>
    </div>
  );
}