"use client";

import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
}

export default function ChatInput({ input, setInput, sendMessage }: ChatInputProps) {
  return (
    <div className="relative w-full mx-auto">
      <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all shadow-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask me anything..."
          className="w-full bg-transparent border-none px-4 py-4 sm:py-5 pl-14 pr-14 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none min-h-[56px] sm:min-h-[64px] text-base text-center placeholder:text-center rounded-2xl"
        />
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`p-2.5 rounded-xl transition-colors ${
              input.trim()
                ? "bg-teal-500 text-white hover:bg-teal-600"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
