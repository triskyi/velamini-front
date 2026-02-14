"use client";

import { Brain, MessageSquare, Sparkles, Database, TrendingUp, Lightbulb } from "lucide-react";

interface DashboardContentProps {
  stats: {
    trainingEntries: number;
    qaPairs: number;
    personalityTraits: number;
    knowledgeItems: number;
  };
}

export default function Dashboard({ stats }: DashboardContentProps) {
  const completionPercentage = 5; // calculate based on stats

  const statsCards = [
    {
      title: "Training Entries",
      value: stats.trainingEntries,
      icon: Brain,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Q&A Pairs",
      value: stats.qaPairs,
      icon: MessageSquare,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500",
    },
    {
      title: "Personality Traits",
      value: stats.personalityTraits,
      icon: Sparkles,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      title: "Knowledge Items",
      value: stats.knowledgeItems,
      icon: Database,
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Virtual Self Status */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Virtual Self Status
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Training Progress</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-teal-500 h-2.5 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your virtual self is in early training stages. Add more examples to improve accuracy
            and personality alignment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Next Steps */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-teal-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Next Steps</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Add more chat examples to improve conversation quality
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Upload documents to expand knowledge base
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Define personality traits for better responses
              </span>
            </li>
          </ul>
        </div>

        {/* Training Tips */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Training Tips</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Provide diverse examples covering different topics
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Include your preferred tone and style in responses
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Regular updates help maintain accuracy over time
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}