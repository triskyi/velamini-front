"use client";

import { Code, GraduationCap, Briefcase, Rocket } from "lucide-react";

const TEMPLATES = [
  {
    id: "dev",
    name: "Developer",
    icon: Code,
    data: {
      tone: "Direct",
      speakingStyle: "Step-by-step",
      skills: "React, Next.js, Node.js, Frontend Architecture",
      tools: "VS Code, GitHub, Cursor, Postman",
      helpWith: ["Coding Help", "Summarizing Notes"],
    }
  },
  {
    id: "student",
    name: "Student",
    icon: GraduationCap,
    data: {
      tone: "Friendly",
      speakingStyle: "Detailed",
      skills: "Computer Science, Academic Writing, Research",
      tools: "Notion, Google Scholar, ChatGPT",
      helpWith: ["Summarizing Notes", "Planning Tasks"],
    }
  },
  {
    id: "ceo",
    name: "Business / CEO",
    icon: Briefcase,
    data: {
      tone: "Professional",
      speakingStyle: "Bullet points",
      skills: "Leadership, Market Analysis, Strategy",
      tools: "Outlook, Slack, LinkedIn",
      helpWith: ["Writing Emails", "Replying to Clients", "Planning Tasks"],
    }
  }
];

interface QuickFillTemplatesProps {
  onSelect: (data: any) => void;
}

export default function QuickFillTemplates({ onSelect }: QuickFillTemplatesProps) {
  return (
    <div className="space-y-4 pt-4">
      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Quick Templates</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.data)}
              className="group flex flex-col items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-cyan-500 group-hover:text-white flex items-center justify-center transition-all">
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-zinc-300 group-hover:text-white">{t.name}</span>
            </button>
          );
        })}
        <button
          onClick={() => onSelect({})}
          className="flex flex-col items-center gap-3 p-4 border border-zinc-800 border-dashed rounded-2xl hover:bg-zinc-900 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-zinc-600" />
          </div>
          <span className="font-bold text-sm text-zinc-500">Custom</span>
        </button>
      </div>
    </div>
  );
}
