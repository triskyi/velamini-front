"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export type AgentRole = "user" | "assistant";

export type AgentMessage = {
  role: AgentRole;
  content: string;
};

export type AgentSessionSummary = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

type SessionsResponse = {
  sessions: AgentSessionSummary[];
  total: number;
};

type HistoryResponse = {
  messages: AgentMessage[];
};

type ChatResponse = {
  reply?: string;
  sessionId?: string;
  error?: string;
};

type UseAgentChatOptions = {
  agentKey: string;
  baseUrl?: string;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export function useAgentChat({ agentKey, baseUrl = "/api/agent" }: UseAgentChatOptions) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const sessionId = useRef<string | undefined>(undefined);

  const headers = useMemo(
    () => ({ "Content-Type": "application/json", "X-Agent-Key": agentKey }),
    [agentKey],
  );

  const resolvedBase = useMemo(() => trimTrailingSlash(baseUrl), [baseUrl]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || loading) return;

      setMessages((prev) => [...prev, { role: "user", content: message }]);
      setLoading(true);

      try {
        const res = await fetch(`${resolvedBase}/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({ message, sessionId: sessionId.current }),
        });

        const data = (await res.json()) as ChatResponse;

        if (!res.ok) {
          throw new Error(data.error || "Request failed");
        }

        if (data.sessionId) {
          sessionId.current = data.sessionId;
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || "Sorry, something went wrong." },
        ]);
      } catch (error) {
        const messageText = error instanceof Error ? error.message : "Network error. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: messageText }]);
      } finally {
        setLoading(false);
      }
    },
    [headers, loading, resolvedBase],
  );

  const submitFeedback = useCallback(
    async (rating: 1 | -1) => {
      if (!sessionId.current) return;

      await fetch(`${resolvedBase}/feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify({ rating, sessionId: sessionId.current }),
      });
    },
    [headers, resolvedBase],
  );

  const loadSessions = useCallback(
    async (page = 1, limit = 20) => {
      const res = await fetch(`${resolvedBase}/sessions?page=${page}&limit=${limit}`, {
        headers: { "X-Agent-Key": agentKey },
      });

      if (!res.ok) {
        throw new Error("Failed to load sessions");
      }

      return (await res.json()) as SessionsResponse;
    },
    [agentKey, resolvedBase],
  );

  const loadHistory = useCallback(
    async (nextSessionId: string) => {
      const res = await fetch(`${resolvedBase}/history?sessionId=${encodeURIComponent(nextSessionId)}`, {
        headers: { "X-Agent-Key": agentKey },
      });

      if (!res.ok) {
        throw new Error("Failed to load history");
      }

      const data = (await res.json()) as HistoryResponse;
      sessionId.current = nextSessionId;
      setMessages(data.messages || []);
      return data.messages || [];
    },
    [agentKey, resolvedBase],
  );

  const clearConversation = useCallback(() => {
    sessionId.current = undefined;
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    sessionId,
    send,
    submitFeedback,
    loadSessions,
    loadHistory,
    clearConversation,
    setMessages,
  };
}
