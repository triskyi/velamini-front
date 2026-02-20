"use client";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

export default function Navbar({ user, isDarkMode, onThemeToggle }: NavbarProps) {
  return (
    <nav className="mt-4 md:mt-8 mx-auto w-full max-w-4xl rounded-2xl bg-[#18182f] flex flex-wrap items-center justify-between px-4 md:px-8 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full from-purple-400 to-cyan-400 flex items-center justify-center">
          <img src="/logo.png" alt="Velamini Logo" className="h-6 w-6 rounded-full" />
        </div>
        <span className="text-white text-lg font-semibold tracking-wide">VELAMINI</span>
      </div>
      <div className="flex gap-2 mt-2 md:mt-0 items-center">
        {/* Theme Toggle Button */}
        <button
          aria-label="Toggle Theme"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#23234a] hover:bg-[#2a2a4c] text-yellow-300 dark:text-purple-300 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={onThemeToggle}
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m8.66-8.66h-1M4.34 12h-1m15.07-5.07l-.7.7M6.34 17.66l-.7.7m12.02 0l-.7-.7M6.34 6.34l-.7-.7M12 5a7 7 0 100 14 7 7 0 000-14z"></path></svg>
          )}
        </button>
        <a
          href="/auth/signin"
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-br from-purple-500 via-purple-700 to-cyan-400 text-white font-semibold shadow-md hover:scale-105 hover:from-purple-600 hover:to-cyan-500 transition-all text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-400"
          style={{ minWidth: '100px', justifyContent: 'center' }}
        >
          Login
        </a>
      </div>
    </nav>
  );
}
