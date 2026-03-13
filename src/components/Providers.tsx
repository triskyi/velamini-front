"use client";

import { SessionProvider } from "@/lib/auth-client";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider basePath="/api/auth">{children}</SessionProvider>;
}
