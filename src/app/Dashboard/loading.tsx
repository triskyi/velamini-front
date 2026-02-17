import { Skeleton } from "@heroui/react";

export default function Loading() {
    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Sidebar Skeleton */}
            <div className="hidden lg:flex w-72 flex-col gap-4 border-r border-slate-200 dark:border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center gap-3 px-2 py-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-24 rounded-lg" />
                        <Skeleton className="h-3 w-16 rounded-lg" />
                    </div>
                </div>
                <div className="space-y-3 mt-8">
                    {Array(6).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg bg-default-200 dark:bg-slate-800" />
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Navbar Skeleton */}
                <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-slate-900/50">
                    <Skeleton className="h-8 w-32 rounded-lg" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>

                {/* Page Content Skeleton */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="flex flex-col gap-2 mb-8">
                        <Skeleton className="h-10 w-48 rounded-lg" />
                        <Skeleton className="h-5 w-64 rounded-lg" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array(4).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>

                    {/* Check/Charts Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
                        <Skeleton className="h-[400px] rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
