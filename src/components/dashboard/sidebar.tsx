"use client";

import Image from "next/image";
import {
  LayoutGrid,
  GraduationCap,
  MessageSquare,
  UserRound,
  Settings,
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
      className="h-full w-72 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-200 flex-shrink-0 border-r border-slate-200 dark:border-slate-800/50 hidden lg:flex flex-col shadow-xl"
    >
      <>
        {/* Header with Modern Gradient */}
        <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Velamini</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-6 pb-2 flex-1 overflow-y-auto">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                    "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-600 dark:text-teal-400 shadow-md shadow-teal-500/10"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50",
                  ].join(" ")}
                >
                  {isActive && (
                    <>
                      <div className="absolute inset-0 border border-teal-500/20 rounded-xl"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 animate-shimmer"></div>
                    </>
                  )}
                  <Icon className={`h-5 w-5 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={2} />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-teal-400 relative z-10 animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - User Profile */}
        <div className="mt-auto px-4 pb-6 space-y-4">
          {/* User Card with Glassmorphism */}
          <div className="bg-slate-100 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user?.name || "User"}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-xl shadow-lg shadow-purple-500/25 object-cover ring-2 ring-purple-500/20 hover:ring-purple-500/40 transition-all duration-300"
                  unoptimized
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-base font-bold text-white shadow-lg shadow-purple-500/25 hover:scale-110 transition-transform duration-300">
                  {(user?.name?.[0] || "U").toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            
            <button className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-900/50 hover:bg-slate-300 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all duration-300 border border-slate-300 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-600 hover:scale-105 active:scale-95">
              <LogOut className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </>
    </aside>
  );
}
