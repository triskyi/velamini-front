"use client";

import { useState, useRef, useEffect } from "react";
import ChatNavbar from "./chat-ui/ChatNavbar";
import HeroSection from "./chat-ui/HeroSection";
import MessageList from "./chat-ui/MessageList";
import ChatInput from "./chat-ui/ChatInput";
import FeedbackModal from "./chat-ui/FeedbackModal";
import TrainingPage from "@/app/pages/TrainingPage";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPanel() {
  const [currentView, setCurrentView] = useState<'chat' | 'training'>('chat');
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);

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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
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

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A] text-white font-sans overflow-hidden">
      
      <ChatNavbar 
        currentView={currentView}
        onShowFeedback={() => setShowFeedbackModal(true)} 
        onShowTraining={() => setCurrentView(prev => prev === 'chat' ? 'training' : 'chat')}
        onNewChat={() => {
          setMessages([]);
          setInput("");
          setCurrentView('chat');
        }}
      />

      {currentView === 'training' ? (
        <div className="flex-1 overflow-hidden">
          <TrainingPage />
        </div>
      ) : (
        <>
          {messages.length === 0 && !isTyping && (
            <HeroSection text="Chat with my digital self" />
          )}

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col items-center px-4 pt-8 pb-16 overflow-hidden relative transition-all duration-700 ${
            messages.length === 0 ? "justify-center" : "justify-start"
          }`}>
            
            <div className={`w-full max-w-3xl flex flex-col h-full transition-all duration-500 ${messages.length > 0 ? "flex-1 pb-8" : "justify-center"}`}>
              
              {messages.length > 0 && (
                <MessageList 
                  messages={messages} 
                  isTyping={isTyping} 
                  bottomRef={bottomRef} 
                />
              )}

              <ChatInput 
                input={input} 
                setInput={setInput} 
                sendMessage={sendMessage} 
              />
            </div>

            {/* Bottom Spacer - Pushes content up in hero state */}
            {messages.length === 0 && <div className="h-24" />}
          </div>
        </>
      )}

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
