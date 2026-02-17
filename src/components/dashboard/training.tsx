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
} from "lucide-react";

import { Input, TextArea, Button, Card, CardContent } from "@heroui/react";

// Wrapper components to handle missing label prop in current version
const Field = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-small font-medium text-default-700">{label}</label>}
    <Input {...props} className="w-full" />
  </div>
);

const TextAreaField = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-small font-medium text-default-700">{label}</label>}
    <TextArea {...props} className="w-full" />
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

  const updateField = (field: keyof KnowledgeBaseData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
              minRows={4}
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
            minRows={8}
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
            minRows={8}
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
            minRows={8}
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
            minRows={8}
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
            minRows={6}
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
              minRows={6}
              value={formData.socialLinks || ""}
              onValueChange={(v: string) => updateField("socialLinks", v)}
            />
            <TextAreaField
              {...inputCommon}
              label="Social Updates"
              placeholder={"e.g., Instagram Status: Working on a new project..."}
              minRows={4}
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
    <div className="w-full text-foreground bg-background min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training</h1>
          <p className="text-default-500 mt-2">Build your intelligent virtual self step by step</p>
        </div>

        {/* Message */}
        {message && (
          <Card className={`p-4 border-l-4 ${message.type === "success" ? "border-green-500" : "border-red-500"}`}>
            <p className={message.type === "success" ? "text-green-600" : "text-red-600"}>{message.text}</p>
          </Card>
        )}

        {/* Steps */}
        <div className="relative hidden sm:flex w-full justify-between items-center mb-8 px-4">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 w-24">
              <Button
                variant={currentStep >= step.id ? "primary" : "outline"}
                onPress={() => goToStep(step.id)}
                className={`w-12 h-12 rounded-full transition-all flex items-center justify-center ${currentStep === step.id ? "scale-110 ring-4 ring-black/5 dark:ring-white/10" : ""
                  }`}
              >
                <step.icon size={20} />
              </Button>

              <span className={`text-xs font-medium ${currentStep >= step.id ? "text-primary" : "text-default-400"}`}>
                {step.name}
              </span>
            </div>
          ))}

          <div className="absolute left-0 right-0 top-6 h-0.5 bg-default-200 -z-0 mx-auto w-[80%] max-w-4xl" />
        </div>

        {/* Mobile */}
        <div className="sm:hidden flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-default-500">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-lg font-bold text-primary">{STEPS[currentStep - 1].name}</span>
        </div>

        {/* Main Card */}
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <StepIcon size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{STEPS[currentStep - 1].name}</h2>
              <p className="text-default-500">Please fill in the details below</p>
            </div>
          </div>

          {renderStepContent()}
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onPress={prevStep}
            isDisabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            Previous
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onPress={handleSave}
              isDisabled={isSaving}
              className="flex items-center gap-2"
            >
              {!isSaving && <Save size={18} />}
              {isSaving ? "Saving..." : "Save Progress"}
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                variant="primary"
                onPress={nextStep}
                className="flex items-center gap-2"
              >
                Next Step
                <ChevronRight size={18} />
              </Button>
            ) : (
              <Button
                variant="primary"
                className="text-white flex items-center gap-2"
                onPress={handleSave} // Or complete action
              >
                <Check size={18} />
                Complete
              </Button>
            )}
          </div>
        </div>

        {/* Train Model */}
        {currentStep === STEPS.length && (
          <Card className="p-8 border border-black/5 dark:border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="p-4 rounded-full bg-primary text-white shadow-lg">
                <Sparkles size={32} />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">Ready to Train?</h3>
                  <p className="text-default-600 mt-1">
                    You've completed all sections. Train your AI model now to update your virtual self.
                  </p>
                </div>

                {formData.isModelTrained && (
                  <div className="flex items-center gap-3 text-green-600 font-medium bg-green-500/10 p-3 rounded-lg w-fit">
                    <CheckCircle2 size={20} />
                    <span>Model Trained Successfully</span>
                  </div>
                )}

                <Button
                  variant="primary"
                  isDisabled={isTraining}
                  onPress={handleTrainModel}
                  className="flex items-center gap-2"
                >
                  {!isTraining && <Sparkles size={18} />}
                  {isTraining ? "Training..." : (formData.isModelTrained ? "Retrain Model" : "Train Model Now")}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
