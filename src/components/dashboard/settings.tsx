"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Eye } from "lucide-react";

// ✅ HeroUI Imports (safe set)
import { Switch, Button, Input, Card, CardContent } from "@heroui/react";

// Wrapper for Input to handle label
const Field = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-small font-medium text-default-700">{label}</label>}
    <Input {...props} className="w-full" />
  </div>
);

interface SettingsViewProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

type Toast = { type: "success" | "error"; text: string } | null;

export default function SettingsView({ user }: SettingsViewProps) {
  const [shareSlug, setShareSlug] = useState<string>("");
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [shareViews, setShareViews] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [toast, setToast] = useState<Toast>(null);

  const fallbackSlug = useMemo(() => {
    const base = (user?.name || "user")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    const rand = Math.floor(Math.random() * 1000);
    return `${base}-${rand}`;
  }, [user?.name]);

  const showToast = (t: Exclude<Toast, null>) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;

    fetch("/api/training")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        if (data?.ok && data?.knowledgeBase) {
          const kb = data.knowledgeBase;
          if (kb.isPubliclyShared && kb.shareSlug) {
            setIsSharing(true);
            setShareSlug(kb.shareSlug);
            setShareViews(kb.shareViews || 0);
            setShareUrl(`${window.location.origin}/chat/${kb.shareSlug}`);
          }
        }
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      showToast({ type: "success", text: "Copied!" });
    } catch {
      showToast({ type: "error", text: "Could not copy link" });
    }
  };

  const handleToggleSharing = async (value: boolean) => {
    // optimistic UI
    setIsSharing(value);

    if (!value) {
      // Disable
      try {
        const res = await fetch("/api/share/disable", { method: "POST" });
        const data = await res.json();

        if (data?.ok) {
          setIsSharing(false);
          setShareUrl("");
          showToast({ type: "success", text: "Sharing disabled" });
        } else {
          setIsSharing(true);
          showToast({ type: "error", text: data?.error || "Failed to disable sharing" });
        }
      } catch {
        setIsSharing(true);
        showToast({ type: "error", text: "Network error occurred" });
      }
      return;
    }

    // Enable
    const slugToUse = shareSlug || fallbackSlug;

    try {
      const res = await fetch("/api/share/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareSlug: slugToUse }),
      });

      const data = await res.json();

      if (data?.ok) {
        setIsSharing(true);
        setShareSlug(slugToUse);
        setShareUrl(data.shareUrl || `${window.location.origin}/chat/${slugToUse}`);
        showToast({ type: "success", text: "Sharing enabled" });
      } else {
        setIsSharing(false);
        showToast({ type: "error", text: data?.error || "Failed to enable sharing" });
      }
    } catch {
      setIsSharing(false);
      showToast({ type: "error", text: "Network error occurred" });
    }
  };

  return (
    <div className="w-full text-foreground bg-background min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-default-500 mt-2">
            Manage your virtual self and sharing preferences
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <Card className={`p-4 border-l-4 ${toast.type === "success" ? "border-green-500" : "border-red-500"}`}>
            <p className={toast.type === "success" ? "text-green-600" : "text-red-600"}>
              {toast.text}
            </p>
          </Card>
        )}

        {/* Share Section */}
        <section>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Share Your Virtual Self</h2>
                  <p className="text-sm text-default-500">
                    Allow others to chat with your AI-powered virtual self
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={isSharing ? "text-green-600 font-medium" : "text-default-400"}>
                    {isSharing ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    {...({
                      isSelected: isSharing,
                      onValueChange: handleToggleSharing
                    } as any)}
                    aria-label="Toggle sharing"
                  />
                </div>
              </div>

              {isSharing && (
                <div className="mt-6 pt-6 border-t border-divider space-y-4">
                  {/* Views */}
                  <div className="flex items-center gap-2 text-default-500">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">{shareViews} views</span>
                  </div>

                  {/* Link row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 rounded-xl border border-divider bg-default-50 px-4 py-3 text-sm font-mono truncate">
                      {shareUrl}
                    </div>

                    <Button
                      variant="outline"
                      onPress={copyToClipboard}
                      className="flex items-center gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Account */}
        <section>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">Account Info</h3>

              <div className="mt-4 space-y-4">
                <Field
                  readOnly
                  label="Full Name"
                  value={user?.name || ""}
                />
                <Field
                  readOnly
                  label="Email"
                  value={user?.email || ""}
                />
                <p className="text-xs text-default-400">Managed by your auth provider.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
