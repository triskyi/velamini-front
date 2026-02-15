"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";
import Navbar from "@/components/dashboard/navbar";
import DashboardView from "@/components/dashboard/dashboard";
import ProfileView from "@/components/dashboard/profile";
import SettingsView from "@/components/dashboard/settings";
import TrainingView from "@/components/dashboard/training";
import DashboardChat from "@/components/dashboard/dashboardchat";

export type DashboardViewType = "dashboard" | "training" | "chat" | "profile" | "settings";

interface DashboardWrapperProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
  stats: {
    trainingEntries: number;
    qaPairs: number;
    personalityTraits: number;
    knowledgeItems: number;
  };
}

export default function DashboardWrapper({ user, stats }: DashboardWrapperProps) {
  const [activeView, setActiveView] = useState<DashboardViewType>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };
    syncTheme();
    const obs = new MutationObserver(syncTheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView stats={stats} onNavigate={handleViewChange} />;
      case "training":
        return <TrainingView user={user} />;
      case "chat":
        return <DashboardChat user={user} />;
      case "profile":
        return <ProfileView user={user} />;
      case "settings":
        return <SettingsView user={user} />;
      default:
        return <DashboardView stats={stats} />;
    }
  };

  const handleViewChange = (view: DashboardViewType) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 lg:h-screen">
      {/* Desktop Sidebar */}
      <Sidebar
        user={user}
        activeView={activeView}
        onViewChange={handleViewChange}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />

      {/* Mobile Sidebar Overlay - high z so it sits above navbar and content */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-slate-800 border-r border-slate-700 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <div>
                  <p className="text-base font-bold text-white tracking-tight">Velamini</p>
                  <p className="text-xs text-slate-400">Workspace</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="px-4 pt-6 pb-6">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                MAIN
              </p>
              <nav className="space-y-1 mb-6">
                {[
                  { label: "Dashboard", view: "dashboard" as DashboardViewType },
                  { label: "Training", view: "training" as DashboardViewType },
                  { label: "Chat", view: "chat" as DashboardViewType },
                  { label: "Profile", view: "profile" as DashboardViewType },
                  { label: "Settings", view: "settings" as DashboardViewType },
                ].map((item) => {
                  const isActive = activeView === item.view;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleViewChange(item.view)}
                      className={[
                        "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-teal-500 text-white"
                          : "text-white/90 hover:bg-slate-700/50 hover:text-white",
                      ].join(" ")}
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-700">
                <span className="text-sm text-white/90">Light Mode</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!isDarkMode}
                  onClick={handleThemeToggle}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
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
            </div>
          </div>
        </div>
      )}
      
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Mobile Menu Button - z-30 so below overlay, above content */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-30 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-slate-900 dark:text-white">Velamini</div>
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg shadow-lg object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shadow-lg">
                {(user?.name?.[0] || "U").toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <Navbar user={user} isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />

        {/* Main content: scrollable area with consistent padding so content is never hidden */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden w-full">
          <div className="min-h-full w-full">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
