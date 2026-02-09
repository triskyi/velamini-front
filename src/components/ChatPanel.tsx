"use client";
import { useState } from "react";

export default function ChatPanel(){

    const [messages, setMessages] = useState([
        { sender: "Velamini", text: "Good morning, Tre! ready to start your journey with velamini?"},
    ]);

    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input) return;
        setMessages([...messages, { sender: "you", text: input}]);
        setInput("");
    };


  return (
    <main className="flex-1 flex flex-col p-6">
      <header className="mb-6">
        <div className="p-4 rounded-lg flex items-center gap-4 bg-white/60 dark:glass-panel border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 avatar-gradient flex items-center justify-center text-2xl text-neonBlue shadow-neon">V</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-textPrimary">Velamini</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your virtual assistant</p>
          </div>
        </div>
      </header>

      <section className="flex-1 grid grid-cols-1 lg:grid-cols-1 gap-4">
        <div className="p-6 rounded-lg bg-white/60 dark:bg-[rgba(11,15,26,0.45)] dark:panel-border neon-border shadow-neon flex flex-col border border-gray-200 dark:border-transparent">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-xs p-3 rounded-xl ${
                  msg.sender === 'Velamini'
                    ? 'bg-gray-100 text-gray-900 dark:bg-neonBlue dark:text-bg self-start shadow-neon'
                    : 'bg-green-100 text-gray-900 dark:bg-neonGreen dark:text-bg self-end shadow-neon'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-textPrimary outline-none border border-gray-300 dark:border-gray-600"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={handleSend} className="px-5 py-2 rounded-lg bg-neonBlue text-bg font-semibold shadow-neon hover:opacity-90 transition">
              Send
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

