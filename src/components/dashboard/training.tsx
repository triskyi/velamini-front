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
} from "lucide-react";

import { Input, TextArea, Button, Card, CardContent } from "@heroui/react";

// Wrapper components to handle missing label prop in current version
const Field = ({ label, onValueChange, ...props }: any) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-small font-medium text-default-700">{label}</label>}
    <Input
      {...props}
      className="w-full"
      onChange={e => onValueChange ? onValueChange(e.target.value) : undefined}
    />
  </div>
);

const TextAreaField = ({ label, onValueChange, ...props }: any) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-small font-medium text-default-700">{label}</label>}
    <TextArea
      {...props}
      className="w-full"
      onChange={e => onValueChange ? onValueChange(e.target.value) : undefined}
    />
  </div>
);

// Helper for button variants mapping
const getButtonVariant = (v: string) => {
  if (v === "solid") return "primary"; // mapping solid to primary
  if (v === "flat") return "secondary"; // mapping flat to secondary
  return v as any;
};


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

  // Debounce save and retrain
  const debounce = (fn: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // Save and retrain after field change
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
        // Retrain model after save
        setIsTraining(true);
        const trainRes = await fetch("/api/training/train", { method: "POST" });
        const trainData = await trainRes.json();
        if (trainData?.ok) {
          setFormData((prev) => ({
            ...prev,
            isModelTrained: true,
            lastTrainedAt: trainData.trainedAt,
          }));
          showMessage({ type: "success", text: "Virtual self retrained! 🎉" }, 4000);
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

  // Debounced version to avoid excessive requests
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
        showMessage({ type: "success", text: "Virtual self trained successfully! 🎉" }, 5000);
      } else {
        showMessage({ type: "error", text: data?.error || "Training failed" }, 5000);
      }
    } catch {
      showMessage({ type: "error", text: "Failed to train model" }, 5000);
    } finally {
      setIsTraining(false);
    }
  };

  const renderStepContent = () => {
    const inputCommon = {};

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                {...inputCommon}
                label="Full Name"
                placeholder="e.g., ISHIMWE TRESOR BERTRAND"
                value={formData.fullName || ""}
                onValueChange={(v: string) => updateField("fullName", v)}
              />
              <Field
                {...inputCommon}
                label="Birth Date"
                placeholder="e.g., February 15, 2002"
                value={formData.birthDate || ""}
                onValueChange={(v: string) => updateField("birthDate", v)}
              />
              <Field
                {...inputCommon}
                label="Birth Place"
                placeholder="e.g., Huye District, Rwanda"
                value={formData.birthPlace || ""}
                onValueChange={(v: string) => updateField("birthPlace", v)}
              />
              <Field
                {...inputCommon}
                label="Current Location"
                placeholder="e.g., Kigali, Rwanda"
                value={formData.currentLocation || ""}
                onValueChange={(v: string) => updateField("currentLocation", v)}
              />
              <Field
                {...inputCommon}
                label="Languages"
                placeholder="e.g., Kinyarwanda, English, French"
                value={formData.languages || ""}
                onValueChange={(v: string) => updateField("languages", v)}
              />
              <Field
                {...inputCommon}
                label="Relationship Status"
                placeholder="e.g., Single, Married"
                value={formData.relationshipStatus || ""}
                onValueChange={(v: string) => updateField("relationshipStatus", v)}
              />
              <Field
                {...inputCommon}
                label="Hobbies"
                placeholder="e.g., Dancing, Reading"
                value={formData.hobbies || ""}
                onValueChange={(v: string) => updateField("hobbies", v)}
              />
              <Field
                {...inputCommon}
                label="Favorite Food"
                placeholder="e.g., Chips"
                value={formData.favoriteFood || ""}
                onValueChange={(v: string) => updateField("favoriteFood", v)}
              />
            </div>

            <TextAreaField
              {...inputCommon}
              label="Bio"
              placeholder="e.g., Software engineer with 3+ years experience..."
              rows={4}
              value={formData.bio || ""}
              onValueChange={(v: string) => updateField("bio", v)}
            />
          </div>
        );

      case 2:
        return (
          <TextAreaField
            {...inputCommon}
            label="Education History"
            placeholder={"e.g., Bugema University — BSc Software Engineering\nGitwe Adventist College — A2 (MPC)"}
            rows={8}
            value={formData.education || ""}
            onValueChange={(v: string) => updateField("education", v)}
          />
        );

      case 3:
        return (
          <TextAreaField
            {...inputCommon}
            label="Work Experience"
            placeholder={"e.g., OpenFn (Present) — Junior Developer\nCOODIC (Mar 2024 – Jun 2024) — Software Engineer"}
            rows={8}
            value={formData.experience || ""}
            onValueChange={(v: string) => updateField("experience", v)}
          />
        );

      case 4:
        return (
          <TextAreaField
            {...inputCommon}
            label="Technical Skills"
            placeholder={"e.g., Languages: HTML, CSS, Python, JavaScript\nFrameworks: React, Next.js, Django\nDB: Postgres, MySQL"}
            rows={8}
            value={formData.skills || ""}
            onValueChange={(v: string) => updateField("skills", v)}
          />
        );

      case 5:
        return (
          <TextAreaField
            {...inputCommon}
            label="Notable Projects"
            placeholder={"e.g., OpenFn Adaptors — Built Flutterwave adaptor\nMyGuyAssistantAPI — Python + Flask API"}
            rows={8}
            value={formData.projects || ""}
            onValueChange={(v: string) => updateField("projects", v)}
          />
        );

      case 6:
        return (
          <TextAreaField
            {...inputCommon}
            label="Achievements & Awards"
            placeholder={"e.g., Winner — AfricasTalking Hackathon (3 times)"}
            rows={6}
            value={formData.awards || ""}
            onValueChange={(v: string) => updateField("awards", v)}
          />
        );

      case 7:
        return (
          <div className="space-y-6">
            <TextAreaField
              {...inputCommon}
              label="Social Media Links"
              placeholder={"e.g., GitHub: https://github.com/username\nLinkedIn: https://linkedin.com/in/username"}
              rows={6}
              value={formData.socialLinks || ""}
              onValueChange={(v: string) => updateField("socialLinks", v)}
            />
            <TextAreaField
              {...inputCommon}
              label="Social Updates"
              placeholder={"e.g., Instagram Status: Working on a new project..."}
              rows={4}
              value={formData.socialUpdates || ""}
              onValueChange={(v: string) => updateField("socialUpdates", v)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const StepIcon = useMemo(() => STEPS[currentStep - 1].icon, [currentStep]);

  return (
    <div className="w-full text-foreground bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-full p-6 sm:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl shadow-xl shadow-violet-200 dark:shadow-violet-900/30">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">AI Training</h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mt-2">Build your intelligent virtual self step by step</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-6 rounded-2xl border-l-4 shadow-lg backdrop-blur-sm ${
            message.type === "success" 
              ? "border-green-500 bg-green-50/80 dark:bg-green-950/30" 
              : "border-red-500 bg-red-50/80 dark:bg-red-950/30"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                message.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}>
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <p className={`font-semibold text-lg ${
                message.type === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="relative hidden sm:flex w-full justify-between items-center mb-12 px-6">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 w-28">
              <Button
                variant={currentStep >= step.id ? "primary" : "outline"}
                onPress={() => goToStep(step.id)}
                className={`w-16 h-16 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-xl ${
                  currentStep === step.id 
                    ? "scale-110 ring-4 ring-violet-500/30 bg-gradient-to-br from-violet-600 to-purple-600 shadow-violet-200 dark:shadow-violet-900/50" 
                    : currentStep > step.id
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-200 dark:shadow-green-900/30"
                    : "bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600"
                }`}
              >
                <step.icon size={24} />
              </Button>

              <span className={`text-sm font-semibold text-center leading-tight ${
                currentStep >= step.id 
                  ? "text-violet-700 dark:text-violet-300" 
                  : "text-slate-500 dark:text-slate-400"
              }`}>
                {step.name}
              </span>
              
              {/* Step connector line */}
              {index < STEPS.length - 1 && (
                <div className={`absolute left-full top-8 w-full h-1 ${
                  currentStep > step.id 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                    : "bg-slate-200 dark:bg-slate-700"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="sm:hidden flex items-center justify-between mb-8 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-600/40 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg">
              <StepIcon size={20} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Step {currentStep} of {STEPS.length}
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{STEPS[currentStep - 1].name}</div>
            </div>
          </div>
          <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/20 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="p-8 sm:p-10 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-200 dark:shadow-violet-900/30">
                <StepIcon size={36} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{STEPS[currentStep - 1].name}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Please fill in the details below to enhance your virtual self</p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            {renderStepContent()}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              currentStep === 1 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            }`}
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft size={20} />
            Previous Step
          </button>

          <div className="flex gap-4">
            <button
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isSaving 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              }`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {!isSaving && <Save size={20} />}
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Progress'
              )}
            </button>

            {currentStep < STEPS.length ? (
              <button
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 shadow-xl shadow-violet-200 dark:shadow-violet-900/30 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                onClick={nextStep}
              >
                Next Step
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-xl shadow-green-200 dark:shadow-green-900/30 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleSave}
              >
                <Check size={20} />
                Complete Training
              </button>
            )}
          </div>
        </div>

        {/* Train Model */}
        {currentStep === STEPS.length && (
          <div className="bg-gradient-to-br from-violet-50/80 via-white/80 to-purple-50/80 dark:from-violet-950/30 dark:via-slate-800/80 dark:to-purple-950/30 backdrop-blur-xl rounded-3xl border-2 border-violet-200/50 dark:border-violet-800/50 shadow-2xl shadow-violet-200/20 dark:shadow-violet-900/20 overflow-hidden">
            <div className="p-10">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white shadow-2xl shadow-violet-300 dark:shadow-violet-900/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <Sparkles size={40} className="relative z-10" />
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">Ready to Deploy Your AI?</h3>
                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                      You've completed all training sections. Deploy your AI model now to activate your intelligent virtual self and make it available for interactions.
                    </p>
                  </div>

                  {formData.isModelTrained && (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800 p-6 rounded-2xl">
                      <div className="p-3 bg-green-500 rounded-full shadow-lg">
                        <CheckCircle2 size={24} className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-green-800 dark:text-green-200">Model Successfully Trained!</h4>
                        <p className="text-green-700 dark:text-green-300 mt-1">Your virtual self is ready and operational</p>
                      </div>
                    </div>
                  )}

                  <button
                    className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                      isTraining 
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400' 
                        : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-200 dark:shadow-violet-900/50 hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl'
                    }`}
                    onClick={handleTrainModel}
                    disabled={isTraining}
                  >
                    {isTraining ? (
                      <>
                        <div className="w-6 h-6 border-3 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                        Training in Progress...
                      </>
                    ) : (
                      <>
                        <Sparkles size={24} />
                        {formData.isModelTrained ? "Retrain AI Model" : "Deploy AI Model Now"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
