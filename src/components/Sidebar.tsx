"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import {
  FiHome,
  FiMessageCircle,
  FiCheckSquare,
  FiSettings,
} from "react-icons/fi";

const menuItems = [
  {
    name: "Dashboard",
    icon: FiHome,
    text: "text-cyan-400",
    border: "border-cyan-400",
    glowBg: "bg-cyan-400/20",
    shadow: "shadow-cyan-400/40",
    dot: "bg-cyan-400",
  },
  {
    name: "Chat",
    icon: FiMessageCircle,
    text: "text-purple-400",
    border: "border-purple-400",
    glowBg: "bg-purple-400/20",
    shadow: "shadow-purple-400/40",
    dot: "bg-purple-400",
  },
  {
    name: "Tasks",
    icon: FiCheckSquare,
    text: "text-green-400",
    border: "border-green-400",
    glowBg: "bg-green-400/20",
    shadow: "shadow-green-400/40",
    dot: "bg-green-400",
  },
  {
    name: "Settings",
    icon: FiSettings,
    text: "text-pink-400",
    border: "border-pink-400",
    glowBg: "bg-pink-400/20",
    shadow: "shadow-pink-400/40",
    dot: "bg-pink-400",
  },
];

export default function Sidebar() {
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative h-screen w-24 bg-[#0B0F1A] flex flex-col items-center py-8 space-y-8 border-r border-cyan-500/20 overflow-hidden"
    >
      {/* Neon edge */}
      <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-400 to-purple-500" />

      {menuItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeIndex === index;

        return (
          <motion.button
            key={item.name}
            onClick={() => setActiveIndex(index)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            {/* Active glow background */}
            {isActive && (
              <motion.div
                layoutId="sidebar-glow"
                className={`absolute inset-0 rounded-xl blur-xl ${item.glowBg}`}
                transition={{ type: "spring", stiffness: 180, damping: 25 }}
              />
            )}

            {/* Icon box */}
            <div
              className={`relative z-10 w-16 h-16 rounded-xl flex items-center justify-center border transition-all duration-300
                ${
                  isActive
                    ? `${item.border} shadow-lg ${item.shadow}`
                    : "border-gray-700 group-hover:border-gray-500"
                }`}
            >
              <Icon
                className={`w-8 h-8 transition-all duration-300
                  ${
                    isActive
                      ? `${item.text} drop-shadow-[0_0_10px]`
                      : "text-gray-400 group-hover:text-white"
                  }`}
              />

              {/* Active dot */}
              {isActive && (
                <motion.span
                  layoutId="active-dot"
                  className={`absolute -right-3 w-2 h-2 rounded-full ${item.dot} shadow-lg`}
                />
              )}
            </div>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute left-full ml-4 px-3 py-1.5 rounded-md bg-black/90 border border-gray-700 text-xs font-semibold pointer-events-none"
            >
              <span className={item.text}>{item.name}</span>
            </motion.div>
          </motion.button>
        );
      })}
    </motion.aside>
  );
}
