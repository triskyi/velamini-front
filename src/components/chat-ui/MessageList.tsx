"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { User } from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageList({ messages, isTyping, bottomRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-2 py-6 space-y-2 scrollbar-thumb-zinc-800 scrollbar-track-transparent">
      <AnimatePresence>
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`chat ${isUser ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                  isUser ? "bg-zinc-800" : "bg-zinc-900 border border-zinc-800 p-0.5"
                }`}>
                  {isUser ? (
                    <User className="w-5 h-5 text-zinc-400" />
                  ) : (
                    <Image 
                      src="/logo.png" 
                      alt="V" 
                      width={40} 
                      height={40} 
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
              <div className="chat-header text-zinc-500 text-xs mb-1 px-1">
                {isUser ? "You" : "Tresor"}
                <time className="ml-2 opacity-50">
                  {new Date(msg.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <div className={`chat-bubble py-2.5 px-4 text-[15px] selection:bg-cyan-500/30 ${
                isUser 
                  ? "bg-zinc-800 text-zinc-100" 
                  : "bg-zinc-900 border border-zinc-800 text-zinc-200"
              }`}>
                {msg.content}
              </div>
              <div className="chat-footer opacity-40 text-[10px] mt-1">
                {isUser ? "Delivered" : "Virtual Tresor"}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {isTyping && (
        <div className="chat chat-start">
          <div className="chat-image avatar">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
              <Image 
                src="/logo.png" 
                alt="V" 
                width={40} 
                height={40} 
                className="object-contain"
              />
            </div>
          </div>
          <div className="chat-bubble bg-zinc-900 border border-zinc-800 flex items-center py-2 px-4 shadow-none">
            <span className="loading loading-dots loading-sm text-zinc-600"></span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
