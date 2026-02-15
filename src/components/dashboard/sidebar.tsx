"use client";

import { useState } from "react";
import {
  LayoutGrid,
  GraduationCap,
  MessageSquare,
  UserRound,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

type DashboardViewType = "dashboard" | "training" | "chat" | "profile" | "settings";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  activeView?: DashboardViewType;
  onViewChange?: (view: DashboardViewType) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

export default function Sidebar({
  activeView = "dashboard",
  onViewChange,
  isDarkMode = false,
  onThemeToggle,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: LayoutGrid, view: "dashboard" as DashboardViewType },
    { label: "Training", icon: GraduationCap, view: "training" as DashboardViewType },
    { label: "Chat", icon: MessageSquare, view: "chat" as DashboardViewType },
    { label: "Profile", icon: UserRound, view: "profile" as DashboardViewType },
    { label: "Settings", icon: Settings, view: "settings" as DashboardViewType },
  ];

  return (
    <aside
      aria-label="Sidebar navigation"
      className={`h-full flex-shrink-0 hidden lg:flex flex-col bg-slate-800 border-r border-slate-700/50 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-5 border-b border-slate-700/50 shrink-0 flex items-center justify-between gap-2">
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-white tracking-tight truncate">Velamini</p>
              <p className="text-xs text-slate-400 truncate">Workspace</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          ) : (
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Navigation - MAIN */}
      <div className="flex-1 overflow-y-auto px-3 py-5 min-h-0">
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            MAIN
          </p>
        )}
        <nav className="space-y-1" role="navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.view ? activeView === item.view : false;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => item.view && onViewChange?.(item.view)}
                className={[
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-slate-800",
                  isActive
                    ? "bg-teal-500 text-white"
                    : "text-white/90 hover:bg-slate-700/50 hover:text-white",
                ].join(" ")}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Light Mode Toggle */}
      {onThemeToggle && (
        <div className="shrink-0 px-4 py-4 border-t border-slate-700/50">
          {!collapsed && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-white/90">Light Mode</span>
              <button
                type="button"
                role="switch"
                aria-checked={!isDarkMode}
                aria-label="Toggle light mode"
                onClick={onThemeToggle}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                  !isDarkMode ? "bg-teal-500" : "bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                    !isDarkMode ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          )}
          {collapsed && (
            <button
              type="button"
              onClick={onThemeToggle}
              className="w-full flex justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5 text-teal-400" />
              )}
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
