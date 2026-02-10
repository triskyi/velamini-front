"use client";

import React from "react";
import { MoreVertical, Circle, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// Type (you can move to lib/types)
type Task = {
  id: number;
  title: string;
  progress: number; // 0–100
  status: "pending" | "progress" | "done";
};

const tasks: Task[] = [
  {
    id: 1,
    title: "Finish React UI polish",
    progress: 70,
    status: "progress",
  },
  {
    id: 2,
    title: "Plan long-term memory layer",
    progress: 30,
    status: "pending",
  },
  {
    id: 3,
    title: "Review architecture notes",
    progress: 45,
    status: "progress",
  },
  {
    id: 4,
    title: "Run performance benchmarks",
    progress: 85,
    status: "progress",
  },
];

function StatusIcon({ status }: { status: Task["status"] }) {
  switch (status) {
    case "pending":
      return <Circle className="h-4 w-4 text-zinc-500" />;
    case "progress":
      return <Clock className="h-4 w-4 text-amber-400" />;
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    default:
      return null;
  }
}

function getProgressColor(progress: number): string {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 50) return "bg-amber-500";
  return "bg-blue-500";
}

export default function InfoPanel() {
  const inProgress = tasks.filter((t) => t.status === "progress").length;

  return (
    <aside className="w-80 lg:w-96 h-screen bg-zinc-950 border-l border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-zinc-800">
        <h2 className="text-xl font-semibold text-white">Today’s Tasks</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {tasks.length} total • {inProgress} in progress
        </p>
      </div>

      {/* Scrollable task list */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-950">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors duration-200"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="mt-0.5">
                  <StatusIcon status={task.status} />
                </div>
                <span className="font-medium text-zinc-100 truncate">
                  {task.title}
                </span>
              </div>

              <button
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 -mr-1 rounded-md hover:bg-zinc-800/50"
                aria-label="Task actions"
              >
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Progress */}
            {task.status !== "done" && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                  <span>Progress</span>
                  <span className="font-medium text-zinc-300">
                    {task.progress}%
                  </span>
                </div>

                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                    transition={{
                      duration: 1.2,
                      ease: "easeOut",
                      delay: 0.2 + index * 0.1,
                    }}
                    className={`h-full ${getProgressColor(task.progress)} transition-all duration-300`}
                  />
                </div>
              </div>
            )}

            {task.status === "done" && (
              <div className="mt-4 text-xs text-emerald-400/80 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Completed
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Optional subtle footer */}
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-600 text-center">
        Tasks auto-sync every 5 min
      </div>
    </aside>
  );
}