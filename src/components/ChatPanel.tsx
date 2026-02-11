"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Bot, 
  User, 
  Paperclip, 
  Plus, 
  ArrowUp, 
  Image as ImageIcon, 
  Upload, 
  Monitor, 
  UserPlus,
  Zap,
  Layout,
  Send
} from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi. I'm Virtual Tresor — your personalized AI. Ask me anything about my work, skills, or projects.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const generateAIResponse = (userText: string) => {
    // Focused on Tresor as a personal AI assistant
    const text = userText.toLowerCase();
    
    if (text.includes("hello") || text.includes("hi")) {
      return "Hello! I'm the AI version of Tresor. How can I help you learn more about him today?";
    }

    if (text.includes("who are you")) {
      return "I am Virtual Tresor — a digital extension of Tresor, built to share my background, expertise, and journey.";
    }

    if (text.includes("tresor")) {
      return "Tresor is a visionary developer and creator. I'm here to represent him and answer any questions you have about his work.";
    }

    return "That's an interesting question. As Tresor's AI, I can tell you more about his projects, goals, or technical background. What would you like to know?";
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiReply: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: generateAIResponse(userMessage.content),
      };

      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A] text-white font-sans">
      
      {/* Top Navigation */}
      <div className="w-full flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3">
           <div className="w-14 h-14 rounded-2xl  border border-zinc-800 flex items-center justify-center overflow-hidden p-1">
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
        <button 
          onClick={() => {
            setMessages([{ id: Date.now(), role: "assistant", content: "Hey. I’m Virtual Tresor. Ask me anything about tresor." }]);
            setInput("");
          }}
          className="btn btn-ghost btn-sm text-zinc-500 hover:text-zinc-200 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col items-center px-4 pt-8 pb-16 overflow-hidden relative transition-all duration-700 ${
        messages.length <= 1 ? "justify-center" : "justify-start"
      }`}>
        
        {messages.length <= 1 && !isTyping && (
          <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white px-4">
              What would you like to know about Tresor?
            </h1>
          </div>
        )}

        {/* This spacer helps push everything up slightly when in hero mode */}
        {messages.length <= 1 && <div className="h-20" />}

        <div className={`w-full max-w-3xl flex flex-col transition-all duration-500 ${messages.length > 1 ? "flex-1 justify-end pb-8" : "justify-center"}`}>
          
          {/* Messages List - Only shown when there's interaction */}
          {messages.length > 1 && (
            <div className="flex-1 overflow-y-auto px-2 py-6 space-y-2 scrollbar-hide">
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
                        {isUser ? "You" : "Velamini"}
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
          )}

          {/* Input Area */}
          <div className="relative w-full max-w-3xl mx-auto">
            <div className="relative bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-zinc-700 transition-colors shadow-2xl">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask me anything about Tresor..."
                className="w-full bg-transparent border-none px-4 py-6 text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none min-h-[80px] text-center"
              />
              
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`btn btn-sm btn-square border-none transition-all ${
                    input.trim() 
                      ? "bg-white text-black hover:bg-zinc-200" 
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Suggestions - Only shown in hero state */}
            {messages.length <= 1 && (
              <div className="mt-24 mb-8 flex flex-wrap justify-center gap-5 animate-in fade-in slide-in-from-top-2 duration-1000 delay-200">
                {[
                  { icon: User, label: "Who is Tresor?" },
                  { icon: Layout, label: "Recent Projects" },
                  { icon: Zap, label: "Technical Skills" },
                  { icon: Monitor, label: "Career Journey" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="btn btn-outline btn-md rounded-full border-zinc-800 text-zinc-400 font-medium hover:bg-zinc-900 hover:border-zinc-700 hover:text-white transition-all whitespace-nowrap px-6"
                  >
                    <item.icon className="w-5 h-5 text-zinc-500" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
