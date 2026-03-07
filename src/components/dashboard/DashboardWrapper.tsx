"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  Menu, X, Moon, Sun, LogOut, Share2, Copy, Check,
  ChevronDown, ChevronRight, Link,
  LayoutDashboard, Brain, MessageSquare, User, Settings, FileText,
} from "lucide-react";

import DashboardView  from "@/components/dashboard/dashboard";
import ProfileView    from "@/components/dashboard/profile";
import SettingsView   from "@/components/dashboard/settings";
import TrainingView   from "@/components/dashboard/training";
import DashboardChat  from "@/components/dashboard/dashboardchat";
import ResumeView     from "@/components/dashboard/resume";
import Sidebar, { DashboardViewType } from "@/components/dashboard/sidebar";

export type { DashboardViewType };

interface DashboardWrapperProps {
  user: { name?: string | null; email?: string | null; image?: string | null; id?: string; status?: string };
  stats: { trainingEntries: number; qaPairs: number; personalityTraits: number; knowledgeItems: number };
  knowledgeBase: any;
  swagList?: { id: string; content: string }[];
  slug?: string;
}

const navItems: { view: DashboardViewType; label: string; Icon: any }[] = [
  { view: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { view: "training",  label: "Training",  Icon: Brain            },
  { view: "chat",      label: "Chat",      Icon: MessageSquare    },
  { view: "profile",   label: "Profile",   Icon: User             },
  { view: "resume",    label: "Resume",    Icon: FileText         },
  { view: "settings",  label: "Settings",  Icon: Settings         },
];

const viewLabels: Record<DashboardViewType, string> = {
  dashboard: "Dashboard", training: "Training", chat: "Chat",
  profile: "Profile", settings: "Settings", resume: "Resume",
};

export default function DashboardWrapper({ user, stats, knowledgeBase, swagList = [], slug }: DashboardWrapperProps) {
  const [activeView,    setActiveView]    = useState<DashboardViewType>("dashboard");
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [shareOpen,     setShareOpen]     = useState(false);
  const [mobileShare,   setMobileShare]   = useState(false);
  const [isDark,        setIsDark]        = useState(false);
  const [copiedId,      setCopiedId]      = useState<string | null>(null);
  const [liveSwagList,  setLiveSwagList]  = useState<{ id: string; content: string }[]>(swagList);
  const [liveSlug,      setLiveSlug]      = useState<string | null>(slug ?? null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") || "light";
      const dark = stored === "dark";
      setIsDark(dark);
      applyTheme(dark);
    } catch {}
  }, []);

  // Fetch live swag list and share slug on mount
  useEffect(() => {
    fetch("/api/swag")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && Array.isArray(d.swag)) setLiveSwagList(d.swag); })
      .catch(() => {});
    fetch("/api/share")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.ok && d.shareSlug) setLiveSlug(d.shareSlug); })
      .catch(() => {});
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function applyTheme(dark: boolean) {
    document.documentElement.setAttribute("data-mode", dark ? "dark" : "light");
  }

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };

  // Single view change handler used everywhere
  const handleViewChange = (view: DashboardViewType) => {
    setActiveView(view);
    setMobileOpen(false);   // always close drawer
    setMobileShare(false);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "https://velamini.com";
  const getSwagUrl = (c: string) =>
    `${origin}/chat/${encodeURIComponent(c.replace(/\s+/g, "-").toLowerCase())}`;
  const getSlugUrl = () =>
    liveSlug ? `${origin}/chat/${encodeURIComponent(liveSlug)}` : `${origin}/chat`;

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id); setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard": return <DashboardView stats={stats} onNavigate={handleViewChange} />;
      case "training":  return <TrainingView user={user} knowledgeBase={knowledgeBase} />;
      case "chat":      return <DashboardChat user={user} knowledgeBase={knowledgeBase} />;
      case "profile":   return <ProfileView user={user} knowledgeBase={knowledgeBase} />;
      case "resume":    return <ResumeView user={user} knowledgeItems={stats.knowledgeItems} />;
      case "settings":  return <SettingsView />;
      default:          return <DashboardView stats={stats} onNavigate={handleViewChange} />;
    }
  };

  // Share items — reused in both desktop dropdown and mobile drawer
  const ShareItems = () => (
    <>
      {liveSlug && (
        <>
          <div className="dw-drop-label">Profile link</div>
          <div className="dw-drop-item">
            <div className="dw-drop-item-name"><Link size={13}/><span>{getSlugUrl()}</span></div>
            <button className={`dw-copy-pill ${copiedId==="__slug__"?"dw-copy-pill--done":"dw-copy-pill--idle"}`}
              onClick={() => handleCopy(getSlugUrl(), "__slug__")}>
              {copiedId==="__slug__" ? <><Check size={10}/> Copied</> : <><Copy size={10}/> Copy</>}
            </button>
          </div>
        </>
      )}
      {liveSwagList.length > 0 && (
        <>
          {liveSlug && <div className="dw-drop-divider"/>}
          <div className="dw-drop-label">Swag links</div>
          {liveSwagList.map(swag => (
            <div className="dw-drop-item" key={swag.id}>
              <div className="dw-drop-item-name"><Link size={13}/><span>{getSwagUrl(swag.content)}</span></div>
              <button className={`dw-copy-pill ${copiedId===swag.id?"dw-copy-pill--done":"dw-copy-pill--idle"}`}
                onClick={() => handleCopy(getSwagUrl(swag.content), swag.id)}>
                {copiedId===swag.id ? <><Check size={10}/> Copied</> : <><Copy size={10}/> Copy</>}
              </button>
            </div>
          ))}
        </>
      )}
      {!liveSlug && liveSwagList.length === 0 && (
        <div className="dw-drop-empty">No share links yet — add one in Settings.</div>
      )}
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        :root,[data-mode="light"]{
          --c-bg:#EFF7FF; --c-surface:#FFFFFF; --c-surface-2:#E2F0FC;
          --c-border:#C5DCF2; --c-text:#0B1E2E; --c-muted:#6B90AE;
          --c-accent:#29A9D4; --c-accent-dim:#1D8BB2; --c-accent-soft:#DDF1FA;
          --c-sidebar:#F5FAFE;
        }
        [data-mode="dark"]{
          --c-bg:#081420; --c-surface:#0F1E2D; --c-surface-2:#162435;
          --c-border:#1A3045; --c-text:#C8E8F8; --c-muted:#3D6580;
          --c-accent:#38AECC; --c-accent-dim:#2690AB; --c-accent-soft:#0C2535;
          --c-sidebar:#0A1825;
        }

        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        html,body { height:100%; }
        body {
          font-family:'Plus Jakarta Sans',system-ui,sans-serif;
          background:var(--c-bg); color:var(--c-text);
          transition:background .3s,color .3s;
        }

        /* ── Shell layout ── */
        .dw-shell { display:flex; min-height:100dvh; width:100%; background:var(--c-bg); }

        /* right column */
        .dw-right { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }

        /* ── Desktop top navbar (sits above main, offset by sidebar) ── */
        .dw-navbar {
          display: none;
        }
        @media(min-width:1024px){
          .dw-navbar {
            display:flex; align-items:center; justify-content:space-between;
            padding:0 24px; height:56px;
            position:fixed; top:0; left:224px; right:0; z-index:30;
            background:var(--c-surface); border-bottom:1px solid var(--c-border);
            transition:background .3s,border-color .3s;
          }
        }
        .dw-nb-breadcrumb { display:flex; align-items:center; gap:6px; font-size:.78rem; color:var(--c-muted); }
        .dw-nb-sep { opacity:.4; }
        .dw-nb-active { font-weight:600; color:var(--c-text); }
        .dw-nb-right { display:flex; align-items:center; gap:7px; }
        .dw-nb-divider { width:1px; height:18px; background:var(--c-border); }

        /* ── Mobile top bar ── */
        .dw-bar {
          display:flex; align-items:center; justify-content:space-between;
          padding:0 14px; height:52px; flex-shrink:0;
          position:sticky; top:0; z-index:30;
          background:var(--c-surface); border-bottom:1px solid var(--c-border);
          transition:background .3s,border-color .3s;
        }
        @media(min-width:1024px){ .dw-bar { display:none; } }

        .dw-bar-left  { display:flex; align-items:center; gap:8px; }
        .dw-bar-logo  { width:26px; height:26px; border-radius:7px; overflow:hidden; border:1.5px solid var(--c-border); }
        .dw-bar-logo img { width:100%; height:100%; object-fit:cover; display:block; }
        .dw-bar-title {
          font-family:'DM Serif Display',Georgia,serif;
          font-size:.88rem; font-weight:600; color:var(--c-text);
        }
        .dw-bar-page { font-size:.76rem; color:var(--c-muted); }
        .dw-bar-right { display:flex; align-items:center; gap:6px; }

        /* shared icon btn */
        .dw-ibtn {
          display:flex; align-items:center; justify-content:center;
          width:32px; height:32px; border-radius:8px;
          border:1px solid var(--c-border); background:var(--c-surface-2);
          color:var(--c-muted); cursor:pointer; transition:all .14s;
        }
        .dw-ibtn:hover { color:var(--c-accent); border-color:var(--c-accent); background:var(--c-accent-soft); }
        .dw-ibtn svg { width:14px; height:14px; }
        .dw-ibtn--active { color:var(--c-accent); border-color:var(--c-accent); background:var(--c-accent-soft); }

        /* share btn */
        .dw-share-btn {
          display:flex; align-items:center; gap:5px; padding:0 11px; height:32px;
          border-radius:8px; border:1.5px solid var(--c-accent,#29A9D4);
          background:var(--c-accent-soft,#DDF1FA); color:var(--c-accent,#29A9D4);
          font-size:.74rem; font-weight:700; cursor:pointer; font-family:inherit;
          transition:all .14s; white-space:nowrap;
        }
        .dw-share-btn:hover { background:var(--c-accent,#29A9D4); color:#fff; }
        .dw-share-btn svg { width:13px; height:13px; }

        /* name chip */
        .dw-name-chip {
          display:flex; align-items:center; padding:0 10px; height:32px; border-radius:8px;
          border:1px solid var(--c-border); background:var(--c-surface-2);
          font-size:.76rem; font-weight:600; color:var(--c-text);
          white-space:nowrap; max-width:130px; overflow:hidden; text-overflow:ellipsis;
        }

        /* logout */
        .dw-logout {
          display:flex; align-items:center; gap:5px; padding:0 11px; height:32px;
          border-radius:8px; border:1px solid var(--c-border);
          background:var(--c-surface-2); color:var(--c-muted);
          font-size:.74rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .14s;
        }
        .dw-logout:hover { background:#FEE2E2; border-color:#FCA5A5; color:#DC2626; }
        .dw-logout svg { width:12px; height:12px; }

        /* ── Desktop share dropdown ── */
        .dw-drop-wrap { position:relative; }
        .dw-dropdown {
          position:absolute; top:calc(100% + 8px); right:0; min-width:272px;
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:14px; box-shadow:0 12px 36px rgba(8,20,32,.14);
          z-index:200; overflow:hidden; animation:dwDrop .15s ease;
        }
        @keyframes dwDrop { from{opacity:0;transform:translateY(-6px) scale(.97);} to{opacity:1;transform:translateY(0) scale(1);} }
        .dw-drop-head { padding:10px 14px 8px; font-size:.68rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--c-muted); border-bottom:1px solid var(--c-border); }
        .dw-drop-section { padding:8px; display:flex; flex-direction:column; gap:2px; }
        .dw-drop-label { padding:4px 8px 2px; font-size:.65rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--c-muted); }
        .dw-drop-item { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:9px 10px; border-radius:9px; cursor:pointer; transition:background .12s; min-height:42px; }
        .dw-drop-item:hover { background:var(--c-surface-2); }
        .dw-drop-item-name { display:flex; align-items:center; gap:7px; font-size:.8rem; font-weight:600; color:var(--c-text); overflow:hidden; min-width:0; flex:1; }
        .dw-drop-item-name svg { color:var(--c-accent); flex-shrink:0; }
        .dw-drop-item-name span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .dw-copy-pill { display:flex; align-items:center; gap:4px; padding:4px 9px; border-radius:6px; font-size:.68rem; font-weight:700; border:none; cursor:pointer; font-family:inherit; transition:all .14s; flex-shrink:0; white-space:nowrap; min-height:30px; }
        .dw-copy-pill--idle { background:var(--c-accent-soft); color:var(--c-accent); border:1px solid var(--c-accent); }
        .dw-copy-pill--idle:hover { background:var(--c-accent); color:#fff; }
        .dw-copy-pill--done { background:color-mix(in srgb,#22c55e 14%,transparent); color:#166534; border:1px solid color-mix(in srgb,#22c55e 35%,transparent); }
        [data-mode="dark"] .dw-copy-pill--done { color:#86efac; }
        .dw-drop-empty { padding:14px; font-size:.78rem; color:var(--c-muted); text-align:center; }
        .dw-drop-divider { height:1px; background:var(--c-border); margin:4px 8px; }

        /* ── Mobile overlay drawer ── */
        .dw-overlay {
          position:fixed; inset:0; z-index:200; display:flex;
          animation:dwFadeIn .18s ease;
        }
        @keyframes dwFadeIn { from{opacity:0;} to{opacity:1;} }
        .dw-overlay-bg { position:absolute; inset:0; background:rgba(8,20,32,.6); backdrop-filter:blur(4px); }
        .dw-drawer {
          position:relative; width:min(280px,88vw); height:100%;
          background:var(--c-sidebar); border-right:1px solid var(--c-border);
          display:flex; flex-direction:column;
          box-shadow:0 8px 40px rgba(8,20,32,.25);
          animation:dwSlide .22s ease; z-index:1;
          transition:background .3s,border-color .3s;
        }
        @keyframes dwSlide { from{transform:translateX(-100%);} to{transform:translateX(0);} }

        .dw-drawer-head {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 14px 12px; border-bottom:1px solid var(--c-border); flex-shrink:0;
        }
        .dw-drawer-brand { display:flex; align-items:center; gap:9px; }
        .dw-drawer-logo { width:28px; height:28px; border-radius:8px; overflow:hidden; border:1.5px solid var(--c-border); }
        .dw-drawer-logo img { width:100%; height:100%; object-fit:cover; display:block; }
        .dw-drawer-name { font-family:'DM Serif Display',Georgia,serif; font-size:.88rem; font-weight:600; color:var(--c-text); }
        .dw-close { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:7px; border:1px solid var(--c-border); background:var(--c-surface-2); color:var(--c-muted); cursor:pointer; transition:all .13s; }
        .dw-close:hover { color:var(--c-text); border-color:var(--c-text); }
        .dw-close svg { width:12px; height:12px; }

        /* drawer nav */
        .dw-drawer-nav { flex:1; overflow-y:auto; padding:10px; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
        .dw-drawer-nav::-webkit-scrollbar { display:none; }
        .dw-nav-sec { font-size:.6rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--c-muted); padding:8px 8px 4px; }
        .dw-nav-item {
          display:flex; align-items:center; gap:10px; padding:10px;
          border-radius:10px; border:1px solid transparent; cursor:pointer;
          transition:all .13s; margin-bottom:2px;
          background:none; width:100%; text-align:left; font-family:inherit; min-height:46px;
        }
        .dw-nav-item:hover { background:var(--c-surface-2); }
        .dw-nav-item--on { background:var(--c-accent-soft) !important; border-color:color-mix(in srgb,var(--c-accent) 28%,transparent); }
        .dw-nav-ic { width:32px; height:32px; border-radius:8px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:var(--c-surface-2); color:var(--c-muted); transition:background .13s,color .13s; }
        .dw-nav-ic svg { width:15px; height:15px; }
        .dw-nav-item--on .dw-nav-ic { background:var(--c-accent); color:#fff; }
        .dw-nav-item:hover:not(.dw-nav-item--on) .dw-nav-ic { background:var(--c-surface); color:var(--c-accent); }
        .dw-nav-lbl { flex:1; font-size:.84rem; font-weight:500; color:var(--c-muted); transition:color .13s; }
        .dw-nav-item--on .dw-nav-lbl { color:var(--c-accent); font-weight:600; }
        .dw-nav-item:hover:not(.dw-nav-item--on) .dw-nav-lbl { color:var(--c-text); }

        /* drawer footer */
        .dw-drawer-foot { flex-shrink:0; padding:10px 10px 14px; border-top:1px solid var(--c-border); }
        .dw-drawer-user { display:flex; align-items:center; gap:9px; padding:9px 10px; border-radius:10px; background:var(--c-surface-2); border:1px solid var(--c-border); margin-bottom:7px; }
        .dw-drawer-av { width:28px; height:28px; border-radius:7px; object-fit:cover; flex-shrink:0; border:1.5px solid var(--c-border); }
        .dw-drawer-uname { font-size:.78rem; font-weight:600; color:var(--c-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; }
        .dw-drawer-acts { display:flex; gap:5px; }
        .dw-dact { flex:1; display:flex; align-items:center; justify-content:center; gap:5px; height:34px; border-radius:8px; border:1px solid var(--c-border); background:var(--c-surface); color:var(--c-muted); font-size:.73rem; font-weight:600; cursor:pointer; transition:all .13s; font-family:inherit; }
        .dw-dact:hover { color:var(--c-accent); border-color:var(--c-accent); background:var(--c-accent-soft); }
        .dw-dact--danger:hover { background:#FEE2E2; border-color:#FCA5A5; color:#DC2626; }
        .dw-dact svg { width:13px; height:13px; }

        /* share section inside drawer */
        .dw-drawer-share-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
        .dw-drawer-share-lbl { font-size:.6rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--c-muted); }
        .dw-drawer-share-toggle { display:flex; align-items:center; gap:4px; padding:3px 9px; border-radius:6px; font-size:.7rem; font-weight:700; font-family:inherit; cursor:pointer; border:1.5px solid var(--c-accent); background:var(--c-accent-soft); color:var(--c-accent); transition:all .14s; }
        .dw-drawer-share-toggle:hover { background:var(--c-accent); color:#fff; }
        .dw-drawer-share-toggle svg { width:11px; height:11px; }
        .dw-drawer-share-box { background:var(--c-surface-2); border:1px solid var(--c-border); border-radius:10px; overflow:hidden; margin-bottom:8px; }
        .dw-drawer-share-hd { padding:7px 10px 5px; font-size:.63rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--c-muted); border-bottom:1px solid var(--c-border); background:var(--c-surface); }
        .dw-drawer-share-bd { padding:5px; }

        /* ── Main content ── */
        .dw-main {
          flex:1; overflow-y:auto; overflow-x:hidden; min-height:0;
          background:var(--c-bg); transition:background .3s;
          -webkit-overflow-scrolling:touch;
          scrollbar-width:thin; scrollbar-color:var(--c-border) transparent;
        }
        @media(min-width:1024px){ .dw-main { padding-top:56px; } }
        .dw-main::-webkit-scrollbar { width:4px; }
        .dw-main::-webkit-scrollbar-thumb { background:var(--c-border); border-radius:4px; }
      `}</style>

      <div className="dw-shell">
        {/* ── Desktop sidebar ── */}
        <Sidebar user={user} activeView={activeView} onViewChange={handleViewChange} />

        {/* ── Mobile overlay drawer ── */}
        {mobileOpen && (
          <div className="dw-overlay" onClick={() => setMobileOpen(false)}>
            <div className="dw-overlay-bg" />
            <div className="dw-drawer" onClick={e => e.stopPropagation()}>

              <div className="dw-drawer-head">
                <div className="dw-drawer-brand">
                  <div className="dw-drawer-logo"><img src="/logo.png" alt="Logo"/></div>
                  <span className="dw-drawer-name">Velamini</span>
                </div>
                <button className="dw-close" onClick={() => setMobileOpen(false)}><X size={12}/></button>
              </div>

              <nav className="dw-drawer-nav">
                <div className="dw-nav-sec">Navigation</div>
                {navItems.map(({ view, label, Icon }) => (
                  <button
                    key={view}
                    type="button"
                    className={`dw-nav-item ${activeView === view ? "dw-nav-item--on" : ""}`}
                    onClick={() => handleViewChange(view)}
                  >
                    <div className="dw-nav-ic"><Icon/></div>
                    <span className="dw-nav-lbl">{label}</span>
                    {activeView === view && <ChevronRight size={12} style={{color:"var(--c-accent)"}}/>}
                  </button>
                ))}
              </nav>

              <div className="dw-drawer-foot">
                {/* Share section */}
                <div className="dw-drawer-share-row">
                  <span className="dw-drawer-share-lbl">Share</span>
                  <button className="dw-drawer-share-toggle" onClick={() => setMobileShare(v => !v)}>
                    <Share2 size={11}/> {mobileShare ? "Hide" : "Links"}
                    <ChevronDown size={10} style={{transform:mobileShare?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}/>
                  </button>
                </div>
                {mobileShare && (
                  <div className="dw-drawer-share-box">
                    <div className="dw-drawer-share-hd">Share your virtual self</div>
                    <div className="dw-drawer-share-bd"><ShareItems/></div>
                  </div>
                )}

                {/* User + actions */}
                <div className="dw-drawer-user">
                  <img src={user?.image || "/logo.png"} alt={user?.name ?? "User"} className="dw-drawer-av"/>
                  <span className="dw-drawer-uname">{user?.name ?? "User"}</span>
                </div>
                <div className="dw-drawer-acts">
                  <button className="dw-dact" onClick={toggleTheme}>
                    {isDark ? <Sun size={13}/> : <Moon size={13}/>}
                    {isDark ? "Light" : "Dark"}
                  </button>
                  <button className="dw-dact dw-dact--danger" onClick={() => signOut({ callbackUrl:"/auth/signin" })}>
                    <LogOut size={13}/> Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Right column ── */}
        <div className="dw-right">

          {/* Mobile top bar */}
          <div className="dw-bar">
            <div className="dw-bar-left">
              <button className="dw-ibtn" onClick={() => setMobileOpen(true)}><Menu size={14}/></button>
              <div className="dw-bar-logo"><img src="/logo.png" alt="Logo"/></div>
              <div>
                <div className="dw-bar-page">{viewLabels[activeView]}</div>
              </div>
            </div>
            <div className="dw-bar-right">
              <button className="dw-ibtn" onClick={toggleTheme} title="Toggle theme">
                {isDark ? <Sun size={13}/> : <Moon size={13}/>}
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
              <button className="dw-ibtn" onClick={toggleTheme} title="Toggle theme">
                {isDark ? <Sun size={13}/> : <Moon size={13}/>}
              </button>

              {/* Desktop share dropdown */}
              <div className="dw-drop-wrap">
                <button className="dw-share-btn" onClick={() => setShareOpen(v => !v)}>
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
              <button className="dw-logout" onClick={() => signOut({ callbackUrl:"/auth/signin" })}>
                <LogOut size={12}/> Sign out
              </button>
            </div>
          </div>

          {/* Flagged account banner */}
          {user.status === "flagged" && (
            <div style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"10px 20px",
              background:"color-mix(in srgb,#F59E0B 12%,transparent)",
              borderBottom:"1px solid color-mix(in srgb,#F59E0B 30%,transparent)",
              fontSize:".8rem", color:"#B45309",
            }}>
              <span style={{fontSize:"1rem"}}>⚠️</span>
              <span>
                <strong>Your account has been flagged.</strong>{" "}
                Some features may be restricted. Please contact{" "}
                <a href="mailto:support@velamini.com" style={{color:"inherit",fontWeight:700,textDecoration:"underline"}}>support@velamini.com</a>{" "}
                if you believe this is a mistake.
              </span>
            </div>
          )}

          {/* Main content */}
          <main className="dw-main">{renderView()}</main>
        </div>
      </div>
    </>
  );
}