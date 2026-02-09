"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";

const menuItems = [
    {
        id: "dashboard",
        label: "Dashboard",
        color: "from-cyan-400 to-blue-600",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
        ),
    },
    {
        id: "chat",
        label: "Chat",
        color: "from-purple-400 to-pink-600",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5"/></svg>
        ),
    },
    {
        id: "tasks",
        label: "Tasks",
        color: "from-green-400 to-cyan-600",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ),
    },
    {
        id: "settings",
        label: "Settings",
        color: "from-pink-400 to-purple-600",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.27 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.27 3.27A2 2 0 1 1 7.1.44l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V0a2 2 0 1 1 4 0v.09c.21.6.73 1.06 1.33 1.18h.06A2 2 0 1 1 19.4 3.1l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09c-.6.21-1.06.73-1.18 1.33V15z" stroke="currentColor" strokeWidth="1.5"/></svg>
        ),
    },
];

export default function Sidebar() {
    const [active, setActive] = useState("dashboard");
    return (
        <aside className="h-full min-h-screen w-28 flex flex-col items-center py-6 bg-[#0B0F1A] border-r border-cyan-900/40 shadow-[0_0_24px_2px_rgba(0,255,255,0.08)] relative z-10">
            {/* Logo/Avatar */}
            <motion.div
                whileHover={{ scale: 1.1, boxShadow: "0 0 32px #00eaff" }}
                className="mb-8 w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-800 text-white text-3xl font-bold shadow-[0_0_32px_4px_rgba(0,255,255,0.25)] border-2 border-cyan-400/60"
            >
                V
            </motion.div>

            {/* Menu */}
            <nav className="flex-1 flex flex-col items-center gap-6">
                {menuItems.map((m) => (
                    <motion.div
                        key={m.id}
                        whileHover={{ scale: 1.18, boxShadow: `0 0 16px 4px #fff` }}
                        className="w-full flex justify-center"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={m.label}
                            onClick={() => setActive(m.id)}
                            className={`group w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200
                                bg-gradient-to-br ${active === m.id ? m.color : "from-transparent to-transparent"}
                                border-2 border-cyan-400/30 shadow-[0_0_16px_2px_rgba(0,255,255,0.10)]
                                ${active === m.id ? "text-white" : "text-cyan-300 hover:text-white"}
                                hover:shadow-[0_0_24px_4px_rgba(0,255,255,0.18)] relative`}
                        >
                            <span className="opacity-90 drop-shadow-[0_0_6px_cyan]">{m.icon}</span>
                        </Button>
                    </motion.div>
                ))}
            </nav>

            {/* Theme Toggle */}
            <div className="mt-8">
                <ThemeToggle />
            </div>

            {/* Neon border accents */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400/60 via-transparent to-purple-500/40 blur-[2px] pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500/40 via-transparent to-cyan-400/60 blur-[2px] pointer-events-none" />
        </aside>
    );
}