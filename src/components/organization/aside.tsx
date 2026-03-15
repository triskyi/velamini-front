"use client";

import Image from "next/image";
import { Zap, Brain, Code2, BarChart3, Settings, Building2, ChevronRight, X, MessageSquare, CreditCard, Database } from "lucide-react";
import type { OrgTab } from "@/types/organization/org-type";

export const ORG_ASIDE_TABS: { id: OrgTab; label: string; Icon: React.ElementType }[] = [
  { id: "overview",  label: "Overview",      Icon: Zap           },
  { id: "agent",     label: "Train Agent",   Icon: Brain         },
  { id: "chat",      label: "Test Chat",     Icon: MessageSquare },
  { id: "api",       label: "API & Embed",   Icon: Code2         },
  { id: "analytics", label: "Analytics",     Icon: BarChart3     },
  { id: "insights",  label: "Data Insights", Icon: Database      },
  { id: "billing",   label: "Billing",       Icon: CreditCard    },
  { id: "settings",  label: "Settings",      Icon: Settings      },
];

export const ORG_ASIDE_CSS = `
  /* ── Sidebar / drawer shared layout ─────────────────────────────── */
  .oa-root{display:flex;flex-direction:column;height:100%;overflow:hidden}

  .oa-head{display:flex;align-items:center;gap:9px;padding:15px 13px 11px;border-bottom:1px solid var(--c-border);flex-shrink:0}
  .oa-orgic{width:34px;height:34px;border-radius:9px;background:var(--c-org-soft);border:1.5px solid color-mix(in srgb,var(--c-org) 24%,transparent);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--c-org)}
  .oa-orgic svg{width:15px;height:15px}
  .oa-orgname{font-family:'DM Serif Display',Georgia,serif;font-size:.87rem;font-weight:400;color:var(--c-text);letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .oa-chip{display:inline-flex;align-items:center;gap:4px;font-size:.54rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:2px 7px;border-radius:20px;margin-top:2px}
  .oa-chip--active{background:var(--c-success-soft);color:var(--c-success)}
  .oa-chip--inactive{background:var(--c-danger-soft);color:var(--c-danger)}
  .oa-chip-dot{width:4px;height:4px;border-radius:50%;background:currentColor}
  .oa-close{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;border:1px solid var(--c-border);background:transparent;color:var(--c-muted);cursor:pointer;flex-shrink:0;transition:all .13s}
  .oa-close:hover{color:var(--c-text);border-color:var(--c-text)}
  .oa-close svg{width:14px;height:14px}

  .oa-nav{flex:1;overflow-y:auto;padding:10px;scrollbar-width:none}
  .oa-nav::-webkit-scrollbar{display:none}
  .oa-section-lbl{font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);padding:8px 8px 4px}
  .oa-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;border:1px solid transparent;cursor:pointer;transition:all .13s;margin-bottom:2px;background:none;width:100%;text-align:left;font-family:inherit;min-height:42px}
  .oa-item:hover{background:var(--c-surface-2)}
  .oa-item--on{background:var(--c-accent-soft)!important;border-color:color-mix(in srgb,var(--c-org) 28%,transparent)}
  .oa-icon{width:30px;height:30px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--c-surface-2);color:var(--c-muted);transition:background .13s,color .13s}
  .oa-icon svg{width:13px;height:13px}
  .oa-item--on .oa-icon{background:var(--c-org);color:#fff}
  .oa-item:hover:not(.oa-item--on) .oa-icon{background:var(--c-surface);color:var(--c-org)}
  .oa-lbl{flex:1;font-size:.82rem;font-weight:500;color:var(--c-muted);transition:color .13s}
  .oa-item--on .oa-lbl{color:var(--c-org);font-weight:600}
  .oa-item:hover:not(.oa-item--on) .oa-lbl{color:var(--c-text)}
  .oa-arr{opacity:0;color:var(--c-org);transition:opacity .13s}
  .oa-item--on .oa-arr{opacity:1}

  .oa-foot{flex-shrink:0;padding:10px 10px 14px;border-top:1px solid var(--c-border)}
  
  /* User profile in sidebar */
  .oa-user{display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;background:var(--c-surface-2);border:1px solid var(--c-border)}
  .oa-user-av{width:36px;height:36px;border-radius:50%;background:var(--c-org-soft);display:flex;align-items:center;justify-content:center;color:var(--c-org);font-weight:600;font-size:.85rem;flex-shrink:0;overflow:hidden}
  .oa-user-av img{width:100%;height:100%;object-fit:cover}
  .oa-user-info{flex:1;min-width:0}
  .oa-user-name{font-size:.8rem;font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .oa-user-email{font-size:.65rem;color:var(--c-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

interface OrgAsideProps {
  orgName:        string;
  isActive:       boolean;
  activeTab:      OrgTab;
  onTabChange:    (tab: OrgTab) => void;
  isDark?:        boolean;
  mounted?:        boolean;
  onToggleTheme?: () => void;
  onClose?:       () => void;
  user?:          { name: string | null; email: string | null; image: string | null } | null;
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

export default function OrgAside({
  orgName,
  isActive,
  activeTab,
  onTabChange,
  onClose,
  user,
}: OrgAsideProps) {
  const initials = getInitials(user?.name ?? null, user?.email ?? null);

  return (
    <div className="oa-root">
      {/* Header */}
      <div className="oa-head">
        <div className="oa-orgic"><Building2 /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="oa-orgname">{orgName}</div>
          <div className={`oa-chip ${isActive ? "oa-chip--active" : "oa-chip--inactive"}`}>
            <span className="oa-chip-dot" />
            {isActive ? "Active" : "Inactive"}
          </div>
        </div>
        {onClose && (
          <button className="oa-close" onClick={onClose} aria-label="Close menu">
            <X />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="oa-nav">
        <div className="oa-section-lbl">Navigation</div>
        {ORG_ASIDE_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`oa-item ${activeTab === id ? "oa-item--on" : ""}`}
            onClick={() => { onTabChange(id); onClose?.(); }}
          >
            <div className="oa-icon"><Icon /></div>
            <span className="oa-lbl">{label}</span>
            <ChevronRight size={11} className="oa-arr" />
          </button>
        ))}
      </nav>

      {/* Footer with User Profile */}
      <div className="oa-foot">
        {user && (
          <div className="oa-user">
            <div className="oa-user-av">
              {user.image ? (
                <Image src={user.image} alt={user.name || "Profile"} width={36} height={36} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                initials
              )}
            </div>
            <div className="oa-user-info">
              <div className="oa-user-name">{user.name || "User"}</div>
              <div className="oa-user-email">{user.email}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
