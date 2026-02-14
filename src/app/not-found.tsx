"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-teal-500">404</h1>
        <h2 className="text-2xl font-semibold text-slate-900">Page Not Found</h2>
        <p className="text-slate-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Home To velamini
        </Link>
      </div>
    </div>
  );
}
