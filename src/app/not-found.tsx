"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">404</h1>
        <p className="mb-4 text-xl text-slate-600">Oops! Page not found</p>
        <Link href="/" className="text-emerald-600 underline hover:text-emerald-500">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
