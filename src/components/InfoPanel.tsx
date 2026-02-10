"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  progress: number;
  status: "progress" | "pending" | "completed";
  gradient: string;
};

const tasks: Task[] = [
  {
    id: 1,
    title: "Finish React UI",
    progress: 70,
    status: "progress",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    id: 2,
    title: "Plan AI Memory Layer",
    progress: 30,
    status: "pending",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    id: 3,
    title: "Review Notes",
    progress: 45,
    status: "progress",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    id: 4,
    title: "Analyze Data",
    progress: 85,
    status: "progress",
    gradient: "from-orange-400 to-red-500",
  },
];

const getStatusIcon = (status: Task["status"]) => {
  switch (status) {
    case "progress":
      return <Clock className="w-4 h-4 text-cyan-400 animate-spin-slow" />;
    case "pending":
      return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  }
};

export default function InfoPanel() {
  return (
    <motion.aside
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-80 lg:w-96 h-screen bg-[#0B0F1A]/60 backdrop-blur-lg border-l border-gray-800/50 p-6 overflow-y-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">
          Today’s Tasks
        </h2>
        <p className="text-gray-400 text-sm">
          {tasks.length} tasks •{" "}
          {tasks.filter((t) => t.status === "progress").length} in progress
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-cyan-400/30 transition"
          >
            {/* Title */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getStatusIcon(task.status)}
                <span className="ml-2 font-medium text-white">
                  {task.title}
                </span>
              </div>
              <button className="text-gray-400 hover:text-white transition">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="text-cyan-400 font-semibold">
                  {task.progress}%
                </span>
              </div>
              <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${task.gradient}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-4">
          Upcoming
        </h3>
        <div className="space-y-3">
          {["Set Reminder", "Team Sync", "Review Metrics"].map(
            (task, index) => (
              <motion.div
                key={task}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center p-3 rounded-lg bg-gray-800/20 border border-gray-700/30 hover:border-purple-400/30 transition"
              >
                <span className="w-2 h-2 rounded-full bg-purple-400 mr-3" />
                <span className="text-sm text-gray-300">
                  {task}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  Tomorrow
                </span>
              </motion.div>
            )
          )}
        </div>
      </div>

      {/* Performance */}
      <div className="mt-10 p-4 rounded-xl bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-3">
          Performance
        </h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">
              87%
            </div>
            <div className="text-xs text-gray-400">
              Efficiency
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              24/7
            </div>
            <div className="text-xs text-gray-400">
              Uptime
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
