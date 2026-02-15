"use client";

import { TrendingUp, Lightbulb } from "lucide-react";

interface DashboardContentProps {
  stats: {
    trainingEntries: number;
    qaPairs: number;
    personalityTraits: number;
    knowledgeItems: number;
  };
}

export default function Dashboard({ stats }: DashboardContentProps) {
  void stats;

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 pb-2">
          <div className="group bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 sm:p-7 text-white shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Next Steps</h3>
              </div>
              <ul className="space-y-3.5 text-white/95">
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
              <button className="mt-6 w-full py-3 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-300 border border-white/30 hover:border-white/50">
                Get Started
              </button>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 sm:p-7 text-white shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                  <Lightbulb className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Training Tips</h3>
              </div>
              <ul className="space-y-3.5 text-white/95">
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
              <button className="mt-6 w-full py-3 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-300 border border-white/30 hover:border-white/50">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
