'use client';
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, AlertCircle, RefreshCw } from "lucide-react";
import FeedbackModal from "@/components/chat-ui/FeedbackModal";
import ChatNavbar from "@/components/chat-ui/ChatNavbar";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Defined OUTSIDE the page so React never unmounts it on re-render
interface ChatInputProps {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  isTyping: boolean;
  placeholder?: string;
}
function ChatInput({ input, setInput, onSend, isTyping, placeholder }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  const isDisabled = !input.trim() || isTyping;
  return (
    <div className="flex w-full gap-2 sm:gap-3 items-end p-3 bg-base-200 rounded-xl border border-base-300 focus-within:border-primary transition-all">
      <div className="flex-1">
        <textarea
          className="w-full px-2 sm:px-3 py-2 bg-transparent text-base-content placeholder-base-content/50 border-none outline-none resize-none min-h-[40px] max-h-36 text-sm sm:text-base leading-relaxed"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type a message...'}
          rows={1}
        />
      </div>
      <button
        className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
          isDisabled ? 'bg-base-300 text-base-content/40 cursor-not-allowed' : 'bg-primary text-primary-content hover:bg-primary/90'
        }`}
        onClick={onSend}
        disabled={isDisabled}
        aria-label="Send message"
      >
        {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function SharedChatPage({ params }: PageProps) {
  // Get slug from params (App Router)
  const [slug, setSlug] = useState<string>("");
  useEffect(() => {
    (async () => {
      if (params && typeof params.then === "function") {
        const resolved = await params;
        setSlug(resolved.slug);
      } else if (params && typeof params === "object" && "slug" in params) {
        setSlug(typeof params.slug === "string" ? params.slug : "");
      }
    })();
  }, [params]);

  // State for virtual self info
  const [virtualSelf, setVirtualSelf] = useState<{ name: string; image?: string; userId?: string } | null>(null);
  // Store resolved userId for chat API
  const [virtualSelfId, setVirtualSelfId] = useState<string | null>(null);
  // Q&A pairs for this virtual self
  const [qaPairs, setQaPairs] = useState<Array<{ question: string; answer: string }>>([]);

  // Fetch userId and virtual self info with proper loading states
  useEffect(() => {
    if (!slug) return;
    
    setIsLoading(true);
    setError(null);
    
    const fetchVirtualSelf = async () => {
      try {
        const res = await fetch(`/api/swag/resolve?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error('Failed to load virtual self');
        
        const data = await res.json();
        if (data && data.userId) {
          setVirtualSelfId(data.userId);
          setVirtualSelf({ name: data.name, image: data.image });
          
          // Fetch Q&A pairs
          const qaRes = await fetch(`/api/knowledgebase/qa?userId=${data.userId}`);
          if (qaRes.ok) {
            const qaData = await qaRes.json();
            setQaPairs(Array.isArray(qaData.qaPairs) ? qaData.qaPairs : []);
          }
        } else {
          throw new Error('Virtual self not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setVirtualSelfId(null);
        setVirtualSelf(null);
        setQaPairs([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVirtualSelf();
  }, [slug]);

  // Chat state and logic with enhanced UX states
  const [input, setInput] = useState("");
  type Message = {
    id: number;
    role: "user" | "assistant";
    content: string;
    status?: "sending" | "sent" | "failed";
    timestamp?: Date;
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<Message | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Theme toggle functionality
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    const shouldBeDark = theme === 'dark' || (!theme && prefersDark);
    setIsDarkMode(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`velamini_chat_history_${slug}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  }, [slug]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`velamini_chat_history_${slug}`, JSON.stringify(messages));
    } else {
      localStorage.removeItem(`velamini_chat_history_${slug}`);
    }
  }, [messages, slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (messageToRetry?: Message) => {
    const messageContent = messageToRetry?.content || input.trim();
    if (!messageContent) return;

    const userMessage: Message = messageToRetry || {
      id: Date.now(),
      role: "user",
      content: messageContent,
      status: "sending",
      timestamp: new Date(),
    };

    if (!messageToRetry) {
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
    } else {
      // Update retry message status
      setMessages((prev) => 
        prev.map(m => m.id === messageToRetry.id ? { ...m, status: "sending" } : m)
      );
    }
    
    setIsTyping(true);
    setRetryMessage(null);

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

      // Wait for virtualSelfId to be resolved
      if (!virtualSelfId) {
        setMessages((prev) => 
          prev.map(m => m.id === userMessage.id ? { ...m, status: "failed" } : m)
        );
        setRetryMessage(userMessage);
        setIsTyping(false);
        return;
      }

      // Inject Q&A pairs into the context/system prompt for the AI
      let qaContext = "";
      if (qaPairs.length > 0) {
        qaContext = '\n\nUSER Q&A MEMORY (Recall these answers if asked similar questions):\n' + qaPairs.map(q => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n");
      }

      const res = await fetch("/api/chat/shared", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: recentHistory,
          virtualSelfId: virtualSelfId,
          qaContext,
        }),
      });

      const data = await res.json();

      // Mark user message as sent
      setMessages((prev) => 
        prev.map(m => m.id === userMessage.id ? { ...m, status: "sent" } : m)
      );
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.text ?? data.error ?? "Sorry, something went wrong.",
          timestamp: new Date(),
        } as Message,
      ]);
    } catch (err) {
      console.error("Chat request failed:", err);
      // Mark user message as failed
      setMessages((prev) => 
        prev.map(m => m.id === userMessage.id ? { ...m, status: "failed" } : m)
      );
      setRetryMessage(userMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    localStorage.removeItem(`velamini_chat_history_${slug}`);
    setInput("");
  };



  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-base-100 overflow-hidden">
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4 p-6 sm:p-8 bg-base-200 rounded-2xl border border-base-300 shadow-xl mx-4">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium text-sm sm:text-base">Loading virtual self...</p>
                <p className="text-base-content/60 text-xs sm:text-sm mt-1">Preparing your conversation</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error State */}
      <AnimatePresence>
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-base-100/80 backdrop-blur-sm p-4"
          >
            <div className="flex flex-col items-center gap-4 p-6 sm:p-8 bg-base-200 rounded-2xl border border-error/30 shadow-xl max-w-sm sm:max-w-md w-full">
              <div className="p-3 bg-error/10 rounded-full">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-error" />
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold text-base-content mb-2">Connection Error</h3>
                <p className="text-base-content/70 mb-4 text-sm sm:text-base">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary btn-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatNavbar
        onShowFeedback={() => setShowFeedbackModal(true)}
        onNewChat={handleNewChat}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            /* ── WELCOME SCREEN ── */
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 overflow-y-auto"
            >
              {!isLoading && !error && virtualSelf && (
                <div className="w-full max-w-xl flex flex-col items-center text-center">
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="relative mb-5"
                  >
                    <img
                      src={virtualSelf.image || "/logo.png"}
                      alt={virtualSelf.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-base-300 shadow-lg bg-base-100"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-base-100" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl sm:text-2xl font-semibold text-base-content mb-1"
                  >
                    {virtualSelf.name}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-base-content/60 text-sm mb-6"
                  >
                    Start a conversation
                  </motion.p>

                  {/* Chat input on welcome screen */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full"
                  >
                    <ChatInput
                      input={input}
                      setInput={setInput}
                      onSend={sendMessage}
                      isTyping={isTyping}
                      placeholder={`Message ${virtualSelf.name}…`}
                    />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ) : (
            /* ── CONVERSATION VIEW ── */
            <motion.div
              key="conversation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Scrollable message list */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col items-center">
                <div className="w-full max-w-xl flex flex-col gap-3 sm:gap-4 pb-2">
                  {messages.map((msg) => {
                    const isCurrentUser = msg.role === "user";
                    const avatar = isCurrentUser ? "/logo.png" : (virtualSelf?.image || "/logo.png");
                    const name = isCurrentUser ? "You" : (virtualSelf?.name || "Virtual Self");
                    const time = msg.timestamp
                      ? msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : new Date(msg.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className={`chat ${isCurrentUser ? "chat-end" : "chat-start"}`}
                      >
                        <div className="chat-image avatar">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full">
                            <img alt={`${name} avatar`} src={avatar} className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="chat-header">
                          <span className="text-xs text-base-content/60">{name}</span>
                          <time className="text-xs text-base-content/40 ml-2">{time}</time>
                        </div>
                        <div className={`chat-bubble text-sm ${
                          isCurrentUser ? "chat-bubble-primary" : "chat-bubble-accent"
                        }`}>
                          {msg.content}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Typing indicator — three bouncing dots */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="chat chat-start"
                      >
                        <div className="chat-image avatar">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full">
                            <img alt="avatar" src={virtualSelf?.image || "/logo.png"} />
                          </div>
                        </div>
                        <div className="chat-bubble chat-bubble-accent">
                          <span className="flex items-center gap-1 h-4">
                            {[0, 1, 2].map((i) => (
                              <motion.span
                                key={i}
                                className="block w-2 h-2 rounded-full bg-current"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                              />
                            ))}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={bottomRef} />
                </div>
              </div>

              {/* Fixed bottom input bar */}
              <div className="border-t border-base-200 bg-base-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-center">
                <div className="w-full max-w-xl">
                  <ChatInput
                    input={input}
                    setInput={setInput}
                    onSend={sendMessage}
                    isTyping={isTyping}
                    placeholder={virtualSelf ? `Message ${virtualSelf.name}…` : "Type a message…"}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
};
