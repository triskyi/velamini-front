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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
            Manage your virtual self and sharing preferences
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-5 rounded-2xl shadow-lg border ${
              message.type === "success"
                ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : "bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-700 dark:text-red-300 border-red-500/20"
            }`}
          >
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        {/* Share Your Virtual Self - Modern Card */}
        <div className="bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-xl shadow-teal-500/25">
              <Share2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Share Your Virtual Self
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Allow others to chat with your AI-powered virtual self using a unique link
              </p>
            </div>
          </div>

          {!isSharing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Create your unique share slug
                </label>
                <input
                  type="text"
                  value={shareSlug}
                  onChange={(e) => setShareSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="e.g., john-doe, my-virtual-self"
                  className="w-full px-5 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <div className="mt-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Your link will be:</p>
                  <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 break-all">
                    {typeof window !== "undefined" ? window.location.origin : ""}/chat/{shareSlug || "your-slug"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleEnableSharing}
                disabled={!shareSlug.trim()}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                <Unlock className="h-5 w-5" />
                Enable Sharing
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-semibold text-lg">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Sharing is Active
                  </div>
                  <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {shareViews} views
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Anyone with this link can chat with your virtual self:
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm font-medium"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <button
                onClick={handleDisableSharing}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-red-500/10 text-red-600 dark:text-red-400 border-2 border-red-500/20 rounded-xl font-semibold hover:bg-red-500/20 transition-all"
              >
                <Lock className="h-5 w-5" />
                Disable Sharing
              </button>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
            Account Settings
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Full Name
              </label>
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900/50 text-slate-900 dark:text-white font-medium cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900/50 text-slate-900 dark:text-white font-medium cursor-not-allowed"
              />
            </div>
            
            <div className="pt-4">
              <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  💡 Account details are managed through your authentication provider. Contact support for changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
