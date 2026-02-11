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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi. I'm Virtual Tresor — your personalized AI. Ask me anything about my work, skills, or projects.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
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

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A] text-white font-sans overflow-hidden">
      
      <ChatNavbar 
        currentView={currentView}
        onShowFeedback={() => setShowFeedbackModal(true)} 
        onShowTraining={() => setCurrentView(prev => prev === 'chat' ? 'training' : 'chat')}
        onNewChat={() => {
          setMessages([{ id: Date.now(), role: "assistant", content: "Hey. I’m Virtual Tresor. Ask me anything about tresor." }]);
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
          {messages.length <= 1 && !isTyping && (
            <HeroSection text="Feel lonely chat with me" />
          )}

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col items-center px-4 pt-8 pb-16 overflow-hidden relative transition-all duration-700 ${
            messages.length <= 1 ? "justify-center" : "justify-start"
          }`}>
            
            <div className={`w-full max-w-3xl flex flex-col transition-all duration-500 ${messages.length > 1 ? "flex-1 justify-end pb-8" : "justify-center"}`}>
              
              {messages.length > 1 && (
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
            {messages.length <= 1 && <div className="h-24" />}
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
