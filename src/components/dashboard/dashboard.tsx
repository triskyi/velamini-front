"use client";

import { Brain, MessageSquare, Sparkles, Database, TrendingUp, Lightbulb, ArrowUpRight, Zap, Target, Trophy } from "lucide-react";

interface DashboardContentProps {
  stats: {
    trainingEntries: number;
    qaPairs: number;
    personalityTraits: number;
    knowledgeItems: number;
  };
}

export default function Dashboard({ stats }: DashboardContentProps) {
  const completionPercentage = Math.min((stats.knowledgeItems / 5) * 100, 100);

  const statsCards = [
    {
      title: "Training Entries",
      value: stats.trainingEntries,
      icon: Brain,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-500/10 to-indigo-500/10",
      iconColor: "text-blue-500",
      change: "+12%",
      positive: true,
    },
    {
      title: "Q&A Pairs",
      value: stats.qaPairs,
      icon: MessageSquare,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-500",
      change: "+8%",
      positive: true,
    },
    {
      title: "Personality Traits",
      value: stats.personalityTraits,
      icon: Sparkles,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-500",
      change: "+5%",
      positive: true,
    },
    {
      title: "Knowledge Items",
      value: stats.knowledgeItems,
      icon: Database,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-500/10 to-red-500/10",
      iconColor: "text-orange-500",
      change: "+15%",
      positive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome Back 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Here's what's happening with your virtual self today
          </p>
        </div>

        {/* Stats Grid with Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">{stat.change}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Training Progress Card */}
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Virtual Self Status
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Your AI is learning and evolving every day
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
              <Zap className="h-4 w-4 text-teal-500" />
              <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                Active
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Training Progress
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  {completionPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-teal-500/50"
                  style={{ width: `${completionPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="p-2 rounded-lg bg-teal-500/10">
                  <Target className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Next Milestone</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">10 Entries</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Trophy className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Achievements</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">3 Unlocked</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Brain className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">AI Accuracy</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">85%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Steps Card */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold">Next Steps</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white/90 group-hover:text-white transition-colors">
                  Add more chat examples to improve conversation quality
                </span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white/90 group-hover:text-white transition-colors">
                  Upload documents to expand knowledge base
                </span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white/90 group-hover:text-white transition-colors">
                  Define personality traits for better responses
                </span>
              </li>
            </ul>
            <button className="mt-6 w-full py-3 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-200 border border-white/30">
              Get Started
            </button>
          </div>

          {/* Training Tips Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Lightbulb className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold">Training Tips</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white/90 group-hover:text-white transition-colors">
                  Provide diverse examples covering different topics
                </span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white/90 group-hover:text-white transition-colors">
                  Include your preferred tone and style in responses
                </span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white/90 group-hover:text-white transition-colors">
                  Regular updates help maintain accuracy over time
                </span>
              </li>
            </ul>
            <button className="mt-6 w-full py-3 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-200 border border-white/30">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}