"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Zap, TrendingUp, Crown, CheckCircle2, AlertTriangle, Receipt, Loader2, X, Check } from "lucide-react";
import type { Organization } from "@/types/organization/org-type";

/* ── Plan definitions ────────────────────────────────────────── */
const PLANS = [
  {
    id: "free",
    label: "Free",
    price: 0,
    msgs: 500,
    color: "#34D399",
    Icon: Zap,
    features: ["500 messages/mo", "1 AI agent", "API access", "Embed widget"],
    paid: false,
  },
  {
    id: "starter",
    label: "Starter",
    price: 4000,
    msgs: 2000,
    color: "#38AECC",
    Icon: TrendingUp,
    features: ["2,000 messages/mo", "2M AI tokens/mo", "1 AI agent", "API + Embed", "Priority support"],
    paid: true,
  },
  {
    id: "pro",
    label: "Pro",
    price: 12000,
    msgs: 8000,
    color: "#818CF8",
    Icon: CreditCard,
    features: ["8,000 messages/mo", "6M AI tokens/mo", "1 AI agent", "API + Embed", "Analytics", "Priority support"],
    paid: true,
  },
  {
    id: "scale",
    label: "Scale",
    price: 28000,
    msgs: 25000,
    color: "#FCD34D",
    Icon: Crown,
    features: ["25,000 messages/mo", "14M AI tokens/mo", "1 AI agent", "API + Embed", "Analytics", "Dedicated support", "SLA guarantee"],
    paid: true,
  },
] as const;

function formatRWF(n: number) {
  return n.toLocaleString("en-RW") + " RWF";
}

interface Invoice {
  id: string;
  plan: string;
  amountRWF: number;
  txRef: string;
  status: string;
  createdAt: string;
}

interface Props {
  org: Organization;
}

export default function OrgBilling({ org }: Props) {
  const [invoices,       setInvoices]       = useState<Invoice[]>([]);
  const [loadingInv,     setLoadingInv]     = useState(true);
  const [upgrading,      setUpgrading]      = useState(false);
  const [selectedPlan,   setSelectedPlan]   = useState<string | null>(null);
  const [paySuccess,     setPaySuccess]     = useState(false);
  const [payError,       setPayError]       = useState("");
  const [billingPeriod,  setBillingPeriod]  = useState<"monthly" | "6months" | "yearly">("monthly");

  const usagePct = org.monthlyMessageLimit > 0
    ? Math.min(100, Math.round((org.monthlyMessageCount / org.monthlyMessageLimit) * 100))
    : 0;

  const currentPlan = PLANS.find(p => p.id === (org.planType ?? "free")) ?? PLANS[0];

  /* ── Load invoices ─────────────────────────────────────────── */
  const loadInvoices = useCallback(async () => {
    setLoadingInv(true);
    try {
      const res  = await fetch(`/api/billing/invoices?orgId=${org.id}`);
      const data = await res.json();
      if (res.ok) setInvoices(data.invoices ?? []);
    } finally {
      setLoadingInv(false);
    }
  }, [org.id]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const PERIOD_OPTS = [
    { key: "monthly"  as const, label: "Monthly",  months: 1,  discount: 0    },
    { key: "6months"  as const, label: "6 Months", months: 6,  discount: 0.10 },
    { key: "yearly"   as const, label: "Yearly",   months: 12, discount: 0.20 },
  ];
  const activePeriod = PERIOD_OPTS.find(p => p.key === billingPeriod)!;

  /* ── Launch Flutterwave checkout ───────────────────────────── */
  const handleUpgrade = async (planId: string) => {
    if (planId === org.planType) return;
    setUpgrading(true);
    setPayError("");
    setSelectedPlan(planId);

    try {
      const res  = await fetch("/api/billing/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: org.id, plan: planId, period: billingPeriod }),
      });
      const data = await res.json();
      if (!res.ok) { setPayError(data.error || "Failed to initiate payment."); setUpgrading(false); return; }

      // Inject Flutterwave JS if needed
      await loadFlwScript();

      (window as any).FlutterwaveCheckout({
        public_key: data.publicKey,
        tx_ref:     data.txRef,
        amount:     data.amount,
        currency:   data.currency,
        customer:   data.customer,
        meta:       data.meta,
        customizations: {
          title:       "Velamini — Upgrade Plan",
          description: `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan`,
        },
        callback: async (response: any) => {
          // Verify server-side
          const vRes  = await fetch("/api/billing/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ txRef: data.txRef, transactionId: response.transaction_id }),
          });
          const vData = await vRes.json();
          if (vRes.ok && vData.ok) {
            setPaySuccess(true);
            loadInvoices();
            // Reload org data on the page after a short delay
            setTimeout(() => window.location.reload(), 2000);
          } else {
            setPayError(vData.error || "Payment could not be verified.");
          }
          setUpgrading(false);
          setSelectedPlan(null);
        },
        onclose: () => { setUpgrading(false); setSelectedPlan(null); },
      });
    } catch {
      setPayError("Something went wrong. Please try again.");
      setUpgrading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Success toast ── */}
      {paySuccess && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--c-success-soft)", border: "1px solid var(--c-success)", borderRadius: 12, color: "var(--c-success)", fontSize: ".84rem" }}>
          <Check size={15} />
          <strong>Plan upgraded!</strong>&nbsp; Your new limits are now active. The page will refresh shortly.
          <button onClick={() => setPaySuccess(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit" }}><X size={13} /></button>
        </div>
      )}
      {payError && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--c-danger-soft)", border: "1px solid var(--c-danger)", borderRadius: 12, color: "var(--c-danger)", fontSize: ".84rem" }}>
          <AlertTriangle size={15} />
          {payError}
          <button onClick={() => setPayError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit" }}><X size={13} /></button>
        </div>
      )}

      {/* ── Current plan card ── */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--c-muted)", marginBottom: 4 }}>Current Plan</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--c-text)" }}>{currentPlan.label}</span>
              <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: ".63rem", fontWeight: 700, background: `${currentPlan.color}22`, color: currentPlan.color }}>
                {currentPlan.price === 0 ? "Free" : formatRWF(currentPlan.price) + "/mo"}
              </span>
            </div>
          </div>
          {org.planType !== "free" && (
            <div style={{ fontSize: ".75rem", color: "var(--c-muted)" }}>
              Renews: {org.planRenewalDate ? new Date(org.planRenewalDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </div>
          )}
        </div>

        {/* Usage bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".74rem", color: "var(--c-muted)", marginBottom: 6 }}>
            <span>Messages this month</span>
            <span style={{ color: usagePct >= 90 ? "var(--c-danger)" : usagePct >= 70 ? "var(--c-warn)" : "var(--c-text)", fontWeight: 600 }}>
              {org.monthlyMessageCount.toLocaleString()} / {org.monthlyMessageLimit.toLocaleString()}
            </span>
          </div>
          <div style={{ height: 8, background: "var(--c-surface-2)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 8, transition: "width .4s ease",
              width: `${usagePct}%`,
              background: usagePct >= 90 ? "var(--c-danger)" : usagePct >= 70 ? "var(--c-warn)" : "var(--c-success)",
            }} />
          </div>
          {usagePct >= 90 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: ".74rem", color: "var(--c-danger)" }}>
              <AlertTriangle size={12} /> You're near your message limit. Upgrade to avoid interruptions.
            </div>
          )}
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--c-muted)" }}>Available Plans</div>
          {/* Period toggle */}
          <div style={{ display: "flex", gap: 4, background: "var(--c-surface-2)", borderRadius: 10, padding: 3, border: "1px solid var(--c-border)" }}>
            {PERIOD_OPTS.map(opt => (
              <button key={opt.key}
                onClick={() => setBillingPeriod(opt.key)}
                style={{
                  padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: ".7rem", fontWeight: 700, fontFamily: "inherit",
                  background: billingPeriod === opt.key ? "var(--c-accent)" : "transparent",
                  color: billingPeriod === opt.key ? "#fff" : "var(--c-muted)",
                  transition: "all .13s", position: "relative",
                }}>
                {opt.label}
                {opt.discount > 0 && (
                  <span style={{
                    position: "absolute", top: -6, right: -4,
                    background: "var(--c-success)", color: "#fff",
                    fontSize: ".52rem", fontWeight: 800, padding: "1px 4px",
                    borderRadius: 4, letterSpacing: ".02em",
                  }}>-{opt.discount * 100}%</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {PLANS.map(plan => {
            const isCurrent = plan.id === (org.planType ?? "free");
            const isLoading = upgrading && selectedPlan === plan.id;
            const periodPrice = plan.price === 0 ? 0 : Math.round(plan.price * activePeriod.months * (1 - activePeriod.discount));
            const perMonth    = plan.price === 0 ? 0 : Math.round(periodPrice / activePeriod.months);
            return (
              <div key={plan.id} style={{
                background: "var(--c-surface)", border: `1.5px solid ${isCurrent ? plan.color : "var(--c-border)"}`,
                borderRadius: 14, padding: "16px 16px 14px",
                boxShadow: isCurrent ? `0 0 0 3px ${plan.color}22` : "none",
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `${plan.color}22`, color: plan.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <plan.Icon size={15} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: ".88rem", color: "var(--c-text)" }}>{plan.label}</div>
                    <div style={{ fontSize: ".72rem", color: "var(--c-muted)" }}>
                      {plan.price === 0 ? "Free" : (
                        <>
                          <strong style={{ color: "var(--c-text)" }}>{formatRWF(periodPrice)}</strong>
                          {billingPeriod !== "monthly" && <span> · {formatRWF(perMonth)}/mo</span>}
                          {billingPeriod === "monthly" && <span>/mo</span>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".74rem", color: "var(--c-muted)" }}>
                      <CheckCircle2 size={11} style={{ color: plan.color, flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div style={{ padding: "7px 12px", borderRadius: 9, background: `${plan.color}18`, color: plan.color, fontSize: ".72rem", fontWeight: 700, textAlign: "center" }}>
                    Current Plan
                  </div>
                ) : plan.paid ? (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading}
                    style={{
                      padding: "8px 12px", borderRadius: 9, border: "none",
                      background: plan.color, color: "#fff",
                      fontSize: ".75rem", fontWeight: 700, cursor: upgrading ? "default" : "pointer",
                      opacity: upgrading && selectedPlan !== plan.id ? .5 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    {isLoading ? <><Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> Processing…</> : `Upgrade — ${formatRWF(periodPrice)}`}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Invoice history ── */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", gap: 8 }}>
          <Receipt size={14} style={{ color: "var(--c-muted)" }} />
          <span style={{ fontWeight: 700, fontSize: ".85rem", color: "var(--c-text)" }}>Billing History</span>
        </div>
        {loadingInv ? (
          <div style={{ padding: "28px 18px", display: "flex", justifyContent: "center" }}>
            <Loader2 size={20} style={{ color: "var(--c-muted)", animation: "spin 1s linear infinite" }} />
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: "28px 18px", textAlign: "center", fontSize: ".8rem", color: "var(--c-muted)" }}>
            No payments yet. Upgrade to get started.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".79rem" }}>
              <thead>
                <tr>{["Date", "Plan", "Amount", "Status", "Ref"].map(h => (
                  <th key={h} style={{ padding: "9px 18px", textAlign: "left", background: "var(--c-surface-2)", color: "var(--c-muted)", fontSize: ".62rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", borderBottom: "1px solid var(--c-border)", whiteSpace: "nowrap" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "10px 18px", color: "var(--c-muted)", whiteSpace: "nowrap" }}>{new Date(inv.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={{ padding: "10px 18px", fontWeight: 600, color: "var(--c-text)", textTransform: "capitalize" }}>{inv.plan}</td>
                    <td style={{ padding: "10px 18px", color: "var(--c-text)", whiteSpace: "nowrap" }}>{formatRWF(inv.amountRWF)}</td>
                    <td style={{ padding: "10px 18px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 20, fontSize: ".63rem", fontWeight: 700,
                        background: inv.status === "success" ? "var(--c-success-soft)" : inv.status === "pending" ? "var(--c-warn-soft)" : "var(--c-danger-soft)",
                        color: inv.status === "success" ? "var(--c-success)" : inv.status === "pending" ? "var(--c-warn)" : "var(--c-danger)",
                      }}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 18px", color: "var(--c-muted)", fontSize: ".68rem", fontFamily: "monospace", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.txRef}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

/* ── Load Flutterwave JS ─────────────────────────────────────── */
function loadFlwScript(): Promise<void> {
  return new Promise(resolve => {
    if ((window as any).FlutterwaveCheckout) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}
