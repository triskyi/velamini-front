"use client";

import { UserRound, Mail, Calendar, Award, Activity, Clock } from "lucide-react";

interface ProfileViewProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ProfileView({ user }: ProfileViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-blue-500/5"></div>
          
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar with Gradient Ring */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full blur-xl opacity-30"></div>
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-4xl font-bold text-white shadow-2xl ring-4 ring-white dark:ring-slate-800">
                  {(user?.name?.[0] || "U").toUpperCase()}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {user?.name || "User"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                      Virtual Self Owner
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <Mail className="h-4 w-4 text-teal-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Email</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user?.email || "Not available"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Member Since</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats with Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <Activity className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-white/80">Total Sessions</p>
              </div>
              <p className="text-4xl font-bold">0</p>
              <p className="text-xs text-white/70 mt-2">All time interactions</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <Mail className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-white/80">Messages</p>
              </div>
              <p className="text-4xl font-bold">0</p>
              <p className="text-xs text-white/70 mt-2">Messages sent</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-white/80">Last Active</p>
              </div>
              <p className="text-4xl font-bold">Today</p>
              <p className="text-xs text-white/70 mt-2">Just now</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Account Information
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Full Name
                </label>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-4 text-sm font-medium text-slate-900 dark:text-white">
                  {user?.name || "Not set"}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Email Address
                </label>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-4 text-sm font-medium text-slate-900 dark:text-white">
                  {user?.email || "Not set"}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Award className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                    Account Verified
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    To update your profile information, please contact support or update through your authentication provider.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
