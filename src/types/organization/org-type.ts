// types/organization.ts

export interface Organization {
  id: string;
  name: string;
  description?: string;
  displayName?: string;
  planType: string;
  planRenewalDate?: string | null;
  isActive: boolean;
  monthlyMessageCount: number;
  monthlyMessageLimit: number;
  // Removed token fields
  totalConversations: number;
  totalMessages: number;
  businessHoursEnabled: boolean;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  timezone?: string;
  autoReplyEnabled: boolean;
  welcomeMessage?: string;
  industry?: string;
  website?: string;
  contactEmail?: string;
  agentName?: string;
  agentPersonality?: string;
  apiKey?: string;
  knowledgeBase?: {
    id: string;
    isModelTrained: boolean;
    lastTrainedAt?: string;
  };
}

export interface Stats {
  totalConversations: number;
  totalMessages: number;
  monthlyMessageCount: number;
  monthlyMessageLimit: number;
  usagePercentage: number;
  recentConversations: {
    id: string;
    userId: string;
    lastMessage: string;
    lastMessageAt: string;
    messageCount: number;
  }[];
}

export type OrgTab = "overview" | "agent" | "api" | "analytics" | "billing" | "settings" | "chat" | "insights";

// ── Shared CSS (import into each component via <style> or a global sheet) ──
export const ORG_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

:root,[data-mode="light"]{
  --c-bg:#EFF7FF; --c-surface:#FFFFFF; --c-surface-2:#E2F0FC;
  --c-border:#C5DCF2; --c-text:#0B1E2E; --c-muted:#6B90AE;
  --c-accent:#29A9D4; --c-accent-dim:#1D8BB2; --c-accent-soft:#DDF1FA;
  --c-org:#6366F1; --c-org-soft:rgba(99,102,241,.1);
  --c-success:#10B981; --c-success-soft:#ECFDF5;
  --c-warn:#F59E0B; --c-warn-soft:#FFFBEB;
  --c-danger:#EF4444; --c-danger-soft:#FEE2E2;
  --shadow-sm:0 1px 4px rgba(10,40,70,.07);
  --shadow-md:0 8px 32px rgba(10,40,80,.1);
  --shadow-lg:0 20px 56px rgba(10,40,80,.13);
}
[data-mode="dark"]{
  --c-bg:#081420; --c-surface:#0F1E2D; --c-surface-2:#162435;
  --c-border:#1A3045; --c-text:#C8E8F8; --c-muted:#3D6580;
  --c-accent:#38AECC; --c-accent-dim:#2690AB; --c-accent-soft:#0C2535;
  --c-org:#818CF8; --c-org-soft:rgba(129,140,248,.1);
  --c-success:#34D399; --c-success-soft:#063320;
  --c-warn:#FCD34D; --c-warn-soft:#2D2008;
  --c-danger:#F87171; --c-danger-soft:#3B1212;
  --shadow-sm:0 1px 4px rgba(0,0,0,.28);
  --shadow-md:0 8px 32px rgba(0,0,0,.32);
  --shadow-lg:0 20px 56px rgba(0,0,0,.5);
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',system-ui,sans-serif;background:var(--c-bg);color:var(--c-text);transition:background .3s,color .3s}

/* ── Shared button ── */
.od-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;font-size:.78rem;font-weight:700;border:none;cursor:pointer;font-family:inherit;transition:all .15s;text-decoration:none;flex-shrink:0;white-space:nowrap}
.od-btn--primary{background:var(--c-accent);color:#fff}
.od-btn--primary:hover:not(:disabled){background:var(--c-accent-dim);transform:translateY(-1px);box-shadow:0 6px 18px color-mix(in srgb,var(--c-accent) 28%,transparent)}
.od-btn--org{background:var(--c-org);color:#fff}
.od-btn--org:hover:not(:disabled){background:color-mix(in srgb,var(--c-org) 80%,black);transform:translateY(-1px)}
.od-btn--ghost{background:var(--c-surface);border:1px solid var(--c-border);color:var(--c-muted)}
.od-btn--ghost:hover:not(:disabled){border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-soft)}
.od-btn--danger{background:var(--c-danger-soft);color:var(--c-danger);border:1px solid color-mix(in srgb,var(--c-danger) 25%,transparent)}
.od-btn--danger:hover:not(:disabled){background:var(--c-danger);color:#fff}
.od-btn--success{background:var(--c-success);color:#fff}
.od-btn:disabled{opacity:.6;cursor:not-allowed;transform:none!important}
.od-btn svg{width:13px;height:13px}

/* ── Shared card ── */
.od-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:16px;padding:20px 22px;box-shadow:var(--shadow-sm);transition:background .3s,border-color .3s;position:relative;overflow:hidden}
.od-card-accent::before{content:'';position:absolute;top:0;left:0;right:0;height:2.5px;background:linear-gradient(90deg,var(--c-org),var(--c-accent));background-size:200%;animation:odshimmer 3.5s linear infinite}
@keyframes odshimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.od-card-title{font-family:'DM Serif Display',serif;font-size:.98rem;color:var(--c-text);margin-bottom:4px;font-weight:400}
.od-card-sub{font-size:.74rem;color:var(--c-muted);margin-bottom:16px;line-height:1.5}

/* ── Shared form fields ── */
.od-field label{display:block;font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);margin-bottom:6px}
.od-field label span{color:var(--c-danger);margin-left:2px}
.od-input,.od-select,.od-textarea{width:100%;padding:10px 12px;border-radius:11px;border:1.5px solid var(--c-border);background:var(--c-surface-2);color:var(--c-text);font-size:.84rem;font-family:inherit;outline:none;transition:border-color .14s,background .14s}
.od-input:focus,.od-select:focus,.od-textarea:focus{border-color:var(--c-accent);background:var(--c-surface)}
.od-input::placeholder,.od-textarea::placeholder{color:var(--c-muted);opacity:.7}
.od-textarea{resize:vertical;min-height:80px;line-height:1.5}
.od-select{cursor:pointer}
.od-grid2{display:grid;gap:14px;grid-template-columns:1fr 1fr}
@media(max-width:500px){.od-grid2{grid-template-columns:1fr}}

/* ── Shared spinner ── */
.od-spinner{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:odspin .75s linear infinite;flex-shrink:0}
.od-spinner--dark{border-color:var(--c-border);border-top-color:var(--c-accent)}
@keyframes odspin{to{transform:rotate(360deg)}}

/* ── Shared error/notice ── */
.od-error{display:flex;align-items:center;gap:8px;padding:10px 13px;border-radius:10px;background:var(--c-danger-soft);border:1px solid color-mix(in srgb,var(--c-danger) 28%,transparent);color:var(--c-danger);font-size:.78rem;font-weight:500;margin-top:12px}
.od-error svg{width:13px;height:13px;flex-shrink:0}
.od-notice{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:11px;background:color-mix(in srgb,var(--c-org) 8%,transparent);border:1px solid color-mix(in srgb,var(--c-org) 20%,transparent);font-size:.78rem;color:var(--c-muted);margin-bottom:16px}
.od-notice svg{width:14px;height:14px;color:var(--c-org);flex-shrink:0;margin-top:1px}

/* ── Code block ── */
.od-code{background:var(--c-surface-2);border:1px solid var(--c-border);border-radius:12px;padding:14px 16px;font-family:ui-monospace,'Cascadia Code',monospace;font-size:.74rem;color:var(--c-accent);line-height:1.8;overflow-x:auto;white-space:pre;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}
.od-code::-webkit-scrollbar{height:3px}
.od-code::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:3px}
.od-c-key{color:var(--c-org)}
.od-c-str{color:var(--c-success)}
.od-c-muted{color:var(--c-muted)}

/* ── Copy row ── */
.od-copy-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 13px;border-radius:11px;background:var(--c-surface-2);border:1px solid var(--c-border);margin-bottom:6px}
.od-copy-val{font-family:ui-monospace,monospace;font-size:.78rem;color:var(--c-accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.od-copy-btn{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:7px;font-size:.68rem;font-weight:700;border:1px solid var(--c-accent);background:var(--c-accent-soft);color:var(--c-accent);cursor:pointer;font-family:inherit;transition:all .13s;flex-shrink:0}
.od-copy-btn:hover{background:var(--c-accent);color:#fff}
.od-copy-btn--done{background:var(--c-success-soft);border-color:var(--c-success);color:var(--c-success)}
.od-copy-btn svg{width:11px;height:11px}
`;