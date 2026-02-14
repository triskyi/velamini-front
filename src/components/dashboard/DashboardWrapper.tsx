"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
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

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar user={user} activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}
