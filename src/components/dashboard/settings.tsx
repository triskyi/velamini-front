"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, Eye, Lock, Unlock } from "lucide-react";

interface SettingsViewProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function SettingsView({ user }: SettingsViewProps) {
  const [shareSlug, setShareSlug] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareViews, setShareViews] = useState(0);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Load current sharing status
    fetch("/api/training")
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.knowledgeBase) {
          if (data.knowledgeBase.isPubliclyShared && data.knowledgeBase.shareSlug) {
            setIsSharing(true);
            setShareSlug(data.knowledgeBase.shareSlug);
            setShareViews(data.knowledgeBase.shareViews || 0);
            setShareUrl(`${window.location.origin}/chat/${data.knowledgeBase.shareSlug}`);
          }
        }
      })
      .catch(err => console.error("Failed to load sharing status:", err));
  }, []);

  const handleEnableSharing = async () => {
    if (!shareSlug.trim()) {
      setMessage({ type: "error", text: "Please enter a share slug" });
      return;
    }

    try {
      const res = await fetch("/api/share/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareSlug: shareSlug.toLowerCase().replace(/\s+/g, "-") }),
      });

      const data = await res.json();
      if (data.ok) {
        setIsSharing(true);
        setShareUrl(data.shareUrl);
        setMessage({ type: "success", text: "Sharing enabled successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to enable sharing" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    }
  };

  const handleDisableSharing = async () => {
    try {
      const res = await fetch("/api/share/disable", {
        method: "POST",
      });

      const data = await res.json();
      if (data.ok) {
        setIsSharing(false);
        setShareUrl("");
        setMessage({ type: "success", text: "Sharing disabled" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to disable sharing" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Manage your virtual self and sharing settings
        </p>

        {message && (
          <div
            className={`p-4 rounded-lg ${ message.type === "success"
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Share Your Virtual Self */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-teal-500/10 to-blue-500/10">
              <Share2 className="h-6 w-6 text-teal-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Share Your Virtual Self
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Allow others to chat with your AI-powered virtual self using a unique link.
              </p>
            </div>
          </div>

          {!isSharing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Create your unique share slug
                </label>
                <input
                  type="text"
                  value={shareSlug}
                  onChange={(e) => setShareSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="e.g., john-doe, my-virtual-self"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Your link will be: <strong className="text-teal-500">{typeof window !== "undefined" ? window.location.origin : ""}/chat/{shareSlug || "your-slug"}</strong>
                </p>
              </div>
              <button
                onClick={handleEnableSharing}
                disabled={!shareSlug.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Unlock className="h-5 w-5" />
                Enable Sharing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                    <Eye className="h-5 w-5" />
                    Sharing is enabled
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {shareViews} views
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Anyone with this link can chat with your virtual self:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <button
                onClick={handleDisableSharing}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg font-medium hover:bg-red-500/20 transition-colors"
              >
                <Lock className="h-5 w-5" />
                Disable Sharing
              </button>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
