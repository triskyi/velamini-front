"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Check, CreditCard, Calendar,
  Receipt, Star, RefreshCw, X,
  AlertTriangle, TrendingUp, ArrowRight, Crown,
  ShieldCheck, Sparkles, BarChart2,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────────── */
type Plan = {
  id: string; name: string; price: number;
  messages: number; accent: string; badge?: string; features: string[];
};
interface Invoice {
  id: string; createdAt: string; amountRWF: number;
  plan: string; status: "success" | "pending" | "failed";
}
interface PlanInfo {
  type: string; msgCount: number; msgLimit: number; renewalDate: string | null;
}
interface UserBillingProps {
  userId: string;
  paymentStatus?: "success" | "pending" | "failed" | null;
}
declare global {
  interface Window { FlutterwaveCheckout: (c: FlutterwaveConfig) => void; }
}
interface FlutterwaveConfig {
  public_key: string; tx_ref: string; amount: number; currency: string;
  payment_options: string; redirect_url: string;
  customer: { email: string; phone_number: string; name: string };
  customizations: { title: string; description: string; logo: string };
  meta: Record<string, string>;
  callback: (r: { status: string; tx_ref: string; transaction_id: string }) => void;
  onclose: () => void;
}

/* ── Plan catalogue ──────────────────────────────────────────────── */
const PLANS: Plan[] = [
  {
    id: "free", name: "Free", price: 0, messages: 200, accent: "#34D399",
    features: ["200 messages/month","150K AI tokens/month","Personal virtual self","Chat link sharing","Basic analytics"],
  },
  {
    id: "plus", name: "Plus", price: 100, messages: 1500, accent: "#818CF8",
    badge: "Most popular",
    features: ["1,500 messages/month","1M AI tokens/month","Personal virtual self","Chat link sharing","Resume generation","Priority support"],
  },
];

const PLUS_HIGHLIGHTS = [
  { Icon: Sparkles,   text: "7.5× more messages/month"       },
  { Icon: BarChart2,  text: "Full analytics & insights"       },
  { Icon: Crown,      text: "Resume generation included"      },
  { Icon: ShieldCheck,text: "Priority support & faster replies"},
];

/* ── Helpers ─────────────────────────────────────────────────────── */
const fmt     = (n: number) => n === 0 ? "Free" : `${n.toLocaleString()} RWF`;
const fmtDate = (s: string | null) => !s ? "—" :
  new Date(s).toLocaleDateString("en-RW", { year:"numeric", month:"short", day:"numeric" });

const BILLING_OPTS = [
  { key:"monthly",  label:"Monthly",  months:1,  discount:0    },
  { key:"6months",  label:"6 Months", months:6,  discount:0.10 },
  { key:"yearly",   label:"Yearly",   months:12, discount:0.20 },
] as const;

/* ── Animated counter ────────────────────────────────────────────── */
function AnimNum({ to }: { to: number }) {
  const [v, setV] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return; done.current = true;
    let c = 0; const step = Math.ceil(to / 50);
    const id = setInterval(() => { c += step; if (c >= to) { setV(to); clearInterval(id); } else setV(c); }, 16);
    return () => clearInterval(id);
  }, [to]);
  return <>{v.toLocaleString()}</>;
}

/* ── Component ───────────────────────────────────────────────────── */
export default function UserBilling({ userId, paymentStatus }: UserBillingProps) {
  const [planInfo,    setPlanInfo]    = useState<PlanInfo | null>(null);
  const [invoices,    setInvoices]    = useState<Invoice[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [period,      setPeriod]      = useState<"monthly"|"6months"|"yearly">("monthly");
  const [paying,      setPaying]      = useState(false);
  const [payResult,   setPayResult]   = useState<"success"|"pending"|"failed"|null>(paymentStatus ?? null);

  /* ── Fetch ──────────────────────────────────────────────────────── */
  const fetchBilling = () => {
    setLoading(true);
    fetch("/api/billing/user/invoices")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setPlanInfo(d.plan); setInvoices(d.invoices ?? []); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchBilling(); }, []);

  /* ── Checkout ───────────────────────────────────────────────────── */
  const handleUpgrade = async () => {
    setPaying(true); setPayResult(null);
    try {
      const data = await fetch("/api/billing/user/create-payment", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ plan:"plus", period }),
      }).then(r => r.json());
      if (data.error) { setPaying(false); return; }
      await loadFlwScript();
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
        callback: (res) => {
          if (res.status === "successful") { setPayResult("success"); fetchBilling(); setShowUpgrade(false); }
          else { setPayResult("failed"); setPaying(false); }
        },
        onclose: () => setPaying(false),
      });
    } catch { setPaying(false); }
  };

  /* ── Derived ────────────────────────────────────────────────────── */
  const currentType = planInfo?.type ?? "free";
  const msgCount    = planInfo?.msgCount  ?? 0;
  const msgLimit    = planInfo?.msgLimit  ?? 200;
  const renewal     = planInfo?.renewalDate ?? null;
  const usagePct    = Math.min((msgCount / Math.max(msgLimit,1)) * 100, 100);
  const usageColor  = usagePct >= 90 ? "#EF4444" : usagePct >= 70 ? "#F59E0B" : "#34D399";
  const currentPlan = PLANS.find(p => p.id === currentType) ?? PLANS[0];
  const upgradePlan = PLANS.find(p => p.id === "plus")!;
  const isPlus      = currentType === "plus";

  const getPeriodPrice = (key: typeof period) => {
    const o = BILLING_OPTS.find(b => b.key === key)!;
    return Math.round(100 * o.months * (1 - o.discount));
  };

  /* ── Loading ────────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:60,color:"var(--c-muted)",fontSize:".84rem" }}>
      <RefreshCw size={16} style={{ animation:"ub-spin .7s linear infinite" }}/> Loading billing…
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes ub-spin   { to { transform: rotate(360deg); } }
        @keyframes ub-in     { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes ub-banner { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
        @keyframes ub-bar    { from { width:0; } to { width:var(--ub-bar-w); } }

        .ub-root { display:flex; flex-direction:column; gap:20px; max-width:680px; width:100%; margin:0 auto; padding:28px 16px 32px; }

        /* ── Banner ── */
        .ub-banner {
          display:flex; align-items:flex-start; gap:10px;
          padding:12px 16px; border-radius:12px; font-size:.8rem; font-weight:600;
          border:1px solid; animation:ub-banner .25s ease;
        }
        .ub-banner svg { flex-shrink:0; margin-top:1px; }
        .ub-banner-close {
          margin-left:auto; background:none; border:none; cursor:pointer;
          color:inherit; opacity:.65; padding:0; display:flex; transition:opacity .12s;
        }
        .ub-banner-close:hover { opacity:1; }
        .ub-banner.ok   { background:var(--c-success-soft); border-color:var(--c-success); color:var(--c-success); }
        .ub-banner.pend { background:var(--c-warn-soft);    border-color:var(--c-warn);    color:var(--c-warn);    }
        .ub-banner.fail { background:var(--c-danger-soft);  border-color:var(--c-danger);  color:var(--c-danger);  }

        /* ── Card shell ── */
        .ub-card {
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:18px; overflow:hidden;
          animation:ub-in .35s ease both;
        }
        .ub-card-hd {
          padding:14px 20px 13px;
          border-bottom:1px solid var(--c-border);
          background:var(--c-surface-2);
          display:flex; align-items:center; justify-content:space-between;
        }
        .ub-card-label {
          font-size:.63rem; font-weight:800; letter-spacing:.1em;
          text-transform:uppercase; color:var(--c-muted);
          display:flex; align-items:center; gap:7px;
        }
        .ub-card-label svg { color:var(--c-accent); }
        .ub-card-body { padding:20px; }

        /* ── Plan hero ── */
        .ub-plan-hero { display:flex; align-items:flex-start; gap:16px; flex-wrap:wrap; }
        .ub-plan-orb {
          width:52px; height:52px; border-radius:16px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          position:relative; overflow:hidden;
          border:1.5px solid color-mix(in srgb,var(--ub-ac) 35%,transparent);
          background:color-mix(in srgb,var(--ub-ac) 12%,var(--c-surface-2));
        }
        .ub-plan-orb::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(circle at 40% 35%, color-mix(in srgb,var(--ub-ac) 45%,transparent), transparent 70%);
        }
        .ub-plan-orb svg { position:relative; z-index:1; color:var(--ub-ac); }
        .ub-plan-meta { flex:1; min-width:0; }
        .ub-plan-headline {
          font-family:'DM Serif Display',Georgia,serif;
          font-size:1.55rem; line-height:1.1; color:var(--c-text); letter-spacing:-.02em;
        }
        .ub-plan-headline em { font-style:italic; color:var(--ub-ac); }
        .ub-plan-sub { font-size:.77rem; color:var(--c-muted); margin-top:4px; }
        .ub-renewal-chip {
          display:inline-flex; align-items:center; gap:5px; margin-top:10px;
          font-size:.7rem; font-weight:600; color:var(--c-muted);
          padding:4px 11px; border-radius:20px;
          background:var(--c-surface-2); border:1px solid var(--c-border);
        }
        .ub-renewal-chip svg { width:10px; height:10px; }

        /* ── Usage meter ── */
        .ub-usage { margin-top:20px; }
        .ub-usage-row {
          display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;
        }
        .ub-usage-label { font-size:.74rem; font-weight:600; color:var(--c-muted); }
        .ub-usage-nums  { font-size:.74rem; font-weight:800; color:var(--c-text); letter-spacing:-.01em; }
        .ub-track {
          height:8px; border-radius:20px; overflow:hidden;
          background:var(--c-surface-2); border:1px solid var(--c-border);
        }
        .ub-fill {
          height:100%; border-radius:20px;
          background:linear-gradient(90deg,
            color-mix(in srgb,var(--ub-usage-c) 60%,transparent),
            var(--ub-usage-c));
          width:var(--ub-bar-w);
          animation:ub-bar .8s cubic-bezier(.34,1.56,.64,1) both .2s;
          box-shadow:0 0 8px color-mix(in srgb,var(--ub-usage-c) 50%,transparent);
        }
        .ub-usage-hint {
          display:flex; align-items:center; justify-content:space-between;
          margin-top:6px; font-size:.68rem; color:var(--c-muted);
        }

        /* ── Feature pills ── */
        .ub-pills { display:flex; flex-wrap:wrap; gap:6px; margin-top:16px; }
        .ub-pill {
          display:flex; align-items:center; gap:5px; padding:4px 11px; border-radius:20px;
          font-size:.7rem; font-weight:700; color:var(--c-muted);
          background:var(--c-surface-2); border:1px solid var(--c-border);
        }
        .ub-pill svg { width:9px; height:9px; color:var(--c-success); }

        /* ── Upgrade CTA ── */
        .ub-cta {
          margin-top:18px; padding:16px 18px; border-radius:14px;
          border:1.5px dashed color-mix(in srgb,var(--c-accent) 45%,var(--c-border));
          background:color-mix(in srgb,var(--c-accent) 5%,var(--c-surface));
          display:flex; align-items:center; gap:14px; flex-wrap:wrap;
        }
        .ub-cta-copy { flex:1; min-width:0; }
        .ub-cta-copy h4 {
          font-size:.86rem; font-weight:800; color:var(--c-accent);
          display:flex; align-items:center; gap:6px; margin-bottom:3px;
        }
        .ub-cta-copy p { font-size:.74rem; color:var(--c-muted); line-height:1.5; }
        .ub-cta-btn {
          display:flex; align-items:center; gap:7px; padding:10px 20px;
          border-radius:11px; background:var(--c-accent); color:#fff;
          font-size:.81rem; font-weight:800; border:none; cursor:pointer;
          font-family:inherit; flex-shrink:0; white-space:nowrap;
          transition:opacity .14s, transform .14s, box-shadow .14s;
          box-shadow:0 4px 16px color-mix(in srgb,var(--c-accent) 35%,transparent);
        }
        .ub-cta-btn:hover { opacity:.88; transform:translateY(-1px); box-shadow:0 6px 22px color-mix(in srgb,var(--c-accent) 42%,transparent); }
        .ub-cta-btn svg { width:14px; height:14px; }

        /* ── Invoice table ── */
        .ub-tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        table.ub-tbl { width:100%; border-collapse:collapse; font-size:.8rem; }
        table.ub-tbl th {
          text-align:left; font-size:.62rem; font-weight:800; letter-spacing:.09em;
          text-transform:uppercase; color:var(--c-muted); padding:10px 16px;
          border-bottom:1px solid var(--c-border);
          background:color-mix(in srgb,var(--c-surface-2) 70%,transparent);
        }
        table.ub-tbl td {
          padding:11px 16px; border-bottom:1px solid var(--c-border);
          color:var(--c-muted); vertical-align:middle;
        }
        table.ub-tbl tr:last-child td { border-bottom:none; }
        table.ub-tbl tbody tr:hover td {
          background:color-mix(in srgb,var(--c-accent) 4%,var(--c-surface));
        }
        .ub-inv-badge {
          display:inline-flex; align-items:center; gap:4px;
          padding:4px 9px; border-radius:7px; font-size:.69rem; font-weight:800;
        }
        .ub-inv-badge svg { width:10px; height:10px; }
        .ub-inv-badge.ok   { background:var(--c-success-soft); color:var(--c-success); }
        .ub-inv-badge.pend { background:var(--c-warn-soft);    color:var(--c-warn);    }
        .ub-inv-badge.fail { background:var(--c-danger-soft);  color:var(--c-danger);  }
        .ub-empty {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:10px; padding:44px 20px; color:var(--c-muted); font-size:.8rem;
        }
        .ub-empty svg { width:34px; height:34px; opacity:.22; }

        /* ── Modal ── */
        .ub-ov {
          position:fixed; inset:0; z-index:300;
          background:rgba(6,14,24,.65); backdrop-filter:blur(6px);
          display:flex; align-items:center; justify-content:center; padding:20px;
        }
        .ub-modal {
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:22px; padding:26px 26px 24px; width:100%; max-width:440px;
          box-shadow:0 24px 80px rgba(0,0,0,.35);
          max-height:90vh; overflow-y:auto; scrollbar-width:none;
        }
        .ub-modal::-webkit-scrollbar { display:none; }
        .ub-modal-hd {
          display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px;
        }
        .ub-modal-title {
          font-family:'DM Serif Display',Georgia,serif;
          font-size:1.35rem; color:var(--c-text); line-height:1.15;
        }
        .ub-modal-title em { font-style:italic; color:#818CF8; }
        .ub-modal-sub { font-size:.75rem; color:var(--c-muted); margin-top:3px; }
        .ub-modal-close {
          display:flex; align-items:center; justify-content:center;
          width:30px; height:30px; border-radius:8px; flex-shrink:0;
          border:1px solid var(--c-border); background:var(--c-surface-2);
          color:var(--c-muted); cursor:pointer; transition:all .13s;
        }
        .ub-modal-close:hover { border-color:var(--c-danger); color:var(--c-danger); background:var(--c-danger-soft); }
        .ub-modal-close svg { width:13px; height:13px; }
        .ub-modal-section-lbl {
          font-size:.67rem; font-weight:800; letter-spacing:.09em;
          text-transform:uppercase; color:var(--c-muted); margin-bottom:8px;
        }

        /* Period tabs */
        .ub-period-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:20px; }
        .ub-period-tab {
          padding:11px 8px; border-radius:12px; border:1.5px solid var(--c-border);
          background:var(--c-surface-2); cursor:pointer; transition:all .15s;
          font-family:inherit; text-align:center;
        }
        .ub-period-tab:hover:not(:disabled) { border-color:#818CF8; }
        .ub-period-tab.on { border-color:#818CF8; background:rgba(129,140,248,.08); }
        .ub-period-tab:disabled { opacity:.5; cursor:not-allowed; }
        .ub-pt-label { font-size:.74rem; font-weight:800; color:var(--c-text); }
        .ub-pt-price { font-size:.69rem; color:var(--c-muted); margin-top:3px; }
        .ub-period-tab.on .ub-pt-price { color:#818CF8; }
        .ub-pt-badge {
          display:inline-block; margin-top:5px; padding:2px 6px; border-radius:5px;
          font-size:.6rem; font-weight:800;
          background:var(--c-success-soft); color:var(--c-success);
        }

        /* Highlights */
        .ub-highlights { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:20px; }
        .ub-hl {
          display:flex; align-items:center; gap:8px; padding:10px 12px;
          border-radius:11px; background:var(--c-surface-2); border:1px solid var(--c-border);
          font-size:.73rem; font-weight:600; color:var(--c-muted); line-height:1.35;
        }
        .ub-hl-icon {
          width:28px; height:28px; border-radius:8px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          background:rgba(129,140,248,.13);
        }
        .ub-hl-icon svg { width:13px; height:13px; color:#818CF8; }

        /* Amount display */
        .ub-amount-row {
          display:flex; align-items:baseline; gap:8px; padding:14px 16px;
          border-radius:12px; margin-bottom:18px;
          background:color-mix(in srgb,#818CF8 7%,var(--c-surface));
          border:1px solid color-mix(in srgb,#818CF8 22%,var(--c-border));
        }
        .ub-amount-big {
          font-family:'DM Serif Display',Georgia,serif;
          font-size:1.9rem; font-weight:400; color:var(--c-text); letter-spacing:-.02em;
        }
        .ub-amount-unit { font-size:.8rem; color:var(--c-muted); }
        .ub-amount-save {
          margin-left:auto; font-size:.72rem; font-weight:800;
          color:var(--c-success); display:flex; align-items:center; gap:3px;
        }

        /* Phone field */
        .ub-field { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
        .ub-field-lbl {
          font-size:.72rem; font-weight:800; color:var(--c-muted);
          display:flex; align-items:center; gap:5px;
        }
        .ub-field-lbl svg { width:12px; height:12px; }
        .ub-input {
          width:100%; padding:11px 13px; border-radius:10px;
          border:1.5px solid var(--c-border); background:var(--c-surface);
          color:var(--c-text); font-size:.84rem; font-family:inherit;
          outline:none; transition:border-color .15s, box-shadow .15s;
        }
        .ub-input:focus { border-color:#818CF8; box-shadow:0 0 0 3px rgba(129,140,248,.12); }
        .ub-input.err { border-color:var(--c-danger); }
        .ub-err-msg {
          display:flex; align-items:center; gap:5px; font-size:.7rem; color:var(--c-danger);
        }
        .ub-err-msg svg { width:12px; height:12px; flex-shrink:0; }
        .ub-pay-note { font-size:.7rem; color:var(--c-muted); line-height:1.6; margin-bottom:16px; }

        /* Pay button */
        .ub-pay-btn {
          width:100%; display:flex; align-items:center; justify-content:center; gap:8px;
          padding:13px; border-radius:12px; background:#818CF8; color:#fff;
          font-size:.86rem; font-weight:800; font-family:inherit; border:none;
          cursor:pointer; transition:opacity .14s, transform .14s, box-shadow .14s;
          box-shadow:0 4px 20px rgba(129,140,248,.38);
        }
        .ub-pay-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); box-shadow:0 6px 28px rgba(129,140,248,.48); }
        .ub-pay-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }
        .ub-pay-btn svg { width:15px; height:15px; }
        .ub-spin { animation:ub-spin .7s linear infinite; }
      `}</style>

      <div className="ub-root" style={{
        ["--ub-ac"      as any]: currentPlan.accent,
        ["--ub-usage-c" as any]: usageColor,
        ["--ub-bar-w"   as any]: `${usagePct}%`,
      }}>

        {/* ━━━━━━ BANNER ━━━━━━ */}
        <AnimatePresence>
          {payResult && (
            <motion.div
              className={`ub-banner ${payResult==="success"?"ok":payResult==="pending"?"pend":"fail"}`}
              initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
              {payResult==="success" ? <Check size={14}/> : <AlertTriangle size={14}/>}
              <span>
                {payResult==="success" && "Payment successful — your Plus plan is now active!"}
                {payResult==="pending" && "Payment is processing. Your plan will upgrade shortly."}
                {payResult==="failed"  && "Payment failed or was cancelled. Please try again."}
              </span>
              <button className="ub-banner-close" onClick={() => setPayResult(null)}>
                <X size={12}/>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ━━━━━━ CURRENT PLAN ━━━━━━ */}
        <div className="ub-card" style={{ animationDelay:".04s" }}>
          <div className="ub-card-hd">
            <span className="ub-card-label"><CreditCard size={13}/> Current plan</span>
            {isPlus && (
              <span style={{
                display:"flex", alignItems:"center", gap:4,
                fontSize:".68rem", fontWeight:700, color:"#818CF8",
                background:"rgba(129,140,248,.12)", padding:"3px 9px",
                borderRadius:20, border:"1px solid rgba(129,140,248,.25)"
              }}>
                <Crown size={10}/> Plus active
              </span>
            )}
          </div>

          <div className="ub-card-body">
            <div className="ub-plan-hero">
              <div className="ub-plan-orb">
                <Star size={20}/>
              </div>
              <div className="ub-plan-meta">
                <div className="ub-plan-headline">
                  Velamini&nbsp;<em>{currentPlan.name}</em>
                </div>
                <div className="ub-plan-sub">
                  {fmt(currentPlan.price)}/month · {currentPlan.messages.toLocaleString()} messages/month
                </div>
                {renewal && (
                  <div className="ub-renewal-chip">
                    <Calendar size={10}/> Renews {fmtDate(renewal)}
                  </div>
                )}
              </div>
            </div>

            {/* Usage */}
            <div className="ub-usage">
              <div className="ub-usage-row">
                <span className="ub-usage-label">Monthly messages used</span>
                <span className="ub-usage-nums">
                  <AnimNum to={msgCount}/> / {msgLimit.toLocaleString()}
                </span>
              </div>
              <div className="ub-track"><div className="ub-fill"/></div>
              <div className="ub-usage-hint">
                <span>{Math.round(usagePct)}% used</span>
                <span>Resets monthly</span>
              </div>
            </div>

            {/* Pills */}
            <div className="ub-pills">
              {currentPlan.features.map(f => (
                <span className="ub-pill" key={f}><Check size={9}/>{f}</span>
              ))}
            </div>

            {/* Upgrade CTA */}
            {!isPlus && (
              <div className="ub-cta">
                <div className="ub-cta-copy">
                  <h4><TrendingUp size={13}/> Unlock Plus</h4>
                  <p>1,500 messages, resume generation and priority support — from 2,000 RWF/month.</p>
                </div>
                <button className="ub-cta-btn" onClick={() => { setShowUpgrade(true); setPayResult(null); }}>
                  <Zap size={14}/> Upgrade now <ArrowRight size={13}/>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ━━━━━━ BILLING HISTORY ━━━━━━ */}
        <div className="ub-card" style={{ animationDelay:".1s" }}>
          <div className="ub-card-hd">
            <span className="ub-card-label"><Receipt size={13}/> Billing history</span>
          </div>

          {invoices.length === 0 ? (
            <div className="ub-empty"><Receipt/><span>No invoices yet</span></div>
          ) : (
            <div className="ub-tbl-wrap">
              <table className="ub-tbl">
                <thead>
                  <tr>
                    <th>Date</th><th>Plan</th><th>Amount</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontSize:".77rem" }}>{fmtDate(inv.createdAt)}</td>
                      <td style={{ fontWeight:700, color:"var(--c-text)", textTransform:"capitalize" }}>{inv.plan}</td>
                      <td style={{ fontWeight:800, color:"var(--c-text)", whiteSpace:"nowrap" }}>{inv.amountRWF.toLocaleString()} RWF</td>
                      <td>
                        <span className={`ub-inv-badge ${inv.status==="success"?"ok":inv.status==="pending"?"pend":"fail"}`}>
                          {inv.status==="success" ? <Check size={10}/> : <AlertTriangle size={10}/>}
                          {inv.status==="success" ? "Paid" : inv.status==="pending" ? "Pending" : "Failed"}
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

      {/* ━━━━━━ UPGRADE MODAL ━━━━━━ */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div className="ub-ov"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => !paying && setShowUpgrade(false)}>
            <motion.div className="ub-modal"
              initial={{ opacity:0, scale:.95, y:14 }}
              animate={{ opacity:1, scale:1,   y:0  }}
              exit={{ opacity:0, scale:.95, y:14 }}
              transition={{ type:"spring", damping:22, stiffness:260 }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="ub-modal-hd">
                <div>
                  <div className="ub-modal-title">Upgrade to <em>Plus</em></div>
                  <div className="ub-modal-sub">Unlock the full Velamini experience</div>
                </div>
                <button className="ub-modal-close" onClick={() => setShowUpgrade(false)} disabled={paying}>
                  <X size={13}/>
                </button>
              </div>

              {/* Period */}
              <div className="ub-modal-section-lbl">Billing period</div>
              <div className="ub-period-grid">
                {BILLING_OPTS.map(o => {
                  const total = Math.round(100 * o.months * (1 - o.discount));
                  const perMo = Math.round(total / o.months);
                  return (
                    <button key={o.key}
                      className={`ub-period-tab${period===o.key?" on":""}`}
                      onClick={() => setPeriod(o.key)} disabled={paying}>
                      <div className="ub-pt-label">{o.label}</div>
                      <div className="ub-pt-price">
                        {o.months > 1 ? `${perMo.toLocaleString()} RWF/mo` : `${total.toLocaleString()} RWF`}
                      </div>
                      {o.discount > 0 && (
                        <div className="ub-pt-badge">Save {o.discount*100}%</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* What's included */}
              <div className="ub-modal-section-lbl">What's included</div>
              <div className="ub-highlights">
                {PLUS_HIGHLIGHTS.map(({ Icon, text }) => (
                  <div className="ub-hl" key={text}>
                    <div className="ub-hl-icon"><Icon size={13}/></div>
                    {text}
                  </div>
                ))}
              </div>

              {/* Amount */}
              {(() => {
                const o    = BILLING_OPTS.find(b => b.key === period)!;
                const tot  = getPeriodPrice(period);
                const saved= Math.round(100 * o.months) - tot;
                return (
                  <div className="ub-amount-row">
                    <div className="ub-amount-big">{tot.toLocaleString()}</div>
                    <div className="ub-amount-unit">
                      RWF {o.months > 1 ? `for ${o.months} months` : "/ month"}
                    </div>
                    {saved > 0 && (
                      <div className="ub-amount-save">
                        <Check size={11}/> Save {saved.toLocaleString()} RWF
                      </div>
                    )}
                  </div>
                );
              })()}

              <p className="ub-pay-note">
                You'll be taken to Flutterwave's secure page to enter your Mobile Money number and confirm payment.
              </p>

              <button className="ub-pay-btn" onClick={handleUpgrade} disabled={paying}>
                {paying
                  ? <><RefreshCw size={15} className="ub-spin"/> Processing payment…</>
                  : <><CreditCard size={15}/> Pay {getPeriodPrice(period).toLocaleString()} RWF via Mobile Money</>
                }
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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