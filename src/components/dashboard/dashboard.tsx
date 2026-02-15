"use client";

import { Brain, MessageSquare, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardContentProps {
  stats: {
    trainingEntries: number;
    qaPairs: number;
    personalityTraits: number;
    knowledgeItems: number;
  };
  onNavigate?: (view: "training" | "chat" | "profile" | "settings") => void;
}

const statCards = [
  { key: "trainingEntries", label: "Training Entries", icon: Brain },
  { key: "qaPairs", label: "Q&A Pairs", icon: MessageSquare },
  { key: "personalityTraits", label: "Personality Traits", icon: Sparkles },
  { key: "knowledgeItems", label: "Knowledge Items", icon: TrendingUp },
] as const;

export default function Dashboard({ stats, onNavigate }: DashboardContentProps) {
  const trainingProgress = Math.min(100, (stats.knowledgeItems / 5) * 100);

  return (
    <div className="w-full min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-16 sm:pb-20">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
              Overview of your virtual self training progress.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {statCards.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      {label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                      {stats[key]}
                    </p>
                  </div>
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-teal-500/10 dark:bg-teal-500/20">
                    <Icon className="h-6 w-6 text-teal-500 dark:text-teal-400" strokeWidth={2} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Virtual Self Status */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Virtual Self Status
            </h2>
            <div
              className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate?.("training")}
              onKeyDown={(e) => e.key === "Enter" && onNavigate?.("training")}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 rounded-xl bg-teal-500/10 dark:bg-teal-500/20">
                  <Brain className="h-8 w-8 text-teal-500 dark:text-teal-400" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                    Getting Started
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Add more training data for better results.
                  </p>
                  <div className="mt-4">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${trainingProgress}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {Math.round(trainingProgress)}% training completion
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
