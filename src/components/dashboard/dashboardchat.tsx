"use client";

import { useState, useRef, useEffect } from "react";
import HeroSection from "../chat-ui/HeroSection";
import MessageList from "../chat-ui/MessageList";
import ChatInput from "../chat-ui/ChatInput";
import FeedbackModal from "../chat-ui/FeedbackModal";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

interface DashboardChatProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function DashboardChat({ user }: DashboardChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("velamini_dashboard_chat_history");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("velamini_dashboard_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Send last 6 messages context + new message
      const contextMessages = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: contextMessages 
        }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: data.text || data.error || "Error: Something went wrong." },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "I'm having trouble connecting right now." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">

      {messages.length === 0 && !isTyping && (
        <HeroSection text="Chat with Your Virtual Self" />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center overflow-hidden">
        
        {/* Messages Area */}
        <div className="flex-1 w-full overflow-y-auto px-4 pt-6 sm:pt-8">
          {messages.length > 0 && (
            <MessageList 
              messages={messages} 
              isTyping={isTyping} 
              bottomRef={bottomRef}
              assistantName={user?.name || "Virtual me"}
              assistantImage={user?.image}
              assistantFooterText="Velamini"
            />
          )}
        </div>

        {/* Centered Chat Input at Bottom */}
        <div className="w-full flex justify-center pb-6 px-4 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent pt-8">
          <div className="w-full max-w-4xl">
            <ChatInput 
              input={input} 
              setInput={setInput} 
              sendMessage={sendMessage} 
            />
          </div>
        </div>
      </div>

      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        rating={rating}
        setRating={setRating}
        feedbackText={feedbackText}
        setFeedbackText={setFeedbackText}
      />
    </div>
  );
}
