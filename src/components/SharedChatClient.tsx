"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import HeroSection from "./chat-ui/HeroSection";
import MessageList from "./chat-ui/MessageList";


type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

interface SharedChatClientProps {
  virtualSelf: {
    id: string;
    name: string;
    image?: string | null;
    slug: string;
  };
}

export default function SharedChatClient({ virtualSelf }: SharedChatClientProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Debug: Log the image URL
  useEffect(() => {
    console.log("Virtual Self Image URL:", virtualSelf.image);
    console.log("Virtual Self Data:", virtualSelf);
  }, [virtualSelf]);

  // Load messages and visitor name from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(`shared_chat_${virtualSelf.slug}`);
    const savedName = localStorage.getItem(`shared_chat_name_${virtualSelf.slug}`);
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    
    if (savedName) {
      setVisitorName(savedName);
    }
  }, [virtualSelf.slug]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`shared_chat_${virtualSelf.slug}`, JSON.stringify(messages));
    }
  }, [messages, virtualSelf.slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Extract visitor name from messages if they introduce themselves
  useEffect(() => {
    if (!visitorName && messages.length > 0) {
      // Simple pattern matching for name introduction
      const lastUserMessage = messages.filter(m => m.role === "user").slice(-1)[0];
      if (lastUserMessage) {
        const content = lastUserMessage.content.toLowerCase();
        // Patterns: "my name is...", "i'm...", "i am...", "call me..."
        const namePatterns = [
          /my name is ([a-z]+)/i,
          /i'm ([a-z]+)/i,
          /i am ([a-z]+)/i,
          /call me ([a-z]+)/i,
          /this is ([a-z]+)/i
        ];
        
        for (const pattern of namePatterns) {
          const match = content.match(pattern);
          if (match && match[1] && match[1].length > 1) {
            const name = match[1].charAt(0).toUpperCase() + match[1].slice(1);
            setVisitorName(name);
            localStorage.setItem(`shared_chat_name_${virtualSelf.slug}`, name);
            console.log("Extracted visitor name:", name);
            break;
          }
        }
      }
    }
  }, [messages, visitorName, virtualSelf.slug]);

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
      const contextMessages = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch("/api/chat/shared", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: contextMessages,
          virtualSelfId: virtualSelf.id,
          visitorName: visitorName, // Pass visitor name to AI
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

  return (
    <div className="h-screen w-full bg-whitesmoke flex flex-col bg-[#0A0A0A] text-white font-sans overflow-hidden">
      {/* Shared Chat Navbar */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center px-4 py-4 sm:px-8 sm:py-6 gap-4 sm:gap-0 border-b border-zinc-800/50">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Home</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-zinc-800 flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-500">
            {virtualSelf.image && !imageError ? (
              <img 
                src={virtualSelf.image} 
                alt={virtualSelf.name} 
                className="w-full h-full object-cover"
                onError={() => {
                  console.error("Failed to load image:", virtualSelf.image);
                  setImageError(true);
                }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {virtualSelf.name[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="font-semibold text-zinc-100 text-sm sm:text-base">
              {virtualSelf.name}'s Virtual Self
            </h1>
            <p className="text-xs text-zinc-500">AI-powered assistant</p>
          </div>
        </div>
        
        <div className="w-16 hidden sm:block"></div>
      </div>

      {/* Hero Section when no messages */}
      {messages.length === 0 && !isTyping && (
        <HeroSection text={`Chat with ${virtualSelf.name}`} />
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
              assistantName={virtualSelf.name}
              assistantImage={virtualSelf.image}
              assistantFooterText={`${virtualSelf.name}'s Virtual Self`}
            />
          )}

          <ChatInput 
            input={input} 
            setInput={setInput} 
            onSend={sendMessage} 
            placeholder={`Type your message to ${virtualSelf.name}...`}
          />
        </div>

        {/* Bottom Spacer - Pushes content up in hero state */}
        {messages.length === 0 && <div className="h-24" />}
      </div>
    </div>
  );
}

// Inline ChatInput component (move outside main component)
function ChatInput({ input, setInput, onSend, placeholder }: { input: string; setInput: React.Dispatch<React.SetStateAction<string>>; onSend: () => void | Promise<void>; placeholder?: string }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  return (
    <div className="flex w-full gap-2 items-center mt-4">
      <div className="flex-1 flex items-center bg-zinc-800/80 rounded-xl px-4 py-3 shadow-md border border-transparent focus-within:ring-2 focus-within:ring-purple-500/70">
        <input
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none text-lg font-medium"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type a message..."}
          autoFocus
        />
        <button
          className="ml-2 p-2 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all border-none outline-none"
          onClick={onSend}
          disabled={!input.trim()}
          aria-label="Send"
          type="button"
        >
          <PaperPlaneIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
      