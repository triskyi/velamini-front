"use client";

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

export default function Navbar({ user, isDarkMode, onThemeToggle, className = "" }: NavbarProps) {
  return (
    <div className={`navbar fixed top-0 left-0 w-full z-50 bg-base-100 shadow-sm py-2 px-4 md:px-8 ${className}`}>
      <div className="navbar-start">
        <a className="btn btn-ghost normal-case text-xl gap-3">
          <div className="avatar">
            <div className="w-8 rounded-full">
              <img src="/logo.png" alt="Velamini Logo" />
            </div>
          </div>
          <span className="font-semibold">VELAMINI</span>
        </a>
      </div>
        
      
      <div className="navbar-end">
          <div className="flex items-center gap-2">
          <button aria-label="Toggle Theme" className="btn btn-ghost btn-square" onClick={onThemeToggle}>
            {isDarkMode ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m8.66-8.66h-1M4.34 12h-1m15.07-5.07l-.7.7M6.34 17.66l-.7.7m12.02 0l-.7-.7M6.34 6.34l-.7-.7M12 5a7 7 0 100 14 7 7 0 000-14z"></path></svg>
            )}
          </button>
          <a href="/auth/login" className="btn btn-dash btn-primary">Login</a>
        </div>
      </div>
    </div>
  );
}
