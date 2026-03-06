"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Save,
  User,
  Briefcase,
  Award,
  Code,
  Link as LinkIcon,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  CheckCircle2,
  Brain,
  X,
} from "lucide-react";

interface KnowledgeBaseData {
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  currentLocation?: string;
  languages?: string;
  bio?: string;
  relationshipStatus?: string;
  hobbies?: string;
  favoriteFood?: string;
  education?: string;
  experience?: string;
  skills?: string;
  projects?: string;
  awards?: string;
  socialLinks?: string;
  socialUpdates?: string;
  isModelTrained?: boolean;
  lastTrainedAt?: string;
}

interface TrainingViewProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  knowledgeBase?: KnowledgeBaseData;
}

const STEPS = [
  { id: 1, name: "Identity", icon: User },
  { id: 2, name: "Education", icon: Briefcase },
  { id: 3, name: "Experience", icon: Briefcase },
  { id: 4, name: "Skills", icon: Code },
  { id: 5, name: "Projects", icon: Code },
  { id: 6, name: "Awards", icon: Award },
  { id: 7, name: "Social", icon: LinkIcon },
] as const;

type Toast = { type: "success" | "error"; text: string } | null;

export default function TrainingView({ knowledgeBase }: TrainingViewProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<KnowledgeBaseData>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [message, setMessage] = useState<Toast>(null);

  useEffect(() => {
    if (knowledgeBase) setFormData(knowledgeBase);
  }, [knowledgeBase]);

  const showMessage = (m: Exclude<Toast, null>, ms = 3000) => {
    setMessage(m);
    window.setTimeout(() => setMessage(null), ms);
  };

  const debounce = (fn: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const saveAndRetrain = async (newData: KnowledgeBaseData) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      const data = await res.json();
      if (data?.ok) {
        showMessage({ type: "success", text: "Saved successfully!" });
        setIsTraining(true);
        const trainRes = await fetch("/api/training/train", { method: "POST" });
        const trainData = await trainRes.json();
        if (trainData?.ok) {
          setFormData((prev) => ({
            ...prev,
            isModelTrained: true,
            lastTrainedAt: trainData.trainedAt,
          }));
          showMessage({ type: "success", text: "Virtual self retrained!" }, 4000);
        } else {
          showMessage({ type: "error", text: trainData?.error || "Training failed" }, 5000);
        }
      } else {
        showMessage({ type: "error", text: data?.error || "Failed to save" }, 5000);
      }
    } catch {
      showMessage({ type: "error", text: "Network error occurred" }, 5000);
    } finally {
      setIsSaving(false);
      setIsTraining(false);
    }
  };

  const debouncedSaveAndRetrain = useMemo(() => debounce(saveAndRetrain, 1200), []);

  const updateField = (field: keyof KnowledgeBaseData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      debouncedSaveAndRetrain(newData);
      return newData;
    });
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const goToStep = (step: number) => setCurrentStep(step);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data?.ok) {
        showMessage({ type: "success", text: "Saved successfully!" });
      } else {
        showMessage({ type: "error", text: data?.error || "Failed to save" }, 5000);
      }
    } catch {
      showMessage({ type: "error", text: "Network error occurred" }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTrainModel = async () => {
    setIsTraining(true);
    setMessage(null);
    try {
      const res = await fetch("/api/training/train", { method: "POST" });
      const data = await res.json();
      if (data?.ok) {
        setFormData((prev) => ({
          ...prev,
          isModelTrained: true,
          lastTrainedAt: data.trainedAt,
        }));
        showMessage({ type: "success", text: "Virtual self trained successfully!" }, 5000);
      } else {
        showMessage({ type: "error", text: data?.error || "Training failed" }, 5000);
      }
    } catch {
      showMessage({ type: "error", text: "Failed to train model" }, 5000);
    } finally {
      setIsTraining(false);
    }
  };

  const StepIcon = STEPS[currentStep - 1].icon;
  const progress = Math.round((currentStep / STEPS.length) * 100);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="tv-fields">
            <div className="tv-grid-2">
              <Field label="Full Name" placeholder="e.g., ISHIMWE TRESOR BERTRAND" value={formData.fullName || ""} onChange={(v) => updateField("fullName", v)} />
              <Field label="Birth Date" placeholder="e.g., February 15, 2002" value={formData.birthDate || ""} onChange={(v) => updateField("birthDate", v)} />
              <Field label="Birth Place" placeholder="e.g., Huye District, Rwanda" value={formData.birthPlace || ""} onChange={(v) => updateField("birthPlace", v)} />
              <Field label="Current Location" placeholder="e.g., Kigali, Rwanda" value={formData.currentLocation || ""} onChange={(v) => updateField("currentLocation", v)} />
              <Field label="Languages" placeholder="e.g., Kinyarwanda, English, French" value={formData.languages || ""} onChange={(v) => updateField("languages", v)} />
              <Field label="Relationship Status" placeholder="e.g., Single, Married" value={formData.relationshipStatus || ""} onChange={(v) => updateField("relationshipStatus", v)} />
              <Field label="Hobbies" placeholder="e.g., Dancing, Reading" value={formData.hobbies || ""} onChange={(v) => updateField("hobbies", v)} />
              <Field label="Favorite Food" placeholder="e.g., Chips" value={formData.favoriteFood || ""} onChange={(v) => updateField("favoriteFood", v)} />
            </div>
            <TextAreaField label="Bio" placeholder="e.g., Software engineer with 3+ years experience..." rows={4} value={formData.bio || ""} onChange={(v) => updateField("bio", v)} />
          </div>
        );
      case 2:
        return <TextAreaField label="Education History" placeholder={"e.g., Bugema University — BSc Software Engineering\nGitwe Adventist College — A2 (MPC)"} rows={8} value={formData.education || ""} onChange={(v) => updateField("education", v)} />;
      case 3:
        return <TextAreaField label="Work Experience" placeholder={"e.g., OpenFn (Present) — Junior Developer\nCOODIC (Mar 2024 – Jun 2024) — Software Engineer"} rows={8} value={formData.experience || ""} onChange={(v) => updateField("experience", v)} />;
      case 4:
        return <TextAreaField label="Technical Skills" placeholder={"e.g., Languages: HTML, CSS, Python, JavaScript\nFrameworks: React, Next.js, Django\nDB: Postgres, MySQL"} rows={8} value={formData.skills || ""} onChange={(v) => updateField("skills", v)} />;
      case 5:
        return <TextAreaField label="Notable Projects" placeholder={"e.g., OpenFn Adaptors — Built Flutterwave adaptor\nMyGuyAssistantAPI — Python + Flask API"} rows={8} value={formData.projects || ""} onChange={(v) => updateField("projects", v)} />;
      case 6:
        return <TextAreaField label="Achievements & Awards" placeholder={"e.g., Winner — AfricasTalking Hackathon (3 times)"} rows={6} value={formData.awards || ""} onChange={(v) => updateField("awards", v)} />;
      case 7:
        return (
          <div className="tv-fields">
            <TextAreaField label="Social Media Links" placeholder={"e.g., GitHub: https://github.com/username\nLinkedIn: https://linkedin.com/in/username"} rows={6} value={formData.socialLinks || ""} onChange={(v) => updateField("socialLinks", v)} />
            <TextAreaField label="Social Updates" placeholder={"e.g., Instagram Status: Working on a new project..."} rows={4} value={formData.socialUpdates || ""} onChange={(v) => updateField("socialUpdates", v)} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .tv-wrap {
          width: 100%;
          min-height: 100%;
          padding: 32px 20px 48px;
          background: var(--c-bg, #EFF7FF);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: var(--c-text, #0B1E2E);
        }

        .tv-inner {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* ── Header ── */
        .tv-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .tv-header-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: var(--c-accent, #29A9D4);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 8px 24px color-mix(in srgb, var(--c-accent, #29A9D4) 30%, transparent);
        }
        .tv-header-icon svg { color: #fff; }
        .tv-header-title {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(1.4rem, 3vw, 1.9rem);
          font-weight: 600;
          color: var(--c-text, #0B1E2E);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .tv-header-sub {
          font-size: 0.85rem;
          color: var(--c-muted, #7399BA);
          margin-top: 2px;
        }

        /* ── Toast ── */
        .tv-toast {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          animation: tvFadeIn 0.2s ease;
        }
        .tv-toast--success {
          background: color-mix(in srgb, #22c55e 12%, var(--c-surface, #fff));
          border: 1px solid color-mix(in srgb, #22c55e 30%, transparent);
          color: #166534;
        }
        .tv-toast--error {
          background: color-mix(in srgb, #ef4444 12%, var(--c-surface, #fff));
          border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
          color: #991b1b;
        }
        [data-mode="dark"] .tv-toast--success { color: #86efac; }
        [data-mode="dark"] .tv-toast--error { color: #fca5a5; }
        .tv-toast-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .tv-toast--success .tv-toast-dot { background: #22c55e; }
        .tv-toast--error .tv-toast-dot { background: #ef4444; }
        @keyframes tvFadeIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        /* ── Step rail (desktop) ── */
        .tv-rail {
          display: none;
        }
        @media (min-width: 600px) {
          .tv-rail {
            display: flex;
            align-items: center;
            background: var(--c-surface, #fff);
            border: 1px solid var(--c-border, #C5DCF2);
            border-radius: 16px;
            padding: 14px 20px;
            gap: 0;
            overflow-x: auto;
          }
        }
        .tv-rail-step {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          flex: 1; min-width: 64px; cursor: pointer; position: relative;
        }
        .tv-rail-btn {
          width: 36px; height: 36px; border-radius: 10px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
          font-size: 0;
        }
        .tv-rail-btn--done {
          background: color-mix(in srgb, var(--c-accent, #29A9D4) 15%, transparent);
          color: var(--c-accent, #29A9D4);
        }
        .tv-rail-btn--active {
          background: var(--c-accent, #29A9D4);
          color: #fff;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--c-accent, #29A9D4) 35%, transparent);
          transform: scale(1.1);
        }
        .tv-rail-btn--idle {
          background: var(--c-surface-2, #E2F0FC);
          color: var(--c-muted, #7399BA);
          border: 1.5px solid var(--c-border, #C5DCF2);
        }
        .tv-rail-label {
          font-size: 0.62rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--c-muted, #7399BA);
          transition: color 0.2s;
        }
        .tv-rail-step--active .tv-rail-label { color: var(--c-accent, #29A9D4); }
        .tv-rail-connector {
          flex: 1; height: 2px; background: var(--c-border, #C5DCF2);
          margin-bottom: 18px; transition: background 0.3s; min-width: 12px;
        }
        .tv-rail-connector--done { background: var(--c-accent, #29A9D4); }

        /* ── Mobile step bar ── */
        .tv-mobile-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px;
          background: var(--c-surface, #fff);
          border: 1px solid var(--c-border, #C5DCF2);
          border-radius: 14px;
        }
        @media (min-width: 600px) { .tv-mobile-bar { display: none; } }
        .tv-mobile-info { display: flex; align-items: center; gap: 10px; }
        .tv-mobile-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: var(--c-accent, #29A9D4);
          display: flex; align-items: center; justify-content: center;
        }
        .tv-mobile-icon svg { color: #fff; }
        .tv-mobile-step { font-size: 0.72rem; color: var(--c-muted, #7399BA); font-weight: 500; }
        .tv-mobile-name { font-size: 0.95rem; font-weight: 700; color: var(--c-text, #0B1E2E); }
        .tv-mobile-prog { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .tv-mobile-pct { font-size: 0.72rem; font-weight: 700; color: var(--c-accent, #29A9D4); }
        .tv-mobile-track {
          width: 64px; height: 5px; border-radius: 99px;
          background: var(--c-border, #C5DCF2); overflow: hidden;
        }
        .tv-mobile-fill {
          height: 100%; border-radius: 99px;
          background: var(--c-accent, #29A9D4);
          transition: width 0.4s ease;
        }

        /* ── Card ── */
        .tv-card {
          background: var(--c-surface, #fff);
          border: 1px solid var(--c-border, #C5DCF2);
          border-radius: 18px;
          overflow: hidden;
        }
        .tv-card-head {
          display: flex; align-items: center; gap: 14px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--c-border, #C5DCF2);
          background: color-mix(in srgb, var(--c-accent, #29A9D4) 5%, var(--c-surface, #fff));
        }
        .tv-card-head-icon {
          width: 42px; height: 42px; border-radius: 11px;
          background: var(--c-accent, #29A9D4);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .tv-card-head-icon svg { color: #fff; }
        .tv-card-head-title {
          font-family: 'Lora', serif;
          font-size: 1.15rem; font-weight: 600;
          color: var(--c-text, #0B1E2E);
        }
        .tv-card-head-sub {
          font-size: 0.78rem; color: var(--c-muted, #7399BA); margin-top: 1px;
        }
        .tv-card-body { padding: 24px; }

        /* ── Fields ── */
        .tv-fields { display: flex; flex-direction: column; gap: 20px; }
        .tv-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 560px) { .tv-grid-2 { grid-template-columns: 1fr; } }

        .tv-field { display: flex; flex-direction: column; gap: 6px; }
        .tv-label {
          font-size: 0.78rem; font-weight: 600;
          color: var(--c-text, #0B1E2E);
          letter-spacing: 0.01em;
        }
        .tv-input, .tv-textarea {
          width: 100%; padding: 10px 13px;
          background: var(--c-surface-2, #E2F0FC);
          border: 1.5px solid var(--c-border, #C5DCF2);
          border-radius: 10px; outline: none;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.855rem; color: var(--c-text, #0B1E2E);
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .tv-input::placeholder, .tv-textarea::placeholder { color: var(--c-muted, #7399BA); }
        .tv-input:focus, .tv-textarea:focus {
          border-color: var(--c-accent, #29A9D4);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent, #29A9D4) 18%, transparent);
        }
        .tv-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }

        /* ── Actions bar ── */
        .tv-actions {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          padding: 16px 20px;
          background: var(--c-surface, #fff);
          border: 1px solid var(--c-border, #C5DCF2);
          border-radius: 14px;
        }
        .tv-actions-right { display: flex; gap: 10px; flex-wrap: wrap; }

        .tv-btn {
          display: flex; align-items: center; gap: 7px;
          height: 40px; padding: 0 18px; border-radius: 10px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.83rem; font-weight: 600; border: none;
          cursor: pointer; transition: all 0.18s; white-space: nowrap;
        }
        .tv-btn svg { flex-shrink: 0; }
        .tv-btn--ghost {
          background: var(--c-surface-2, #E2F0FC);
          color: var(--c-muted, #7399BA);
          border: 1.5px solid var(--c-border, #C5DCF2);
        }
        .tv-btn--ghost:hover:not(:disabled) {
          color: var(--c-text, #0B1E2E);
          border-color: var(--c-text, #0B1E2E);
        }
        .tv-btn--ghost:disabled { opacity: 0.4; cursor: not-allowed; }
        .tv-btn--save {
          background: var(--c-surface-2, #E2F0FC);
          color: var(--c-accent, #29A9D4);
          border: 1.5px solid var(--c-accent, #29A9D4);
        }
        .tv-btn--save:hover:not(:disabled) {
          background: color-mix(in srgb, var(--c-accent, #29A9D4) 12%, transparent);
        }
        .tv-btn--save:disabled { opacity: 0.4; cursor: not-allowed; }
        .tv-btn--primary {
          background: var(--c-accent, #29A9D4);
          color: #fff;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--c-accent, #29A9D4) 30%, transparent);
        }
        .tv-btn--primary:hover:not(:disabled) {
          background: var(--c-accent-dim, #1D8BB2);
          transform: scale(1.02);
        }
        .tv-btn--success {
          background: #16a34a; color: #fff;
          box-shadow: 0 4px 14px color-mix(in srgb, #16a34a 25%, transparent);
        }
        .tv-btn--success:hover { background: #15803d; transform: scale(1.02); }

        .tv-spin {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid currentColor; border-top-color: transparent;
          animation: tvSpin 0.7s linear infinite;
        }
        @keyframes tvSpin { to { transform: rotate(360deg); } }

        /* ── Deploy card ── */
        .tv-deploy {
          background: var(--c-surface, #fff);
          border: 1.5px solid var(--c-accent, #29A9D4);
          border-radius: 18px; overflow: hidden;
        }
        .tv-deploy-strip {
          height: 4px;
          background: linear-gradient(90deg, var(--c-accent, #29A9D4), #7DD3FC);
        }
        .tv-deploy-body {
          display: flex; flex-direction: column; gap: 20px;
          padding: 24px;
        }
        @media (min-width: 640px) {
          .tv-deploy-body { flex-direction: row; align-items: flex-start; }
        }
        .tv-deploy-icon {
          width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
          background: var(--c-accent, #29A9D4);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px color-mix(in srgb, var(--c-accent, #29A9D4) 30%, transparent);
        }
        .tv-deploy-icon svg { color: #fff; }
        .tv-deploy-content { flex: 1; display: flex; flex-direction: column; gap: 14px; }
        .tv-deploy-title {
          font-family: 'Lora', serif;
          font-size: 1.2rem; font-weight: 600;
          color: var(--c-text, #0B1E2E);
          letter-spacing: -0.01em;
        }
        .tv-deploy-sub { font-size: 0.83rem; color: var(--c-muted, #7399BA); line-height: 1.6; }
        .tv-trained-badge {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 11px;
          background: color-mix(in srgb, #22c55e 10%, var(--c-surface-2, #E2F0FC));
          border: 1px solid color-mix(in srgb, #22c55e 30%, transparent);
        }
        .tv-trained-badge svg { color: #16a34a; flex-shrink: 0; }
        .tv-trained-badge-text { font-size: 0.83rem; font-weight: 600; color: #166534; }
        [data-mode="dark"] .tv-trained-badge-text { color: #86efac; }
        .tv-deploy-btn {
          display: inline-flex; align-items: center; gap: 9px;
          height: 44px; padding: 0 22px; border-radius: 11px; border: none;
          background: var(--c-accent, #29A9D4); color: #fff;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.88rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 16px color-mix(in srgb, var(--c-accent, #29A9D4) 35%, transparent);
          align-self: flex-start;
        }
        .tv-deploy-btn:hover:not(:disabled) {
          background: var(--c-accent-dim, #1D8BB2); transform: scale(1.02);
        }
        .tv-deploy-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="tv-wrap">
        <div className="tv-inner">

          {/* Header */}
          <div className="tv-header">
            <div className="tv-header-icon">
              <Brain size={24} />
            </div>
            <div>
              <div className="tv-header-title">AI Training</div>
              <div className="tv-header-sub">Build your intelligent virtual self step by step</div>
            </div>
          </div>

          {/* Toast */}
          {message && (
            <div className={`tv-toast tv-toast--${message.type}`}>
              <span className="tv-toast-dot" />
              {message.text}
            </div>
          )}

          {/* Desktop step rail */}
          <div className="tv-rail">
            {STEPS.map((step, index) => (
              <>
                <div
                  key={step.id}
                  className={`tv-rail-step ${currentStep === step.id ? "tv-rail-step--active" : ""}`}
                  onClick={() => goToStep(step.id)}
                >
                  <button
                    className={`tv-rail-btn ${
                      currentStep === step.id
                        ? "tv-rail-btn--active"
                        : currentStep > step.id
                        ? "tv-rail-btn--done"
                        : "tv-rail-btn--idle"
                    }`}
                  >
                    {currentStep > step.id ? <Check size={16} /> : <step.icon size={16} />}
                  </button>
                  <span className="tv-rail-label">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    key={`connector-${step.id}`}
                    className={`tv-rail-connector ${currentStep > step.id ? "tv-rail-connector--done" : ""}`}
                  />
                )}
              </>
            ))}
          </div>

          {/* Mobile bar */}
          <div className="tv-mobile-bar">
            <div className="tv-mobile-info">
              <div className="tv-mobile-icon">
                <StepIcon size={18} />
              </div>
              <div>
                <div className="tv-mobile-step">Step {currentStep} of {STEPS.length}</div>
                <div className="tv-mobile-name">{STEPS[currentStep - 1].name}</div>
              </div>
            </div>
            <div className="tv-mobile-prog">
              <span className="tv-mobile-pct">{progress}%</span>
              <div className="tv-mobile-track">
                <div className="tv-mobile-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* Main card */}
          <div className="tv-card">
            <div className="tv-card-head">
              <div className="tv-card-head-icon">
                <StepIcon size={20} />
              </div>
              <div>
                <div className="tv-card-head-title">{STEPS[currentStep - 1].name}</div>
                <div className="tv-card-head-sub">Fill in the details below to enhance your virtual self</div>
              </div>
            </div>
            <div className="tv-card-body">
              {renderStepContent()}
            </div>
          </div>

          {/* Actions */}
          <div className="tv-actions">
            <button
              className="tv-btn tv-btn--ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="tv-actions-right">
              <button
                className="tv-btn tv-btn--save"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <span className="tv-spin" /> : <Save size={15} />}
                {isSaving ? "Saving…" : "Save"}
              </button>

              {currentStep < STEPS.length ? (
                <button className="tv-btn tv-btn--primary" onClick={nextStep}>
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button className="tv-btn tv-btn--success" onClick={handleSave}>
                  <Check size={15} />
                  Complete
                </button>
              )}
            </div>
          </div>

          {/* Deploy card — only on last step */}
          {currentStep === STEPS.length && (
            <div className="tv-deploy">
              <div className="tv-deploy-strip" />
              <div className="tv-deploy-body">
                <div className="tv-deploy-icon">
                  <Sparkles size={24} />
                </div>
                <div className="tv-deploy-content">
                  <div className="tv-deploy-title">Ready to deploy your AI?</div>
                  <div className="tv-deploy-sub">
                    You've completed all training sections. Deploy now to activate your intelligent virtual self and make it available for interactions.
                  </div>

                  {formData.isModelTrained && (
                    <div className="tv-trained-badge">
                      <CheckCircle2 size={18} />
                      <span className="tv-trained-badge-text">Model trained — your virtual self is live</span>
                    </div>
                  )}

                  <button
                    className="tv-deploy-btn"
                    onClick={handleTrainModel}
                    disabled={isTraining}
                  >
                    {isTraining ? (
                      <><span className="tv-spin" /> Training…</>
                    ) : (
                      <><Sparkles size={17} /> {formData.isModelTrained ? "Retrain AI Model" : "Deploy AI Model"}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* ── Sub-components ── */
function Field({ label, placeholder, value, onChange }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="tv-field">
      <label className="tv-label">{label}</label>
      <input
        className="tv-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextAreaField({ label, placeholder, rows, value, onChange }: {
  label: string; placeholder?: string; rows?: number; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="tv-field">
      <label className="tv-label">{label}</label>
      <textarea
        className="tv-textarea"
        placeholder={placeholder}
        rows={rows ?? 5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}