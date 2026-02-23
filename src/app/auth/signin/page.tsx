"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Sparkles, Shield } from "lucide-react";
import Navbar from "@/components/Navbar"

// Background animation kept for larger screens only (saves mobile CPU + avoids clutter)
const AnimatedBackground = () => {
  // lightweight animated bubbles + soft orbs; visible at all sizes
  const bubbleCount = 12;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-base-200 via-base-100 to-base-200" />

      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.22, 0.38, 0.22], x: [0, 30, 0], y: [0, 16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-20 -top-10 w-[420px] h-[420px] bg-gradient-to-br from-violet-500/28 to-purple-500/28 rounded-full blur-[100px]"
      />

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.16, 0.34, 0.16], x: [0, -18, 0], y: [0, 36, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -right-20 bottom-0 w-[480px] h-[480px] bg-gradient-to-br from-cyan-500/16 to-blue-500/16 rounded-full blur-[100px]"
      />

      {/* floating bubble particles */}
      {Array.from({ length: bubbleCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, -80 - Math.random() * 80],
            x: [0, Math.random() * 40 - 20],
            scale: [0.8, 1.05, 0.8],
          }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5, ease: "easeOut" }}
          className="absolute bottom-0 w-2 h-2 rounded-full bg-primary/70 dark:bg-primary/90 shadow-lg"
          style={{ left: `${Math.random() * 100}%` }}
        />
      ))}
    </div>
  );
};

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/Dashboard";

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialDark = stored === "dark" || (!stored && prefersDark);
      setIsDark(initialDark);
      if (initialDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
    } catch (e) {
      // ignore for SSR safety
    }
  }, []);

  const handleThemeToggle = () => {
    try {
      const next = !isDark;
      setIsDark(next);
      if (next) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 pt-16 lg:pt-20 relative overflow-hidden bg-base-100 text-base-content">
      <Navbar isDarkMode={isDark} onThemeToggle={handleThemeToggle} className="bg-transparent" />
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8">

          {/* Sign-in card (shows first on small screens) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full lg:w-1/2 flex items-center justify-center"
          >
            <div className="w-full max-w-md">
              <div className="bg-base-100/70 border border-base-300/20 rounded-2xl p-8 md:p-10 shadow-xl m-4 md:m-0">
                <div className="text-center mb-4">
                  <h3 className="mt-3 text-2xl font-extrabold">Welcome to VELAMINI</h3>
     
                </div>

                <div className="space-y-4">
                  <motion.button
                    onClick={handleGoogleSignIn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-dash btn-primary w-full flex items-center justify-center gap-3"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" />
                    </svg>
                    <span>Continue with Google</span>
                  </motion.button>

              

                  <div className="flex items-center justify-center gap-6 text-xs text-base-content/70">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Encrypted</span>
                    </div>
                    
                  </div>
                </div>

                <p className="text-xs text-center text-base-content/60 mt-4">
                  By continuing you agree to our <Link href="/terms" className="underline text-primary">Terms</Link> and <Link href="/privacy" className="underline text-primary">Privacy</Link>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Branding / hero (hidden on small screens) */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center"
          >
            <div className="space-y-4 lg:pr-8 max-w-md text-left p-4 md:p-0 m-4 md:m-0">
              <div className="flex items-center gap-3">
               
                <div>
                  <h2 className="text-2xl font-bold">VELAMINI</h2>
                  <p className="text-xs text-base-content/70">Your Virtual Self Platform</p>
                </div>
              </div>

              <h3 className="text-4xl font-extrabold leading-tight">
                Create your <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Digital Twin</span>
              </h3>
              <p className="text-base text-base-content/70">Train an AI that thinks, responds and represents you online. Share your knowledge, personality and expertise.</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-base-content/50">VELAMINI • {new Date().getFullYear()} • <Link href="/terms" className="underline">Terms</Link> • <Link href="/privacy" className="underline">Privacy</Link></p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-base-200 dark:bg-base-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-base-content/70 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
