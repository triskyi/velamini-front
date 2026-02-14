"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  GraduationCap,
  UserCircle2,
  BarChart3,
  Sliders,
  Settings,
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
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", icon: Home, href: "/Dashboard" },
    { label: "Chat Workspace", icon: MessageSquare, href: "/" },
    { label: "Training", icon: GraduationCap, href: "/training", badge: "New" },
    { label: "Analytics", icon: BarChart3, href: "/Dashboard" },
    { label: "Profile", icon: UserCircle2, href: "/Dashboard" },
    { label: "Settings", icon: Settings, href: "/Dashboard" },
    { label: "Tools", icon: Sliders, href: "/Dashboard" },
  ];

  return (
    <aside
      aria-label={`${user?.name || "User"} sidebar`}
      className="h-screen w-72 bg-[#001f3d] border-r border-[#14365f] flex flex-col flex-shrink-0 text-[#d4deea]"
    >
      <div className="m-4 mb-0 flex-1 border border-[#31527a] p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-md bg-[#f0f5ff] text-[#1f6fc0] flex items-center justify-center font-extrabold text-lg">
            V
          </div>
          <span className="text-sm font-semibold tracking-wide">Velamini</span>
        </div>
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-[#91a3b84d] text-white"
                    : "text-[#d4deea] hover:bg-[#91a3b833]",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="text-[10px] leading-none bg-[#d9e6f5] text-[#3f5f83] px-1.5 py-0.5 rounded-sm">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-[#31527a] pt-4">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm bg-[#082948] text-white">
            <span className="flex items-center gap-3">
              <Moon className="w-4 h-4" />
              Light Mode
            </span>
            <span className="text-[10px] bg-[#7f96af] text-white rounded-full px-2 py-0.5">
              ON
            </span>
          </button>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-[#7f96af] text-white font-semibold hover:bg-[#90a5bb] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
