"use client";

import { useState } from "react";
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

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView stats={stats} />;
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
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900">
      {/* Desktop Sidebar */}
      <Sidebar user={user} activeView={activeView} onViewChange={handleViewChange} />
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/50 overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-white tracking-tight">Velamini</p>
                  <p className="text-xs text-slate-400">AI Workspace</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="px-4 pt-8 pb-6">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Navigation
              </p>
              <nav className="space-y-1">
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
                        "group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-400 shadow-lg shadow-teal-500/5"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
                      ].join(" ")}
                    >
                      {isActive && (
                        <div className="absolute inset-0 border border-teal-500/20 rounded-xl"></div>
                      )}
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-teal-400 relative z-10"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
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

        <Navbar user={user} />
        
        <main className="flex-1 overflow-auto w-full">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
