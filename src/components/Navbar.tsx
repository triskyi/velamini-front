"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";

/* ── Brand token ─────────────────────────────── */
const SKY = "#38bdf8";          // sky-400
const SKY_DARK = "#0ea5e9";     // sky-500 (slightly richer for dark bg)
const SKY_DIM_L = "rgba(56,189,248,0.08)";
const SKY_DIM_D = "rgba(56,189,248,0.12)";

interface NavbarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  className?: string;
}

export function applyTheme(isDark: boolean) {
  try {
    const r = document.documentElement;
    r.classList.toggle("dark", isDark);
    r.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    r.style.setProperty("--bg",            isDark ? "#0a0f14" : "#f0f8ff");
    r.style.setProperty("--bg2",           isDark ? "#0f1a24" : "#e0f2fe");
    r.style.setProperty("--bg-card",       isDark ? "#111e2a" : "#f0f8ff");
    r.style.setProperty("--fg",            isDark ? "#e8f4fd" : "#0c1a26");
    r.style.setProperty("--muted",         isDark ? "#7ea8c4" : "#5a8aa8");
    r.style.setProperty("--border",        isDark ? "#1e3448" : "#bae0f7");
    r.style.setProperty("--sky",           isDark ? SKY_DARK  : SKY);
    r.style.setProperty("--sky-dim",       isDark ? SKY_DIM_D : SKY_DIM_L);
    r.style.setProperty("--cta-bg",        isDark ? "#0a0f14" : "#0c1a26");
    r.style.setProperty("--cta-fg",        isDark ? "#e8f4fd" : "#f0f8ff");
    r.style.setProperty("--cta-sub",       isDark ? "rgba(232,244,253,0.45)" : "rgba(240,248,255,0.45)");
    r.style.setProperty("--footer-border", isDark ? "rgba(232,244,253,0.07)" : "rgba(240,248,255,0.07)");
    r.style.setProperty("--footer-text",   isDark ? "rgba(232,244,253,0.35)" : "rgba(240,248,255,0.35)");
    r.style.setProperty("--footer-copy",   isDark ? "rgba(232,244,253,0.2)"  : "rgba(240,248,255,0.2)");
  } catch (_) {}
}

const NAV_LINKS = [
  { label: "Features",     href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Terms",        href: "/terms" },
  { label: "Privacy",      href: "/privacy" },
];

export default function Navbar({ isDarkMode, onThemeToggle, className = "" }: NavbarProps) {
  const [localDark, setLocalDark] = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  /* ── init ── */
  useEffect(() => {
    if (typeof isDarkMode === "boolean") { setLocalDark(isDarkMode); return; }
    try {
      const stored = localStorage.getItem("theme");
      const prefer = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const d = stored ? stored === "dark" : prefer;
      setLocalDark(d);
      applyTheme(d);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (typeof isDarkMode === "boolean") setLocalDark(isDarkMode);
  }, [isDarkMode]);

  /* ── scroll ── */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* ── close on outside tap ── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  /* ── close on resize to desktop ── */
  useEffect(() => {
    const h = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* ── lock body scroll when drawer open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleToggle = () => {
    if (onThemeToggle) { onThemeToggle(); return; }
    setLocalDark(p => { const n = !p; applyTheme(n); return n; });
  };

  const dark = typeof isDarkMode === "boolean" ? isDarkMode : localDark;
  const accent = dark ? SKY_DARK : SKY;

  /* ── derived tokens ── */
  const navBg     = scrolled || menuOpen
    ? dark ? "rgba(10,15,20,0.97)"  : "rgba(240,248,255,0.97)"
    : "transparent";
  const navBorder = scrolled || menuOpen
    ? dark ? "rgba(30,52,72,1)"      : "rgba(186,224,247,1)"
    : "transparent";
  const fg     = dark ? "#e8f4fd" : "#0c1a26";
  const muted  = dark ? "#7ea8c4" : "#5a8aa8";
  const skyDim = dark ? SKY_DIM_D : SKY_DIM_L;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Geist+Mono:wght@400&display=swap');

        /* ── Desktop nav links ── */
        .nav-link {
          font-family: 'Geist Mono', monospace;
          font-size: 0.63rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 0.45rem 0.7rem;
          border-radius: 3px;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .nav-link:hover { color: var(--sky, ${SKY}) !important; background: var(--sky-dim, ${SKY_DIM_L}); }

        /* ── CTA button ── */
        .nav-cta {
          font-family: 'Geist Mono', monospace;
          font-size: 0.63rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 0.55rem 1.3rem;
          border: 1.5px solid var(--sky, ${SKY});
          color: var(--sky, ${SKY});
          background: transparent;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          transition: background 0.2s, color 0.2s;
        }
        .nav-cta:hover { background: var(--sky, ${SKY}); color: #fff; }

        /* ── Get Started (filled) button ── */
        .nav-cta-solid {
          font-family: 'Geist Mono', monospace;
          font-size: 0.63rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 0.55rem 1.3rem;
          border: 1.5px solid var(--sky, ${SKY});
          color: #fff;
          background: var(--sky, ${SKY});
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          transition: opacity 0.2s;
        }
        .nav-cta-solid:hover { opacity: 0.82; }

        /* ── Icon button ── */
        .icon-btn {
          background: none;
          border: 1px solid transparent;
          cursor: pointer;
          padding: 0.42rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          transition: border-color 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .icon-btn:hover { border-color: var(--sky, ${SKY}); background: var(--sky-dim, ${SKY_DIM_L}); }

        /* ── Mobile drawer animation ── */
        .mob-drawer {
          overflow: hidden;
          transition: max-height 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease;
          will-change: max-height, opacity;
        }
        .mob-drawer.open   { max-height: 600px; opacity: 1; }
        .mob-drawer.closed { max-height: 0;     opacity: 0; pointer-events: none; }

        /* ── Mobile nav row ── */
        .mob-link {
          font-family: 'Geist Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.95rem 0;
          border-bottom: 1px solid var(--border, #bae0f7);
          transition: color 0.2s;
        }
        .mob-link:hover { color: var(--sky, ${SKY}) !important; }

        /* ── Logo wordmark ── */
        .logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          transition: color 0.3s;
        }

        /* ── Responsive helpers ── */
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
        }
        @media (min-width: 768px) {
          .mobile-only { display: none !important; }
        }

        /* ── Safe area padding for notched phones ── */
        .nav-inner {
          padding-left: max(1rem, env(safe-area-inset-left));
          padding-right: max(1rem, env(safe-area-inset-right));
        }
        .drawer-inner {
          padding-left: max(1.25rem, env(safe-area-inset-left));
          padding-right: max(1.25rem, env(safe-area-inset-right));
          padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
        }
      `}</style>

      <header
        ref={headerRef}
        className={className}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          background: navBg,
          borderBottom: `1px solid ${navBorder}`,
          backdropFilter:       scrolled || menuOpen ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled || menuOpen ? "blur(18px)" : "none",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        {/* ── Top bar ── */}
        <div
          className="nav-inner"
          style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "3.75rem", gap: "0.5rem" }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.55rem", textDecoration: "none", flexShrink: 0, minWidth: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 5, overflow: "hidden", border: `1.5px solid ${accent}`, position: "relative", flexShrink: 0 }}>
              <Image src="/logo.png" alt="Velamini" fill style={{ objectFit: "contain" }} />
            </div>
            <span
              className="logo-text"
              style={{ fontSize: "clamp(0.78rem, 2.5vw, 0.9rem)", color: fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              Velamini
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "0.1rem", flex: "0 1 auto" }}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="nav-link" style={{ color: muted }}>{label}</Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            {/* Theme toggle — always visible */}
            <button onClick={handleToggle} aria-label="Toggle theme" className="icon-btn" style={{ color: muted }}>
              {dark ? <Sun size={14} strokeWidth={1.75} /> : <Moon size={14} strokeWidth={1.75} />}
            </button>

            {/* Sign in — desktop only */}
            <Link href="/auth/signin" className="nav-cta desktop-only">Sign In</Link>

            {/* Get Started — desktop only */}
            <Link href="/onboarding" className="nav-cta-solid desktop-only">Get Started</Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="icon-btn mobile-only"
              style={{ color: fg }}
            >
              {menuOpen ? <X size={17} strokeWidth={1.75} /> : <Menu size={17} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <div
          className={`mob-drawer mobile-only ${menuOpen ? "open" : "closed"}`}
          style={{
            background: dark ? "rgba(10,15,20,0.99)" : "rgba(240,248,255,0.99)",
            borderTop: `1px solid ${dark ? "rgba(30,52,72,1)" : "rgba(186,224,247,1)"}`,
          }}
        >
          <div className="drawer-inner" style={{ paddingTop: "0.5rem" }}>

            {/* Nav links */}
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="mob-link"
                style={{ color: muted }}
                onClick={() => setMenuOpen(false)}
              >
                <span>{label}</span>
                <span style={{ color: accent, fontSize: "0.75rem", opacity: 0.7 }}>→</span>
              </Link>
            ))}

            {/* Mobile CTAs */}
            <div style={{ paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Get Started — filled */}
              <Link
                href="/onboarding"
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.95rem 1.5rem",
                  background: accent,
                  color: "#fff",
                  border: `1.5px solid ${accent}`,
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                  width: "100%",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Get Started
              </Link>
              {/* Sign In — outlined */}
              <Link
                href="/auth/signin"
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.9rem 1.5rem",
                  background: "transparent",
                  color: accent,
                  border: `1.5px solid ${accent}`,
                  textDecoration: "none",
                  transition: "background 0.2s, color 0.2s",
                  width: "100%",
                }}
              >
                Sign In
              </Link>
            </div>

            {/* Theme toggle row — visible in drawer for easy access */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1.1rem", paddingBottom: "0.25rem" }}>
              <span style={{ fontFamily: "Geist Mono, monospace", fontSize: "0.62rem", letterSpacing: "0.13em", textTransform: "uppercase", color: muted }}>
                {dark ? "Light mode" : "Dark mode"}
              </span>
              <button
                onClick={() => { handleToggle(); }}
                aria-label="Toggle theme"
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: "0.62rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: "none",
                  border: `1px solid ${dark ? "rgba(30,52,72,1)" : "rgba(186,224,247,1)"}`,
                  color: muted,
                  padding: "0.4rem 0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  transition: "border-color 0.2s, color 0.2s",
                  borderRadius: 2,
                }}
              >
                {dark ? <Sun size={12} /> : <Moon size={12} />}
                Switch
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Backdrop */}
      {menuOpen && (
        <div
          aria-hidden
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}
        />
      )}
    </>
  );
}