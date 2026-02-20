
"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";


export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // On mount, set theme from localStorage or system
    const theme = localStorage.getItem("theme");
    console.debug("[Theme] useEffect mount. theme from storage:", theme);
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
      console.debug("[Theme] Setting dark mode ON");
    } else {
      document.documentElement.classList.remove("dark");
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
        localStorage.setItem("theme", "dark");
        console.debug("[Theme] Toggled dark mode ON");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
        console.debug("[Theme] Toggled dark mode OFF");
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center font-sans">
      {/* Navbar */}
      <Navbar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl mt-10 md:mt-24 gap-8 md:gap-12 px-4 md:px-8">
        {/* Left: Headline and CTA */}
        <div className="flex-1 flex flex-col items-start justify-center w-full max-w-xl mb-8 md:mb-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            VELAMINI <br />
            <span className="text-purple-400">new era of AI</span>
          </h1>
          <p className="text-gray-300 mb-6 max-w-md text-base sm:text-lg">
            Create a virtual you with Velamini and let it handle your tasks while you focus on what matters most.
          </p>
        </div>

        {/* Right: Robot Image */}
        <div className="flex-1 flex items-center justify-center w-full max-w-xs md:max-w-md">
          <img src="/velamini.png" alt="velamini" className="w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 object-contain drop-shadow-[0_0_40px_purple] mx-auto" />
        </div>
      </div>
    </div>
  );
}
