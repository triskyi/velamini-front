"use client";

import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
    )},
    { id: 'chat', label: 'Chat', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5"/></svg>
    )},
    { id: 'tasks', label: 'Tasks', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    )},
    { id: 'settings', label: 'Settings', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.27 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.27 3.27A2 2 0 1 1 7.1.44l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V0a2 2 0 1 1 4 0v.09c.21.6.73 1.06 1.33 1.18h.06A2 2 0 1 1 19.4 3.1l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09c-.6.21-1.06.73-1.18 1.33V15z" stroke="currentColor" strokeWidth="1.5"/></svg>
    )},
];

export default function Sidebar() {
    return (
        <aside className="w-24 flex flex-col items-center py-6 border-r border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-bg">
            <div className="mb-6">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 avatar-gradient flex items-center justify-center text-neonBlue shadow-neon"
                >
                    V
                </motion.div>
            </div>

            <nav className="flex-1 flex flex-col items-center gap-3">
                {menuItems.map((m) => (
                    <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.2 }}
                        className="w-12 h-12 flex items-center justify-center text-textPrimary hover:text-neonBlue hover:shadow-neon rounded-full transition-colors duration-200"
                        aria-label={m.label}
                    >
                        <span className="opacity-90">{m.icon}</span>
                    </motion.button>
                ))}
            </nav>

            <div className="mt-6">
                <ThemeToggle />
            </div>
        </aside>
    );
}