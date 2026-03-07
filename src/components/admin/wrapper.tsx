"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, BarChart2, ShieldAlert, Settings,
  Menu, X, Moon, Sun, LogOut, ChevronRight, Bell, Building2, TrendingUp
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import AdminOverview       from "./overview";
import AdminUsers          from "./user";
import AdminAnalytics      from "./analytics";
import AdminModeration     from "./moderation";
import AdminSettings       from "./settings";
import AdminOrganizations  from "./organizations";

export type AdminView = "overview" | "users" | "analytics" | "moderation" | "settings" | "organizations";

const navItems: { view: AdminView; label: string; Icon: any; badge?: string }[] = [
  { view: "overview",       label: "Overview",       Icon: LayoutDashboard },
  { view: "users",          label: "Users",          Icon: Users           },
  { view: "organizations",  label: "Organizations",  Icon: Building2       },
  { view: "analytics",      label: "Analytics",      Icon: BarChart2       },
  { view: "moderation",     label: "Moderation",     Icon: ShieldAlert     },
  { view: "settings",       label: "Settings",       Icon: Settings        },
];

const viewLabel: Record<AdminView, string> = {
  overview: "Overview", users: "Users", organizations: "Organizations",
  analytics: "Analytics", moderation: "Moderation", settings: "Settings",
};

export default function AdminWrapper() {
  const { data: session }       = useSession();
  const [view, setView]         = useState<AdminView>("overview");
  const [mobileOpen, setMobile] = useState(false);
  const [isDark, setIsDark]     = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") || "light";
      const dark   = stored === "dark";
      setIsDark(dark);
      applyTheme(dark);
    } catch {}
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const applyTheme = (dark: boolean) => {
    document.documentElement.setAttribute("data-mode",  dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const go = (v: AdminView) => { setView(v); setMobile(false); };

  const renderView = () => {
    switch (view) {
      case "overview":       return <AdminOverview      onNavigate={go} />;
      case "users":          return <AdminUsers />;
      case "organizations":  return <AdminOrganizations />;
      case "analytics":      return <AdminAnalytics />;
      case "moderation":     return <AdminModeration />;
      case "settings":       return <AdminSettings />;
    }
  };

  const user = session?.user;

  /* ── Shared nav item renderer ── */
  const NavItem = ({ v }: { v: typeof navItems[number] }) => (
    <button className={`aw-item ${view === v.view ? "aw-item--on" : ""}`} onClick={() => go(v.view)}>
      <div className="aw-ic"><v.Icon /></div>
      <span className="aw-lbl">{v.label}</span>
      {v.badge && <span className="aw-badge">{v.badge}</span>}
      <ChevronRight size={11} className="aw-arr" />
    </button>
  );

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
          --c-danger:      #EF4444;
          --c-danger-soft: #FEE2E2;
          --c-warn:        #F59E0B;
          --c-warn-soft:   #FFFBEB;
          --c-success:     #10B981;
          --c-success-soft:#ECFDF5;
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
          --c-danger:      #F87171;
          --c-danger-soft: #3B1212;
          --c-warn:        #FCD34D;
          --c-warn-soft:   #2D2008;
          --c-success:     #34D399;
          --c-success-soft:#063320;
          --shadow-sm:     0 1px 4px rgba(0,0,0,.3);
          --shadow-md:     0 8px 32px rgba(0,0,0,.45);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--c-bg);color:var(--c-text);transition:background .3s,color .3s}

        /* ── Shell ── */
        .aw{display:flex;min-height:100dvh;background:var(--c-bg);transition:background .3s}
        .aw-right{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}

        /* ── Desktop Sidebar ── */
        .aw-sb{display:none}
        @media(min-width:1024px){
          .aw-sb{
            display:flex;flex-direction:column;
            width:220px;flex-shrink:0;height:100vh;position:sticky;top:0;
            background:var(--c-sidebar);border-right:1px solid var(--c-border);
            overflow:hidden;transition:background .3s,border-color .3s;
          }
        }

        .aw-brand{display:flex;align-items:center;gap:10px;padding:18px 16px 13px;border-bottom:1px solid var(--c-border);flex-shrink:0}
        .aw-brand-logo{width:32px;height:32px;border-radius:9px;overflow:hidden;border:1.5px solid var(--c-border);background:var(--c-accent-soft);flex-shrink:0}
        .aw-brand-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .aw-brand-name{font-family:'DM Serif Display',serif;font-size:.9rem;font-weight:600;color:var(--c-text);letter-spacing:-.01em}
        .aw-brand-tag{font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--c-danger);padding:1px 7px;border-radius:20px;margin-top:1px}

        .aw-nav{flex:1;overflow-y:auto;padding:10px;scrollbar-width:none}
        .aw-nav::-webkit-scrollbar{display:none}
        .aw-nav-sec{font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);padding:8px 8px 4px}

        .aw-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;border:1px solid transparent;cursor:pointer;transition:all .13s;margin-bottom:2px;background:none;width:100%;text-align:left;font-family:inherit;min-height:42px}
        .aw-item:hover{background:var(--c-surface-2)}
        .aw-item--on{background:var(--c-accent-soft)!important;border-color:color-mix(in srgb,var(--c-accent) 28%,transparent)}
        .aw-ic{width:30px;height:30px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--c-surface-2);color:var(--c-muted);transition:background .13s,color .13s}
        .aw-ic svg{width:13px;height:13px}
        .aw-item--on .aw-ic{background:var(--c-accent);color:#fff}
        .aw-item:hover:not(.aw-item--on) .aw-ic{background:var(--c-surface);color:var(--c-accent)}
        .aw-lbl{flex:1;font-size:.82rem;font-weight:500;color:var(--c-muted);transition:color .13s}
        .aw-item--on .aw-lbl{color:var(--c-accent);font-weight:600}
        .aw-item:hover:not(.aw-item--on) .aw-lbl{color:var(--c-text)}
        .aw-badge{font-size:.62rem;font-weight:700;padding:1px 7px;border-radius:20px;background:var(--c-danger-soft);color:var(--c-danger);flex-shrink:0}
        .aw-arr{opacity:0;color:var(--c-accent);transition:opacity .13s;flex-shrink:0}
        .aw-item--on .aw-arr{opacity:1}

        .aw-foot{flex-shrink:0;padding:10px;border-top:1px solid var(--c-border)}
        .aw-user{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:var(--c-surface-2);border:1px solid var(--c-border);margin-bottom:6px}
        .aw-uav{width:28px;height:28px;border-radius:7px;object-fit:cover;flex-shrink:0;border:1.5px solid var(--c-border)}
        .aw-uname{font-size:.75rem;font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
        .aw-uemail{font-size:.63rem;color:var(--c-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .aw-acts{display:flex;gap:5px}
        .aw-act{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;height:32px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface);color:var(--c-muted);font-size:.71rem;font-weight:600;cursor:pointer;transition:all .13s;font-family:inherit}
        .aw-act:hover{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-accent-soft)}
        .aw-act--danger:hover{background:var(--c-danger-soft);border-color:var(--c-danger);color:var(--c-danger)}
        .aw-act svg{width:12px;height:12px}

        /* ── Desktop Navbar ── */
        .aw-navbar{display:none}
        @media(min-width:1024px){
          .aw-navbar{
            display:flex;align-items:center;justify-content:space-between;
            padding:0 28px;height:56px;flex-shrink:0;
            background:var(--c-surface);border-bottom:1px solid var(--c-border);
            transition:background .3s,border-color .3s;
          }
        }
        .aw-crumb{display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--c-muted)}
        .aw-crumb-sep{opacity:.4}
        .aw-crumb-cur{font-weight:600;color:var(--c-text)}
        .aw-admin-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:20px;background:var(--c-danger-soft);color:var(--c-danger);font-size:.6rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
        .aw-nb-right{display:flex;align-items:center;gap:8px}
        .aw-ibtn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);cursor:pointer;transition:all .14s}
        .aw-ibtn:hover{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-accent-soft)}
        .aw-ibtn svg{width:13px;height:13px}
        .aw-divider{width:1px;height:18px;background:var(--c-border)}
        .aw-nb-user{display:flex;align-items:center;gap:8px;padding:3px 10px 3px 3px;border-radius:9px;border:1px solid var(--c-border);background:var(--c-surface-2)}
        .aw-nb-av{width:26px;height:26px;border-radius:6px;object-fit:cover;border:1.5px solid var(--c-border)}
        .aw-nb-name{font-size:.74rem;font-weight:600;color:var(--c-text);max-width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .aw-logout{display:flex;align-items:center;gap:5px;padding:0 11px;height:32px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);font-size:.72rem;font-weight:600;cursor:pointer;font-family:inherit;transition:all .14s}
        .aw-logout:hover{background:var(--c-danger-soft);border-color:var(--c-danger);color:var(--c-danger)}
        .aw-logout svg{width:12px;height:12px}

        /* ── Mobile top bar ── */
        .aw-bar{display:flex;align-items:center;justify-content:space-between;padding:0 14px;height:52px;flex-shrink:0;background:var(--c-surface);border-bottom:1px solid var(--c-border);transition:background .3s,border-color .3s;z-index:30}
        @media(min-width:1024px){.aw-bar{display:none}}
        .aw-bar-brand{display:flex;align-items:center;gap:8px}
        .aw-bar-logo{width:28px;height:28px;border-radius:7px;overflow:hidden;border:1.5px solid var(--c-border);background:var(--c-accent-soft)}
        .aw-bar-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .aw-bar-title{font-family:'DM Serif Display',serif;font-size:.88rem;font-weight:600;color:var(--c-text)}
        .aw-bar-chip{font-size:.55rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--c-danger);padding:1px 6px;border-radius:20px}
        .aw-bar-right{display:flex;align-items:center;gap:6px}
        .aw-bar-av{width:28px;height:28px;border-radius:7px;object-fit:cover;border:1.5px solid var(--c-border)}

        /* ── Mobile overlay ── */
        .aw-overlay{position:fixed;inset:0;z-index:200;display:flex}
        .aw-ovbg{position:absolute;inset:0;background:rgba(8,20,32,.7);backdrop-filter:blur(5px)}
        .aw-drawer{position:relative;z-index:1;width:min(268px,88vw);height:100%;background:var(--c-sidebar);border-right:1px solid var(--c-border);display:flex;flex-direction:column;box-shadow:var(--shadow-md);transition:background .3s,border-color .3s}
        .aw-dhead{display:flex;align-items:center;justify-content:space-between;padding:14px 14px 11px;border-bottom:1px solid var(--c-border);flex-shrink:0}
        .aw-dbrand{display:flex;align-items:center;gap:8px}
        .aw-dlogo{width:28px;height:28px;border-radius:7px;overflow:hidden;border:1.5px solid var(--c-border);background:var(--c-accent-soft)}
        .aw-dlogo img{width:100%;height:100%;object-fit:cover;display:block}
        .aw-dname{font-family:'DM Serif Display',serif;font-size:.86rem;font-weight:600;color:var(--c-text)}
        .aw-dtag{font-size:.56rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#fff;background:var(--c-danger);padding:1px 6px;border-radius:20px}
        .aw-dclose{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);cursor:pointer;transition:all .12s}
        .aw-dclose:hover{color:var(--c-text)}
        .aw-dclose svg{width:11px;height:11px}
        .aw-dnav{flex:1;overflow-y:auto;padding:10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
        .aw-dnav::-webkit-scrollbar{display:none}
        .aw-dfoot{flex-shrink:0;padding:10px;border-top:1px solid var(--c-border)}
        .aw-duser{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:var(--c-surface-2);border:1px solid var(--c-border);margin-bottom:7px}
        .aw-duav{width:26px;height:26px;border-radius:7px;object-fit:cover;flex-shrink:0;border:1.5px solid var(--c-border)}
        .aw-duname{font-size:.74rem;font-weight:600;color:var(--c-text);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .aw-dacts{display:flex;gap:5px}
        .aw-dact{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;height:32px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface);color:var(--c-muted);font-size:.7rem;font-weight:600;cursor:pointer;transition:all .12s;font-family:inherit}
        .aw-dact:hover{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-accent-soft)}
        .aw-dact--danger:hover{background:var(--c-danger-soft);border-color:var(--c-danger);color:var(--c-danger)}
        .aw-dact svg{width:12px;height:12px}

        /* ── Main ── */
        .aw-main{flex:1;overflow-y:auto;overflow-x:hidden;min-height:0;background:var(--c-bg);transition:background .3s;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}
        .aw-main::-webkit-scrollbar{width:4px}
        .aw-main::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:4px}
      `}</style>

      <div className="aw">
        {/* ── Desktop sidebar ── */}
        <aside className="aw-sb">
          <div className="aw-brand">
            <div className="aw-brand-logo"><img src="/logo.png" alt="Velamini" /></div>
            <div>
              <div className="aw-brand-name">Velamini</div>
              <div className="aw-brand-tag">Admin</div>
            </div>
          </div>

          <nav className="aw-nav">
            <div className="aw-nav-sec">Admin Panel</div>
            {navItems.map(v => <NavItem key={v.view} v={v} />)}
          </nav>

          <div className="aw-foot">
            <div className="aw-user">
              <img src={user?.image || "/logo.png"} alt={user?.name ?? "Admin"} className="aw-uav" />
              <div style={{ flex:1, minWidth:0 }}>
                <div className="aw-uname">{user?.name ?? "Admin"}</div>
                <div className="aw-uemail">{user?.email ?? ""}</div>
              </div>
            </div>
            <div className="aw-acts">
              <button className="aw-act" onClick={toggleTheme}>
                {isDark ? <Sun size={12}/> : <Moon size={12}/>}
                {isDark ? "Light" : "Dark"}
              </button>
              <button className="aw-act aw-act--danger" onClick={() => signOut({ callbackUrl:"/signin" })}>
                <LogOut size={12}/> Out
              </button>
            </div>
          </div>
        </aside>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div className="aw-overlay">
            <div className="aw-ovbg" onClick={() => setMobile(false)} />
            <div className="aw-drawer">
              <div className="aw-dhead">
                <div className="aw-dbrand">
                  <div className="aw-dlogo"><img src="/logo.png" alt="Logo"/></div>
                  <span className="aw-dname">Velamini</span>
                  <span className="aw-dtag">Admin</span>
                </div>
                <button className="aw-dclose" onClick={() => setMobile(false)}><X size={11}/></button>
              </div>
              <nav className="aw-dnav">
                <div className="aw-nav-sec">Admin Panel</div>
                {navItems.map(v => <NavItem key={v.view} v={v} />)}
              </nav>
              <div className="aw-dfoot">
                <div className="aw-duser">
                  <img src={user?.image || "/logo.png"} alt={user?.name ?? "Admin"} className="aw-duav" />
                  <span className="aw-duname">{user?.name ?? "Admin"}</span>
                </div>
                <div className="aw-dacts">
                  <button className="aw-dact" onClick={toggleTheme}>
                    {isDark ? <Sun size={12}/> : <Moon size={12}/>} {isDark ? "Light" : "Dark"}
                  </button>
                  <button className="aw-dact aw-dact--danger" onClick={() => signOut({ callbackUrl:"/signin" })}>
                    <LogOut size={12}/> Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="aw-right">
          {/* ── Mobile top bar ── */}
          <div className="aw-bar">
            <button className="aw-ibtn" onClick={() => setMobile(true)}><Menu size={14}/></button>
            <div className="aw-bar-brand">
              <div className="aw-bar-logo"><img src="/logo.png" alt="Logo"/></div>
              <span className="aw-bar-title">Velamini</span>
              <span className="aw-bar-chip">Admin</span>
            </div>
            <div className="aw-bar-right">
              <button className="aw-ibtn" onClick={toggleTheme}>
                {isDark ? <Sun size={14}/> : <Moon size={14}/>}
              </button>
              <img src={user?.image || "/logo.png"} alt="Admin" className="aw-bar-av"/>
            </div>
          </div>

          {/* ── Desktop navbar ── */}
          <header className="aw-navbar">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <nav className="aw-crumb">
                <span>Velamini</span>
                <span className="aw-crumb-sep">/</span>
                <span className="aw-crumb-cur">{viewLabel[view]}</span>
              </nav>
              <span className="aw-admin-chip">Admin</span>
            </div>
            <div className="aw-nb-right">
              <button className="aw-ibtn" title="Notifications"><Bell size={13}/></button>
              <button className="aw-ibtn" onClick={toggleTheme} title="Toggle theme">
                {isDark ? <Sun size={13}/> : <Moon size={13}/>}
              </button>
              <div className="aw-divider"/>
              <div className="aw-nb-user">
                <img src={user?.image || "/logo.png"} alt="Admin" className="aw-nb-av"/>
                <span className="aw-nb-name">{user?.name ?? "Admin"}</span>
              </div>
              <button className="aw-logout" onClick={() => signOut({ callbackUrl:"/signin" })}>
                <LogOut size={12}/> Sign out
              </button>
            </div>
          </header>

          <main className="aw-main">{renderView()}</main>
        </div>
      </div>
    </>
  );
}