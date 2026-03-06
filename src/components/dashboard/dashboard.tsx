"use client";

import { Clock, MessageSquare, CheckCircle2, Activity, Zap, Target, ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import type { DashboardViewType } from "./sidebar";

interface DashboardProps {
  stats: { trainingEntries: number; qaPairs: number; personalityTraits: number; knowledgeItems: number };
  onNavigate?: (view: DashboardViewType) => void;
}

const statCards = [
  { key: "trainingEntries"  as const, label: "Training Entries",   Icon: Clock,        accent: "#29A9D4", soft: "rgba(41,169,212,.12)"  },
  { key: "qaPairs"          as const, label: "Q&A Pairs",          Icon: MessageSquare, accent: "#6366F1", soft: "rgba(99,102,241,.12)"  },
  { key: "personalityTraits"as const, label: "Personality Traits", Icon: CheckCircle2,  accent: "#F59E0B", soft: "rgba(245,158,11,.12)"  },
  { key: "knowledgeItems"   as const, label: "Knowledge Items",    Icon: Activity,      accent: "#10B981", soft: "rgba(16,185,129,.12)"  },
];

const quickActions: { label: string; sub: string; Icon: any; view: DashboardViewType }[] = [
  { label: "Start Training", sub: "Teach your AI",     Icon: Zap,           view: "training" },
  { label: "Chat Now",       sub: "Talk to your twin", Icon: MessageSquare, view: "chat"     },
  { label: "View Profile",   sub: "Your public page",  Icon: Target,        view: "profile"  },
];

const recentActivity = [
  { label: "Training session completed",   time: "2h ago",   done: true  },
  { label: "New Q&A pair added",            time: "5h ago",   done: true  },
  { label: "Personality trait updated",     time: "1d ago",   done: true  },
  { label: "Knowledge base expanded",       time: "2d ago",   done: false },
];

function Counter({ value }: { value: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let s: number, raf: number;
      const tick = (now: number) => {
        if (!s) s = now;
        const p = Math.min((now - s) / 1300, 1);
        setN(Math.floor(p * value));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{n}</span>;
}

export default function DashboardView({ stats, onNavigate }: DashboardProps) {
  const total    = Object.values(stats).reduce((a, b) => a + b, 0);
  const progress = Math.min(100, Math.round((total / 20) * 100));

  return (
    <>
      <style>{`
        .dv { padding: 18px 14px 44px; background: var(--c-bg); min-height: 100%; transition: background .3s; }
        @media(min-width:600px){ .dv { padding: 26px 24px 48px; } }
        @media(min-width:1024px){ .dv { padding: 32px 36px 56px; } }
        .dv-inner { max-width: 1080px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

        /* header */
        .dv-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .dv-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(1.55rem, 4vw, 2.1rem); font-weight: 400;
          letter-spacing: -.022em; color: var(--c-text); margin-bottom: 4px;
        }
        .dv-sub { font-size: .8rem; color: var(--c-muted); }
        .dv-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 11px; border-radius: 20px;
          background: var(--c-accent-soft);
          border: 1px solid color-mix(in srgb, var(--c-accent) 25%, transparent);
          font-size: .66rem; font-weight: 700; color: var(--c-accent);
          letter-spacing: .05em; text-transform: uppercase; flex-shrink: 0; margin-top: 4px;
        }
        .dv-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; animation: dvp 2s infinite; }
        @keyframes dvp { 0%,100%{opacity:.4;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }

        /* stat grid */
        .dv-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, 1fr); }
        @media(min-width:900px){ .dv-grid { grid-template-columns: repeat(4, 1fr); } }

        .dv-card {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: 14px; padding: 16px 16px 14px;
          display: flex; flex-direction: column; gap: 12px;
          box-shadow: var(--shadow-sm); position: relative; overflow: hidden;
          transition: background .3s, border-color .2s, box-shadow .2s;
        }
        .dv-card::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2.5px;
          background: var(--ci-accent); opacity: .7; border-radius: 14px 14px 0 0;
        }
        .dv-card:hover { box-shadow: var(--shadow-md); border-color: var(--ci-accent); }

        .dv-ci {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--ci-soft); color: var(--ci-accent);
        }
        .dv-ci svg { width: 15px; height: 15px; }
        .dv-num {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(1.65rem, 3vw, 2.1rem); font-weight: 400;
          color: var(--c-text); letter-spacing: -.02em; line-height: 1;
        }
        .dv-clbl { font-size: .68rem; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }

        /* progress */
        .dv-prog {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: 14px; padding: 18px 20px;
          box-shadow: var(--shadow-sm); transition: background .3s, border-color .3s;
        }
        .dv-prog-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 6px; }
        .dv-prog-title { display: flex; align-items: center; gap: 7px; font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--c-text); }
        .dv-prog-title svg { color: var(--c-accent); }
        .dv-pct {
          font-size: .76rem; font-weight: 700; color: var(--c-accent);
          background: var(--c-accent-soft); padding: 2px 9px; border-radius: 20px;
        }
        .dv-track { width: 100%; height: 7px; border-radius: 7px; background: var(--c-surface-2); overflow: hidden; margin-bottom: 7px; }
        .dv-bar { height: 100%; border-radius: 7px; background: linear-gradient(90deg, var(--c-accent), #7DD3FC); transition: width .9s cubic-bezier(.4,0,.2,1); }
        .dv-prog-note { font-size: .7rem; color: var(--c-muted); }

        /* row */
        .dv-row { display: grid; gap: 12px; }
        @media(min-width:700px){ .dv-row { grid-template-columns: 1fr 1fr; } }

        .dv-panel {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: 14px; padding: 18px 18px 14px;
          box-shadow: var(--shadow-sm); transition: background .3s, border-color .3s;
        }
        .dv-panel-title { font-family: 'DM Serif Display', serif; font-size: .96rem; color: var(--c-text); margin-bottom: 12px; }

        /* quick actions */
        .dv-action {
          display: flex; align-items: center; gap: 11px;
          width: 100%; padding: 10px 12px; border-radius: 10px;
          border: 1px solid var(--c-border); background: var(--c-surface-2);
          cursor: pointer; transition: all .15s; margin-bottom: 7px;
          font-family: inherit; text-align: left; min-height: 50px;
        }
        .dv-action:last-child { margin-bottom: 0; }
        .dv-action:hover { background: var(--c-accent-soft); border-color: var(--c-accent); transform: translateX(3px); }
        .dv-aic {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--c-accent-soft); color: var(--c-accent);
        }
        .dv-aic svg { width: 13px; height: 13px; }
        .dv-action:hover .dv-aic { background: var(--c-accent); color: #fff; }
        .dv-albl { font-size: .82rem; font-weight: 600; color: var(--c-text); }
        .dv-asub { font-size: .68rem; color: var(--c-muted); margin-top: 1px; }
        .dv-aarr { color: var(--c-muted); opacity: 0; transition: opacity .15s, transform .15s; flex-shrink: 0; }
        .dv-action:hover .dv-aarr { opacity: 1; transform: translateX(2px); }

        /* activity */
        .dv-act { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--c-border); }
        .dv-act:last-child { border-bottom: none; padding-bottom: 0; }
        .dv-adot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .dv-adot--on  { background: var(--c-accent); }
        .dv-adot--off { background: var(--c-muted); opacity: .45; }
        .dv-alabel { flex: 1; font-size: .8rem; color: var(--c-text); }
        .dv-atime  { font-size: .68rem; color: var(--c-muted); white-space: nowrap; }
      `}</style>

      <div className="dv">
        <div className="dv-inner">

          {/* Header */}
          <motion.div className="dv-hd" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
            <div>
              <h1 className="dv-title">Dashboard</h1>
              <p className="dv-sub">Welcome back — here's your virtual self overview.</p>
            </div>
            <div className="dv-badge"><span className="dv-dot" /> Active</div>
          </motion.div>

          {/* Stats */}
          <div className="dv-grid">
            {statCards.map(({ key, label, Icon, accent, soft }, i) => (
              <motion.div key={key} className="dv-card"
                style={{ '--ci-accent': accent, '--ci-soft': soft } as any}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .3, delay: i * .06 }}>
                <div className="dv-ci"><Icon /></div>
                <div>
                  <div className="dv-num"><Counter value={stats[key]} /></div>
                  <div className="dv-clbl">{label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress */}
          <motion.div className="dv-prog" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28 }}>
            <div className="dv-prog-hd">
              <div className="dv-prog-title"><TrendingUp size={14} /> Training Progress</div>
              <span className="dv-pct">{progress}%</span>
            </div>
            <div className="dv-track"><div className="dv-bar" style={{ width: `${progress}%` }} /></div>
            <p className="dv-prog-note">{total} data points · {Math.max(0, 20 - total)} more recommended</p>
          </motion.div>

          {/* Quick actions + Activity */}
          <motion.div className="dv-row" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .36 }}>
            <div className="dv-panel">
              <div className="dv-panel-title">Quick Actions</div>
              {quickActions.map(({ label, sub, Icon, view }) => (
                <button key={view} className="dv-action" onClick={() => onNavigate?.(view)}>
                  <div className="dv-aic"><Icon /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dv-albl">{label}</div>
                    <div className="dv-asub">{sub}</div>
                  </div>
                  <ArrowRight size={13} className="dv-aarr" />
                </button>
              ))}
            </div>

            <div className="dv-panel">
              <div className="dv-panel-title">Recent Activity</div>
              {recentActivity.map((item, i) => (
                <div key={i} className="dv-act">
                  <div className={`dv-adot ${item.done ? 'dv-adot--on' : 'dv-adot--off'}`} />
                  <span className="dv-alabel">{item.label}</span>
                  <span className="dv-atime">{item.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}