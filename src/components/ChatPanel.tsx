"use client";

import { useState, useRef, useEffect } from "react";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { VELAMINI_KB } from "../lib/Knowledge/velamini-kb";
import { VIRTUAL_TRESOR_SYSTEM_PROMPT } from "../lib/ai-config";
import ChatNavbar from "./chat-ui/ChatNavbar";
import MessageList from "./chat-ui/MessageList";
import FeedbackModal from "./chat-ui/FeedbackModal";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type ChatInputProps = {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => Promise<void> | void;
  placeholder?: string;
};

function ChatInput({ input, setInput, onSend, placeholder }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex w-full gap-3 items-center p-4 sm:p-6 bg-zinc-900 rounded-lg shadow-lg border border-zinc-800">
      <input
        className="flex-1 px-4 py-4 sm:px-8 sm:py-6 bg-transparent text-zinc-100 placeholder-zinc-400 border-none focus:outline-none focus:ring-2 focus:ring-cyan-500/60 rounded-md text-lg sm:text-2xl transition"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type a message..."}
        autoFocus
      />
      <button
        className="flex items-center justify-center p-4 sm:p-5 text-cyan-500 rounded-md bg-transparent hover:bg-transparent focus:bg-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-cyan-400"
        onClick={onSend}
        disabled={!input.trim()}
        aria-label="Send message"
      >
        <PaperPlaneIcon className="w-7 h-7 sm:w-8 sm:h-8" />
      </button>
    </div>
  );
}

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Optional: if you still want rating & text in parent (or move to modal internal state)
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    try {
      const saved = localStorage.getItem("velamini_chat_history");
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  }, []);

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("velamini_chat_history", JSON.stringify(messages));
    } else {
      localStorage.removeItem("velamini_chat_history");
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      let recentHistory = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // If there is no chat history, preload knowledge and system prompt for backend use
      let useDefaultKnowledge = false;
      if (messages.length === 0) {
        useDefaultKnowledge = true;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: recentHistory,
          useLocalKnowledge: true,
          defaultKnowledge: useDefaultKnowledge ? VELAMINI_KB : undefined,
          systemPrompt: useDefaultKnowledge ? VIRTUAL_TRESOR_SYSTEM_PROMPT : undefined,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.text ?? data.error ?? "Sorry, something went wrong.",
        },
      ]);
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "I'm having connection issues right now…",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    localStorage.removeItem("velamini_chat_history");
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-whitesmoke text-gray-100 font-sans overflow-hidden">
      <ChatNavbar
        onShowFeedback={() => setShowFeedbackModal(true)}
        onNewChat={handleNewChat}
      />

      {/* No longer show HeroSection if messages are empty, since we now show a default assistant message */}
      {/* {messages.length === 0 && !isTyping && <HeroSection text="Reka ture ibyaribyo" />} */}

      <div
        className={`flex-1 flex flex-col items-center px-1 sm:px-4 pt-3 sm:pt-6 pb-24 sm:pb-20 overflow-y-auto ${
          messages.length === 0 ? "justify-center" : "justify-start"
        }`}
      >
        <div className="w-full max-w-full sm:max-w-3xl mx-auto flex flex-col min-h-full">
          {messages.length > 0 && (
            <MessageList
              messages={messages}
              isTyping={isTyping}
              bottomRef={bottomRef}
            />
          )}

          {/* Input in the middle if new chat */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="w-full max-w-xl mx-auto">
                <ChatInput
                  input={input}
                  setInput={setInput}
                  onSend={sendMessage}
                  placeholder="Ask anything..."
                />
              </div>
            </div>
          ) : (
            <div className="sticky bottom-0 pt-4 pb-6 bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent">
              <ChatInput
                input={input}
                setInput={setInput}
                onSend={sendMessage}
                placeholder="Ask anything..."
              />
            </div>
          )}
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