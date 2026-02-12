"use client";

import Image from "next/image";
import { MessageSquare, Plus, GraduationCap } from "lucide-react";

interface ChatNavbarProps {
  onShowFeedback: () => void;
  onNewChat: () => void;
  onShowTraining: () => void;
  currentView: 'chat' | 'training';
}

export default function ChatNavbar({ 
  onShowFeedback, 
  onNewChat, 
  onShowTraining,
  currentView
}: ChatNavbarProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-center px-4 py-4 sm:px-8 sm:py-6 gap-4 sm:gap-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden p-1 bg-black/50 backdrop-blur-sm">
          <Image 
            src="/logo.png" 
            alt="Velamini Logo" 
            width={120} 
            height={120} 
            className="object-contain"
          />
        </div>
        <span className="font-bold text-zinc-100 text-xl sm:text-2xl tracking-tight">Velamini</span>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
        {/* <button 
          onClick={onShowTraining}
          className={`btn btn-sm gap-2 transition-all ${
            currentView === 'training' 
              ? 'bg-cyan-500 text-white border-none shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
              : 'btn-ghost text-zinc-500 hover:text-cyan-400'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          {currentView === 'training' ? 'Back to Chat' : 'Intelligence Hub'}
        </button>

        <div className="w-px h-6 bg-zinc-800 mx-1" /> */}

        <button 
          onClick={onShowFeedback}
          className="btn btn-ghost btn-sm text-zinc-500 hover:text-cyan-400 gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Feedback
        </button>
        <button 
          onClick={onNewChat}
          className="btn btn-ghost btn-sm text-zinc-500 hover:text-zinc-200 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>
    </div>
  );
}
