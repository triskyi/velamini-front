"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot } from "lucide-react";

type Message = {
  id: number;
  text: string;
  isUser: boolean;
};

export default function ChatPanel() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Yes, let's get started.", isUser: true },
    {
      id: 2,
      text: "I've analyzed the quantum data patterns. Shall I proceed with optimization?",
      isUser: false,
    },
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: message,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Fake AI response (placeholder for real API)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Optimization in progress. All systems stable.",
          isUser: false,
        },
      ]);
    }, 700);
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A]">
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mr-3">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Velamini</h3>
              <p className="text-sm text-cyan-400">Online • Realtime</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-green-400/10 border border-green-400/30 rounded-full">
            <span className="text-xs text-green-400">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[70%]">
                <div
                  className={`flex items-start ${
                    msg.isUser ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.isUser
                        ? "ml-3 bg-green-400/20"
                        : "mr-3 bg-cyan-400/20"
                    }`}
                  >
                    {msg.isUser ? (
                      <User className="w-4 h-4 text-green-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>

                  <div>
                    <div
                      className={`px-4 py-3 rounded-2xl border ${
                        msg.isUser
                          ? "bg-green-400/10 border-green-400/30"
                          : "bg-cyan-400/10 border-cyan-400/30"
                      }`}
                    >
                      <p className="text-sm text-white">{msg.text}</p>
                    </div>
                    <div
                      className={`text-xs text-gray-400 mt-1 ${
                        msg.isUser ? "text-right" : ""
                      }`}
                    >
                      {msg.isUser ? "You" : "AI"} • now
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-800/50">
        <div className="relative">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="w-full px-6 py-4 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all"
          />
          <motion.button
            onClick={sendMessage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center"
          >
            <Send className="w-4 h-4 text-white mr-2" />
            <span className="text-sm font-medium text-white">Send</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
