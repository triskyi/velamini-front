"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import {
  Home,
  MessageCircle,
  CheckSquare,
  Settings,
} from "lucide-react";

type MenuItem = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; // tailwind color class base (e.g. cyan-500)
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: Home, color: "cyan" },
  { name: "Chat", icon: MessageCircle, color: "purple" },
  { name: "Tasks", icon: CheckSquare, color: "emerald" },
  { name: "Settings", icon: Settings, color: "rose" },
];

export default function Sidebar() {
  const [activeIndex, setActiveIndex] = useState(1); // Chat as default

  return (
    <motion.aside
      initial={{ x: -72 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative h-screen w-20 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-10 space-y-6 select-none"
    >
      {/* Very subtle vertical accent line (optional – comment out if too much) */}
      {/* <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-zinc-800 via-zinc-700 to-zinc-800" /> */}

      {menuItems.map((item, index) => {
        const isActive = activeIndex === index;
        const color = item.color;

        return (
          <button
            key={item.name}
            onClick={() => setActiveIndex(index)}
            className={`
              group relative w-14 h-14 rounded-xl flex flex-col items-center justify-center
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-${color}-500/50
              ${isActive
                ? `bg-zinc-900/80 border border-${color}-500/40 shadow-sm`
                : `border border-transparent hover:bg-zinc-900/60 hover:border-zinc-700`
              }
            `}
            aria-label={item.name}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Active indicator pill on the left */}
            {isActive && (
              <motion.div
                layoutId="active-indicator"
                className={`absolute -left-3 w-1.5 h-8 rounded-full bg-${color}-500`}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            <item.icon
              className={`
                w-7 h-7 transition-colors duration-200
                ${isActive ? `text-${color}-400` : `text-zinc-400 group-hover:text-zinc-200`}
              `}
            />

            <span
              className={`
                mt-1.5 text-[10px] font-medium tracking-tight
                ${isActive ? `text-${color}-300` : `text-zinc-500 group-hover:text-zinc-300`}
              `}
            >
              {item.name}
            </span>
          </button>
        );
      })}

      {/* Optional bottom spacer / branding */}
      <div className="flex-1" />
      <div className="text-xs text-zinc-600 pb-4">v2.1</div>
    </motion.aside>
  );
}