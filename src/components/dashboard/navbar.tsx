"use client";

import { Moon, Sun, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface NavbarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  activeView?: string;
}

const viewLabels: Record<string, string> = {
  dashboard: "Dashboard", training: "Training", chat: "Chat",
  profile: "Profile", settings: "Settings", resume: "Resume",
};

export default function DashboardNavbar({ user, isDarkMode, onThemeToggle, activeView = "dashboard" }: NavbarProps) {
  return (
    <>
      <style>{`
        .dnb { display: none; }
        @media(min-width:1024px){
          .dnb {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 28px; height: 56px; flex-shrink: 0;
            background: var(--c-surface); border-bottom: 1px solid var(--c-border);
            transition: background .3s, border-color .3s;
          }
        }
        .dnb-breadcrumb {
          display: flex; align-items: center; gap: 7px;
          font-size: .78rem; color: var(--c-muted);
        }
        .dnb-sep { opacity: .45; }
        .dnb-active { font-weight: 600; color: var(--c-text); }
        .dnb-right { display: flex; align-items: center; gap: 8px; }
        .dnb-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--c-border); background: var(--c-surface-2);
          color: var(--c-muted); cursor: pointer; transition: all .14s;
        }
        .dnb-icon-btn:hover { color: var(--c-accent); border-color: var(--c-accent); background: var(--c-accent-soft); }
        .dnb-icon-btn svg { width: 13px; height: 13px; }
        .dnb-divider { width: 1px; height: 18px; background: var(--c-border); }
        .dnb-user {
          display: flex; align-items: center; gap: 8px;
          padding: 3px 10px 3px 3px; border-radius: 9px;
          border: 1px solid var(--c-border); background: var(--c-surface-2);
        }
        .dnb-av {
          width: 26px; height: 26px; border-radius: 6px; object-fit: cover;
          border: 1.5px solid var(--c-border); flex-shrink: 0;
        }
        .dnb-name {
          font-size: .76rem; font-weight: 600; color: var(--c-text);
          white-space: nowrap; max-width: 110px; overflow: hidden; text-overflow: ellipsis;
        }
        .dnb-logout {
          display: flex; align-items: center; gap: 5px;
          padding: 0 11px; height: 32px; border-radius: 8px;
          border: 1px solid var(--c-border); background: var(--c-surface-2);
          color: var(--c-muted); font-size: .74rem; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all .14s;
        }
        .dnb-logout:hover { background: #FEE2E2; border-color: #FCA5A5; color: #DC2626; }
        .dnb-logout svg { width: 12px; height: 12px; }
      `}</style>

      <header className="dnb">
        <nav className="dnb-breadcrumb">
          <span>Velamini</span>
          <span className="dnb-sep">/</span>
          <span className="dnb-active">{viewLabels[activeView] ?? activeView}</span>
        </nav>

        <div className="dnb-right">
          <button className="dnb-icon-btn" onClick={onThemeToggle} title="Toggle theme">
            {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <div className="dnb-divider" />
          <div className="dnb-user">
            <img src={user?.image || "/logo.png"} alt={user?.name ?? "User"} className="dnb-av" />
            <span className="dnb-name">{user?.name ?? "User"}</span>
          </div>
          <button className="dnb-logout" onClick={() => signOut({ callbackUrl: "/signin" })}>
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>
    </>
  );
}