"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutGrid,
  GraduationCap,
  MessageSquare,
  UserRound,
  Settings,
  SunMoon,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isLight, setIsLight] = useState(false);

  const navItems = useMemo(
    () => [
      { label: "Dashboard", icon: LayoutGrid, href: "/Dashboard" },
      { label: "Training", icon: GraduationCap, href: "/training" },
      { label: "Chat", icon: MessageSquare, href: "/" },
      { label: "Profile", icon: UserRound, href: "/profile" },
      { label: "Settings", icon: Settings, href: "/settings" },
    ],
    []
  );

  const initials = (user?.name?.trim()?.[0] || "V").toUpperCase();

  return (
    <aside
      aria-label={`${user?.name || "User"} sidebar`}
      className="h-screen w-[292px] flex-shrink-0 bg-[#0b1220] text-slate-200"
      style={{
        boxShadow:
          "inset -1px 0 0 rgba(148,163,184,0.06), 0 20px 80px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="px-6 pt-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[18px] font-semibold leading-none text-white tracking-tight">
                Velamini
              </p>
              <p className="text-[12px] leading-none text-slate-500">
                Workspace
              </p>
            </div>

            <button
              type="button"
              className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 pt-6">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Main
          </p>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-medium transition",
                    "border border-transparent",
                    isActive
                      ? "bg-[#0f2230] text-[#2fe6de] border-white/5"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 hover:border-white/5",
                  ].join(" ")}
                >
                  {/* left accent like the screenshot */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#2fe6de]" />
                  )}

                  <Icon
                    className={[
                      "h-[18px] w-[18px] transition",
                      isActive ? "text-[#2fe6de]" : "text-slate-500 group-hover:text-slate-300",
                    ].join(" ")}
                    strokeWidth={2}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="px-6 pb-5">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Avatar */}
          <div className="mt-6 flex items-center justify-center">
            <div
              className="grid h-14 w-14 place-items-center rounded-full bg-white/[0.04] text-lg font-semibold text-white ring-1 ring-white/10"
              style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}
            >
              {initials}
            </div>
          </div>

          {/* Light mode row */}
          <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
            <span className="flex items-center gap-2.5">
              <SunMoon className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">Light Mode</span>
            </span>

            {/* Toggle (UI only, matches screenshot) */}
            <button
              type="button"
              onClick={() => setIsLight((v) => !v)}
              aria-label="Toggle light mode"
              className={[
                "relative h-6 w-11 rounded-full transition",
                isLight ? "bg-[#2fe6de]" : "bg-white/10",
                "ring-1 ring-white/10",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  isLight ? "translate-x-[22px]" : "translate-x-[2px]",
                ].join(" ")}
              />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
