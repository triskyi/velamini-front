"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, Bell, CheckCheck, Info, AlertTriangle, Sparkles, LogOut, MessageSquare } from "lucide-react";
import { signOut } from "@/lib/auth-client";

import OrgAside, { ORG_ASIDE_CSS } from "./aside";
import OrgOverview  from "./overview";
import OrgAgent     from "./agent";
import OrgApi       from "./api";
import OrgAnalytics from "./analytics";
import OrgSettings  from "./settings";
import OrgChat      from "./chat";
import OrgBilling      from "@/components/organization/billing";
import OrgDataInsights from "./OrgDataInsights";
import { ORG_CSS }  from "@/types/organization/org-type";
import type { Organization, Stats, OrgTab } from "@/types/organization/org-type";

/* ── Notifications ───────────────────────────────────────────────── */
type NotifType = "info" | "success" | "warning" | "system" | "billing";
interface Notif { id: string; type: NotifType; title: string; body: string; time: string; read: boolean }

const notifIcon:  Record<string, any>    = { info: Info, success: Sparkles, warning: AlertTriangle, system: Bell, billing: Info };
const notifColor: Record<string, string> = { info: "#29A9D4", success: "#10B981", warning: "#F59E0B", system: "#8B5CF6", billing: "#0EA5E9" };

function fmtTimeAgo(ts: number, now: number): string {
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

/* ── CSS ─────────────────────────────────────────────────────────── */
const OW_CSS = `
  .ow-shell{min-height:100dvh;background:var(--c-bg)}
  .ow-right{display:flex;flex-direction:column;min-width:0;overflow:hidden}
  @media(min-width:1024px){.ow-right{margin-left:230px}}

  /* fixed sidebar (desktop) */
  .ow-sidebar{display:none}
  @media(min-width:1024px){
    .ow-sidebar{
      display:flex;flex-direction:column;
      position:fixed;top:0;left:0;width:230px;height:100vh;z-index:40;
      background:var(--c-sidebar,var(--c-surface));border-right:1px solid var(--c-border);
      overflow:hidden;transition:background .3s,border-color .3s;
    }
  }

  /* desktop navbar */
  .ow-navbar{display:none}
  @media(min-width:1024px){
    .ow-navbar{
      display:flex;align-items:center;justify-content:space-between;
      padding:0 24px;height:56px;
      position:fixed;top:0;left:230px;right:0;z-index:30;
      background:var(--c-surface);border-bottom:1px solid var(--c-border);
      transition:background .3s,border-color .3s;
    }
  }
  .ow-nb-breadcrumb{display:flex;align-items:center;gap:6px;font-size:.78rem;color:var(--c-muted)}
  .ow-nb-sep{opacity:.4}
  .ow-nb-active{font-weight:600;color:var(--c-text)}
  .ow-nb-right{display:flex;align-items:center;gap:7px}

  /* ── Usage pill ── */
  .ow-usage-pill{
    display:flex;align-items:center;gap:4px;
    padding:0 10px;height:28px;border-radius:7px;
    border:1px solid var(--c-border);
    background:var(--c-surface-2);
    color:var(--c-muted);font-size:.68rem;font-weight:600;
    white-space:nowrap;cursor:pointer;letter-spacing:.01em;
    transition:opacity .14s;
  }
  .ow-usage-pill:hover{opacity:.8}
  .ow-usage-pill--warn{
    border-color:color-mix(in srgb,#F59E0B 40%,transparent);
    background:color-mix(in srgb,#F59E0B 10%,transparent);
    color:#B45309;
  }
  .ow-usage-pill--danger{
    border-color:color-mix(in srgb,var(--c-danger) 40%,transparent);
    background:var(--c-danger-soft,#fee2e2);
    color:var(--c-danger);
  }
  .ow-usage-pill svg{width:10px;height:10px;flex-shrink:0}
  .ow-usage-free-badge{
    font-size:.52rem;font-weight:900;letter-spacing:.08em;
    padding:1px 5px;border-radius:4px;
    background:color-mix(in srgb,var(--c-accent,#29A9D4) 15%,transparent);
    color:var(--c-accent,#29A9D4);margin-right:1px;
  }
  @media(max-width:900px){.ow-usage-pill{display:none}}

  /* mobile bar */
  .ow-bar{
    display:flex;align-items:center;justify-content:space-between;
    padding:0 14px;height:52px;flex-shrink:0;
    position:fixed;top:0;left:0;right:0;z-index:30;
    background:var(--c-surface);border-bottom:1px solid var(--c-border);
    transition:background .3s,border-color .3s;
  }
  @media(min-width:1024px){.ow-bar{display:none}}
  .ow-bar-spacer{height:52px;flex-shrink:0;display:block}
  @media(min-width:1024px){.ow-bar-spacer{display:none}}
  .ow-bar-left{display:flex;align-items:center;gap:8px}
  .ow-bar-page{font-size:.76rem;color:var(--c-muted);font-weight:600}
  .ow-bar-right{display:flex;align-items:center;gap:6px}

  /* shared icon button */
  .ow-ibtn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);cursor:pointer;transition:all .14s}
  .ow-ibtn:hover,.ow-ibtn--active{color:var(--c-org);border-color:var(--c-org);background:var(--c-org-soft)}
  .ow-ibtn svg{width:14px;height:14px}

  /* bell + badge */
  .ow-bell-wrap{position:relative;display:inline-flex}
  .ow-bell-badge{
    position:absolute;top:-5px;right:-5px;
    min-width:17px;height:17px;padding:0 4px;border-radius:9px;
    background:var(--c-danger);color:#fff;font-size:.58rem;font-weight:700;
    display:flex;align-items:center;justify-content:center;
    border:2px solid var(--c-surface);pointer-events:none;line-height:1;
    animation:owbadge .35s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes owbadge{from{transform:scale(0)}to{transform:scale(1)}}

  /* mobile overlay + drawer */
  .ow-overlay{position:fixed;inset:0;z-index:200;display:flex;animation:owFadeIn .18s ease}
  @keyframes owFadeIn{from{opacity:0}to{opacity:1}}
  .ow-overlay-bg{position:absolute;inset:0;background:rgba(8,20,32,.6);backdrop-filter:blur(4px)}
  .ow-drawer{position:relative;width:min(280px,88vw);height:100%;background:var(--c-sidebar,var(--c-surface));border-right:1px solid var(--c-border);display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(8,20,32,.25);animation:owSlide .22s ease;z-index:1;transition:background .3s,border-color .3s}
  @keyframes owSlide{from{transform:translateX(-100%)}to{transform:translateX(0)}}

  /* notification dropdown */
  .ow-drop-wrap{position:relative;display:inline-flex}
  .ow-dropdown{
    position:absolute;top:calc(100% + 8px);right:0;
    background:var(--c-surface);border:1px solid var(--c-border);
    border-radius:14px;box-shadow:var(--shadow-lg);
    z-index:200;overflow:hidden;animation:owDrop .15s ease;
  }
  @keyframes owDrop{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}
  .ow-drop-head{
    padding:10px 14px 8px;
    display:flex;align-items:center;justify-content:space-between;
    font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
    color:var(--c-muted);border-bottom:1px solid var(--c-border);
  }
  .ow-notif-panel{min-width:310px;max-width:330px}
  .ow-notif-mark-btn{display:flex;align-items:center;gap:4px;padding:3px 9px;border-radius:7px;border:none;font-size:.68rem;font-weight:600;font-family:inherit;background:var(--c-org-soft);color:var(--c-org);cursor:pointer;transition:all .13s}
  .ow-notif-mark-btn:hover{background:var(--c-org);color:#fff}
  .ow-notif-mark-btn svg{width:11px;height:11px}
  .ow-notif-list{max-height:336px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}
  .ow-notif-list::-webkit-scrollbar{width:3px}
  .ow-notif-list::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:3px}
  .ow-notif-item{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;border-bottom:1px solid var(--c-border);cursor:pointer;transition:background .12s}
  .ow-notif-item:last-child{border-bottom:none}
  .ow-notif-item:hover{background:var(--c-surface-2)}
  .ow-notif-item--unread{background:color-mix(in srgb,var(--c-org) 5%,transparent)}
  .ow-notif-item--unread:hover{background:color-mix(in srgb,var(--c-org) 9%,transparent)}
  .ow-notif-ic{width:30px;height:30px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
  .ow-notif-ic svg{width:13px;height:13px}
  .ow-notif-body{flex:1;min-width:0}
  .ow-notif-title{font-size:.8rem;font-weight:700;color:var(--c-text);margin-bottom:2px}
  .ow-notif-text{font-size:.72rem;color:var(--c-muted);line-height:1.5}
  .ow-notif-time{font-size:.64rem;color:var(--c-muted);margin-top:3px;opacity:.8}
  .ow-notif-dot{width:7px;height:7px;border-radius:50%;background:var(--c-org);flex-shrink:0;margin-top:6px}
  .ow-notif-empty{padding:28px 14px;text-align:center;font-size:.78rem;color:var(--c-muted)}

  /* main content */
  .ow-main{flex:1;overflow-y:auto;overflow-x:hidden;min-height:0;background:var(--c-bg);transition:background .3s;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}
  .ow-main--chat{overflow:hidden;display:flex;flex-direction:column}
  @media(min-width:1024px){.ow-main{padding-top:56px}}
  .ow-main::-webkit-scrollbar{width:4px}
  .ow-main::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:4px}
  .ow-inner{max-width:980px;margin:0 auto;padding:20px 14px 72px}
  @media(min-width:600px){.ow-inner{padding:28px 24px 80px}}
  @media(min-width:1024px){.ow-inner{padding:32px 36px 80px}}
`;

const TAB_LABELS: Record<OrgTab, string> = {
  overview:  "Overview",
  agent:     "Train Agent",
  chat:      "Test Chat",
  api:       "API & Embed",
  analytics: "Analytics",
  insights:  "Data Insights",
  billing:   "Billing",
  settings:  "Settings",
};

/* ── Props ───────────────────────────────────────────────────────── */
interface OrgWrapperProps {
  orgId:        string;
  initialOrg:   Organization;
  initialStats: Stats | null;
}

/* ── Component ───────────────────────────────────────────────────── */
export default function OrgWrapper({ orgId, initialOrg, initialStats }: OrgWrapperProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [org,        setOrg]        = useState<Organization>(initialOrg);
  const [stats,      setStats]      = useState<Stats | null>(initialStats);
  const [tab,        setTab]        = useState<OrgTab>("overview");
  const [isDark,     setIsDark]     = useState(true);
  const [mounted,    setMounted]    = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifs,     setNotifs]     = useState<Notif[]>([]);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState("");
  const [paymentBanner, setPaymentBanner] = useState<"successful" | "failed" | "cancelled" | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const unread   = notifs.filter(n => !n.read).length;

  // Open billing tab and show payment result when redirected back from Flutterwave
  useEffect(() => {
    const tabParam     = searchParams.get("tab");
    const paymentParam = searchParams.get("payment");
    if (tabParam === "billing") {
      setTab("billing");
      if (paymentParam === "successful" || paymentParam === "failed" || paymentParam === "cancelled") {
        setPaymentBanner(paymentParam as "successful" | "failed" | "cancelled");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") || "dark";
      setIsDark(stored === "dark");
      document.documentElement.setAttribute("data-mode", stored);
    } catch {}
    fetch(`/api/notifications/org/${orgId}?pageSize=30`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.ok && Array.isArray(d.notifications)) {
          const now = Date.now();
          setNotifs(d.notifications.map((n: any) => ({
            id: n.id, type: n.type as NotifType,
            title: n.title, body: n.body,
            time: fmtTimeAgo(new Date(n.createdAt).getTime(), now),
            read: n.isRead,
          })));
        }
      }).catch(() => {});
  }, [orgId]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const mode = next ? "dark" : "light";
    document.documentElement.setAttribute("data-mode", mode);
    try { localStorage.setItem("theme", mode); } catch {}
  };

  const fetchOrg = async () => {
    try {
      const r = await fetch(`/api/organizations/${orgId}`);
      const d = await r.json();
      if (d.ok) setOrg(d.organization);
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const r = await fetch(`/api/organizations/${orgId}/stats`);
      const d = await r.json();
      if (d.ok) setStats(d.stats);
    } catch {}
  };

  const handleSave = async (updates: Partial<Organization>) => {
    setSaving(true); setSaved(false); setError("");
    try {
      const r = await fetch(`/api/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const d = await r.json();
      if (d.ok) {
        setOrg(d.organization);
        setSaved(true);
        setTimeout(() => setSaved(false), 2400);
        fetchStats();
      } else {
        setError(d.error || "Failed to save.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const markAllRead = () => {
    fetch(`/api/notifications/org/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
    setNotifs(p => p.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    fetch(`/api/notifications/org/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {});
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  };

  /* ── Message usage pill values ───────────────────────────────── */
  const msgUsed      = org.monthlyMessageCount ?? 0;
  const msgLimit     = org.monthlyMessageLimit ?? 0;
  const msgRemaining = Math.max(0, msgLimit - msgUsed);
  const msgPct       = msgLimit > 0 ? (msgUsed / msgLimit) * 100 : 0;
  const msgPillCls   = msgPct >= 90
    ? "ow-usage-pill--danger"
    : msgPct >= 70
    ? "ow-usage-pill--warn"
    : "";
  const isFreeOrg    = org.planType === "free" || org.planType === "trial";
  const msgTitle     = `${msgRemaining.toLocaleString()} of ${msgLimit.toLocaleString()} messages remaining this month (${msgUsed.toLocaleString()} used)`;

  const sharedAsideProps = {
    orgName:       org.displayName ?? org.name,
    isActive:      org.isActive,
    activeTab:     tab,
    onTabChange:   (t: OrgTab) => { setTab(t); setMobileOpen(false); },
    isDark,
    mounted,
    onToggleTheme: toggleTheme,
  };

  return (
    <>
      <style>{ORG_CSS}</style>
      <style>{ORG_ASIDE_CSS}</style>
      <style>{OW_CSS}</style>

      <div className="ow-shell">

        {/* ── Fixed desktop sidebar ──────────────────────────────── */}
        <aside className="ow-sidebar">
          <OrgAside {...sharedAsideProps} />
        </aside>

        {/* ── Mobile overlay + drawer ────────────────────────────── */}
        {mobileOpen && (
          <div className="ow-overlay" onClick={() => setMobileOpen(false)}>
            <div className="ow-overlay-bg"/>
            <div className="ow-drawer" onClick={e => e.stopPropagation()}>
              <OrgAside {...sharedAsideProps} onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="ow-right">

          {/* ── Mobile bar ─────────────────────────────────────────── */}
          <div className="ow-bar">
            <div className="ow-bar-left">
              <button className="ow-ibtn" onClick={() => setMobileOpen(true)}><Menu size={14}/></button>
              <span className="ow-bar-page">{TAB_LABELS[tab]}</span>
            </div>
            <div className="ow-bar-right">
              <div className="ow-bell-wrap">
                <button className={`ow-ibtn ${notifOpen ? "ow-ibtn--active" : ""}`}
                  onClick={() => setNotifOpen(v => !v)} title="Notifications">
                  <Bell size={14}/>
                </button>
                {unread > 0 && <span className="ow-bell-badge">{unread}</span>}
              </div>
              {mounted && (
                <button className="ow-ibtn" onClick={toggleTheme}>
                  {isDark ? <Sun size={13}/> : <Moon size={13}/>}
                </button>
              )}
              <button className="ow-ibtn"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign out">
                <LogOut size={13}/>
              </button>
            </div>
          </div>

          {/* spacer for fixed mobile bar */}
          <div className="ow-bar-spacer" />

          {/* ── Desktop navbar ─────────────────────────────────────── */}
          <div className="ow-navbar">
            <nav className="ow-nb-breadcrumb">
              <span>{org.displayName ?? org.name}</span>
              <span className="ow-nb-sep">/</span>
              <span className="ow-nb-active">{TAB_LABELS[tab]}</span>
            </nav>

            <div className="ow-nb-right">

              {/* ── Single message usage pill ── */}
              <div
                className={`ow-usage-pill ${msgPillCls}`}
                title={msgTitle}
                onClick={() => setTab("billing")}
              >
                <MessageSquare size={10}/>
                {isFreeOrg && <span className="ow-usage-free-badge">FREE</span>}
                {msgRemaining.toLocaleString()} msgs left
              </div>

              {mounted && (
                <button className="ow-ibtn" onClick={toggleTheme} title="Toggle theme">
                  {isDark ? <Sun size={13}/> : <Moon size={13}/>}
                </button>
              )}
              <button className="ow-ibtn"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign out">
                <LogOut size={13}/>
              </button>

              {/* ── Notifications ── */}
              <div className="ow-drop-wrap ow-bell-wrap" ref={notifRef}>
                <button className={`ow-ibtn ${notifOpen ? "ow-ibtn--active" : ""}`}
                  onClick={() => setNotifOpen(v => !v)} title="Notifications">
                  <Bell size={13}/>
                </button>
                {unread > 0 && <span className="ow-bell-badge">{unread}</span>}
                {notifOpen && (
                  <div className="ow-dropdown ow-notif-panel">
                    <div className="ow-drop-head">
                      Notifications
                      {unread > 0 && (
                        <button className="ow-notif-mark-btn" onClick={markAllRead}>
                          <CheckCheck size={11}/> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="ow-notif-list">
                      {notifs.length === 0
                        ? <div className="ow-notif-empty">No notifications yet</div>
                        : notifs.map(n => {
                            const Icon = notifIcon[n.type];
                            return (
                              <div key={n.id}
                                className={`ow-notif-item ${!n.read ? "ow-notif-item--unread" : ""}`}
                                onClick={() => markRead(n.id)}>
                                <div className="ow-notif-ic"
                                  style={{ background:`color-mix(in srgb,${notifColor[n.type]} 14%,transparent)`, color:notifColor[n.type] }}>
                                  <Icon/>
                                </div>
                                <div className="ow-notif-body">
                                  <div className="ow-notif-title">{n.title}</div>
                                  <div className="ow-notif-text">{n.body}</div>
                                  <div className="ow-notif-time">{n.time}</div>
                                </div>
                                {!n.read && <div className="ow-notif-dot"/>}
                              </div>
                            );
                          })
                      }
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── Main content ───────────────────────────────────────── */}
          <main className={`ow-main${tab === "chat" ? " ow-main--chat" : ""}`}>
            {tab === "chat" ? (
              <OrgChat org={org}/>
            ) : (
              <div className="ow-inner">
                <AnimatePresence mode="wait">
                  <motion.div key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: .18, ease: "easeOut" }}>

                    {tab === "overview"  && <OrgOverview org={org} stats={stats} onNavigate={setTab}/>}
                    {tab === "agent"     && <OrgAgent org={org} onSave={handleSave} onRefresh={fetchOrg} saving={saving} saved={saved} error={error}/>}
                    {tab === "api"       && <OrgApi org={org} onKeyRotated={(newKey) => setOrg(prev => ({ ...prev, apiKey: newKey }))}/>}
                    {tab === "analytics" && <OrgAnalytics orgId={orgId} stats={stats}/>}
                    {tab === "billing"   && (
                      <div>
                        {paymentBanner === "successful" && (
                          <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:12, background:"var(--c-success-soft)", border:"1px solid color-mix(in srgb,var(--c-success) 30%,transparent)", fontSize:".8rem", color:"var(--c-success)", display:"flex", alignItems:"center", gap:10 }}>
                            ✓ Payment received! Your plan upgrade is being confirmed — this usually takes a few seconds.
                          </div>
                        )}
                        {(paymentBanner === "failed" || paymentBanner === "cancelled") && (
                          <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:12, background:"var(--c-danger-soft)", border:"1px solid color-mix(in srgb,var(--c-danger) 30%,transparent)", fontSize:".8rem", color:"var(--c-danger)", display:"flex", alignItems:"center", gap:10 }}>
                            ✗ Payment {paymentBanner}. Your plan was not changed. Please try again.
                          </div>
                        )}
                        <OrgBilling org={org}/>
                      </div>
                    )}
                    {tab === "insights"  && <OrgDataInsights orgId={orgId}/>}
                    {tab === "settings"  && <OrgSettings org={org} onSave={handleSave} saving={saving} saved={saved} error={error}/>}

                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </main>

        </div>
      </div>
    </>
  );
}