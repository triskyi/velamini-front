import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { DashboardUser } from "@/components/dashboard/types";

interface DashboardLayoutProps {
  children: ReactNode;
  user?: DashboardUser;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      <Sidebar user={user} />
      <div className="min-w-0 flex-1 overflow-y-auto bg-slate-50">
        <header className="flex h-16 items-center justify-end bg-white border-b border-slate-200 px-8">
          <div className="flex items-center gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-sm font-semibold text-white hover:bg-teal-600 transition-colors">
              {(user?.name?.[0] || "T").toUpperCase()}
            </button>
          </div>
        </header>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
