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
    <div className="flex-1 flex flex-col p-6">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-xs ${
              msg.sender === "Velamini"
                ? "bg-gray-800 text-neonBlue self-start shadow-neon"
                : "bg-neonBlue text-bg self-end shadow-neon"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <input
          className="flex-1 p-3 rounded-lg bg-gray-700 text-textPrimary outline-none border border-gray-600"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button className="neon-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

