"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  Menu, X, Moon, Sun, LogOut, Share2, Copy, Check,
  ChevronDown, ChevronRight, Link, Bell,
  LayoutDashboard, Brain, MessageSquare, User, Settings, FileText, CreditCard,
  CheckCheck, Info, AlertTriangle, Sparkles,
} from "lucide-react";

import DashboardView  from "@/components/dashboard/dashboard";
import ProfileView    from "@/components/dashboard/profile";
import SettingsView   from "@/components/dashboard/settings";
import TrainingView   from "@/components/dashboard/training";
import DashboardChat  from "@/components/dashboard/dashboardchat";
import ResumeView     from "@/components/dashboard/resume";
import UserBilling    from "@/components/dashboard/UserBilling";
import Sidebar, { DashboardViewType } from "@/components/dashboard/sidebar";

export type { DashboardViewType };

interface DashboardWrapperProps {
  user: { name?: string | null; email?: string | null; image?: string | null; id?: string; status?: string };
  stats: { trainingEntries: number; qaPairs: number; personalityTraits: number; knowledgeItems: number };
  knowledgeBase: any;
  swagList?: { id: string; content: string }[];
  slug?: string;
  initialUsage?: { planType: string; msgCount: number; msgLimit: number };
}

type NotifType = "info" | "success" | "warning" | "system" | "billing";
interface Notif { id: string; type: NotifType; title: string; body: string; time: string; read: boolean }

const notifIcon:  Record<string, any>    = { info: Info, success: Sparkles, warning: AlertTriangle, system: Bell, billing: CreditCard };
const notifColor: Record<string, string> = { info:"#29A9D4", success:"#10B981", warning:"#F59E0B", system:"#8B5CF6", billing:"#0EA5E9" };

function fmtTimeAgo(ts: number, now: number): string {
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

const navItems: { view: DashboardViewType; label: string; Icon: any }[] = [
  { view:"dashboard", label:"Dashboard", Icon:LayoutDashboard },
  { view:"training",  label:"Training",  Icon:Brain            },
  { view:"chat",      label:"Chat",      Icon:MessageSquare    },
  { view:"profile",   label:"Profile",   Icon:User             },
  { view:"resume",    label:"Resume",    Icon:FileText         },
  { view:"billing",   label:"Billing",   Icon:CreditCard       },
  { view:"settings",  label:"Settings",  Icon:Settings         },
];

const viewLabels: Record<DashboardViewType, string> = {
  dashboard:"Dashboard", training:"Training", chat:"Chat",
  profile:"Profile", settings:"Settings", resume:"Resume", billing:"Billing",
};

export default function DashboardWrapper({ user, stats, knowledgeBase, swagList=[], slug, initialUsage }: DashboardWrapperProps) {
  const searchParams  = useSearchParams();
  const [activeView,    setActiveView]    = useState<DashboardViewType>("dashboard");
  const [paymentStatus, setPaymentStatus] = useState<"success" | "pending" | "failed" | null>(null);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [shareOpen,     setShareOpen]     = useState(false);
  const [mobileShare,   setMobileShare]   = useState(false);
  const [isDark,        setIsDark]        = useState(false);
  const [copiedId,      setCopiedId]      = useState<string | null>(null);
  const [liveSwagList,  setLiveSwagList]  = useState<{ id:string; content:string }[]>(swagList);
  const [liveSlug,      setLiveSlug]      = useState<string | null>(slug ?? null);
  const [notifs,        setNotifs]        = useState<Notif[]>([]);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [usage,         setUsage]         = useState<{ planType?: string; msgCount: number; msgLimit: number } | null>(initialUsage ?? null);

  const notifRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const unread   = notifs.filter(n => !n.read).length;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") || "light";
      const dark = stored === "dark";
      setIsDark(dark);
      applyTheme(dark);
    } catch {}
  }, []);

  // Handle Flutterwave redirect back to billing tab
  useEffect(() => {
    const tab     = searchParams.get("tab");
    const payment = searchParams.get("payment");
    if (tab === "billing") {
      setActiveView("billing");
      if (payment === "successful" || payment === "success") setPaymentStatus("success");
      else if (payment === "pending")                        setPaymentStatus("pending");
      else if (payment)                                      setPaymentStatus("failed");
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/swag").then(r => r.ok ? r.json() : null)
      .then(d => { if (d && Array.isArray(d.swag)) setLiveSwagList(d.swag); }).catch(()=>{});
    fetch("/api/share").then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.ok && d.shareSlug) setLiveSlug(d.shareSlug); }).catch(()=>{});
    // Load notifications
    fetch("/api/notifications?pageSize=30")
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
      }).catch(()=>{});
    // Load personal usage stats
    fetch("/api/user/usage").then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.ok) setUsage({ planType: d.planType ?? "free", msgCount: d.msgCount, msgLimit: d.msgLimit });
      }).catch(()=>{});
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (shareRef.current && !shareRef.current.contains(e.target as Node))  setShareOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const applyTheme = (dark: boolean) =>
    document.documentElement.setAttribute("data-mode", dark ? "dark" : "light");

  const toggleTheme = () => {
    const next = !isDark; setIsDark(next); applyTheme(next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };

  const handleViewChange = (view: DashboardViewType) => {
    setActiveView(view); setMobileOpen(false); setMobileShare(false);
  };

  const markAllRead = () => {
    fetch("/api/notifications", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ all:true }) }).catch(()=>{});
    setNotifs(p => p.map(n => ({ ...n, read:true })));
  };
  const markRead = (id: string) => {
    fetch("/api/notifications", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ids:[id] }) }).catch(()=>{});
    setNotifs(p => p.map(n => n.id===id ? {...n, read:true} : n));
  };

  const origin     = typeof window !== "undefined" ? window.location.origin : "https://velamini.com";
  const getSwagUrl = (c: string) => `${origin}/chat/${encodeURIComponent(c.replace(/\s+/g,"-").toLowerCase())}`;
  const getSlugUrl = () => liveSlug ? `${origin}/chat/${encodeURIComponent(liveSlug)}` : `${origin}/chat`;

  const handleCopy = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(()=>setCopiedId(null),1500); } catch {}
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard": return <DashboardView stats={stats} onNavigate={handleViewChange}/>;
      case "training":  return <TrainingView  user={user} knowledgeBase={knowledgeBase}/>;
      case "chat":      return <DashboardChat user={user} knowledgeBase={knowledgeBase}/>;
      case "profile":   return <ProfileView   user={user} knowledgeBase={knowledgeBase}/>;
      case "resume":    return <ResumeView    user={user} knowledgeItems={stats.knowledgeItems}/>;
      case "billing":   return <UserBilling   userId={user.id!} paymentStatus={paymentStatus}/>;
      case "settings":  return <SettingsView/>;
      default:          return <DashboardView stats={stats} onNavigate={handleViewChange}/>;
    }
  };

  const ShareItems = () => (
    <>
      {liveSlug && (
        <>
          <div className="dw-drop-label">Profile link</div>
          <div className="dw-drop-item">
            <div className="dw-drop-item-name"><Link size={13}/><span>{getSlugUrl()}</span></div>
            <button className={`dw-copy-pill ${copiedId==="__slug__"?"dw-copy-pill--done":"dw-copy-pill--idle"}`}
              onClick={()=>handleCopy(getSlugUrl(),"__slug__")}>
              {copiedId==="__slug__"?<><Check size={10}/> Copied</>:<><Copy size={10}/> Copy</>}
            </button>
          </div>
        </>
      )}
      {liveSwagList.length > 0 && (
        <>
          {liveSlug && <div className="dw-drop-divider"/>}
          <div className="dw-drop-label">Swag links</div>
          {liveSwagList.map(swag=>(
            <div className="dw-drop-item" key={swag.id}>
              <div className="dw-drop-item-name"><Link size={13}/><span>{getSwagUrl(swag.content)}</span></div>
              <button className={`dw-copy-pill ${copiedId===swag.id?"dw-copy-pill--done":"dw-copy-pill--idle"}`}
                onClick={()=>handleCopy(getSwagUrl(swag.content),swag.id)}>
                {copiedId===swag.id?<><Check size={10}/> Copied</>:<><Copy size={10}/> Copy</>}
              </button>
            </div>
          ))}
        </>
      )}
      {!liveSlug && liveSwagList.length===0 && (
        <div className="dw-drop-empty">No share links yet — add one in Settings.</div>
      )}
    </>
  );

  /* ── Message pill values ── */
  const msgUsed      = usage?.msgCount ?? 0;
  const msgLimit     = Math.max(usage?.msgLimit ?? 200, 1);
  const msgRemaining = Math.max(0, msgLimit - msgUsed);
  const msgPct       = (msgUsed / msgLimit) * 100;
  const isFree       = !usage || (usage.planType ?? "free") === "free";
  const msgPillCls   = msgPct >= 90 ? "dw-usage-pill--danger" : msgPct >= 70 ? "dw-usage-pill--warn" : "";
  const msgTitle     = `${msgRemaining.toLocaleString()} of ${msgLimit.toLocaleString()} messages remaining this month (${msgUsed.toLocaleString()} used)`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        :root,[data-mode="light"]{
          --c-bg:#EFF7FF; --c-surface:#FFFFFF; --c-surface-2:#E2F0FC;
          --c-border:#C5DCF2; --c-text:#0B1E2E; --c-muted:#6B90AE;
          --c-accent:#29A9D4; --c-accent-dim:#1D8BB2; --c-accent-soft:#DDF1FA;
          --c-sidebar:#F5FAFE;
          --c-success:#10B981; --c-success-soft:#ECFDF5;
          --c-warn:#F59E0B;    --c-warn-soft:#FFFBEB;
          --c-danger:#EF4444;  --c-danger-soft:#FEE2E2;
          --shadow-md:0 8px 32px rgba(10,40,80,.1);
          --shadow-lg:0 16px 48px rgba(10,40,80,.13);
        }
        [data-mode="dark"]{
          --c-bg:#081420; --c-surface:#0F1E2D; --c-surface-2:#162435;
          --c-border:#1A3045; --c-text:#C8E8F8; --c-muted:#3D6580;
          --c-accent:#38AECC; --c-accent-dim:#2690AB; --c-accent-soft:#0C2535;
          --c-sidebar:#0A1825;
          --c-success:#34D399; --c-success-soft:#063320;
          --c-warn:#FCD34D;    --c-warn-soft:#2D2008;
          --c-danger:#F87171;  --c-danger-soft:#3B1212;
          --shadow-md:0 8px 32px rgba(0,0,0,.32);
          --shadow-lg:0 16px 48px rgba(0,0,0,.48);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--c-bg);color:var(--c-text);transition:background .3s,color .3s}

        .dw-shell{display:flex;min-height:100dvh;width:100%;background:var(--c-bg)}
        .dw-right{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}

        /* ── Desktop navbar ── */
        .dw-navbar{display:none}
        @media(min-width:1024px){
          .dw-navbar{
            display:flex;align-items:center;justify-content:space-between;
            padding:0 24px;height:56px;
            position:fixed;top:0;left:224px;right:0;z-index:30;
            background:var(--c-surface);border-bottom:1px solid var(--c-border);
            transition:background .3s,border-color .3s;
          }
        }
        .dw-nb-breadcrumb{display:flex;align-items:center;gap:6px;font-size:.78rem;color:var(--c-muted)}
        .dw-nb-sep{opacity:.4}
        .dw-nb-active{font-weight:600;color:var(--c-text)}
        .dw-nb-right{display:flex;align-items:center;gap:7px}
        .dw-nb-divider{width:1px;height:18px;background:var(--c-border)}

        /* ── Usage pill ── */
        .dw-usage-pill{display:flex;align-items:center;gap:4px;padding:0 10px;height:28px;border-radius:7px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);font-size:.68rem;font-weight:600;white-space:nowrap;cursor:pointer;letter-spacing:.01em;transition:opacity .14s}
        .dw-usage-pill:hover{opacity:.8}
        .dw-usage-pill--warn{border-color:color-mix(in srgb,#F59E0B 40%,transparent);background:color-mix(in srgb,#F59E0B 10%,transparent);color:#B45309}
        .dw-usage-pill--danger{border-color:color-mix(in srgb,var(--c-danger) 40%,transparent);background:var(--c-danger-soft,#fee2e2);color:var(--c-danger)}
        .dw-usage-pill svg{width:10px;height:10px;flex-shrink:0}
        .dw-usage-free-badge{font-size:.52rem;font-weight:900;letter-spacing:.08em;padding:1px 5px;border-radius:4px;background:color-mix(in srgb,var(--c-accent,#29A9D4) 15%,transparent);color:var(--c-accent,#29A9D4);margin-right:1px}
        @media(max-width:900px){.dw-usage-pill{display:none}}

        /* ── Mobile bar ── */
        .dw-bar{
          display:flex;align-items:center;justify-content:space-between;
          padding:0 14px;height:52px;flex-shrink:0;
          position:sticky;top:0;z-index:30;
          background:var(--c-surface);border-bottom:1px solid var(--c-border);
          transition:background .3s,border-color .3s;
        }
        @media(min-width:1024px){.dw-bar{display:none}}
        .dw-bar-left{display:flex;align-items:center;gap:8px}
        .dw-bar-logo{width:26px;height:26px;border-radius:7px;overflow:hidden;border:1.5px solid var(--c-border)}
        .dw-bar-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .dw-bar-page{font-size:.76rem;color:var(--c-muted)}
        .dw-bar-right{display:flex;align-items:center;gap:6px}

        /* shared icon btn */
        .dw-ibtn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);cursor:pointer;transition:all .14s}
        .dw-ibtn:hover,.dw-ibtn--active{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-accent-soft)}
        .dw-ibtn svg{width:14px;height:14px}

        /* ── Bell with badge ── */
        .dw-bell-wrap{position:relative;display:inline-flex}
        .dw-bell-badge{
          position:absolute;top:-5px;right:-5px;
          min-width:17px;height:17px;padding:0 4px;
          border-radius:9px;background:var(--c-danger);
          color:#fff;font-size:.58rem;font-weight:700;
          display:flex;align-items:center;justify-content:center;
          border:2px solid var(--c-surface);pointer-events:none;line-height:1;
          animation:dwbadge .35s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes dwbadge{from{transform:scale(0)}to{transform:scale(1)}}

        /* share btn */
        .dw-share-btn{display:flex;align-items:center;gap:5px;padding:0 11px;height:32px;border-radius:8px;border:1.5px solid var(--c-accent);background:var(--c-accent-soft);color:var(--c-accent);font-size:.74rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .14s;white-space:nowrap}
        .dw-share-btn:hover{background:var(--c-accent);color:#fff}
        .dw-share-btn svg{width:13px;height:13px}

        .dw-logout{display:flex;align-items:center;gap:5px;padding:0 11px;height:32px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);font-size:.74rem;font-weight:600;cursor:pointer;font-family:inherit;transition:all .14s}
        .dw-logout:hover{background:var(--c-danger-soft);border-color:var(--c-danger);color:var(--c-danger)}
        .dw-logout svg{width:12px;height:12px}

        /* ── Dropdown base ── */
        .dw-drop-wrap{position:relative}
        .dw-dropdown{
          position:absolute;top:calc(100% + 8px);right:0;
          background:var(--c-surface);border:1px solid var(--c-border);
          border-radius:14px;box-shadow:var(--shadow-lg);
          z-index:200;overflow:hidden;
          animation:dwDrop .15s ease;
        }
        @keyframes dwDrop{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}
        .dw-drop-head{
          padding:10px 14px 8px;
          display:flex;align-items:center;justify-content:space-between;
          font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
          color:var(--c-muted);border-bottom:1px solid var(--c-border);
        }
        .dw-drop-section{padding:8px;display:flex;flex-direction:column;gap:2px}
        .dw-drop-label{padding:4px 8px 2px;font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted)}
        .dw-drop-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border-radius:9px;cursor:pointer;transition:background .12s;min-height:42px}
        .dw-drop-item:hover{background:var(--c-surface-2)}
        .dw-drop-item-name{display:flex;align-items:center;gap:7px;font-size:.8rem;font-weight:600;color:var(--c-text);overflow:hidden;min-width:0;flex:1}
        .dw-drop-item-name svg{color:var(--c-accent);flex-shrink:0}
        .dw-drop-item-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .dw-copy-pill{display:flex;align-items:center;gap:4px;padding:4px 9px;border-radius:6px;font-size:.68rem;font-weight:700;border:none;cursor:pointer;font-family:inherit;transition:all .14s;flex-shrink:0;white-space:nowrap;min-height:30px}
        .dw-copy-pill--idle{background:var(--c-accent-soft);color:var(--c-accent);border:1px solid var(--c-accent)}
        .dw-copy-pill--idle:hover{background:var(--c-accent);color:#fff}
        .dw-copy-pill--done{background:color-mix(in srgb,#22c55e 14%,transparent);color:#166534;border:1px solid color-mix(in srgb,#22c55e 35%,transparent)}
        [data-mode="dark"] .dw-copy-pill--done{color:#86efac}
        .dw-drop-empty{padding:14px;font-size:.78rem;color:var(--c-muted);text-align:center}
        .dw-drop-divider{height:1px;background:var(--c-border);margin:4px 8px}

        /* ── Notification panel ── */
        .dw-notif-panel{min-width:310px;max-width:330px}
        .dw-notif-mark-btn{display:flex;align-items:center;gap:4px;padding:3px 9px;border-radius:7px;border:none;font-size:.68rem;font-weight:600;font-family:inherit;background:var(--c-accent-soft);color:var(--c-accent);cursor:pointer;transition:all .13s}
        .dw-notif-mark-btn:hover{background:var(--c-accent);color:#fff}
        .dw-notif-mark-btn svg{width:11px;height:11px}
        .dw-notif-list{max-height:336px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}
        .dw-notif-list::-webkit-scrollbar{width:3px}
        .dw-notif-list::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:3px}
        .dw-notif-item{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;border-bottom:1px solid var(--c-border);cursor:pointer;transition:background .12s}
        .dw-notif-item:last-child{border-bottom:none}
        .dw-notif-item:hover{background:var(--c-surface-2)}
        .dw-notif-item--unread{background:color-mix(in srgb,var(--c-accent) 5%,transparent)}
        .dw-notif-item--unread:hover{background:color-mix(in srgb,var(--c-accent) 9%,transparent)}
        .dw-notif-ic{width:30px;height:30px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .dw-notif-ic svg{width:13px;height:13px}
        .dw-notif-body{flex:1;min-width:0}
        .dw-notif-title{font-size:.8rem;font-weight:700;color:var(--c-text);margin-bottom:2px}
        .dw-notif-text{font-size:.72rem;color:var(--c-muted);line-height:1.5}
        .dw-notif-time{font-size:.64rem;color:var(--c-muted);margin-top:3px;opacity:.8}
        .dw-notif-dot{width:7px;height:7px;border-radius:50%;background:var(--c-accent);flex-shrink:0;margin-top:6px}
        .dw-notif-empty{padding:28px 14px;text-align:center;font-size:.78rem;color:var(--c-muted)}
        .dw-notif-empty-ic{width:40px;height:40px;border-radius:12px;background:var(--c-surface-2);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;color:var(--c-muted)}

        /* ── Mobile drawer ── */
        .dw-overlay{position:fixed;inset:0;z-index:200;display:flex;animation:dwFadeIn .18s ease}
        @keyframes dwFadeIn{from{opacity:0}to{opacity:1}}
        .dw-overlay-bg{position:absolute;inset:0;background:rgba(8,20,32,.6);backdrop-filter:blur(4px)}
        .dw-drawer{position:relative;width:min(280px,88vw);height:100%;background:var(--c-sidebar);border-right:1px solid var(--c-border);display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(8,20,32,.25);animation:dwSlide .22s ease;z-index:1;transition:background .3s,border-color .3s}
        @keyframes dwSlide{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        .dw-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:14px 14px 12px;border-bottom:1px solid var(--c-border);flex-shrink:0}
        .dw-drawer-brand{display:flex;align-items:center;gap:9px}
        .dw-drawer-logo{width:28px;height:28px;border-radius:8px;overflow:hidden;border:1.5px solid var(--c-border)}
        .dw-drawer-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .dw-drawer-name{font-family:'DM Serif Display',Georgia,serif;font-size:.88rem;font-weight:600;color:var(--c-text)}
        .dw-close{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);cursor:pointer;transition:all .13s}
        .dw-close:hover{color:var(--c-text);border-color:var(--c-text)}
        .dw-close svg{width:12px;height:12px}
        .dw-drawer-nav{flex:1;overflow-y:auto;padding:10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
        .dw-drawer-nav::-webkit-scrollbar{display:none}
        .dw-nav-sec{font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);padding:8px 8px 4px}
        .dw-nav-item{display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;border:1px solid transparent;cursor:pointer;transition:all .13s;margin-bottom:2px;background:none;width:100%;text-align:left;font-family:inherit;min-height:46px}
        .dw-nav-item:hover{background:var(--c-surface-2)}
        .dw-nav-item--on{background:var(--c-accent-soft)!important;border-color:color-mix(in srgb,var(--c-accent) 28%,transparent)}
        .dw-nav-ic{width:32px;height:32px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--c-surface-2);color:var(--c-muted);transition:background .13s,color .13s}
        .dw-nav-ic svg{width:15px;height:15px}
        .dw-nav-item--on .dw-nav-ic{background:var(--c-accent);color:#fff}
        .dw-nav-item:hover:not(.dw-nav-item--on) .dw-nav-ic{background:var(--c-surface);color:var(--c-accent)}
        .dw-nav-lbl{flex:1;font-size:.84rem;font-weight:500;color:var(--c-muted);transition:color .13s}
        .dw-nav-item--on .dw-nav-lbl{color:var(--c-accent);font-weight:600}
        .dw-nav-item:hover:not(.dw-nav-item--on) .dw-nav-lbl{color:var(--c-text)}
        .dw-drawer-foot{flex-shrink:0;padding:10px 10px 14px;border-top:1px solid var(--c-border)}
        .dw-drawer-user{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:10px;background:var(--c-surface-2);border:1px solid var(--c-border);margin-bottom:7px}
        .dw-drawer-av{width:28px;height:28px;border-radius:7px;object-fit:cover;flex-shrink:0;border:1.5px solid var(--c-border)}
        .dw-drawer-uname{font-size:.78rem;font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
        .dw-drawer-acts{display:flex;gap:5px}
        .dw-dact{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;height:34px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface);color:var(--c-muted);font-size:.73rem;font-weight:600;cursor:pointer;transition:all .13s;font-family:inherit}
        .dw-dact:hover{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-accent-soft)}
        .dw-dact--danger:hover{background:var(--c-danger-soft);border-color:var(--c-danger);color:var(--c-danger)}
        .dw-dact svg{width:13px;height:13px}
        .dw-drawer-share-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
        .dw-drawer-share-lbl{font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted)}
        .dw-drawer-share-toggle{display:flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;font-size:.7rem;font-weight:700;font-family:inherit;cursor:pointer;border:1.5px solid var(--c-accent);background:var(--c-accent-soft);color:var(--c-accent);transition:all .14s}
        .dw-drawer-share-toggle:hover{background:var(--c-accent);color:#fff}
        .dw-drawer-share-toggle svg{width:11px;height:11px}
        .dw-drawer-share-box{background:var(--c-surface-2);border:1px solid var(--c-border);border-radius:10px;overflow:hidden;margin-bottom:8px}
        .dw-drawer-share-hd{padding:7px 10px 5px;font-size:.63rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--c-muted);border-bottom:1px solid var(--c-border);background:var(--c-surface)}
        .dw-drawer-share-bd{padding:5px}

        /* ── Main ── */
        .dw-main{flex:1;overflow-y:auto;overflow-x:hidden;min-height:0;background:var(--c-bg);transition:background .3s;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}
        @media(min-width:1024px){.dw-main{padding-top:56px}}
        .dw-main::-webkit-scrollbar{width:4px}
        .dw-main::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:4px}
      `}</style>

      <div className="dw-shell">
        <Sidebar user={user} activeView={activeView} onViewChange={handleViewChange}/>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="dw-overlay" onClick={()=>setMobileOpen(false)}>
            <div className="dw-overlay-bg"/>
            <div className="dw-drawer" onClick={e=>e.stopPropagation()}>
              <div className="dw-drawer-head">
                <div className="dw-drawer-brand">
                  <div className="dw-drawer-logo"><img src="/logo.png" alt="Logo"/></div>
                  <span className="dw-drawer-name">Velamini</span>
                </div>
                <button className="dw-close" onClick={()=>setMobileOpen(false)}><X size={12}/></button>
              </div>
              <nav className="dw-drawer-nav">
                <div className="dw-nav-sec">Navigation</div>
                {navItems.map(({view,label,Icon})=>(
                  <button key={view} type="button"
                    className={`dw-nav-item ${activeView===view?"dw-nav-item--on":""}`}
                    onClick={()=>handleViewChange(view)}>
                    <div className="dw-nav-ic"><Icon/></div>
                    <span className="dw-nav-lbl">{label}</span>
                    {activeView===view && <ChevronRight size={12} style={{color:"var(--c-accent)"}}/>}
                  </button>
                ))}
              </nav>
              <div className="dw-drawer-foot">
                <div className="dw-drawer-share-row">
                  <span className="dw-drawer-share-lbl">Share</span>
                  <button className="dw-drawer-share-toggle" onClick={()=>setMobileShare(v=>!v)}>
                    <Share2 size={11}/> {mobileShare?"Hide":"Links"}
                    <ChevronDown size={10} style={{transform:mobileShare?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}/>
                  </button>
                </div>
                {mobileShare && (
                  <div className="dw-drawer-share-box">
                    <div className="dw-drawer-share-hd">Share your virtual self</div>
                    <div className="dw-drawer-share-bd"><ShareItems/></div>
                  </div>
                )}
                <div className="dw-drawer-user">
                  <img src={user?.image||"/logo.png"} alt={user?.name??"User"} className="dw-drawer-av"/>
                  <span className="dw-drawer-uname">{user?.name??"User"}</span>
                </div>
                <div className="dw-drawer-acts">
                  <button className="dw-dact" onClick={toggleTheme}>
                    {isDark?<Sun size={13}/>:<Moon size={13}/>} {isDark?"Light":"Dark"}
                  </button>
                  <button className="dw-dact dw-dact--danger" onClick={()=>signOut({callbackUrl:"/auth/signin?loggedOut=1"})}>
                    <LogOut size={13}/> Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="dw-right">
          {/* Mobile bar */}
          <div className="dw-bar">
            <div className="dw-bar-left">
              <button className="dw-ibtn" onClick={()=>setMobileOpen(true)}><Menu size={14}/></button>
              <div className="dw-bar-logo"><img src="/logo.png" alt="Logo"/></div>
              <div className="dw-bar-page">{viewLabels[activeView]}</div>
            </div>
            <div className="dw-bar-right">
              <div className="dw-bell-wrap">
                <button className={`dw-ibtn ${notifOpen?"dw-ibtn--active":""}`}
                  onClick={()=>setNotifOpen(v=>!v)} title="Notifications">
                  <Bell size={14}/>
                </button>
                {unread > 0 && <span className="dw-bell-badge">{unread}</span>}
              </div>
              <button className="dw-ibtn" onClick={toggleTheme}>
                {isDark?<Sun size={13}/>:<Moon size={13}/>}
              </button>
            </div>
          </div>

          {/* Desktop navbar */}
          <div className="dw-navbar">
            <nav className="dw-nb-breadcrumb">
              <span>Velamini</span>
              <span className="dw-nb-sep">/</span>
              <span className="dw-nb-active">{viewLabels[activeView]}</span>
            </nav>
            <div className="dw-nb-right">

              {/* ── Message usage pill ── */}
              <div
                className={`dw-usage-pill ${msgPillCls}`}
                title={msgTitle}
                onClick={() => setActiveView("billing")}
              >
                <MessageSquare size={10}/>
                {isFree && <span className="dw-usage-free-badge">FREE</span>}
                {msgRemaining.toLocaleString()} msgs left
              </div>

              <button className="dw-ibtn" onClick={toggleTheme} title="Toggle theme">
                {isDark?<Sun size={13}/>:<Moon size={13}/>}
              </button>

              {/* ── Bell + notification dropdown ── */}
              <div className="dw-drop-wrap dw-bell-wrap" ref={notifRef}>
                <button className={`dw-ibtn ${notifOpen?"dw-ibtn--active":""}`}
                  onClick={()=>{ setNotifOpen(v=>!v); setShareOpen(false); }}
                  title="Notifications">
                  <Bell size={13}/>
                </button>
                {unread > 0 && <span className="dw-bell-badge">{unread}</span>}
                {notifOpen && (
                  <div className="dw-dropdown dw-notif-panel">
                    <div className="dw-drop-head">
                      Notifications
                      {unread > 0 && (
                        <button className="dw-notif-mark-btn" onClick={markAllRead}>
                          <CheckCheck size={11}/> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="dw-notif-list">
                      {notifs.length === 0 ? (
                        <div className="dw-notif-empty">
                          <div className="dw-notif-empty-ic"><Bell size={18}/></div>
                          You're all caught up!
                        </div>
                      ) : notifs.map(n => {
                        const NIcon = notifIcon[n.type];
                        const color = notifColor[n.type];
                        return (
                          <div key={n.id}
                            className={`dw-notif-item ${!n.read?"dw-notif-item--unread":""}`}
                            onClick={()=>markRead(n.id)}>
                            <div className="dw-notif-ic"
                              style={{ background:`color-mix(in srgb,${color} 14%,transparent)`, color }}>
                              <NIcon size={13}/>
                            </div>
                            <div className="dw-notif-body">
                              <div className="dw-notif-title">{n.title}</div>
                              <div className="dw-notif-text">{n.body}</div>
                              <div className="dw-notif-time">{n.time}</div>
                            </div>
                            {!n.read && <div className="dw-notif-dot"/>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Share dropdown */}
              <div className="dw-drop-wrap" ref={shareRef}>
                <button className="dw-share-btn"
                  onClick={()=>{ setShareOpen(v=>!v); setNotifOpen(false); }}>
                  <Share2 size={13}/> Share
                  <ChevronDown size={12} style={{opacity:.7,transform:shareOpen?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}/>
                </button>
                {shareOpen && (
                  <div className="dw-dropdown">
                    <div className="dw-drop-head">Share your virtual self</div>
                    <div className="dw-drop-section"><ShareItems/></div>
                  </div>
                )}
              </div>

              <div className="dw-nb-divider"/>
              <button className="dw-logout" onClick={()=>signOut({callbackUrl:"/auth/signin?loggedOut=1"})}>
                <LogOut size={12}/> Sign out
              </button>
            </div>
          </div>

          {/* Flagged banner */}
          {user.status === "flagged" && (
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 20px",background:"color-mix(in srgb,#F59E0B 12%,transparent)",borderBottom:"1px solid color-mix(in srgb,#F59E0B 30%,transparent)",fontSize:".8rem",color:"#B45309"}}>
              <span>⚠️</span>
              <span>
                <strong>Your account has been flagged.</strong>{" "}
                Some features may be restricted. Contact{" "}
                <a href="mailto:support@velamini.com" style={{color:"inherit",fontWeight:700,textDecoration:"underline"}}>support@velamini.com</a>{" "}
                if you believe this is a mistake.
              </span>
            </div>
          )}

          <main className="dw-main">{renderView()}</main>
        </div>
      </div>
    </>
  );
}