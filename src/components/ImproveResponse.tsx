"use client";

import { useState } from "react";

export function ImproveResponse({
  userPrompt,
  aiAnswer,
}: {
  userPrompt: string;
  aiAnswer: string;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [userEdit, setUserEdit] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    try {
      await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt,
          aiAnswer,
          userEdit: userEdit.trim() ? userEdit : null,
          rating,
        }),
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save training example:", error);
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-2 border-t pt-2 opacity-70 hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">Rate:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={`text-lg transition-colors ${rating === n ? "text-yellow-500" : "text-gray-400 hover:text-yellow-400"}`}
            title={`${n} star${n > 1 ? 's' : ''}`}
          >
            ⭐
          </button>
        ))}

        <button 
          onClick={() => setEditing((s) => !s)} 
          className="ml-2 text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {editing ? "❌ Cancel" : "✏️ Edit"}
        </button>

        <button 
          onClick={save} 
          className="text-xs px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
          disabled={!rating && !userEdit.trim()}
        >
          {saved ? "✅ Saved!" : "💾 Save"}
        </button>
      </div>

      {editing && (
        <textarea
          className="w-full min-h-[90px] p-2 border rounded text-sm bg-background text-foreground"
          placeholder="Rewrite the AI reply in your style..."
          value={userEdit}
          onChange={(e) => setUserEdit(e.target.value)}
        />
      )}
    </div>
  );
}
