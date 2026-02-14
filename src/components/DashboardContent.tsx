"use client";

import {
  Brain,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { DashboardUser } from "@/components/dashboard/types";

interface DashboardContentProps {
  user?: DashboardUser;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  // TODO: Replace with actual data from database
  const stats = [
    { label: "TRAINING ENTRIES", value: "1", icon: Brain, bgColor: "bg-cyan-50", iconColor: "text-cyan-600" },
    { label: "Q&A PAIRS", value: "0", icon: MessageSquare, bgColor: "bg-slate-50", iconColor: "text-slate-600" },
    { label: "PERSONALITY TRAITS", value: "0", icon: Sparkles, bgColor: "bg-slate-50", iconColor: "text-slate-600" },
    { label: "KNOWLEDGE ITEMS", value: "1", icon: TrendingUp, bgColor: "bg-slate-50", iconColor: "text-slate-600" },
  ];

  // Calculate training completion percentage
  const totalPossibleEntries = 10; // Minimum recommended entries
  const currentEntries = parseInt(stats[0].value);
  const completionPercentage = Math.min((currentEntries / totalPossibleEntries) * 100, 100);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Section */}
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Overview of your virtual self training progress.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <article 
              key={stat.label} 
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-4xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Virtual Self Status Section */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Virtual Self Status</h2>
          
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cyan-500">
              <Brain className="h-7 w-7 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900">Getting Started</h3>
              <p className="mt-1 text-sm text-slate-600">
                Add more training data for better results.
              </p>
              
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div 
                    className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {Math.round(completionPercentage)}% training completion
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Next Steps</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Add Training Data</p>
                  <p className="text-xs text-slate-600">Create Q&A pairs to train your virtual self</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Define Personality</p>
                  <p className="text-xs text-slate-600">Set traits to personalize responses</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Test Your AI</p>
                  <p className="text-xs text-slate-600">Chat with your virtual self</p>
                </div>
              </li>
            </ul>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Training Tips</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-cyan-50 p-4">
                <p className="text-sm font-medium text-cyan-900">Quality over Quantity</p>
                <p className="mt-1 text-xs text-cyan-700">
                  Focus on detailed, authentic responses that reflect your communication style.
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Be Consistent</p>
                <p className="mt-1 text-xs text-slate-600">
                  Regular training updates help maintain accuracy and relevance.
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
