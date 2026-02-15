"use client";

import {
  LayoutGrid,
  GraduationCap,
  MessageSquare,
  UserRound,
  Settings,
  SunMoon,
  LogOut,
  Sparkles,
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
}

export default function Sidebar({ user, activeView = "dashboard", onViewChange }: SidebarProps) {
  const navItems = [
    { label: "Dashboard", icon: LayoutGrid, view: "dashboard" as DashboardViewType },
    { label: "Training", icon: GraduationCap, view: "training" as DashboardViewType },
    { label: "Chat", icon: MessageSquare, view: "chat" as DashboardViewType },
    { label: "Profile", icon: UserRound, view: "profile" as DashboardViewType },
    { label: "Settings", icon: Settings, view: "settings" as DashboardViewType },
  ];

  return (
    <aside
      aria-label={`${user?.name || "User"} sidebar`}
      className="h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-200 flex-shrink-0 border-r border-slate-800/50"
    >
      <div className="flex h-full flex-col">
        {/* Header with Modern Gradient */}
        <div className="px-6 py-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-lg font-bold text-white tracking-tight">Velamini</p>
              <p className="text-xs text-slate-400">AI Workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-8 flex-1 overflow-y-auto">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.view ? activeView === item.view : false;

              return (
                <button
                  key={item.label}
                  onClick={() => item.view && onViewChange?.(item.view)}
                  className={[
                    "group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-400 shadow-lg shadow-teal-500/5"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
                  ].join(" ")}
                >
                  {isActive && (
                    <div className="absolute inset-0 border border-teal-500/20 rounded-xl"></div>
                  )}
                  <Icon className="h-5 w-5 relative z-10" strokeWidth={2} />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-teal-400 relative z-10"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - User Profile */}
        <div className="mt-auto px-4 pb-6 space-y-4">
          {/* User Card with Glassmorphism */}
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-base font-bold text-white shadow-lg shadow-purple-500/25">
                {(user?.name?.[0] || "U").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            
            <button className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200 border border-slate-700/50 hover:border-slate-600">
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}