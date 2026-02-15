"use client";

import Image from "next/image";
import { Mail, Calendar, Award, Activity } from "lucide-react";

interface ProfileViewProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ProfileView({ user }: ProfileViewProps) {
  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-20 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-shrink-0">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                  unoptimized
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl flex items-center justify-center bg-teal-500 text-3xl font-bold text-white">
                  {(user?.name?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {user?.name || "User"}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  Virtual Self Owner
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <Mail className="h-4 w-4 text-teal-500" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user?.email || "Not available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Member Since</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-teal-500/10">
                <Activity className="h-5 w-5 text-teal-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Sessions</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All time interactions</p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Mail className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Messages</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Messages sent</p>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Account Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Full Name
              </label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">
                {user?.name || "Not set"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">
                {user?.email || "Not set"}
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
              <Award className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Account Verified</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  To update your profile, contact support or update through your authentication provider.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
