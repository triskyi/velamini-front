"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, GraduationCap, Settings, UserRound, Wrench } from "lucide-react";

interface DashboardContentProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-[#eef3f8] px-6 py-8 md:px-10">
      <div className="mx-auto max-w-5xl space-y-5">
        <section id="dashboard" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Welcome, {user?.name || "User"}</h1>
          <p className="mt-2 text-sm text-slate-500">
            This is your starter control center. Use the sections below to set up your virtual self.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Setup Progress</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">65%</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Conversations</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">12</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Quality Score</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">4.6/5</p>
            </div>
          </div>
        </section>

        <section id="training" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Training</p>
              <h2 className="mt-2 inline-flex items-center gap-2 text-xl font-semibold text-slate-900">
                <GraduationCap className="h-5 w-5" />
                Train Your Assistant
              </h2>
              <p className="mt-2 text-sm text-slate-500">Complete identity, personality, and workflow to get better answers.</p>
            </div>
            <Link
              href="/training"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Open Training
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section id="profile" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Profile</p>
          <h2 className="mt-2 inline-flex items-center gap-2 text-xl font-semibold text-slate-900">
            <UserRound className="h-5 w-5" />
            Your Profile
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Name</p>
              <p className="mt-1 font-semibold text-slate-900">{user?.name || "Not set"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Email</p>
              <p className="mt-1 font-semibold text-slate-900">{user?.email || "Not set"}</p>
            </div>
          </div>
        </section>

        <section id="settings" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Settings</p>
          <h2 className="mt-2 inline-flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Settings className="h-5 w-5" />
            Workspace Settings
          </h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Notification emails</span>
              <span className="text-xs font-semibold text-emerald-700">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Auto-save training edits</span>
              <span className="text-xs font-semibold text-emerald-700">Enabled</span>
            </div>
          </div>
        </section>

        <section id="tools" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Tools</p>
          <h2 className="mt-2 inline-flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Wrench className="h-5 w-5" />
            Quick Tools
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Export basic report
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </button>
            <button className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Backup profile data
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
