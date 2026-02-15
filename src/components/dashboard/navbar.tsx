"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md hidden lg:flex">
      <div className="flex h-14 items-center justify-end gap-4 px-5 sm:px-6 w-full">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-teal-500 shrink-0
              ring-2 ring-slate-200 dark:ring-slate-700"
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
                unoptimized
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {(user?.name?.[0] || "U").toUpperCase()}
              </span>
            )}
          </div>
          <Link
            href="/logout"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
