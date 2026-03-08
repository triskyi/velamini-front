"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Check, CreditCard, Calendar,
  Receipt, Star, RefreshCw, X, Smartphone,
  AlertTriangle, TrendingUp,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────

type Plan = {
  id: string;
  name: string;
  price: number;
  messages: number;
  accent: string;
  badge?: string;
  features: string[];
};

interface Invoice {
  id: string;
  createdAt: string;
  amountRWF: number;
  plan: string;
  status: "success" | "pending" | "failed";
}

interface PlanInfo {
  type: string;
  msgCount: number;
  msgLimit: number;
  renewalDate: string | null;
}

interface UserBillingProps {
  userId: string;
  paymentStatus?: "success" | "pending" | "failed" | null;
}

// ── Plan catalogue ────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    messages: 200,
    accent: "#34D399",
    features: ["200 messages/month", "150K AI tokens/month", "Personal virtual self", "Chat link sharing", "Basic analytics"],
  },
  {
    id: "plus",
    name: "Plus",
    price: 2000,
    messages: 1500,
    accent: "#818CF8",
    badge: "Best for creators",
    features: [
      "1,500 messages/month",
      "1M AI tokens/month",
      "Personal virtual self",
      "Chat link sharing",
      "Resume generation",
      "Priority support",
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRWF(n: number) {
  return n === 0 ? "Free" : `${n.toLocaleString()} RWF`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-RW", { year: "numeric", month: "short", day: "numeric" });
}

declare global {
  interface Window {
    FlutterwaveCheckout: (config: FlutterwaveConfig) => void;
  }
}

interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  redirect_url: string;
  customer: { email: string; phone_number: string; name: string };
  customizations: { title: string; description: string; logo: string };
  meta: Record<string, string>;
  callback: (response: { status: string; tx_ref: string; transaction_id: string }) => void;
  onclose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function UserBilling({ userId, paymentStatus }: UserBillingProps) {
  const [planInfo,     setPlanInfo]     = useState<PlanInfo | null>(null);
  const [invoices,     setInvoices]     = useState<Invoice[]>([]);
  const [loading,      setLoading]      = useState(true);

  const [showUpgrade,  setShowUpgrade]  = useState(false);
  const [period,       setPeriod]       = useState<"monthly" | "6months" | "yearly">("monthly");
  const [paying,       setPaying]       = useState(false);
  const [phoneNumber,  setPhoneNumber]  = useState("");
  const [phoneError,   setPhoneError]   = useState("");
  const [payResult,    setPayResult]    = useState<"success" | "pending" | "failed" | null>(
    paymentStatus ?? null,
  );

  // ── Fetch billing info ────────────────────────────────────────────────

  const fetchBilling = () => {
    setLoading(true);
    fetch("/api/billing/user/invoices")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setPlanInfo(d.plan);
          setInvoices(d.invoices ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBilling(); }, []);

  // ── Validation ────────────────────────────────────────────────────────

  const validatePhone = (v: string) => {
    const c = v.replace(/\s/g, "");
    return /^\+?250[78]\d{8}$/.test(c) || /^0[78]\d{8}$/.test(c);
  };

  // ── Checkout ──────────────────────────────────────────────────────────

  const handleUpgrade = async () => {
    if (!validatePhone(phoneNumber)) {
      setPhoneError("Enter a valid Rwanda mobile number (e.g. +250788123456)");
      return;
    }
    setPhoneError("");
    setPaying(true);
    setPayResult(null);

    try {
      const data = await fetch("/api/billing/user/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "plus", period, phoneNumber: phoneNumber.replace(/\s/g, "") }),
      }).then(r => r.json());

      if (data.error) {
        setPaying(false);
        return;
      }

      window.FlutterwaveCheckout({
        public_key:      data.publicKey,
        tx_ref:          data.txRef,
        amount:          data.amount,
        currency:        "RWF",
        payment_options: "mobilemoneyrwanda",
        redirect_url:    data.redirectUrl,
        customer:        data.customer,
        customizations:  data.customizations,
        meta:            data.meta,
        callback: (response) => {
          if (response.status === "successful") {
            setPayResult("success");
            fetchBilling();
          } else {
            setPayResult("failed");
            setPaying(false);
          }
        },
        onclose: () => {
          setPaying(false);
        },
      });
    } catch {
      setPaying(false);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────

  const currentType  = planInfo?.type  ?? "free";
  const msgCount     = planInfo?.msgCount  ?? 0;
  const msgLimit     = planInfo?.msgLimit  ?? 200;
  const renewalDate  = planInfo?.renewalDate ?? null;
  const usagePct     = Math.min((msgCount / Math.max(msgLimit, 1)) * 100, 100);
  const usageColor   =
    usagePct >= 90 ? "var(--c-danger)" :
    usagePct >= 70 ? "var(--c-warn)"   :
    "var(--c-success)";
  const currentPlan  = PLANS.find(p => p.id === currentType) ?? PLANS[0];
  const upgradePlan  = PLANS.find(p => p.id === "plus")!;
  const alreadyPlus  = currentType === "plus";

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="ub-loading" style={{ padding: "48px", textAlign: "center", color: "var(--c-muted)", fontSize: ".84rem" }}>
        Loading billing info…
      </div>
    );
  }

  return (
    <>
      {/* Flutterwave SDK */}
      <script src="https://checkout.flutterwave.com/v3.js" async/>

      <style>{`
        .ub { display:flex; flex-direction:column; gap:20px; max-width:720px; }

        /* ── Banner ── */
        .ub-banner{
          display:flex; align-items:flex-start; gap:10px;
          padding:11px 14px; border-radius:12px; font-size:.8rem; font-weight:500;
          border:1px solid; animation:ubBanner .25s ease;
        }
        @keyframes ubBanner{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
        .ub-banner--success{ background:var(--c-success-soft); border-color:var(--c-success); color:var(--c-success); }
        .ub-banner--pending{ background:var(--c-warn-soft);    border-color:var(--c-warn);    color:var(--c-warn);    }
        .ub-banner--failed{  background:var(--c-danger-soft);  border-color:var(--c-danger);  color:var(--c-danger);  }
        .ub-banner svg{ flex-shrink:0; width:14px; height:14px; margin-top:1px; }
        .ub-banner-close{ margin-left:auto; background:none; border:none; cursor:pointer; color:inherit; opacity:.7; padding:0; display:flex; }
        .ub-banner-close:hover{ opacity:1; }

        /* ── Card ── */
        .ub-card{
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:16px; padding:20px; transition:background .3s,border-color .3s;
        }
        .ub-card-title{
          font-size:.65rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          color:var(--c-muted); margin-bottom:14px;
          display:flex; align-items:center; gap:7px;
        }
        .ub-card-title svg{ color:var(--c-accent); width:13px; height:13px; }

        /* ── Current plan ── */
        .ub-plan-row{ display:flex; align-items:flex-start; gap:16px; flex-wrap:wrap; }
        .ub-plan-dot{
          width:44px; height:44px; border-radius:12px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          background:color-mix(in srgb, var(--ub-accent) 15%, transparent);
          border:1.5px solid color-mix(in srgb, var(--ub-accent) 30%, transparent);
        }
        .ub-plan-dot svg{ color:var(--ub-accent); width:18px; height:18px; }
        .ub-plan-info{ flex:1; min-width:0; }
        .ub-plan-name{
          font-family:'DM Serif Display',Georgia,serif;
          font-size:1.3rem; color:var(--c-text); letter-spacing:-.02em;
        }
        .ub-plan-name em{ font-style:italic; color:var(--ub-accent, var(--c-accent)); }
        .ub-plan-sub{ font-size:.74rem; color:var(--c-muted); margin-top:3px; }
        .ub-renewal{
          display:inline-flex; align-items:center; gap:5px; margin-top:7px;
          font-size:.7rem; color:var(--c-muted); padding:4px 10px;
          border-radius:8px; background:var(--c-surface-2); border:1px solid var(--c-border);
        }
        .ub-renewal svg{ width:11px; height:11px; }

        /* ── Usage bar ── */
        .ub-usage{ margin-top:18px; }
        .ub-usage-head{
          display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;
        }
        .ub-usage-lbl{ font-size:.74rem; font-weight:600; color:var(--c-muted); }
        .ub-usage-val{ font-size:.74rem; font-weight:700; color:var(--c-text); }
        .ub-bar-track{
          height:7px; border-radius:4px;
          background:var(--c-surface-2); border:1px solid var(--c-border); overflow:hidden;
        }
        .ub-bar-fill{
          height:100%; border-radius:4px;
          background:var(--ub-usage-color, var(--c-success));
          transition:width .6s cubic-bezier(.34,1.56,.64,1);
        }
        .ub-usage-note{ font-size:.68rem; color:var(--c-muted); margin-top:5px; }

        /* ── Upgrade prompt ── */
        .ub-upgrade-prompt{
          margin-top:16px; padding:14px 16px;
          border-radius:12px; border:1.5px dashed var(--c-accent);
          background:var(--c-accent-soft);
          display:flex; align-items:center; gap:12px; flex-wrap:wrap;
        }
        .ub-upgrade-prompt-text{ flex:1; min-width:0; }
        .ub-upgrade-prompt h4{
          font-size:.84rem; font-weight:700; color:var(--c-accent); margin-bottom:3px;
        }
        .ub-upgrade-prompt p{ font-size:.74rem; color:var(--c-muted); }
        .ub-upgrade-btn{
          display:flex; align-items:center; gap:6px;
          padding:9px 18px; border-radius:10px;
          background:var(--c-accent); color:#fff;
          font-size:.8rem; font-weight:700; border:none; cursor:pointer;
          font-family:inherit; transition:background .14s, transform .12s; white-space:nowrap;
          flex-shrink:0;
        }
        .ub-upgrade-btn:hover{ background:var(--c-accent-dim); transform:translateY(-1px); }
        .ub-upgrade-btn svg{ width:14px; height:14px; }

        /* ── Feature list ── */
        .ub-features{ display:flex; flex-wrap:wrap; gap:7px; margin-top:14px; }
        .ub-feat{
          display:flex; align-items:center; gap:5px;
          font-size:.72rem; font-weight:600; color:var(--c-muted);
          padding:4px 10px; border-radius:20px;
          background:var(--c-surface-2); border:1px solid var(--c-border);
        }
        .ub-feat svg{ width:10px; height:10px; color:var(--c-success); }

        /* ── Modal ── */
        .ub-modal-overlay{
          position:fixed; inset:0; z-index:300;
          background:rgba(8,20,32,.6); backdrop-filter:blur(5px);
          display:flex; align-items:center; justify-content:center; padding:20px;
          animation:ubFade .18s ease;
        }
        @keyframes ubFade{from{opacity:0}to{opacity:1}}
        .ub-modal{
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:18px; padding:24px; width:100%; max-width:420px;
          box-shadow:var(--shadow-lg); animation:ubSlide .2s ease;
        }
        @keyframes ubSlide{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
        .ub-modal-head{display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
        .ub-modal-title{ font-family:'DM Serif Display',Georgia,serif; font-size:1.2rem; color:var(--c-text); }
        .ub-modal-title em{ font-style:italic; color:var(--c-accent); }
        .ub-modal-close{
          display:flex; align-items:center; justify-content:center;
          width:28px; height:28px; border-radius:7px;
          border:1px solid var(--c-border); background:var(--c-surface-2);
          color:var(--c-muted); cursor:pointer; transition:all .13s; flex-shrink:0;
        }
        .ub-modal-close:hover{ border-color:var(--c-danger); color:var(--c-danger); background:var(--c-danger-soft); }
        .ub-modal-close svg{ width:13px; height:13px; }

        .ub-plan-card{
          border:1.5px solid var(--c-border); border-radius:12px; padding:16px; margin-bottom:16px;
          background:var(--c-surface-2);
        }
        .ub-plan-card-top{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
        .ub-plan-card-icon{
          width:36px; height:36px; border-radius:9px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          background:color-mix(in srgb, #818CF8 15%, transparent);
        }
        .ub-plan-card-icon svg{ color:#818CF8; width:16px; height:16px; }
        .ub-plan-card-name{ font-size:.9rem; font-weight:700; color:var(--c-text); }
        .ub-period-tabs{display:flex;gap:6px;margin-bottom:14px}
        .ub-period-tab{flex:1;padding:8px 6px;border-radius:9px;border:1.5px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);font-size:.74rem;font-weight:600;cursor:pointer;transition:all .13s;font-family:inherit;text-align:center}
        .ub-period-tab:hover{border-color:var(--c-accent);color:var(--c-accent)}
        .ub-period-tab--on{border-color:var(--c-accent);background:var(--c-accent-soft);color:var(--c-accent)}
        .ub-period-badge{display:inline-block;margin-left:4px;padding:1px 5px;border-radius:4px;font-size:.58rem;font-weight:700;background:var(--c-success-soft);color:var(--c-success)}
        .ub-plan-card-features{ display:flex; flex-direction:column; gap:5px; }
        .ub-plan-card-feat{ display:flex; align-items:center; gap:7px; font-size:.76rem; color:var(--c-muted); }
        .ub-plan-card-feat svg{ width:12px; height:12px; color:var(--c-success); flex-shrink:0; }

        /* Phone input */
        .ub-field{ display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
        .ub-field label{ font-size:.72rem; font-weight:700; color:var(--c-muted); display:flex; align-items:center; gap:5px; }
        .ub-field label svg{ width:12px; height:12px; }
        .ub-input{
          width:100%; padding:10px 12px; border-radius:9px;
          border:1.5px solid var(--c-border); background:var(--c-surface);
          color:var(--c-text); font-size:.84rem; font-family:inherit;
          outline:none; transition:border-color .15s;
        }
        .ub-input:focus{ border-color:var(--c-accent); }
        .ub-input--err{ border-color:var(--c-danger) !important; }
        .ub-field-err{
          display:flex; align-items:center; gap:5px;
          font-size:.7rem; color:var(--c-danger);
        }
        .ub-field-err svg{ width:12px; height:12px; }
        .ub-pay-note{ font-size:.7rem; color:var(--c-muted); margin-bottom:14px; line-height:1.5; }

        .ub-pay-btn{
          width:100%; display:flex; align-items:center; justify-content:center; gap:7px;
          padding:12px; border-radius:10px;
          background:var(--c-accent); color:#fff;
          font-size:.86rem; font-weight:700; font-family:inherit;
          border:none; cursor:pointer; transition:background .14s;
        }
        .ub-pay-btn:hover:not(:disabled){ background:var(--c-accent-dim); }
        .ub-pay-btn:disabled{ opacity:.6; cursor:not-allowed; }
        .ub-pay-btn svg{ width:15px; height:15px; }

        /* ── Invoice table ── */
        .ub-table-wrap{ overflow-x:auto; -webkit-overflow-scrolling:touch; }
        table.ub-table{ width:100%; border-collapse:collapse; font-size:.8rem; }
        table.ub-table th{
          text-align:left; font-size:.63rem; font-weight:700;
          letter-spacing:.08em; text-transform:uppercase;
          color:var(--c-muted); padding:8px 10px; border-bottom:1px solid var(--c-border);
        }
        table.ub-table td{ padding:10px; border-bottom:1px solid var(--c-border); color:var(--c-muted); vertical-align:middle; }
        table.ub-table tr:last-child td{ border-bottom:none; }
        table.ub-table tr:hover td{ background:var(--c-surface-2); }
        .ub-badge{
          display:inline-flex; align-items:center; gap:4px;
          padding:3px 8px; border-radius:6px; font-size:.68rem; font-weight:700;
        }
        .ub-badge--success{ background:var(--c-success-soft); color:var(--c-success); }
        .ub-badge--pending{ background:var(--c-warn-soft);    color:var(--c-warn);    }
        .ub-badge--failed{  background:var(--c-danger-soft);  color:var(--c-danger);  }
        .ub-empty-inv{ text-align:center; padding:28px; color:var(--c-muted); font-size:.8rem; }
        .ub-empty-inv svg{ width:32px; height:32px; opacity:.35; margin-bottom:8px; display:block; margin-inline:auto; }
      `}</style>

      <div className="ub" style={{ /* @ts-ignore */ "--ub-accent": currentPlan.accent, "--ub-usage-color": usageColor } as React.CSSProperties}>

        {/* ── Payment result banner ─────────────────────────────────────── */}
        <AnimatePresence>
          {payResult && (
            <motion.div
              className={`ub-banner ub-banner--${payResult === "success" ? "success" : payResult === "pending" ? "pending" : "failed"}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {payResult === "success" ? <Check size={14}/> : <AlertTriangle size={14}/>}
              <span>
                {payResult === "success" && "Payment successful! Your Plus plan is now active."}
                {payResult === "pending" && "Payment is being processed. Your plan will upgrade shortly."}
                {payResult === "failed"  && "Payment failed or was cancelled. Please try again."}
              </span>
              <button className="ub-banner-close" onClick={() => setPayResult(null)} aria-label="Dismiss">
                <X size={12}/>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Current plan card ─────────────────────────────────────────── */}
        <div className="ub-card">
          <div className="ub-card-title"><CreditCard size={13}/> Current plan</div>

          <div className="ub-plan-row">
            <div className="ub-plan-dot">
              <Star size={18}/>
            </div>
            <div className="ub-plan-info">
              <div className="ub-plan-name">
                Velamini <em>{currentPlan.name}</em>
              </div>
              <div className="ub-plan-sub">{formatRWF(currentPlan.price)}/month · {currentPlan.messages.toLocaleString()} messages</div>

              {renewalDate && (
                <div className="ub-renewal">
                  <Calendar size={11}/>
                  Renews {formatDate(renewalDate)}
                </div>
              )}

              <div className="ub-features">
                {currentPlan.features.map(f => (
                  <span className="ub-feat" key={f}><Check size={10}/>{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Usage bar */}
          <div className="ub-usage">
            <div className="ub-usage-head">
              <span className="ub-usage-lbl">Monthly messages</span>
              <span className="ub-usage-val">{msgCount.toLocaleString()} / {msgLimit.toLocaleString()}</span>
            </div>
            <div className="ub-bar-track">
              <div className="ub-bar-fill" style={{ width: `${usagePct}%` }}/>
            </div>
            <div className="ub-usage-note">{Math.round(usagePct)}% used · resets monthly</div>
          </div>

          {/* Upgrade prompt (only shown on free plan) */}
          {!alreadyPlus && (
            <div className="ub-upgrade-prompt">
              <div className="ub-upgrade-prompt-text">
                <h4><TrendingUp size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }}/>Upgrade to Plus</h4>
                <p>Get 1,500 messages/month, resume generation, and priority support for 2,000 RWF/month.</p>
              </div>
              <button className="ub-upgrade-btn" onClick={() => { setShowUpgrade(true); setPayResult(null); }}>
                <Zap size={14}/> Upgrade now
              </button>
            </div>
          )}
        </div>

        {/* ── Invoice history ────────────────────────────────────────────── */}
        <div className="ub-card">
          <div className="ub-card-title"><Receipt size={13}/> Billing history</div>

          {invoices.length === 0 ? (
            <div className="ub-empty-inv">
              <Receipt/>
              No invoices yet
            </div>
          ) : (
            <div className="ub-table-wrap">
              <table className="ub-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td>{formatDate(inv.createdAt)}</td>
                      <td style={{ fontWeight: 600, color: "var(--c-text)", textTransform: "capitalize" }}>{inv.plan}</td>
                      <td style={{ fontWeight: 700, color: "var(--c-text)" }}>{inv.amountRWF.toLocaleString()} RWF</td>
                      <td>
                        <span className={`ub-badge ub-badge--${inv.status === "success" ? "success" : inv.status === "pending" ? "pending" : "failed"}`}>
                          {inv.status === "success" ? <Check size={9}/> : <AlertTriangle size={9}/>}
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── Upgrade modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            className="ub-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !paying && setShowUpgrade(false)}
          >
            <motion.div
              className="ub-modal"
              initial={{ opacity: 0, y: 14, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: .96 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="ub-modal-head">
                <div className="ub-modal-title">Upgrade to <em>Plus</em></div>
                <button className="ub-modal-close" onClick={() => setShowUpgrade(false)} disabled={paying}>
                  <X size={13}/>
                </button>
              </div>

              {/* Period selector */}
              {(() => {
                const BASE = 2000;
                const opts = [
                  { key: "monthly",  label: "Monthly",    months: 1,  discount: 0    },
                  { key: "6months",  label: "6 Months",   months: 6,  discount: 0.10 },
                  { key: "yearly",   label: "Yearly",     months: 12, discount: 0.20 },
                ] as const;
                return (
                  <div>
                    <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--c-muted)", marginBottom: 8 }}>Billing Period</div>
                    <div className="ub-period-tabs">
                      {opts.map(o => {
                        const total = Math.round(BASE * o.months * (1 - o.discount));
                        return (
                          <button key={o.key}
                            className={`ub-period-tab${period === o.key ? " ub-period-tab--on" : ""}`}
                            onClick={() => setPeriod(o.key)}
                            disabled={paying}>
                            {o.label}
                            {o.discount > 0 && <span className="ub-period-badge">-{o.discount * 100}%</span>}
                            <div style={{ fontSize: ".68rem", color: period === o.key ? "var(--c-accent)" : "var(--c-muted)", marginTop: 2, fontWeight: 500 }}>
                              {total.toLocaleString()} RWF
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Plan summary */}
              <div className="ub-plan-card">
                <div className="ub-plan-card-top">
                  <div className="ub-plan-card-icon"><Star size={16}/></div>
                  <div>
                    <div className="ub-plan-card-name">Plus plan</div>
                    <div style={{ fontSize: ".78rem", color: "var(--c-muted)" }}>
                      {(() => {
                        const months = period === "yearly" ? 12 : period === "6months" ? 6 : 1;
                        const discount = period === "yearly" ? 0.20 : period === "6months" ? 0.10 : 0;
                        const total = Math.round(2000 * months * (1 - discount));
                        const perMonth = Math.round(total / months);
                        return (<><strong style={{ color: "var(--c-text)" }}>{total.toLocaleString()} RWF</strong>
                          {period !== "monthly" && <span> · {perMonth.toLocaleString()} RWF/mo</span>}
                        </>);
                      })()}
                    </div>
                  </div>
                </div>
                <div className="ub-plan-card-features">
                  {upgradePlan.features.map(f => (
                    <div className="ub-plan-card-feat" key={f}><Check size={12}/>{f}</div>
                  ))}
                </div>
              </div>

              {/* Phone number */}
              <div className="ub-field">
                <label><Smartphone size={12}/> MTN / Airtel Rwanda number</label>
                <input
                  className={`ub-input${phoneError ? " ub-input--err" : ""}`}
                  type="tel"
                  placeholder="+250788123456 or 0788123456"
                  value={phoneNumber}
                  onChange={e => { setPhoneNumber(e.target.value); if (phoneError) setPhoneError(""); }}
                  disabled={paying}
                />
                {phoneError && (
                  <div className="ub-field-err"><AlertTriangle size={12}/>{phoneError}</div>
                )}
              </div>

              <p className="ub-pay-note">
                You will receive a payment prompt on your mobile phone. Enter your Mobile Money PIN to complete the payment. Your plan activates immediately after confirmation.
              </p>

              <button
                className="ub-pay-btn"
                onClick={handleUpgrade}
                disabled={paying}
              >
                {paying ? <RefreshCw size={15} className="spin"/> : <CreditCard size={15}/>}
                {paying ? "Processing…" : `Pay ${Math.round(2000 * (period === "yearly" ? 12 * 0.8 : period === "6months" ? 6 * 0.9 : 1)).toLocaleString()} RWF via Mobile Money`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
