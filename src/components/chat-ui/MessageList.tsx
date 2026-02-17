// HeroUI Imports
import { Card, Spinner } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { User as UserIcon } from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  assistantName?: string;
  assistantImage?: string | null;
  assistantFooterText?: string;
}

// Helper to auto-linkify URLs
const renderWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all transition-colors"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function MessageList({
  messages,
  isTyping,
  bottomRef,
  assistantName = "Tresor",
  assistantImage,
  assistantFooterText
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full px-2 sm:px-4 py-4 sm:py-6 space-y-6">
      <AnimatePresence>
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex w-full ${isUser ? "justify-end" : "justify-start"} gap-3`}
            >
              {!isUser && (
                <div className="flex-shrink-0 mt-1 hidden sm:block">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-default-200 bg-default-100 flex items-center justify-center">
                    {assistantImage ? (
                      <img src={assistantImage} alt={assistantName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-default-500">{assistantName.charAt(0)}</span>
                    )}
                  </div>
                </div>
              )}

              <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-tiny text-default-500 font-medium">
                    {isUser ? "You" : assistantName}
                  </span>
                  <span className="text-tiny text-default-400">
                    {new Date(msg.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <Card
                  className={`border-none shadow-sm ${isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-content2 dark:bg-content1 text-foreground"
                    }`}
                >
                  <div className="p-3 sm:p-4 text-small sm:text-medium overflow-hidden break-words">
                    {isUser ? (
                      <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="break-words whitespace-pre-wrap leading-relaxed">
                        {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                          part.match(/(https?:\/\/[^\s]+)/g) ? (
                            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-current underline decoration-solid decoration-1 break-all hover:text-primary-foreground/80">{part}</a>
                          ) : part
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {!isUser && assistantFooterText && (
                  <span className="text-tiny text-default-400 mt-1 px-1">
                    {assistantFooterText}
                  </span>
                )}
              </div>

              {isUser && (
                <div className="flex-shrink-0 mt-1 hidden sm:block">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-default-200 bg-default-100 flex items-center justify-center text-default-500">
                    <UserIcon size={16} />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {isTyping && (
        <div className="flex w-full justify-start gap-3">
          <div className="flex-shrink-0 mt-1 hidden sm:block">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-default-200 bg-default-100 flex items-center justify-center">
              {assistantImage ? (
                <img src={assistantImage} alt={assistantName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-default-500">{assistantName.charAt(0)}</span>
              )}
            </div>
          </div>
          <Card className="bg-content2 dark:bg-content1 border-none shadow-sm mr-auto">
            <div className="p-4 py-3">
              <Spinner size="sm" color="current" />
            </div>
          </Card>
        </div>
      )}

      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
