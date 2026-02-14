"use client";

import { CheckCircle2, LucideIcon } from "lucide-react";

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface TrainingSidebarProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (id: number) => void;
}

export default function TrainingSidebar({ steps, currentStep, setCurrentStep }: TrainingSidebarProps) {
  return (
    <div className="w-full md:w-80 bg-zinc-900/30 border-r border-zinc-800 p-8 flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
          Velamini <span className="text-cyan-500">Train</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-bold">Personalization Hub</p>
      </div>

      <div className="flex-1 space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <button 
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                isActive 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" 
                  : isCompleted 
                    ? "text-zinc-500" 
                    : "text-zinc-600 opacity-50 hover:opacity-100"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "bg-zinc-800"
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className="font-bold text-sm">{step.title}</span>
            </button>
          );
        })}
      </div>
      
      <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <p className="text-xs text-zinc-400 leading-relaxed italic">
          &quot;Teach Velamini your style, preferences, and workflow-so it can guide you like you guide yourself.&quot;
        </p>
      </div>
    </div>
  );
}
