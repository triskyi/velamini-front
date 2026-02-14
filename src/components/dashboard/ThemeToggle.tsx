"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("velamini-theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("velamini-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 dark:bg-gray-800 text-gray-800 dark:text-textPrimary border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-neonBlue">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-yellow-500">
          <path d="M12 3v2M12 19v2M20.66 7.34l-1.41 1.41M5.34 18.66l-1.41 1.41M21 12h-2M5 12H3M18.66 18.66l-1.41-1.41M6.75 6.75L5.34 5.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
