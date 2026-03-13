"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAgentChat } from "@/hooks/useAgentChat";

type AgentChatWidgetProps = {
  agentKey: string;
  agentName?: string;
  baseUrl?: string;
  theme?: "auto" | "light" | "dark";
  greeting?: string;
};

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

  return initials || "AI";
};

export default function AgentChatWidget({
  agentKey,
  agentName = "AI Agent",
  baseUrl = "/api/agent",
  theme = "auto",
  greeting = "Hello! How can I help you today?",
}: AgentChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [autoDark, setAutoDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(prefers-color-scheme: dark)").matches ||
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark"
    );
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, loading, send, setMessages } = useAgentChat({ agentKey, baseUrl });

  const initials = useMemo(() => getInitials(agentName), [agentName]);
  const isDark = useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return autoDark;
  }, [autoDark, theme]);

  useEffect(() => {
    if (theme !== "auto") return;

    const evaluateTheme = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const classDark = document.documentElement.classList.contains("dark");
      const dataTheme = document.documentElement.getAttribute("data-theme") === "dark";
      setAutoDark(prefersDark || classDark || dataTheme);
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const observer = new MutationObserver(evaluateTheme);
    media.addEventListener("change", evaluateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      media.removeEventListener("change", evaluateTheme);
      observer.disconnect();
    };
  }, [theme]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  const onSend = async () => {
    if (!input.trim() || loading) return;
    const message = input;
    setInput("");
    await send(message);
  };

  return (
    <div className="vela-react">
      <button
        type="button"
        className="vela-btn"
        aria-label={`Chat with ${agentName}`}
        onClick={() => {
          const nextIsOpen = !isOpen;
          if (nextIsOpen && messages.length === 0) {
            setMessages([{ role: "assistant", content: greeting }]);
          }
          setIsOpen(nextIsOpen);
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <div
        className={`vela-panel ${isOpen ? "" : "vela-hidden"} ${isDark ? "vd" : "vl"}`}
        role="dialog"
        aria-label={`Chat with ${agentName}`}
      >
        <div className="vela-hd">
          <div className="vela-av">{initials}</div>
          <div className="vela-hd-info">
            <div className="vela-hd-name">{agentName}</div>
            <div className="vela-hd-status">● Online</div>
          </div>
          <button type="button" className="vela-close" aria-label="Close" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <div className="vela-msgs">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div key={`${msg.role}-${index}-${msg.content.slice(0, 16)}`} className={`vela-row ${isUser ? "vela-row-usr" : "vela-row-bot"}`}>
                <div className={isUser ? "vela-bubble-usr" : "vela-bubble-bot"}>{msg.content}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className={`vela-typing ${loading ? "vela-show" : ""}`}>{agentName} is typing…</div>

        <div className="vela-footer">
          <textarea
            className="vela-inp"
            placeholder="Type a message..."
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
          />
          <button type="button" className="vela-send" aria-label="Send" disabled={loading || !input.trim()} onClick={() => void onSend()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

      </div>

      <style jsx>{`
        .vela-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 2147483646;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #0b84c6;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 22px rgba(11, 132, 198, 0.34);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
          outline: none;
          padding: 0;
        }

        .vela-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 30px rgba(11, 132, 198, 0.42);
        }

        .vela-panel {
          position: fixed;
          bottom: 90px;
          right: 24px;
          z-index: 2147483645;
          width: 360px;
          max-width: calc(100vw - 32px);
          height: 520px;
          max-height: calc(100dvh - 110px);
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 64px rgba(0, 0, 0, 0.28);
          transform-origin: bottom right;
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease;
        }

        .vela-hidden {
          transform: scale(0.85) translateY(16px);
          opacity: 0;
          pointer-events: none;
        }

        .vl {
          background: #fff;
          border: 1px solid #e2e8f0;
        }

        .vl .vela-hd {
          background: #0b84c6;
          color: #fff;
        }

        .vl .vela-msgs {
          background: #f3f7fb;
        }

        .vl .vela-footer {
          background: #fff;
          border-top: 1px solid #dce6ef;
        }

        .vl .vela-inp {
          background: #eef4f9;
          color: #0b1e2e;
          border: 1px solid #d3e1ee;
        }

        .vl .vela-bubble-bot {
          background: #fff;
          color: #0b1e2e;
          border: 1px solid #e2e8f0;
        }

        .vl .vela-bubble-usr {
          background: #0b84c6;
          color: #fff;
        }

        .vl .vela-typing {
          color: #557087;
        }

        .vd {
          background: #0e1822;
          border: 1px solid #22384a;
        }

        .vd .vela-hd {
          background: #102133;
          color: #e6f3ff;
          border-bottom: 1px solid #22384a;
        }

        .vd .vela-msgs {
          background: #0c141d;
        }

        .vd .vela-footer {
          background: #0e1822;
          border-top: 1px solid #22384a;
        }

        .vd .vela-inp {
          background: #102133;
          color: #e6f3ff;
          border: 1px solid #2a4458;
        }

        .vd .vela-bubble-bot {
          background: #132637;
          color: #e6f3ff;
          border: 1px solid #284255;
        }

        .vd .vela-bubble-usr {
          background: #14a7ff;
          color: #fff;
        }

        .vd .vela-typing {
          color: #88b0ca;
        }

        .vela-hd {
          padding: 13px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .vela-av {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: 0.04em;
        }

        .vela-hd-info {
          flex: 1;
          min-width: 0;
        }

        .vela-hd-name {
          font-size: 0.84rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }

        .vela-hd-status {
          font-size: 0.63rem;
          opacity: 0.75;
          margin-top: 1px;
        }

        .vela-close {
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.65;
          padding: 4px;
          line-height: 1;
          color: inherit;
          font-size: 18px;
          transition: opacity 0.15s;
          flex-shrink: 0;
        }

        .vela-close:hover {
          opacity: 1;
        }

        .vela-msgs {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          scroll-behavior: smooth;
        }

        .vela-msgs::-webkit-scrollbar {
          width: 3px;
        }

        .vela-msgs::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.3);
          border-radius: 3px;
        }

        .vela-row {
          display: flex;
          max-width: 84%;
        }

        .vela-row-bot {
          align-self: flex-start;
        }

        .vela-row-usr {
          align-self: flex-end;
        }

        .vela-bubble-bot,
        .vela-bubble-usr {
          padding: 9px 13px;
          border-radius: 12px;
          font-size: 0.83rem;
          line-height: 1.55;
          word-break: break-word;
          font-family: inherit;
        }

        .vela-bubble-bot {
          border-bottom-left-radius: 4px;
        }

        .vela-bubble-usr {
          border-bottom-right-radius: 4px;
        }

        .vela-typing {
          font-size: 0.75rem;
          padding: 6px 12px 2px;
          font-style: italic;
          opacity: 0.7;
          display: none;
        }

        .vela-show {
          display: block;
        }

        .vela-footer {
          padding: 10px 12px;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
        }

        .vela-inp {
          flex: 1;
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 0.83rem;
          outline: none;
          resize: none;
          font-family: inherit;
          line-height: 1.45;
          transition: border-color 0.15s;
          min-height: 38px;
          max-height: 96px;
        }

        .vela-inp:focus {
          border-color: #0b84c6 !important;
        }

        .vela-send {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 10px;
          border: none;
          background: #0b84c6;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.15s;
          padding: 0;
        }

        .vela-send:hover {
          opacity: 0.85;
        }

        .vela-send:disabled {
          opacity: 0.4;
          cursor: default;
        }

        @media (max-width: 480px) {
          .vela-panel {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            max-width: 100%;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            max-height: 82dvh;
          }

          .vela-btn {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>
    </div>
  );
}
