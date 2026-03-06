"use client";

import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, Brain, MessageSquare, User, Settings, FileText, ChevronRight } from "lucide-react";
import DashboardView from "@/components/dashboard/dashboard";
import ProfileView   from "@/components/dashboard/profile";
import SettingsView  from "@/components/dashboard/settings";
import TrainingView  from "@/components/dashboard/training";
import DashboardChat from "@/components/dashboard/dashboardchat";
import ResumeView    from "@/components/dashboard/resume";
import DashboardNavbar from "@/components/dashboard/navbar";
import Sidebar, { DashboardViewType } from "@/components/dashboard/sidebar";

export type { DashboardViewType };

interface DashboardWrapperProps {
  user: { name?: string | null; email?: string | null; image?: string | null; id?: string };
  stats: { trainingEntries: number; qaPairs: number; personalityTraits: number; knowledgeItems: number };
  knowledgeBase: any;
}

const navItems: { view: DashboardViewType; label: string; Icon: any }[] = [
  { view: "dashboard", label: "Dashboard",  Icon: LayoutDashboard },
  { view: "training",  label: "Training",   Icon: Brain           },
  { view: "chat",      label: "Chat",       Icon: MessageSquare   },
  { view: "profile",   label: "Profile",    Icon: User            },
  { view: "resume",    label: "Resume",     Icon: FileText        },
  { view: "settings",  label: "Settings",   Icon: Settings        },
];

export default function DashboardWrapper({ user, stats, knowledgeBase }: DashboardWrapperProps) {
  const [activeView, setActiveView] = useState<DashboardViewType>("dashboard");
  const [mobileOpen, setMobileOpen]  = useState(false);
  const [isDark, setIsDark]          = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") || "light";
      const dark = stored === "dark";
      setIsDark(dark);
      applyTheme(dark);
    } catch {}
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function applyTheme(dark: boolean) {
    document.documentElement.setAttribute("data-mode", dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleViewChange = (view: DashboardViewType) => {
    setActiveView(view);
    setMobileOpen(false);
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard": return <DashboardView stats={stats} onNavigate={handleViewChange} />;
      case "training":  return <TrainingView user={user} knowledgeBase={knowledgeBase} />;
      case "chat":      return <DashboardChat user={user} knowledgeBase={knowledgeBase} />;
      case "profile":   return <ProfileView user={user} knowledgeBase={knowledgeBase} />;
      case "resume":    return <ResumeView />;
      case "settings":  return <SettingsView />;
      default:          return <DashboardView stats={stats} onNavigate={handleViewChange} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root,[data-mode="light"]{
          --c-bg:          #EFF7FF;
          --c-surface:     #FFFFFF;
          --c-surface-2:   #E2F0FC;
          --c-border:      #C5DCF2;
          --c-text:        #0B1E2E;
          --c-muted:       #6B90AE;
          --c-accent:      #29A9D4;
          --c-accent-dim:  #1D8BB2;
          --c-accent-soft: #DDF1FA;
          --c-sidebar:     #F5FAFE;
          --shadow-sm:     0 1px 4px rgba(10,40,70,.07);
          --shadow-md:     0 8px 32px rgba(10,40,70,.11);
        }
        [data-mode="dark"]{
          --c-bg:          #081420;
          --c-surface:     #0F1E2D;
          --c-surface-2:   #162435;
          --c-border:      #1A3045;
          --c-text:        #C8E8F8;
          --c-muted:       #3D6580;
          --c-accent:      #38AECC;
          --c-accent-dim:  #2690AB;
          --c-accent-soft: #0C2535;
          --c-sidebar:     #0A1825;
          --shadow-sm:     0 1px 4px rgba(0,0,0,.3);
          --shadow-md:     0 8px 32px rgba(0,0,0,.45);
        }

        *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: var(--c-bg); color: var(--c-text);
          transition: background .3s, color .3s;
        }

        /* ── Shell ── */
        .dw-shell {
          display: flex; min-height: 100dvh; width: 100%;
          background: var(--c-bg); color: var(--c-text);
          transition: background .3s, color .3s;
        }
        .dw-right { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

        /* ── Mobile top bar ── */
        .dw-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 14px; height: 52px; flex-shrink: 0; z-index: 30;
          background: var(--c-surface); border-bottom: 1px solid var(--c-border);
          transition: background .3s, border-color .3s;
        }
        @media(min-width:1024px) { .dw-bar { display: none; } }

        .dw-bar-brand { display: flex; align-items: center; gap: 9px; }
        .dw-bar-logo {
          width: 30px; height: 30px; border-radius: 8px; overflow: hidden;
          border: 1.5px solid var(--c-border); background: var(--c-accent-soft);
        }
        .dw-bar-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .dw-bar-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: .9rem; font-weight: 600; color: var(--c-text);
        }
        .dw-bar-right { display: flex; align-items: center; gap: 6px; }
        .dw-bar-av {
          width: 30px; height: 30px; border-radius: 8px; object-fit: cover;
          border: 1.5px solid var(--c-border);
        }

        /* Icon buttons (shared) */
        .dw-ibtn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--c-border); background: var(--c-surface-2);
          color: var(--c-muted); cursor: pointer; transition: all .14s;
        }
        .dw-ibtn:hover { color: var(--c-accent); border-color: var(--c-accent); background: var(--c-accent-soft); }
        .dw-ibtn svg { width: 14px; height: 14px; }

        /* ── Mobile overlay drawer ── */
        .dw-overlay {
          position: fixed; inset: 0; z-index: 200; display: flex;
        }
        .dw-overlay-bg {
          position: absolute; inset: 0;
          background: rgba(8,20,32,.65); backdrop-filter: blur(5px);
        }
        .dw-drawer {
          position: relative; width: min(272px, 88vw); height: 100%;
          background: var(--c-sidebar); border-right: 1px solid var(--c-border);
          display: flex; flex-direction: column;
          box-shadow: var(--shadow-md);
          transition: background .3s, border-color .3s;
          z-index: 1;
        }
        .dw-drawer-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 15px 14px 12px; border-bottom: 1px solid var(--c-border); flex-shrink: 0;
        }
        .dw-drawer-brand { display: flex; align-items: center; gap: 9px; }
        .dw-drawer-logo {
          width: 30px; height: 30px; border-radius: 8px; overflow: hidden;
          border: 1.5px solid var(--c-border); background: var(--c-accent-soft);
        }
        .dw-drawer-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .dw-drawer-name {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: .88rem; font-weight: 600; color: var(--c-text);
        }
        .dw-close {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 7px;
          border: 1px solid var(--c-border); background: var(--c-surface-2);
          color: var(--c-muted); cursor: pointer; transition: all .13s;
        }
        .dw-close:hover { color: var(--c-text); border-color: var(--c-text); }
        .dw-close svg { width: 12px; height: 12px; }

        .dw-drawer-nav {
          flex: 1; overflow-y: auto; padding: 10px 10px;
          scrollbar-width: none; -webkit-overflow-scrolling: touch;
        }
        .dw-drawer-nav::-webkit-scrollbar { display: none; }

        .dw-nav-sec {
          font-size: .6rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: var(--c-muted); padding: 8px 8px 4px;
        }
        .dw-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 10px; border-radius: 10px; border: 1px solid transparent;
          cursor: pointer; transition: all .13s; margin-bottom: 2px;
          background: none; width: 100%; text-align: left; font-family: inherit;
          min-height: 46px;
        }
        .dw-nav-item:hover { background: var(--c-surface-2); }
        .dw-nav-item--on {
          background: var(--c-accent-soft) !important;
          border-color: color-mix(in srgb, var(--c-accent) 28%, transparent);
        }
        .dw-nav-ic {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--c-surface-2); color: var(--c-muted);
          transition: background .13s, color .13s;
        }
        .dw-nav-ic svg { width: 15px; height: 15px; }
        .dw-nav-item--on .dw-nav-ic { background: var(--c-accent); color: #fff; }
        .dw-nav-item:hover:not(.dw-nav-item--on) .dw-nav-ic { background: var(--c-surface); color: var(--c-accent); }
        .dw-nav-lbl {
          flex: 1; font-size: .84rem; font-weight: 500; color: var(--c-muted); transition: color .13s;
        }
        .dw-nav-item--on .dw-nav-lbl { color: var(--c-accent); font-weight: 600; }
        .dw-nav-item:hover:not(.dw-nav-item--on) .dw-nav-lbl { color: var(--c-text); }

        .dw-drawer-foot {
          flex-shrink: 0; padding: 10px 10px 14px; border-top: 1px solid var(--c-border);
        }
        .dw-drawer-user {
          display: flex; align-items: center; gap: 9px;
          padding: 9px 10px; border-radius: 10px;
          background: var(--c-surface-2); border: 1px solid var(--c-border);
          margin-bottom: 7px;
        }
        .dw-drawer-av {
          width: 28px; height: 28px; border-radius: 7px; object-fit: cover; flex-shrink: 0;
          border: 1.5px solid var(--c-border);
        }
        .dw-drawer-uname {
          font-size: .78rem; font-weight: 600; color: var(--c-text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
        }
        .dw-drawer-acts { display: flex; gap: 5px; }
        .dw-dact {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
          height: 34px; border-radius: 8px; border: 1px solid var(--c-border);
          background: var(--c-surface); color: var(--c-muted);
          font-size: .73rem; font-weight: 600; cursor: pointer; transition: all .13s; font-family: inherit;
        }
        .dw-dact:hover { color: var(--c-accent); border-color: var(--c-accent); background: var(--c-accent-soft); }
        .dw-dact--danger:hover { background: #FEE2E2; border-color: #FCA5A5; color: #DC2626; }
        .dw-dact svg { width: 13px; height: 13px; }

        /* ── Main content ── */
        .dw-main {
          flex: 1; overflow-y: auto; overflow-x: hidden; min-height: 0;
          background: var(--c-bg); transition: background .3s;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin; scrollbar-color: var(--c-border) transparent;
        }
        .dw-main::-webkit-scrollbar { width: 4px; }
        .dw-main::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 4px; }
      `}</style>

      <div className="dw-shell">
        {/* Desktop sidebar */}
        <Sidebar user={user} activeView={activeView} onViewChange={handleViewChange} />

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="dw-overlay">
            <div className="dw-overlay-bg" onClick={() => setMobileOpen(false)} />
            <div className="dw-drawer">
              <div className="dw-drawer-head">
                <div className="dw-drawer-brand">
                  <div className="dw-drawer-logo"><img src="/logo.png" alt="Logo" /></div>
                  <span className="dw-drawer-name">Velamini</span>
                </div>
                <button className="dw-close" onClick={() => setMobileOpen(false)}><X size={12} /></button>
              </div>

              <nav className="dw-drawer-nav">
                <div className="dw-nav-sec">Menu</div>
                {navItems.map(({ view, label, Icon }) => (
                  <button key={view} className={`dw-nav-item ${activeView === view ? "dw-nav-item--on" : ""}`} onClick={() => handleViewChange(view)}>
                    <div className="dw-nav-ic"><Icon /></div>
                    <span className="dw-nav-lbl">{label}</span>
                    {activeView === view && <ChevronRight size={12} style={{ color: 'var(--c-accent)', opacity: 1 }} />}
                  </button>
                ))}
              </nav>

              <div className="dw-drawer-foot">
                <div className="dw-drawer-user">
                  <img src={user?.image || "/logo.png"} alt={user?.name ?? "User"} className="dw-drawer-av" />
                  <span className="dw-drawer-uname">{user?.name ?? "User"}</span>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Right column */}
        <div className="dw-right">
          {/* Mobile top bar */}
          <div className="dw-bar">
            <button className="dw-ibtn" onClick={() => setMobileOpen(true)}><Menu size={14} /></button>
            <div className="dw-bar-brand">
              <div className="dw-bar-logo"><img src="/logo.png" alt="Logo" /></div>
              <span className="dw-bar-title">Velamini</span>
            </div>
            <div className="dw-bar-right">
              <img src={user?.image || "/logo.png"} alt={user?.name ?? "User"} className="dw-bar-av" />
            </div>
          </div>

          {/* Desktop top navbar */}
          <DashboardNavbar user={user} isDarkMode={isDark} onThemeToggle={toggleTheme} activeView={activeView} />

          {/* Content */}
          <main className="dw-main">{renderView()}</main>
        </div>
      </div>
    </>
  );
}