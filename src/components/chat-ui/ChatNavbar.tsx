"use client";

import Image from "next/image";
import { MessageSquare, Plus } from "lucide-react";

interface ChatNavbarProps {
  onShowFeedback: () => void;
  onNewChat: () => void;
}

export default function ChatNavbar({ onShowFeedback, onNewChat }: ChatNavbarProps) {
  return (
    <div className="w-full flex justify-between items-center px-8 py-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden p-1">
          <Image 
            src="/logo.png" 
            alt="Velamini Logo" 
            width={120} 
            height={120} 
            className="object-contain"
          />
        </div>
        <span className="font-bold text-zinc-100 text-2xl tracking-tight">Velamini</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onShowFeedback}
          className="btn btn-ghost btn-sm text-zinc-500 hover:text-cyan-400 gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Feedback
        </button>
        <div className="w-px h-6 bg-zinc-800 mx-1" />
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
