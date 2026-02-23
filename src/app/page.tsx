"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    console.debug("[Theme] useEffect mount. theme from storage:", theme);
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const useDark = theme === "dark" || (!theme && prefersDark);
    if (useDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      setIsDarkMode(true);
      console.debug("[Theme] Setting dark mode ON");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      setIsDarkMode(false);
      console.debug("[Theme] Setting dark mode OFF");
    }
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      console.debug("[Theme] handleThemeToggle. prev:", prev, "next:", next);
      if (next) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        console.debug("[Theme] Toggled dark mode ON");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
        console.debug("[Theme] Toggled dark mode OFF");
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full bg-base-100 dark:bg-base-100 font-sans text-base-content pt-16 md:pt-20">
      {/* Navbar */}
      <div className="w-full">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
      </div>

      {/* Hero (daisyUI) */}
      <div className="hero bg-base-200 min-h-screen mt-0">
        <div className="hero-content flex-col lg:flex-row-reverse w-full max-w-6xl px-4 md:px-8">
          <img
            src="/velamini.png"
            className="max-w-sm rounded-none shadow-none bg-transparent animate-float"
            alt="Velamini"
          />
          <div className="text-center lg:text-left">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold">Welcome to <span className="text-primary">VELAMINI</span></h1>
            <p className="py-6 text-lg sm:text-xl md:text-2xl">Create a virtual you with Velamini and let it handle your tasks while you focus on what matters most.</p>           
          </div>
        </div>
      </div>
    </div>
  );
}
