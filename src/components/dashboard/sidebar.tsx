"use client";

import {
  LayoutGrid,
  GraduationCap,
  MessageSquare,
  UserRound,
  Settings,
  SunMoon,
  ChevronLeft,
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
      className="h-screen w-64 bg-[#0f1729] text-slate-200 flex-shrink-0"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/40">
          <div>
            <p className="text-lg font-semibold text-white leading-none">Velamini</p>
            <p className="text-xs text-slate-500 leading-none mt-1">Workspace</p>
          </div>
          <button className="text-slate-500 hover:text-slate-400">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-6 flex-1">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Main
          </p>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.view ? activeView === item.view : false;

              return (
                <button
                  key={item.label}
                  onClick={() => item.view && onViewChange?.(item.view)}
                  className={[
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all border border-transparent",
                    isActive
                      ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-300 hover:border-slate-700/30",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - User Profile */}
        <div className="mt-auto px-6 pb-4">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-white">
              {(user?.name?.[0] || "N").toUpperCase()}
            </div>
          </div>
          
          {/* Light Mode Toggle */}
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span className="flex items-center gap-2.5">
              <SunMoon className="h-4 w-4" />
              <span>Light Mode</span>
            </span>
            <div className="relative">
              <div className="w-11 h-6 bg-teal-500 rounded-full flex items-center px-0.5">
                <div className="w-5 h-5 bg-white rounded-full ml-auto shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}