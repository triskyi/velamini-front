"use client";

import {
  Brain,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  Clock,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Circle,
  MoreHorizontal
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

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
  {
    key: "trainingEntries",
    label: "Training Entries",
    icon: Brain,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-100 dark:border-blue-800",
  },
  {
    key: "qaPairs",
    label: "Q&A Pairs",
    icon: MessageSquare,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    borderColor: "border-indigo-100 dark:border-indigo-800",
  },
  {
    key: "personalityTraits",
    label: "Personality Traits",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-100 dark:border-amber-800",
  },
  {
    key: "knowledgeItems",
    label: "Knowledge Items",
    icon: TrendingUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-100 dark:border-emerald-800",
  },
] as const;

type ColorKey = "violet" | "cyan" | "amber";

const quickActions: Array<{
  label: string;
  icon: typeof Brain;
  view: "training" | "chat" | "profile";
  color: ColorKey;
}> = [
    { label: "Start Training", icon: Brain, view: "training", color: "violet" },
    { label: "Chat Now", icon: MessageSquare, view: "chat", color: "cyan" },
    { label: "View Profile", icon: Target, view: "profile", color: "amber" },
  ];

const recentActivities = [
  { label: "Training session completed", time: "2 hours ago", status: "completed" },
  { label: "New Q&A pair added", time: "5 hours ago", status: "completed" },
  { label: "Personality trait updated", time: "1 day ago", status: "completed" },
  { label: "Knowledge base expanded", time: "2 days ago", status: "in-progress" },
];

// Animated counter component
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, isInView]);

  return <span ref={ref}>{count}</span>;
}

// HeroUI Imports
import { Card, Button, Chip } from "@heroui/react";

export default function Dashboard({ stats, onNavigate }: DashboardContentProps) {
  const trainingProgress = Math.min(100, (stats.knowledgeItems / 5) * 100);
  const totalStats = stats.trainingEntries + stats.qaPairs + stats.personalityTraits + stats.knowledgeItems;

  return (
    <div className="w-full min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-default-500">
              Welcome back! Here's an overview of your virtual self.
            </p>
          </div>
          <Chip color="success" variant="soft" size="sm">
            <span className="w-2 h-2 rounded-full bg-success-500 ml-1" />
          </Chip>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ key, label, icon: Icon, color, bgColor }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow" onClick={() => { }}>
                <div className="p-5 flex flex-col justify-between h-full gap-4">
                  <div className={`p-3 w-fit rounded-lg ${bgColor} ${color}`}>
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight">
                      <AnimatedCounter value={stats[key]} />
                    </h3>
                    <p className="text-small text-default-500 font-medium mt-1 uppercase tracking-wide">{label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Placeholder for future sections using HeroUI Cards if needed */}

      </div>
    </div>
  );
}
