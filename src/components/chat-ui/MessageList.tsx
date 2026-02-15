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
  assistantName?: string;
  assistantImage?: string | null;
  assistantFooterText?: string;
}

// Helper to auto-linkify URLs
const renderWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline break-words"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function MessageList({ 
  messages, 
  isTyping, 
  bottomRef,
  assistantName = "Tresor",
  assistantImage,
  assistantFooterText
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 px-2 sm:px-4 py-4 sm:py-6 space-y-4">
      <AnimatePresence>
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const userPrompt = (!isUser && prevMsg?.role === "user") ? prevMsg.content : "";

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`chat min-w-0 w-full ${isUser ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar hidden sm:flex">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                  isUser ? "bg-slate-200 dark:bg-slate-700" : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5"
                }`}>
                  {isUser ? (
                    <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  ) : assistantImage ? (
                    <img 
                      src={assistantImage} 
                      alt={assistantName} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
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
              <div className="chat-header text-slate-500 dark:text-slate-400 text-xs mb-1 px-1">
                {isUser ? "You" : assistantName}
                <time className="ml-2 opacity-50">
                  {new Date(msg.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <div className={`chat-bubble max-w-[85%] sm:max-w-[70%] min-w-0 py-2.5 px-4 text-[14px] sm:text-[15px] rounded-2xl overflow-hidden break-words ${
                isUser 
                  ? "bg-teal-500 text-white" 
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              }`}>
                <span className="break-words block">{renderWithLinks(msg.content)}</span>
                
              
              </div>
              <div className="chat-footer opacity-40 text-[10px] mt-1">
                {isUser ? "Delivered" : (assistantFooterText || `Virtual ${assistantName}`)}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {isTyping && (
        <div className="chat chat-start">
          <div className="chat-image avatar hidden sm:flex">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
              {assistantImage ? (
                <img 
                  src={assistantImage} 
                  alt={assistantName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
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
          <div className="chat-bubble bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center py-2 px-4 rounded-2xl">
            <span className="loading loading-dots loading-sm text-teal-500"></span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
