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
      className={`h-full flex-shrink-0 hidden lg:flex flex-col bg-gray-900 border-r border-gray-700 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-700 flex items-center justify-between gap-2">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img
              src="/logo.png" // Path to the real logo
              alt="Velamini Logo"
              className="h-10 w-10 rounded-lg"
            />
            <div>
              <p className="text-lg font-bold text-white">Velamini</p>
              <p className="text-sm text-gray-400">Your Workspace</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map(({ label, icon: Icon, view }) => (
            <li key={view}>
              <button
                onClick={() => onViewChange?.(view)}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition ${
                  activeView === view
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span>{label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-700">
        <button
          onClick={onThemeToggle}
          className="flex items-center gap-3 px-4 py-2 w-full text-left rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          {!collapsed && <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>}
        </button>
      </div>
    </aside>
  );
}
