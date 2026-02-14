"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Home,
  GraduationCap,
  UserRound,
  Settings,
  Wrench,
  Moon,
  LogOut,
} from "lucide-react";
import { handleSignOut } from "@/app/actions";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    const updateActive = () => {
      const nextHash = window.location.hash.replace("#", "") || "dashboard";
      setActiveSection(nextHash);
    };

    updateActive();
    window.addEventListener("hashchange", updateActive);
    return () => window.removeEventListener("hashchange", updateActive);
  }, []);

  const navItems = [
    { label: "Dashboard", icon: Home, id: "dashboard" },
    { label: "Training", icon: GraduationCap, id: "training" },
    { label: "Profile", icon: UserRound, id: "profile" },
    { label: "Settings", icon: Settings, id: "settings" },
    { label: "Tools", icon: Wrench, id: "tools" },
  ];

  return (
    <aside
      aria-label={`${user?.name || "User"} sidebar`}
      className="h-screen w-72 border-r border-[#203f68] bg-gradient-to-b from-[#05284a] to-[#03233f] p-4 text-[#d4deea]"
    >
      <div className="flex h-full flex-col rounded-2xl border border-[#37608f] bg-[#022845]/70 p-4 shadow-[0_20px_45px_rgba(0,0,0,0.25)]">
        <div className="mb-8 flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2f7ff] text-[#1457a6] font-extrabold text-lg">
            V
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">Velamini</p>
            <p className="text-[11px] text-[#a8bfd9]">Starter Workspace</p>
          </div>
        </div>

        <p className="mb-2 px-3 text-[11px] uppercase tracking-[0.14em] text-[#8fa8c4]">Main</p>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Link
                key={item.label}
                href={`/Dashboard#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={[
                  "group w-full rounded-xl px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-[#dbe9f84a] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                    : "text-[#d0dded] hover:bg-[#dbe9f824]",
                ].join(" ")}
              >
                <span className="flex items-center gap-3.5">
                  <span className={["rounded-lg p-1.5", isActive ? "bg-[#0f4378]" : "bg-[#0b3a66] group-hover:bg-[#11477f]"].join(" ")}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <button className="flex w-full items-center justify-between rounded-xl border border-[#36608e] bg-[#07325a] px-3 py-2.5 text-sm text-white">
            <span className="flex items-center gap-2.5">
              <Moon className="h-4 w-4" />
              Light Mode
            </span>
            <span className="rounded-full bg-[#8ea6bf] px-2 py-0.5 text-[10px] font-semibold text-[#0e2f52]">ON</span>
          </button>

          <div className="rounded-xl border border-[#36608e] bg-[#07325a] p-3">
          <p className="truncate text-sm font-semibold text-white">{user?.name || "User"}</p>
          <p className="truncate text-xs text-[#a6bed9]">{user?.email || "Free plan"}</p>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#8ea6bf] px-3 py-2.5 text-sm font-semibold text-[#0e2f52] transition hover:bg-[#a3b9cf]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
