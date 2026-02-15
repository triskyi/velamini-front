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
    fetch("/api/training")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.knowledgeBase) {
          if (data.knowledgeBase.isPubliclyShared && data.knowledgeBase.shareSlug) {
            setIsSharing(true);
            setShareSlug(data.knowledgeBase.shareSlug);
            setShareViews(data.knowledgeBase.shareViews || 0);
            setShareUrl(`${window.location.origin}/chat/${data.knowledgeBase.shareSlug}`);
          }
        }
      })
      .catch(() => {});
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
    } catch {
      setMessage({ type: "error", text: "Network error occurred" });
    }
  };

  const handleDisableSharing = async () => {
    try {
      const res = await fetch("/api/share/disable", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setIsSharing(false);
        setShareUrl("");
        setMessage({ type: "success", text: "Sharing disabled" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to disable sharing" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error occurred" });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors";

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-20 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
            Manage your virtual self and sharing preferences
          </p>
        </div>

        {message && (
          <div
            className={`rounded-2xl p-4 border ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
            }`}
          >
            <p className="font-medium text-sm">{message.text}</p>
          </div>
        )}

        {/* Share Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-teal-500/10">
              <Share2 className="h-6 w-6 text-teal-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Share Your Virtual Self
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Allow others to chat with your AI-powered virtual self using a unique link
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
                  className={inputClass}
                />
                <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Your link will be:</p>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400 break-all">
                    {typeof window !== "undefined" ? window.location.origin : ""}/chat/{shareSlug || "your-slug"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleEnableSharing}
                disabled={!shareSlug.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Unlock className="h-5 w-5" strokeWidth={2} />
                Enable Sharing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium">
                    <Eye className="h-5 w-5" />
                    Sharing is Active
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {shareViews} views
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Anyone with this link can chat with your virtual self:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <button
                onClick={handleDisableSharing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Lock className="h-5 w-5" />
                Disable Sharing
              </button>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Account Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                className={`${inputClass} bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className={`${inputClass} bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed`}
              />
            </div>
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Account details are managed through your authentication provider. Contact support for changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
