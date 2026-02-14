"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, MessageSquare, Sparkles } from "lucide-react";

interface DashboardContentProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const recent = [
  { title: "Profile basics completed", time: "Today" },
  { title: "First chat conversation started", time: "Yesterday" },
  { title: "Training checklist created", time: "2 days ago" },
];

export default function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-[#eef3f8] px-6 py-8 md:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
          <p className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            <Sparkles className="h-3.5 w-3.5" />
            Your Virtual Self Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Hi {user?.name || "there"}, let&apos;s build your assistant.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Keep it simple. Complete training, chat with your assistant, and monitor progress from one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/training"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <GraduationCap className="h-4 w-4" />
              Start Training
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <MessageSquare className="h-4 w-4" />
              Open Chat
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Profile completion</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">65%</p>
            <p className="mt-1 text-xs text-slate-500">Add voice/personality details to improve responses.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Conversations</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">12</p>
            <p className="mt-1 text-xs text-slate-500">Total sessions started with your assistant.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Quality score</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">4.6/5</p>
            <p className="mt-1 text-xs text-slate-500">Based on your edits and feedback so far.</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <Link href="/training" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
              Continue setup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium text-slate-700">{item.title}</p>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
