'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const DEMO_AGENT_KEY = "vela_3cac6117f64540c5ba9e053d4861a182";

const GREETING = "Hello! I'm a demo AI agent. Ask me anything about Coodic!";

export default function LandingDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages - instant, no animation
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message to demo agent
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    const userMessage = { role: "user" as const, content: text };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Agent-Key": DEMO_AGENT_KEY,
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble responding right now. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section style={{
      padding: "6rem 0 4rem",
      background: "linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%)",
    }}>
      <div className="wrap" style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 20,
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            color: "var(--accent)",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            <Sparkles size={12} />
            Try It Live
          </div>
          
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1rem",
            color: "var(--fg)",
          }}>
            Chat with our <span style={{ color: "var(--accent)", fontStyle: "italic" }}>AI Demo</span>
          </h2>
          
          <p style={{
            fontSize: "1rem",
            color: "var(--muted)",
            maxWidth: 500,
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Experience Coodic&apos;s AI agent in action. No signup required — just ask!
          </p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: "var(--bg-card)",
            borderRadius: 24,
            border: "1px solid var(--border2)",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          {/* Chat Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg2)",
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--accent), #7DD3FC)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Bot size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--fg)" }}>
                coodic Demo Agent

              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "inline-block",
                }} />
                Online • Try it now
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            style={{
              height: 360,
              overflowY: "auto",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.length === 0 && (
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted)",
                textAlign: "center",
                gap: 12,
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <MessageSquare size={28} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 }}>
                    {GREETING}
                  </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    Try: &quot;When  is coodic founded?&quot; ;
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.role === "assistant" && (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      <Bot size={14} color="#fff" />
                    </div>
                  )}
                  
                  <div style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: 16,
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                    background: msg.role === "user" 
                      ? "var(--accent)" 
                      : "color-mix(in srgb, var(--accent) 12%, transparent)",
                    color: msg.role === "user" ? "#fff" : "var(--fg)",
                    border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                  }}>
                    {msg.content}
                  </div>

                  {msg.role === "user" && (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "var(--bg2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                      border: "1px solid var(--border)",
                    }}>
                      <User size={14} style={{ color: "var(--muted)" }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Bot size={14} color="#fff" />
                </div>
                <div style={{
                  padding: "12px 16px",
                  borderRadius: 16,
                  background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                  border: "1px solid var(--border)",
                }}>
                  <Loader2 size={16} style={{ 
                    color: "var(--accent)", 
                    animation: "spin 1s linear infinite",
                  }} />
                </div>
              </motion.div>
            )}

            {error && (
              <div style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "color-mix(in srgb, #EF4444 12%, transparent)",
                border: "1px solid color-mix(in srgb, #EF4444 30%, transparent)",
                color: "#EF4444",
                fontSize: "0.8rem",
              }}>
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: "0.9rem",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "none",
                background: input.trim() ? "var(--accent)" : "var(--border)",
                color: input.trim() ? "#fff" : "var(--muted)",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "var(--muted)",
            fontSize: "0.85rem",
          }}
        >
          Ready to create your own AI agent?{" "}
          <a
            href="/onboarding"
            style={{
              color: "var(--accent)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Get started free →
          </a>
        </motion.div>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
