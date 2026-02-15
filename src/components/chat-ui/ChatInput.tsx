"use client";

import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
}

export default function ChatInput({ input, setInput, sendMessage }: ChatInputProps) {
  return (
    <div className="relative w-full mx-auto px-4 sm:px-0">
      <div className="relative bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-zinc-700 transition-colors shadow-2xl">
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
          className="w-full bg-transparent border-none px-4 py-4 sm:py-6 text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none min-h-[60px] sm:min-h-[80px] text-base sm:text-center text-left"
        />
        
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-2">
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`btn btn-sm btn-square border-none transition-all ${
              input.trim() 
                ? "bg-white text-black hover:bg-zinc-200" 
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
