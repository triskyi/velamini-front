"use client";

import { LayoutDashboard, Brain, MessageSquare, User, Settings, FileText, ChevronRight } from "lucide-react";

export type DashboardViewType = "dashboard" | "training" | "chat" | "profile" | "settings" | "resume";

interface SidebarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  activeView: DashboardViewType;
  onViewChange: (view: DashboardViewType) => void;
}

const navItems: { view: DashboardViewType; label: string; Icon: any }[] = [
  { view: "dashboard", label: "Dashboard",  Icon: LayoutDashboard },
  { view: "training",  label: "Training",   Icon: Brain           },
  { view: "chat",      label: "Chat",       Icon: MessageSquare   },
  { view: "profile",   label: "Profile",    Icon: User            },
  { view: "resume",    label: "Resume",     Icon: FileText        },
  { view: "settings",  label: "Settings",   Icon: Settings        },
];

export default function Sidebar({ user, activeView, onViewChange }: SidebarProps) {
  return (
    <>
      <style>{`
        .sb { display: none; }
        @media(min-width:1024px){
          .sb {
            display: flex; flex-direction: column;
            width: 224px; flex-shrink: 0; height: 100vh; position: sticky; top: 0;
            background: var(--c-sidebar); border-right: 1px solid var(--c-border);
            overflow: hidden; transition: background .3s, border-color .3s;
          }
        }
        .sb-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 18px 16px 14px;
          border-bottom: 1px solid var(--c-border); flex-shrink: 0;
        }
        .sb-logo {
          width: 32px; height: 32px; border-radius: 9px; overflow: hidden;
          border: 1.5px solid var(--c-border); background: var(--c-accent-soft); flex-shrink: 0;
        }
        .sb-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .sb-name {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: .92rem; font-weight: 600; color: var(--c-text); letter-spacing: -.01em;
        }
        .sb-tag {
          font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
          color: var(--c-accent); background: var(--c-accent-soft);
          padding: 1px 6px; border-radius: 20px; margin-top: 1px;
        }
        .sb-nav { flex: 1; overflow-y: auto; padding: 10px 10px; scrollbar-width: none; }
        .sb-nav::-webkit-scrollbar { display: none; }
        .sb-section-lbl {
          font-size: .6rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: var(--c-muted); padding: 8px 8px 4px;
        }
        .sb-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 10px; border: 1px solid transparent;
          cursor: pointer; transition: all .13s; margin-bottom: 2px;
          background: none; width: 100%; text-align: left; font-family: inherit;
          min-height: 42px;
        }
        .sb-item:hover { background: var(--c-surface-2); }
        .sb-item--on { background: var(--c-accent-soft) !important; border-color: color-mix(in srgb, var(--c-accent) 28%, transparent); }
        .sb-icon {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--c-surface-2); color: var(--c-muted);
          transition: background .13s, color .13s;
        }
        .sb-icon svg { width: 13px; height: 13px; }
        .sb-item--on .sb-icon { background: var(--c-accent); color: #fff; }
        .sb-item:hover:not(.sb-item--on) .sb-icon { background: var(--c-surface); color: var(--c-accent); }
        .sb-lbl { flex: 1; font-size: .82rem; font-weight: 500; color: var(--c-muted); transition: color .13s; }
        .sb-item--on .sb-lbl { color: var(--c-accent); font-weight: 600; }
        .sb-item:hover:not(.sb-item--on) .sb-lbl { color: var(--c-text); }
        .sb-arr { opacity: 0; color: var(--c-accent); transition: opacity .13s; }
        .sb-item--on .sb-arr { opacity: 1; }
        .sb-footer { flex-shrink: 0; padding: 10px 10px 14px; border-top: 1px solid var(--c-border); }
        .sb-user {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 10px; margin-bottom: 6px;
          background: var(--c-surface-2); border: 1px solid var(--c-border);
        }
        .sb-uav {
          width: 28px; height: 28px; border-radius: 7px; object-fit: cover; flex-shrink: 0;
          border: 1.5px solid var(--c-border);
        }
        .sb-uname { font-size: .76rem; font-weight: 600; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
        .sb-uemail { font-size: .64rem; color: var(--c-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sb-actions { display: flex; gap: 5px; }
        .sb-action {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
          height: 32px; border-radius: 8px; border: 1px solid var(--c-border);
          background: var(--c-surface); color: var(--c-muted);
          font-size: .72rem; font-weight: 600; cursor: pointer; transition: all .13s;
          font-family: inherit;
        }
        .sb-action:hover { color: var(--c-accent); border-color: var(--c-accent); background: var(--c-accent-soft); }
        .sb-action--danger:hover { background: #FEE2E2; border-color: #FCA5A5; color: #DC2626; }
        .sb-action svg { width: 12px; height: 12px; }
      `}</style>

      <aside className="sb">
        <div className="sb-brand">
          <div className="sb-logo"><img src="/logo.png" alt="Velamini" /></div>
          <div>
            <div className="sb-name">Velamini</div>
            <div className="sb-tag">Dashboard</div>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section-lbl">Navigation</div>
          {navItems.map(({ view, label, Icon }) => (
            <button key={view} className={`sb-item ${activeView === view ? "sb-item--on" : ""}`} onClick={() => onViewChange(view)}>
              <div className="sb-icon"><Icon /></div>
              <span className="sb-lbl">{label}</span>
              <ChevronRight size={11} className="sb-arr" />
            </button>
          ))}
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <img src={user?.image || "/logo.png"} alt={user?.name ?? "User"} className="sb-uav" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sb-uname">{user?.name ?? "User"}</div>
              <div className="sb-uemail">{user?.email ?? ""}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}