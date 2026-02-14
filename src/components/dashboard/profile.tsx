"use client";

import { UserRound, Mail, Calendar } from "lucide-react";

interface ProfileViewProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ProfileView({ user }: ProfileViewProps) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header Section */}
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your account information and preferences.
          </p>
        </section>

        {/* Profile Card */}
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-teal-500 text-3xl font-bold text-white shadow-lg">
              {(user?.name?.[0] || "U").toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {user?.name || "User"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Virtual Self Owner
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">{user?.email || "No email available"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">Member since {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Information */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Account Information</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {user?.name || "Not set"}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {user?.email || "Not set"}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                To update your profile information, please contact support or update through your authentication provider.
              </p>
            </div>
          </div>
        </section>

        {/* Activity Stats */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Activity Overview</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-cyan-50 p-4">
              <p className="text-xs font-medium text-cyan-900 uppercase tracking-wider">Total Sessions</p>
              <p className="mt-2 text-3xl font-bold text-cyan-900">0</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-700 uppercase tracking-wider">Messages Sent</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-700 uppercase tracking-wider">Last Active</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">Today</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
