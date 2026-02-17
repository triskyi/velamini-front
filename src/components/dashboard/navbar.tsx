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

// HeroUI Imports
import { Tooltip, Link as HeroLink } from "@heroui/react";

export default function Navbar({ user, isDarkMode, onThemeToggle }: NavbarProps) {
  return (
    <div className="hidden lg:flex border-b border-gray-200 px-6 items-center justify-between">
      {/* Left Section: Logo or Title */}
      <div className="flex items-center gap-4">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-10 h-10"
        />
        <span className="text-xl font-bold">Dashboard</span>
      </div>

      {/* Right Section: User and Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v1m0 16v1m8.66-8.66h-1M4.34 12h-1m15.07-5.07l-.7.7M6.34 17.66l-.7.7m12.02 0l-.7-.7M6.34 6.34l-.7-.7M12 5a7 7 0 100 14 7 7 0 000-14z"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
            </svg>
          )}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <img
            src={user?.image || "/default-avatar.png"}
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-primary"
          />
          <span className="text-sm text-gray-600">{user?.name || "User"}</span>
        </div>

        {/* Logout Button */}
        <a
          href="/logout"
          className="flex items-center gap-2 text-danger hover:text-danger-dark"
          aria-label="Sign out"
        >
          <img
            src="/logout-icon.png"
            alt="Logout"
            className="w-6 h-6"
          />
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
}
