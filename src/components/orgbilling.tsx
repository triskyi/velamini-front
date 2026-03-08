"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Check, CreditCard, AlertTriangle,
  Calendar, Receipt, Star, RefreshCw, X, Smartphone,
} from "lucide-react";
import type { Organization } from "@/types/organization/org-type";

type Plan = {
  id: string;
  name: string;
  price: number;
  messages: number;
  accent: string;
  badge?: string;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    messages: 500,
    accent: "#34D399",
    features: ["500 messages/mo", "1 AI agent", "API access", "Embed widget"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 100,
    messages: 2000,
    accent: "#38AECC",
    features: ["2,000 messages/mo", "1 AI agent", "API + Embed", "Priority support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 100,
    messages: 8000,
    accent: "#818CF8",
    badge: "Most popular",
    features: ["8,000 messages/mo", "1 AI agent", "API + Embed", "Analytics", "Priority support"],
  },
  {
    id: "scale",
    name: "Scale",
    price: 100,
    messages: 25000,
    accent: "#FCD34D",
    badge: "Best value",
    features: ["25,000 messages/mo", "1 AI agent", "API + Embed", "Analytics", "Dedicated support", "SLA guarantee"],
  },
];

interface Invoice {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: "paid" | "pending" | "failed";
}

interface Props {
  org: Organization & {
    planId?: string;
    billingCycleEnd?: string;
    invoices?: Invoice[];
  };
}

declare global { interface Window { FlutterwaveCheckout: (config: FlutterwaveConfig) => void } }

interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  redirect_url: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  meta: Record<string, string>;
  callback: (response: { status: string; tx_ref: string; transaction_id: string }) => void;
  onclose: () => void;
}

function formatRWF(n: number) { return `${n.toLocaleString()} RWF` }

export default function OrgBilling({ org }: Props) {
  const currentPlanId = org.planId || "free";
  const currentPlan   = PLANS.find(p => p.id === currentPlanId) || PLANS[0];
  const usagePct      = Math.min((org.monthlyMessageCount / org.monthlyMessageLimit) * 100, 100);
  const usageColor    = usagePct >= 90 ? "var(--c-danger)" : usagePct >= 70 ? "var(--c-warn)" : "var(--c-success)";

  const [showUpgrade,   setShowUpgrade]   = useState(false);
  const [selectedPlan,  setSelectedPlan]  = useState<string | null>(null);
  const [paying,        setPaying]        = useState(false);
  const [phoneNumber,   setPhoneNumber]   = useState("");
  const [phoneError,    setPhoneError]    = useState("");
  const [payResult,     setPayResult]     = useState<"success" | "pending" | "failed" | null>(null);

  const mockInvoices: Invoice[] = org.invoices || [];

  // Rwanda MTN / Airtel numbers: +2507XXXXXXXX or 07XXXXXXXX
  const validatePhone = (v: string) => {
    const cleaned = v.replace(/\s/g, "");
    return /^\+?250[78]\d{8}$/.test(cleaned) || /^0[78]\d{8}$/.test(cleaned);
  };

  const handleUpgrade = async (planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan || plan.price === 0) return;

    if (!validatePhone(phoneNumber)) {
      setPhoneError("Enter a valid Rwanda mobile number (e.g. +250788123456 or 0788123456)");
      return;
    }
    setPhoneError("");
    setPaying(true);
    setSelectedPlan(planId);
    setPayResult(null);

    try {
      const ref = await fetch("/api/billing/create-payment", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          orgId:       org.id,
          plan:        planId,
          phoneNumber: phoneNumber.replace(/\s/g, ""),
        }),
      }).then(r => r.json());

      if (ref.error) {
        setPaying(false);
        setSelectedPlan(null);
        return;
      }

      // Launch Flutterwave inline checkout — MTN Mobile Money Rwanda
      window.FlutterwaveCheckout({
        public_key:      ref.publicKey,
        tx_ref:          ref.txRef,
        amount:          ref.amount,
        currency:        "RWF",
        payment_options: "mobilemoneyrwanda",
        redirect_url:    ref.redirectUrl,
        customer:        ref.customer,
        customizations:  ref.customizations,
        meta:            ref.meta,
        callback: (response) => {
          // Fires in-browser before redirect.
          // The authoritative plan upgrade is handled server-side by the webhook.
          if (response.status === "successful") {
            setPayResult("success");
          } else {
            setPayResult("failed");
            setPaying(false);
            setSelectedPlan(null);
          }
        },
        onclose: () => {
          setPaying(false);
          setSelectedPlan(null);
        },
      });
    } catch {
      setPaying(false);
      setSelectedPlan(null);
    }
  };

  return (
    <>
      <style>{`
        .ob2{display:flex;flex-direction:column;gap:16px}

        /* current plan */
        .ob2-plan{display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap}
        .ob2-plan-info{flex:1;min-width:220px}
        .ob2-plan-name{font-family:'DM Serif Display',serif;font-size:1.5rem;color:var(--c-text);letter-spacing:-.02em}
        .ob2-plan-name em{font-style:italic;color:var(--pp-plan-accent, var(--c-accent))}
        .ob2-plan-sub{font-size:.76rem;color:var(--c-muted);margin-top:4px}
        .ob2-plan-renewal{display:inline-flex;align-items:center;gap:5px;margin-top:8px;font-size:.7rem;color:var(--c-muted);padding:4px 10px;border-radius:8px;background:var(--c-surface-2);border:1px solid var(--c-border)}
        .ob2-plan-renewal svg{width:11px;height:11px}

        /* usage */
        .ob2-usage{margin-top:14px}
        .ob2-usage-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
        .ob2-usage-label{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--c-muted)}
        .ob2-usage-count{font-size:.76rem;font-weight:700;color:var(--c-text)}
        .ob2-usage-track{height:7px;background:var(--c-surface-2);border-radius:4px;overflow:hidden;border:1px solid var(--c-border)}
        .ob2-usage-fill{height:100%;border-radius:4px;transition:width .5s;position:relative;overflow:hidden}
        .ob2-usage-fill::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);animation:ob2shimmer 2s linear infinite}
        @keyframes ob2shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .ob2-usage-warning{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:.72rem;color:var(--c-warn);background:var(--c-warn-soft);border:1px solid color-mix(in srgb,var(--c-warn) 22%,transparent);padding:7px 10px;border-radius:8px}
        .ob2-usage-warning svg{width:12px;height:12px;flex-shrink:0}

        /* stats row */
        .ob2-stats{display:grid;gap:10px;grid-template-columns:repeat(3,1fr)}
        @media(max-width:500px){.ob2-stats{grid-template-columns:1fr 1fr}}
        .ob2-stat{padding:13px 14px;border-radius:12px;background:var(--c-surface-2);border:1px solid var(--c-border)}
        .ob2-stat-val{font-family:'DM Serif Display',serif;font-size:1.4rem;color:var(--c-text);letter-spacing:-.02em}
        .ob2-stat-lbl{font-size:.64rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--c-muted);margin-top:1px}

        /* upgrade grid */
        .ob2-plans{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
        @media(min-width:700px){.ob2-plans{grid-template-columns:repeat(3,1fr)}}
        .ob2-uplan{
          border:1.5px solid var(--c-border);border-radius:15px;padding:18px 16px;
          display:flex;flex-direction:column;gap:0;cursor:pointer;
          transition:all .17s;position:relative;overflow:hidden;
          background:var(--c-surface-2);
        }
        .ob2-uplan::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--pp-accent);opacity:.5}
        .ob2-uplan:hover{border-color:var(--pp-accent);background:color-mix(in srgb,var(--pp-accent) 6%,var(--c-surface));transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.28)}
        .ob2-uplan--selected{border-color:var(--pp-accent)!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--pp-accent) 20%,transparent)}
        .ob2-uplan--current{opacity:.55;cursor:not-allowed;pointer-events:none}
        .ob2-uplan--current::after{content:'Current';position:absolute;top:8px;right:8px;font-size:.6rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:2px 7px;border-radius:6px;background:var(--c-surface);border:1px solid var(--c-border);color:var(--c-muted)}
        .ob2-uplan-name{font-family:'DM Serif Display',serif;font-size:.96rem;color:var(--c-text);margin-bottom:4px}
        .ob2-uplan-price{font-family:'DM Serif Display',serif;font-size:1.4rem;color:var(--c-text);letter-spacing:-.02em;line-height:1}
        .ob2-uplan-price span{font-size:.68rem;font-family:'DM Sans',sans-serif;color:var(--c-muted)}
        .ob2-uplan-msgs{font-size:.7rem;color:var(--c-muted);margin:6px 0 12px;padding-bottom:10px;border-bottom:1px solid var(--c-border)}
        .ob2-uplan-feats{display:flex;flex-direction:column;gap:5px;flex:1;margin-bottom:14px}
        .ob2-uplan-feat{display:flex;align-items:flex-start;gap:6px;font-size:.7rem;color:var(--c-muted);line-height:1.35}
        .ob2-uplan-feat svg{width:10px;height:10px;flex-shrink:0;margin-top:2px;color:var(--pp-accent)}
        .ob2-uplan-btn{width:100%;padding:9px;border-radius:10px;border:1.5px solid var(--pp-accent);background:color-mix(in srgb,var(--pp-accent) 10%,transparent);color:var(--pp-accent);font-size:.76rem;font-weight:700;font-family:inherit;cursor:pointer;transition:all .14s;display:flex;align-items:center;justify-content:center;gap:5px}
        .ob2-uplan-btn:hover{background:var(--pp-accent);color:#fff}
        .ob2-uplan-btn svg{width:11px;height:11px}

        /* invoices */
        .ob2-invoices{display:flex;flex-direction:column;gap:6px}
        .ob2-invoice{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:11px;background:var(--c-surface-2);border:1px solid var(--c-border)}
        .ob2-invoice-ic{width:30px;height:30px;border-radius:8px;background:var(--c-accent-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--c-accent)}
        .ob2-invoice-ic svg{width:12px;height:12px}
        .ob2-invoice-info{flex:1;min-width:0}
        .ob2-invoice-plan{font-size:.78rem;font-weight:600;color:var(--c-text)}
        .ob2-invoice-date{font-size:.68rem;color:var(--c-muted);margin-top:1px}
        .ob2-invoice-amount{font-size:.82rem;font-weight:700;color:var(--c-text);flex-shrink:0}
        .ob2-invoice-status{font-size:.62rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:2px 8px;border-radius:6px;flex-shrink:0}
        .ob2-invoice-status--paid{background:var(--c-success-soft);color:var(--c-success)}
        .ob2-invoice-status--pending{background:var(--c-warn-soft);color:var(--c-warn)}
        .ob2-invoice-status--failed{background:var(--c-danger-soft);color:var(--c-danger)}

        /* modal */
        .ob2-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
        .ob2-modal{background:var(--c-surface);border:1px solid var(--c-border);border-radius:20px;padding:28px 24px;width:100%;max-width:540px;max-height:90dvh;overflow-y:auto;box-shadow:var(--shadow-lg);position:relative}
        .ob2-modal-close{position:absolute;top:14px;right:14px;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);cursor:pointer;transition:all .13s}
        .ob2-modal-close:hover{border-color:var(--c-danger);color:var(--c-danger);background:var(--c-danger-soft)}
        .ob2-modal-close svg{width:12px;height:12px}
        .ob2-modal-title{font-family:'DM Serif Display',serif;font-size:1.2rem;color:var(--c-text);margin-bottom:4px}
        .ob2-modal-sub{font-size:.76rem;color:var(--c-muted);margin-bottom:20px}
      `}</style>

      <div className="ob2">

        {/* ── Current plan card ── */}
        <motion.div className="od-card od-card-accent"
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
          <div className="od-card-title">Current plan</div>
          <div className="ob2-plan">
            <div className="ob2-plan-info" style={{ "--pp-plan-accent": currentPlan.accent } as any}>
              <div className="ob2-plan-name">
                You're on <em>{currentPlan.name}</em>
              </div>
              <div className="ob2-plan-sub">
                {currentPlan.price === 0
                  ? "Free plan — 500 messages included to get you started."
                  : `${formatRWF(currentPlan.price)} / month · ${currentPlan.messages.toLocaleString()} messages`}
              </div>
              {org.billingCycleEnd && (
                <div className="ob2-plan-renewal">
                  <Calendar size={11}/> Renews {new Date(org.billingCycleEnd).toLocaleDateString("en-RW", { day:"numeric", month:"long" })}
                </div>
              )}
            </div>
            <button className="od-btn od-btn--org" onClick={() => setShowUpgrade(true)}>
              {currentPlan.id === "scale" ? <><RefreshCw size={13}/> Manage</> : <><Star size={13}/> Upgrade plan</>}
            </button>
          </div>

          {/* Usage bar */}
          <div className="ob2-usage">
            <div className="ob2-usage-head">
              <span className="ob2-usage-label">Messages used this month</span>
              <span className="ob2-usage-count">
                {org.monthlyMessageCount.toLocaleString()} / {org.monthlyMessageLimit.toLocaleString()}
              </span>
            </div>
            <div className="ob2-usage-track">
              <div className="ob2-usage-fill" style={{ width:`${usagePct}%`, background:usageColor }}/>
            </div>
            {usagePct >= 80 && (
              <div className="ob2-usage-warning">
                <AlertTriangle size={12}/>
                {usagePct >= 100
                  ? "You've used all your messages this month. Upgrade to keep your agent running."
                  : `You've used ${usagePct.toFixed(0)}% of your monthly messages. Consider upgrading soon.`}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div className="od-card"
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.08 }}>
          <div className="od-card-title">Usage summary</div>
          <div className="od-card-sub">Your organisation's all-time usage across all billing periods.</div>
          <div className="ob2-stats">
            <div className="ob2-stat">
              <div className="ob2-stat-val">{org.totalMessages.toLocaleString()}</div>
              <div className="ob2-stat-lbl">Total messages</div>
            </div>
            <div className="ob2-stat">
              <div className="ob2-stat-val">{org.totalConversations.toLocaleString()}</div>
              <div className="ob2-stat-lbl">Conversations</div>
            </div>
            <div className="ob2-stat">
              <div className="ob2-stat-val">{currentPlan.name}</div>
              <div className="ob2-stat-lbl">Current plan</div>
            </div>
          </div>
        </motion.div>

        {/* ── Invoice history ── */}
        <motion.div className="od-card"
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.14 }}>
          <div className="od-card-title">Billing history</div>
          <div className="od-card-sub">Your past invoices and payments via Flutterwave.</div>

          {mockInvoices.length === 0 ? (
            <div style={{ textAlign:"center", padding:"28px 0", color:"var(--c-muted)", fontSize:".8rem" }}>
              No invoices yet — you're on the free plan.
            </div>
          ) : (
            <div className="ob2-invoices">
              {mockInvoices.map(inv => (
                <div key={inv.id} className="ob2-invoice">
                  <div className="ob2-invoice-ic"><Receipt size={12}/></div>
                  <div className="ob2-invoice-info">
                    <div className="ob2-invoice-plan">{inv.plan} Plan</div>
                    <div className="ob2-invoice-date">
                      {new Date(inv.date).toLocaleDateString("en-RW", { day:"numeric", month:"long", year:"numeric" })}
                    </div>
                  </div>
                  <div className="ob2-invoice-amount">{formatRWF(inv.amount)}</div>
                  <div className={`ob2-invoice-status ob2-invoice-status--${inv.status}`}>{inv.status}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>

      {/* ── Upgrade modal ── */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div className="ob2-modal-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowUpgrade(false) }}>
            <motion.div className="ob2-modal"
              initial={{ opacity:0, scale:.94, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:.94, y:20 }} transition={{ type:"spring", stiffness:280, damping:26 }}>

              <button className="ob2-modal-close" onClick={() => setShowUpgrade(false)}><X size={12}/></button>
              <div className="ob2-modal-title">Upgrade your plan</div>
              <div className="ob2-modal-sub">Pay securely with MTN Mobile Money via Flutterwave.</div>

              {/* MTN Mobile Money phone input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display:"block", fontSize:".72rem", fontWeight:700, color:"var(--c-muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>
                  MTN / Airtel Mobile Money Number
                </label>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:10, background:"var(--c-surface-2)", border:`1.5px solid ${phoneError ? "var(--c-danger)" : "var(--c-border)"}`, transition:"border-color .15s" }}>
                  <Smartphone size={14} style={{ flexShrink:0, color:"var(--c-muted)" }}/>
                  <input
                    type="tel"
                    placeholder="+250788123456 or 0788123456"
                    value={phoneNumber}
                    onChange={e => { setPhoneNumber(e.target.value); setPhoneError(""); }}
                    disabled={paying}
                    style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:".82rem", color:"var(--c-text)", fontFamily:"inherit" }}
                  />
                </div>
                {phoneError && (
                  <div style={{ marginTop:5, fontSize:".68rem", color:"var(--c-danger)" }}>{phoneError}</div>
                )}
                <div style={{ marginTop:5, fontSize:".65rem", color:"var(--c-muted)" }}>
                  You will receive a push notification on your phone to confirm payment.
                </div>
              </div>

              {/* Payment result banner */}
              {payResult === "success" && (
                <div style={{ marginBottom:14, padding:"10px 14px", borderRadius:10, background:"var(--c-success-soft)", border:"1px solid color-mix(in srgb,var(--c-success) 30%,transparent)", fontSize:".75rem", color:"var(--c-success)", display:"flex", alignItems:"center", gap:8 }}>
                  <Check size={13}/> Payment received — your plan will be activated shortly via webhook confirmation.
                </div>
              )}
              {payResult === "failed" && (
                <div style={{ marginBottom:14, padding:"10px 14px", borderRadius:10, background:"var(--c-danger-soft)", border:"1px solid color-mix(in srgb,var(--c-danger) 30%,transparent)", fontSize:".75rem", color:"var(--c-danger)", display:"flex", alignItems:"center", gap:8 }}>
                  <AlertTriangle size={13}/> Payment was not completed. Please try again.
                </div>
              )}

              <div className="ob2-plans">
                {PLANS.filter(p => p.id !== "free").map(plan => (
                  <div key={plan.id}
                    className={`ob2-uplan ${plan.id === currentPlanId ? "ob2-uplan--current" : ""} ${selectedPlan === plan.id ? "ob2-uplan--selected" : ""}`}
                    style={{ "--pp-accent": plan.accent } as any}>

                    {plan.badge && (
                      <div style={{ position:"absolute", top:8, right:8, fontSize:".58rem", fontWeight:800, padding:"2px 7px", borderRadius:6, background:plan.accent, color: plan.id === "scale" ? "#0B1E2E" : "#fff", letterSpacing:".04em", textTransform:"uppercase" }}>
                        {plan.badge}
                      </div>
                    )}

                    <div className="ob2-uplan-name">{plan.name}</div>
                    <div className="ob2-uplan-price">
                      {formatRWF(plan.price)}<span> / mo</span>
                    </div>
                    <div className="ob2-uplan-msgs">{plan.messages.toLocaleString()} messages / month</div>
                    <div className="ob2-uplan-feats">
                      {plan.features.slice(0, 5).map(f => (
                        <div key={f} className="ob2-uplan-feat"><Check size={10}/>{f}</div>
                      ))}
                    </div>
                    <button className="ob2-uplan-btn" disabled={paying}
                      onClick={() => handleUpgrade(plan.id)}>
                      {paying && selectedPlan === plan.id
                        ? <><div className="od-spinner" style={{ borderTopColor:plan.accent, borderColor:"rgba(255,255,255,.2)", width:11, height:11 }}/> Processing…</>
                        : <><Smartphone size={11}/> Pay with MTN MoMo</>}
                    </button>
                  </div>
                ))}
              </div>

              {/* Payment methods note */}
              <div style={{ marginTop:18, padding:"10px 14px", borderRadius:10, background:"var(--c-surface-2)", border:"1px solid var(--c-border)", fontSize:".72rem", color:"var(--c-muted)", display:"flex", alignItems:"center", gap:6 }}>
                <Smartphone size={12} style={{ flexShrink:0, color:"var(--c-accent)" }}/>
                MTN Mobile Money Rwanda — powered by Flutterwave. You'll get a USSD push to approve payment.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load Flutterwave inline JS */}
      <script src="https://checkout.flutterwave.com/v3.js" async/>
    </>
  );
}