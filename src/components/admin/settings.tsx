"use client";

import { useState, useEffect } from "react";
import { Save, AlertTriangle, Shield, Bell, Globe, Cpu, Loader2 } from "lucide-react";

interface ToggleProps { on: boolean; onChange: () => void; disabled?: boolean }
function Toggle({ on, onChange, disabled }: ToggleProps) {
  return (
    <button role="switch" aria-checked={on} onClick={onChange} disabled={disabled} style={{
      width: 40, height: 22, borderRadius: 11, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: on ? 'var(--c-accent)' : 'var(--c-border)',
      position: 'relative', transition: 'background .2s', flexShrink: 0,
      opacity: disabled ? 0.5 : 1,
    }}>
      <span style={{
        position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%',
        background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        left: on ? 21 : 3,
      }} />
    </button>
  );
}

const DEFAULTS = {
  allowSignups:       true,
  requireEmailVerify: true,
  maintenanceMode:    false,
  aiEnabled:          true,
  moderationAI:       true,
  emailNotifs:        true,
  slackNotifs:        false,
  publicProfiles:     true,
  analyticsTracking:  true,
  rateLimit:          "100",
  maxQaPairs:         "500",
  platformName:       "Velamini",
  supportEmail:       "support@velamini.example",
};

type Settings = typeof DEFAULTS;

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Danger zone confirmation states: null | "pending" | "running"
  const [clearState, setClearState]   = useState<"idle" | "confirm" | "running">("idle");
  const [resetState, setResetState]   = useState<"idle" | "confirm" | "running">("idle");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        setSettings({
          allowSignups:       data.allowSignups       === "true",
          requireEmailVerify: data.requireEmailVerify === "true",
          maintenanceMode:    data.maintenanceMode    === "true",
          aiEnabled:          data.aiEnabled          === "true",
          moderationAI:       data.moderationAI       === "true",
          emailNotifs:        data.emailNotifs        === "true",
          slackNotifs:        data.slackNotifs        === "true",
          publicProfiles:     data.publicProfiles     === "true",
          analyticsTracking:  data.analyticsTracking  === "true",
          rateLimit:          data.rateLimit          ?? "100",
          maxQaPairs:         data.maxQaPairs         ?? "500",
          platformName:       data.platformName       ?? "Velamini",
          supportEmail:       data.supportEmail       ?? "support@velamini.example",
        } as Settings);
      })
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: keyof Settings) =>
    setSettings(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string> = {};
      for (const [k, v] of Object.entries(settings)) {
        body[k] = typeof v === "boolean" ? String(v) : v;
      }
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearChats = async () => {
    if (clearState === "idle")    { setClearState("confirm"); return; }
    if (clearState === "confirm") {
      setClearState("running");
      try {
        const res = await fetch("/api/admin/settings/clear-chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm: "CLEAR_ALL_CHATS" }),
        });
        if (!res.ok) throw new Error();
      } catch {
        setError("Failed to clear chat history.");
      } finally {
        setClearState("idle");
      }
    }
  };

  const handleResetTraining = async () => {
    if (resetState === "idle")    { setResetState("confirm"); return; }
    if (resetState === "confirm") {
      setResetState("running");
      try {
        const res = await fetch("/api/admin/settings/reset-training", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm: "RESET_TRAINING" }),
        });
        if (!res.ok) throw new Error();
      } catch {
        setError("Failed to reset training data.");
      } finally {
        setResetState("idle");
      }
    }
  };

  return (
    <>
      <style>{`
        .as{padding:18px 14px 48px;background:var(--c-bg);min-height:100%;transition:background .3s}
        @media(min-width:600px){.as{padding:26px 24px 56px}}
        @media(min-width:1024px){.as{padding:32px 36px 64px}}
        .as-inner{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:20px}

        .as-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.5rem,4vw,2rem);font-weight:400;letter-spacing:-.022em;color:var(--c-text);margin-bottom:4px}
        .as-sub{font-size:.8rem;color:var(--c-muted)}

        .as-section{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-sm);transition:background .3s,border-color .3s}
        .as-section-head{display:flex;align-items:center;gap:9px;padding:14px 18px 12px;border-bottom:1px solid var(--c-border);background:var(--c-surface-2)}
        .as-section-ic{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;background:var(--c-accent-soft);color:var(--c-accent)}
        .as-section-ic svg{width:13px;height:13px}
        .as-section-title{font-family:'DM Serif Display',serif;font-size:.88rem;color:var(--c-text);font-weight:400}
        .as-section-danger .as-section-head{background:var(--c-danger-soft)}
        .as-section-danger .as-section-ic{background:color-mix(in srgb,var(--c-danger) 18%,transparent);color:var(--c-danger)}
        .as-section-danger{border-color:color-mix(in srgb,var(--c-danger) 25%,transparent)}

        .as-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 18px;border-bottom:1px solid var(--c-border)}
        .as-row:last-child{border-bottom:none}
        .as-row-lbl{font-size:.83rem;font-weight:600;color:var(--c-text)}
        .as-row-sub{font-size:.7rem;color:var(--c-muted);margin-top:2px}

        .as-input{padding:7px 11px;border-radius:9px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-text);font-size:.82rem;font-family:inherit;outline:none;transition:border-color .14s;max-width:180px;width:100%}
        .as-input:focus{border-color:var(--c-accent)}

        .as-danger-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9px;border:1px solid var(--c-danger);background:var(--c-danger-soft);color:var(--c-danger);font-size:.78rem;font-weight:700;cursor:pointer;transition:all .14s;font-family:inherit}
        .as-danger-btn:hover{background:var(--c-danger);color:#fff}
        .as-danger-btn svg{width:13px;height:13px}

        .as-save{display:flex;align-items:center;gap:8px;justify-content:flex-end}
        .as-save-btn{display:flex;align-items:center;gap:7px;padding:10px 22px;border-radius:11px;border:none;background:var(--c-accent);color:#fff;font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s}
        .as-save-btn:hover{background:var(--c-accent-dim);transform:translateY(-1px);box-shadow:0 6px 18px rgba(41,169,212,.28)}
        .as-save-btn--saved{background:var(--c-success)}
        .as-save-btn svg{width:14px;height:14px}
        .as-save-note{font-size:.74rem;color:var(--c-muted)}
      `}</style>

      <div className="as">
        <div className="as-inner">
          <div>
            <h1 className="as-title">System Settings</h1>
            <p className="as-sub">Configure platform-wide behaviour and permissions.</p>
          </div>

          {/* General */}
          <div className="as-section">
            <div className="as-section-head">
              <div className="as-section-ic"><Globe /></div>
              <span className="as-section-title">General</span>
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Platform Name</div><div className="as-row-sub">Displayed across the platform</div></div>
              <input className="as-input" value={settings.platformName} onChange={e => setSettings(p => ({ ...p, platformName: e.target.value }))} />
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Support Email</div><div className="as-row-sub">Used in user-facing communications</div></div>
              <input className="as-input" value={settings.supportEmail} onChange={e => setSettings(p => ({ ...p, supportEmail: e.target.value }))} />
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Public Profiles</div><div className="as-row-sub">Allow virtual selves to be publicly viewable</div></div>
              <Toggle on={settings.publicProfiles} onChange={() => toggle("publicProfiles")} />
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Analytics Tracking</div><div className="as-row-sub">Collect usage data for admin insights</div></div>
              <Toggle on={settings.analyticsTracking} onChange={() => toggle("analyticsTracking")} />
            </div>
          </div>

          {/* Access */}
          <div className="as-section">
            <div className="as-section-head">
              <div className="as-section-ic"><Shield /></div>
              <span className="as-section-title">Access & Security</span>
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Allow New Signups</div><div className="as-row-sub">Disable to freeze user registration</div></div>
              <Toggle on={settings.allowSignups} onChange={() => toggle("allowSignups")} />
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Require Email Verification</div><div className="as-row-sub">New users must verify email before access</div></div>
              <Toggle on={settings.requireEmailVerify} onChange={() => toggle("requireEmailVerify")} />
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">API Rate Limit (req/min)</div><div className="as-row-sub">Per-user request cap</div></div>
              <input className="as-input" type="number" value={settings.rateLimit} onChange={e => setSettings(p => ({ ...p, rateLimit: e.target.value }))} />
            </div>
          </div>

          {/* AI */}
          <div className="as-section">
            <div className="as-section-head">
              <div className="as-section-ic"><Cpu /></div>
              <span className="as-section-title">AI & Training</span>
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">AI Chat Enabled</div><div className="as-row-sub">Toggle all AI responses platform-wide</div></div>
              <Toggle on={settings.aiEnabled} onChange={() => toggle("aiEnabled")} />
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">AI Moderation</div><div className="as-row-sub">Auto-flag suspicious AI outputs</div></div>
              <Toggle on={settings.moderationAI} onChange={() => toggle("moderationAI")} />
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Max Q&A Pairs / User</div><div className="as-row-sub">Cap on knowledge base size per user</div></div>
              <input className="as-input" type="number" value={settings.maxQaPairs} onChange={e => setSettings(p => ({ ...p, maxQaPairs: e.target.value }))} />
            </div>
          </div>

          {/* Notifications */}
          <div className="as-section">
            <div className="as-section-head">
              <div className="as-section-ic"><Bell /></div>
              <span className="as-section-title">Notifications</span>
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Email Notifications</div><div className="as-row-sub">Receive admin alerts via email</div></div>
              <Toggle on={settings.emailNotifs} onChange={() => toggle("emailNotifs")} />
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Slack Notifications</div><div className="as-row-sub">Send alerts to a Slack channel</div></div>
              <Toggle on={settings.slackNotifs} onChange={() => toggle("slackNotifs")} />
            </div>
          </div>

          {/* Danger zone */}
          <div className="as-section as-section-danger">
            <div className="as-section-head">
              <div className="as-section-ic"><AlertTriangle /></div>
              <span className="as-section-title">Danger Zone</span>
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Maintenance Mode</div><div className="as-row-sub">Shows a maintenance page to all users</div></div>
              <Toggle on={settings.maintenanceMode} onChange={() => toggle("maintenanceMode")} />
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Clear All Chat History</div><div className="as-row-sub">Permanently delete all user chat logs</div></div>
              <button className="as-danger-btn"><AlertTriangle size={13} /> Clear All</button>
            </div>
            <div className="as-row">
              <div><div className="as-row-lbl">Reset Training Data</div><div className="as-row-sub">Wipe all knowledge base entries</div></div>
              <button className="as-danger-btn"><AlertTriangle size={13} /> Reset</button>
            </div>
          </div>

          {/* Save */}
          <div className="as-save">
            <span className="as-save-note">Changes apply immediately after saving.</span>
            <button className={`as-save-btn ${saved ? "as-save-btn--saved" : ""}`} onClick={handleSave}>
              <Save size={14} /> {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}