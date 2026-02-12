"use client";

import React from "react";
import { 
  MessageSquare, 
  Search, 
  Library, 
  Plus, 
  Settings, 
  LogOut, 
  Sparkles,
  MoreHorizontal
} from "lucide-react";
import { handleSignOut } from "@/app/actions";
import { motion } from "framer-motion";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="h-screen w-72 bg-black border-r border-zinc-900 flex flex-col flex-shrink-0 z-50 font-sans">
      {/* Header / Logo */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-white font-bold font-mono text-lg">V</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Velamini</span>
        </div>
        <button className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-zinc-900 rounded-md">
          <Library className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-5 mb-6">
        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white py-3.5 rounded-xl transition-all font-semibold shadow-lg shadow-orange-900/20 active:scale-[0.98] border border-orange-400/20">
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 space-y-1 mb-6">
        <p className="px-4 text-[10px] font-bold text-zinc-600 mb-2 uppercase tracking-widest">Features</p>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-lg transition-all duration-200 text-sm font-medium group">
          <MessageSquare className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
          AI Chat
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-all duration-200 text-sm font-medium group">
          <Search className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
          Search Chat
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-all duration-200 text-sm font-medium group">
          <Library className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
          Library
        </button>
      </div>

      {/* History Section */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <div>
          <p className="px-4 text-[10px] font-bold text-zinc-600 mb-2 uppercase tracking-widest">Today</p>
          <div className="space-y-0.5">
            <button className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 rounded-lg transition-colors text-xs truncate">
              Refine conversational AI interface
            </button>
            <button className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 rounded-lg transition-colors text-xs truncate">
              Deploy smart intent recognition
            </button>
            <button className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 rounded-lg transition-colors text-xs truncate">
              Optimize chat response latency
            </button>
          </div>
        </div>

        <div>
           <p className="px-4 text-[10px] font-bold text-zinc-600 mb-2 uppercase tracking-widest">Yesterday</p>
          <div className="space-y-0.5">
            <button className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 rounded-lg transition-colors text-xs truncate">
               Tested natural language pipelines
            </button>
            <button className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 rounded-lg transition-colors text-xs truncate">
               Updated user session analytics
            </button>
             <button className="w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 rounded-lg transition-colors text-xs truncate">
               Integrated new data API
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Premium & User */}
      <div className="p-4 bg-black space-y-4 border-t border-zinc-900/50">
        {/* Premium Upgrade Card */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h4 className="text-white font-semibold text-sm mb-1 relative z-10">Unlock Premium</h4>
            <p className="text-zinc-500 text-[11px] mb-3 leading-relaxed relative z-10">
              Experience smarter insights, real-time responses, and advanced tools.
            </p>
            <button className="relative z-10 w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-900/20 hover:shadow-orange-700/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" />
              Upgrade
            </button>
        </div>

        {/* User Profile */}
        <div className="pt-2 flex items-center justify-between group">
          <div className="flex items-center gap-3 cursor-pointer p-2 -ml-2 rounded-xl hover:bg-zinc-900/50 transition-colors w-full max-w-[190px]">
             <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0">
                {user?.image ? (
                  <img src={user.image} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-medium">
                     {user?.name?.[0] || "U"}
                  </div>
                )}
             </div>
             <div className="flex flex-col min-w-0">
                <span className="text-zinc-200 text-sm font-medium leading-none truncate">{user?.name || "User"}</span>
                <span className="text-zinc-500 text-[10px] mt-1 truncate">Free Plan</span>
             </div>
          </div>
          
          <div className="flex items-center">
             <form action={handleSignOut}>
                <button type="submit" className="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-900 hover:shadow-inner" title="Sign Out">
                   <LogOut className="w-4 h-4" />
                </button>
             </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
