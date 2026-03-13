import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "React Chat Hook Guide | Velamini Docs",
  description: "Build the same Velamini chat widget UI in React using the public /api/agent endpoints.",
};

export default function DocsEmbedPage() {
  return (
    <InfoPage
      eyebrow="Documentation"
      title="React Chat Hook Guide"
      description="Use useAgentChat + AgentChatWidget for a custom React chat UI with the same behavior as the embed widget."
      updatedAt="March 10, 2026"
      sections={[
        {
          title: "1) Required endpoints",
          paragraphs: [
            "Your integration should call only these endpoints: POST /api/agent/chat, GET /api/agent/sessions, GET /api/agent/history, POST /api/agent/feedback.",
            "Every request must include X-Agent-Key. In React, read it from NEXT_PUBLIC_AGENT_KEY for client-side widget usage.",
          ],
        },
        {
          title: "2) useAgentChat hook",
          paragraphs: [
            "Create src/hooks/useAgentChat.ts with messages, loading, send(message), submitFeedback(rating), loadSessions(page), and loadHistory(sessionId).",
            "send() should append the user message, POST to /api/agent/chat with the current sessionId, then append data.reply and store data.sessionId.",
          ],
        },
        {
          title: "3) Widget component",
          paragraphs: [
            "Create a client component (for example src/components/chat-ui/AgentChatWidget.tsx) and connect its launcher, panel, message list, typing state, and input to useAgentChat.",
            "Match the embed behavior: floating launcher, open/close panel, Enter-to-send, Shift+Enter newline, mobile full-width drawer, and session continuity.",
          ],
        },
        {
          title: "4) Page usage",
          paragraphs: [
            "Import AgentChatWidget in any client page and pass agentKey, agentName, baseUrl='/api/agent', and theme='auto'.",
            "Use this approach when you need full React control over UI while keeping the same backend API contract as the embed script.",
          ],
        },
      ]}
      primaryCta={{ label: "Back to Docs", href: "/docs" }}
      hideFooter
    />
  );
}
