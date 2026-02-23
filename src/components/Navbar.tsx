"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  className?: string;
}

function applyTheme(isDark: boolean) {
  try {
    const doc = document.documentElement;
    if (isDark) {
      doc.classList.add("dark");
      doc.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      doc.classList.remove("dark");
      doc.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  } catch (e) {
    // ignore in SSR or restricted env
  }
}

export default function Navbar({ user, isDarkMode, onThemeToggle, className = "" }: NavbarProps) {
  const [localDark, setLocalDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // if parent provided an explicit controlled prop, prefer it
    if (typeof isDarkMode === "boolean") {
      applyTheme(isDarkMode);
      setLocalDark(isDarkMode);
    } else {
      applyTheme(localDark);
    }
  }, [isDarkMode, localDark]);

  const handleToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
      return;
    }
    setLocalDark((v) => {
      const next = !v;
      applyTheme(next);
      return next;
    });
  };

  return (
    <div className={`navbar fixed top-0 left-0 w-full z-50 bg-base-100/80 backdrop-blur-sm shadow-sm py-2 px-4 md:px-8 font-sans ${className}`}>
      <div className="navbar-start">
        <Link href="/" className="flex items-center gap-3 text-2xl md:text-3xl text-base-content cursor-pointer">
          <div className="avatar">
            <div className="w-10 h-10 md:w-[60px] md:h-[60px] rounded-full overflow-hidden">
              <Image src="/logo.png" alt="Velamini Logo" width={100} height={100} className="object-contain" />
            </div>
          </div>
          <span className="font-semibold tracking-wide">VELAMINI</span>
        </Link>
      </div>

      <div className="navbar-center hidden md:flex">
        <nav className="flex items-center gap-6 text-sm md:text-base">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </nav>
      </div>

      <div className="navbar-end">
        <div className="flex items-center gap-3">
          <label className="toggle text-primary p-1 rounded-lg" aria-label="Theme toggle">
            <input
              type="checkbox"
              className="theme-controller accent-primary"
              checked={typeof isDarkMode === "boolean" ? isDarkMode : localDark}
              onChange={handleToggle}
            />

            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </g>
            </svg>

            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </g>
            </svg>
          </label>

          <Link href="/auth/signin" className="btn btn-dash btn-primary">Login</Link>
        </div>
      </div>
    </div>
  );
}
