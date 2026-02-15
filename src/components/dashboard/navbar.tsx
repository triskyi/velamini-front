"use client";

import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check current state from DOM
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    console.log('Initial theme state:', isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Update document class
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Force a small delay to ensure class is applied
    setTimeout(() => {
      console.log('Theme changed to:', newTheme ? 'dark' : 'light');
      console.log('HTML classes:', document.documentElement.className);
    }, 100);
  };

  // Prevent flash during hydration
  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hidden lg:block">
      <div className="flex h-16 items-center justify-end px-6">
        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 rotate-0 transition-transform duration-300 hover:rotate-180" strokeWidth={2} />
            ) : (
              <Moon className="h-5 w-5 rotate-0 transition-transform duration-300 hover:-rotate-12" strokeWidth={2} />
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 ml-3 border-l border-slate-200 dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administrator
              </p>
            </div>
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl shadow-lg object-cover ring-2 ring-teal-500/20 hover:ring-teal-500/40 transition-all duration-300 hover:scale-110 cursor-pointer"
                unoptimized
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                {(user?.name?.[0] || "U").toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
