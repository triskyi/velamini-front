"use client";

import Image from "next/image";
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
    <div className="h-full w-full bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 overflow-y-auto">
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Hero Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-blue-500/5 group-hover:from-teal-500/10 group-hover:via-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
          {/* Animated circles */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-500/5 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/5 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="relative p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar with Gradient Ring */}
              <div className="relative mx-auto sm:mx-0 group/avatar">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full blur-xl opacity-30 group-hover/avatar:opacity-50 transition-opacity duration-500"></div>
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={112}
                    height={112}
                    className="relative h-28 w-28 shrink-0 rounded-full shadow-2xl ring-4 ring-white dark:ring-slate-800 object-cover group-hover/avatar:ring-teal-500/40 group-hover/avatar:scale-110 transition-all duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-4xl font-bold text-white shadow-2xl ring-4 ring-white dark:ring-slate-800 group-hover/avatar:scale-110 transition-transform duration-500">
                    {(user?.name?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {user?.name || "User"}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                      Virtual Self Owner
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group/detail flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-105 transition-all duration-300">
                    <div className="p-2 rounded-lg bg-teal-500/10 group-hover/detail:bg-teal-500/20 transition-colors duration-300">
                      <Mail className="h-4 w-4 text-teal-500 group-hover/detail:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Email</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user?.email || "Not available"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="group/detail flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-105 transition-all duration-300">
                    <div className="p-2 rounded-lg bg-blue-500/10 group-hover/detail:bg-blue-500/20 transition-colors duration-300">
                      <Calendar className="h-4 w-4 text-blue-500 group-hover/detail:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="text-left flex-1">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                  <Activity className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <p className="text-sm font-medium text-white/80">Total Sessions</p>
              </div>
              <p className="text-4xl font-bold">0</p>
              <p className="text-xs text-white/70 mt-2">All time interactions</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                  <Mail className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <p className="text-sm font-medium text-white/80">Messages</p>
              </div>
              <p className="text-4xl font-bold">0</p>
              <p className="text-xs text-white/70 mt-2">Messages sent</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 lg:p-8 shadow-lg">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
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
