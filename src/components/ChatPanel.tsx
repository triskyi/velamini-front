"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  User, 
  Plus, 
  ArrowUp, 
  MessageSquare,
  X
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"positive" | "negative" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);

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

  const text = "Feel lonely chat with me";
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 200,
      },
    },
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
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowFeedbackModal(true)}
            className="btn btn-ghost btn-sm text-zinc-500 hover:text-cyan-400 gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Feedback
          </button>
          <div className="w-px h-6 bg-zinc-800 mx-1" />
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
      </div>

      {messages.length <= 1 && !isTyping && (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="visible"
          className="mt-[15vh] text-center px-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight flex flex-wrap justify-center gap-x-[0.2em]">
            {text.split(" ").map((word, index) => (
              <span key={index} className="inline-block whitespace-nowrap">
                {word.split("").map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    variants={child}
                    className="inline-block text-[#00f3ff] drop-shadow-[0_0_10px_rgba(0,243,255,0.7)]"
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col items-center px-4 pt-8 pb-16 overflow-hidden relative transition-all duration-700 ${
        messages.length <= 1 ? "justify-center" : "justify-start"
      }`}>
        
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
          </div>
        </div>

        {/* Bottom Spacer - Pushes content up in hero state */}
        {messages.length <= 1 && <div className="h-24" />}
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="modal modal-open px-4 py-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-box bg-base-200 shadow-2xl"
            >
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">Help us improve</h3>
                  <p className="opacity-60 text-[15px]">How was your experience talking with Virtual Tresor?</p>
                </div>
                
                {/* Emoji Rating */}
                <div className="flex justify-between gap-3">
            {[
              { emoji: "🤩", value: 5 },
              { emoji: "🙂", value: 4 },
              { emoji: "😐", value: 3 },
              { emoji: "☹️", value: 2 },
              { emoji: "😭", value: 1 },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setRating(item.value)}
                className={`btn btn-circle text-2xl transition-all duration-200 ${
                  rating === item.value
                    ? "btn-primary scale-110"
                    : "btn-ghost"
                }`}
              >
                {item.emoji}
              </button>
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-base-content/50 uppercase tracking-wider">
            <span>Satisfied</span>
            <span>Dissatisfied</span>
          </div>

          {/* Textarea */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">
                Additional feedback
              </span>
              <span className="label-text-alt">(optional)</span>
            </label>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Briefly explain what happened..."
              className="textarea textarea-bordered w-full min-h-[140px]"
            />
          </div>

          {/* Submit */}
          <div className="modal-action mt-4">
            <button
              disabled={rating === 0}
              onClick={() => {
                setShowFeedbackModal(false);
                setFeedbackText("");
                setRating(0);
              }}
              className="btn btn-primary w-full"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </motion.div>

      {/* Backdrop close */}
      <div
        className="modal-backdrop"
        onClick={() => setShowFeedbackModal(false)}
      />
    </div>
  )}
</AnimatePresence>

    </div>
  );
}
