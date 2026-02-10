"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send } from "lucide-react";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

const INITIAL_MESSAGE: Message = {
  id: 1,
  role: "ai",
  content: "Hi! How can I help you today?",
};

const SUGGESTIONS = [
  { label: "Optimize React code", prompt: "Help me optimize this React component for performance:" },
  { label: "AI integration ideas", prompt: "Suggest ways to integrate AI into our product roadmap" },
  { label: "Security checklist", prompt: "Give me a security review checklist for a Node.js + React app" },
  { label: "Architecture advice", prompt: "How would you structure a scalable backend for 100k+ users?" },
];

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic – only when near bottom or new AI message
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const isNearBottom =
      Math.abs(node.scrollHeight - node.scrollTop - node.clientHeight) < 120;

    if (isNearBottom || messages[messages.length - 1]?.role === "ai") {
      node.scrollTo({
        top: node.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulated AI response – replace with real API call
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now(),
        role: "ai",
        content:
          "Got your request. Here's my analysis / suggestion / plan… (real answer would appear here)",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1400);
  };

  const handleSuggestion = (prompt: string) => {
    setInput(prompt);
    // You can also auto-send here if preferred:
    // setTimeout(handleSend, 100);
  };

  const showWelcome = messages.length === 1;

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      {/* Minimal header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-semibold">Velamini</h1>
            <p className="text-xs text-zinc-500">AI assistant</p>
          </div>
        </div>
        <div className="text-xs text-emerald-400/80">Online</div>
      </header>

      {/* Main content – messages or welcome */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 pb-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-950"
      >
        {showWelcome ? (
          <div className="flex h-full flex-col items-center justify-center gap-10 px-4 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Ask anything
              </h2>
              <p className="text-lg text-zinc-400 max-w-xl">
                Get help with code, system design, security, AI strategy and more.
              </p>
            </div>

            <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
              {SUGGESTIONS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(item.prompt)}
                  className="group flex flex-col gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition-all hover:border-zinc-700 hover:bg-zinc-900/80 active:opacity-90"
                >
                  <span className="font-medium text-zinc-100 group-hover:text-cyan-300">
                    {item.label}
                  </span>
                  <span className="text-sm text-zinc-500 line-clamp-2">
                    {item.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-7 py-7">
            <AnimatePresence initial={false}>
              {messages.slice(1).map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] ${msg.role === "user" ? "pl-12" : "pr-12"}`}>
                    <div
                      className={`rounded-2xl px-5 py-3.5 text-[15.5px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-cyan-600/20 text-cyan-50"
                          : "bg-zinc-800/70 text-zinc-100"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="mt-1.5 text-xs text-zinc-600">
                      {msg.role === "user" ? "You" : "Velamini"}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 pl-4 pt-5"
                >
                  <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Sparkles size={18} className="text-cyan-400" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]"></div>
                    <div className="h-3 w-3 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]"></div>
                    <div className="h-3 w-3 animate-bounce rounded-full bg-zinc-500"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Larger, more prominent input area – positioned higher with more space above */}
      <footer className="border-t border-zinc-800 bg-zinc-950/90 px-5 pb-8 pt-6 backdrop-blur-md">
        <div className="relative flex items-center rounded-2xl border border-zinc-700/70 bg-zinc-900/75 shadow-inner shadow-black/30">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Velamini anything..."
            className="flex-1 bg-transparent px-7 py-6 text-lg placeholder-zinc-500 focus:outline-none focus:placeholder-zinc-400 caret-cyan-400"
            disabled={isLoading}
            autoFocus
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="mr-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 text-white shadow-lg shadow-cyan-600/20 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
            aria-label="Send message"
          >
            <Send size={24} strokeWidth={2.4} />
          </motion.button>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-600">
          Velamini can make mistakes. Verify critical information.
        </p>
      </footer>
    </div>
  );
}