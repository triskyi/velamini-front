"use client";

import { useState, useEffect } from "react";
import { Save, User, Briefcase, Award, Code, Link as LinkIcon, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";

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
}

const STEPS = [
  { id: 1, name: "Identity", icon: User },
  { id: 2, name: "Education", icon: Briefcase },
  { id: 3, name: "Experience", icon: Briefcase },
  { id: 4, name: "Skills", icon: Code },
  { id: 5, name: "Projects", icon: Code },
  { id: 6, name: "Awards", icon: Award },
  { id: 7, name: "Social", icon: LinkIcon },
];

export default function TrainingView({ user }: TrainingViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<KnowledgeBaseData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

// Load existing data
useEffect(() => {
  const loadData = async () => {
    try {
      const res = await fetch("/api/training");
      const data = await res.json();
      if (data.ok && data.knowledgeBase) {
        setFormData(data.knowledgeBase);
      }
    } catch (error) {
      console.error("Failed to load knowledge base:", error);
    }
  };
  loadData();
}, []);

const handleTrainModel = async () => {
  setIsTraining(true);
  setMessage(null);

  try {
    const res = await fetch("/api/training/train", {
      method: "POST",
    });

    const data = await res.json();
    if (data.ok) {
      setFormData({ ...formData, isModelTrained: true, lastTrainedAt: data.trainedAt });
      setMessage({ type: "success", text: "Virtual self trained successfully! 🎉" });
      setTimeout(() => setMessage(null), 5000);
    } else {
      setMessage({ type: "error", text: data.error || "Training failed" });
    }
  } catch (error) {
    setMessage({ type: "error", text: "Failed to train model" });
  } finally {
    setIsTraining(false);
  }
};

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
      if (data.ok) {
        setMessage({ type: "success", text: "Saved successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof KnowledgeBaseData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Identity
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName || ""}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., ISHIMWE TRESOR BERTRAND"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Birth Date
                </label>
                <input
                  type="text"
                  value={formData.birthDate || ""}
                  onChange={(e) => updateField("birthDate", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., February 15, 2002"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Birth Place
                </label>
                <input
                  type="text"
                  value={formData.birthPlace || ""}
                  onChange={(e) => updateField("birthPlace", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Huye District, Rwanda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  value={formData.currentLocation || ""}
                  onChange={(e) => updateField("currentLocation", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Kigali, Rwanda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Languages
                </label>
                <input
                  type="text"
                  value={formData.languages || ""}
                  onChange={(e) => updateField("languages", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Kinyarwanda, English, French"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Relationship Status
                </label>
                <input
                  type="text"
                  value={formData.relationshipStatus || ""}
                  onChange={(e) => updateField("relationshipStatus", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Single, Married"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Hobbies
                </label>
                <input
                  type="text"
                  value={formData.hobbies || ""}
                  onChange={(e) => updateField("hobbies", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Dancing, Reading"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Favorite Food
                </label>
                <input
                  type="text"
                  value={formData.favoriteFood || ""}
                  onChange={(e) => updateField("favoriteFood", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Chips"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio || ""}
                onChange={(e) => updateField("bio", e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., Software engineer with 3+ years experience..."
              />
            </div>
          </div>
        );

      case 2: // Education
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Education History
            </label>
            <textarea
              value={formData.education || ""}
              onChange={(e) => updateField("education", e.target.value)}
              rows={8}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Bugema University — Bachelor in Software Engineering&#10;Gitwe Adventist College — A2 Diploma (MPC)"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              List your educational background, one per line
            </p>
          </div>
        );

      case 3: // Experience
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Work Experience
            </label>
            <textarea
              value={formData.experience || ""}
              onChange={(e) => updateField("experience", e.target.value)}
              rows={8}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., OpenFN (Present) — Junior Developer&#10;COODIC (Mar 2024 – Jun 2024) — Software Engineer"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              List your work experience, one per line
            </p>
          </div>
        );

      case 4: // Skills
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Technical Skills
            </label>
            <textarea
              value={formData.skills || ""}
              onChange={(e) => updateField("skills", e.target.value)}
              rows={8}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Languages: HTML, CSS, Python, JavaScript&#10;Frameworks: ReactJS, Django, Flask&#10;Databases: MySQL, PostgreSQL"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              List your technical skills by category
            </p>
          </div>
        );

      case 5: // Projects
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notable Projects
            </label>
            <textarea
              value={formData.projects || ""}
              onChange={(e) => updateField("projects", e.target.value)}
              rows={8}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., OpenFn Adaptors — Built Flutterwave adaptor&#10;MyGuyAssistantAPI — Python + Flask API"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              List your notable projects, one per line
            </p>
          </div>
        );

      case 6: // Awards
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Achievements & Awards
            </label>
            <textarea
              value={formData.awards || ""}
              onChange={(e) => updateField("awards", e.target.value)}
              rows={6}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Winner — AfricasTalking Hackathon 3 times"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              List your achievements and awards
            </p>
          </div>
        );

      case 7: // Social
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Social Media Links
              </label>
              <textarea
                value={formData.socialLinks || ""}
                onChange={(e) => updateField("socialLinks", e.target.value)}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., GitHub: https://github.com/username&#10;LinkedIn: https://linkedin.com/in/username&#10;Instagram: https://instagram.com/username"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Add your social media profiles
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Social Updates
              </label>
              <textarea
                value={formData.socialUpdates || ""}
                onChange={(e) => updateField("socialUpdates", e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., Instagram Status: I haven't posted anything new recently..."
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Any recent updates about your social presence
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const StepIcon = STEPS[currentStep - 1].icon;

  return (
    <div className="h-full overflow-auto bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Training Information
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Fill in your information step by step to train your virtual self
          </p>
        </div>

        {message && (
          <div
            className={`rounded-lg p-4 mb-6 ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep === step.id
                      ? "border-teal-500 bg-teal-500 text-white"
                      : currentStep > step.id
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      currentStep > step.id
                        ? "bg-teal-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  currentStep === step.id ? "font-semibold text-teal-600 dark:text-teal-400" : ""
                }`}
              >
                {step.name}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content Card */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-teal-500/10">
              <StepIcon className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {STEPS[currentStep - 1].name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Step {currentStep} of {STEPS.length}
              </p>
            </div>
          </div>
          
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg font-medium hover:bg-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Progress"}
        </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="h-4 w-4" />
              {isSaving ? "Saving..." : "Complete"}
            </button>
          )}
        </div>

        {/* Train Model Section - Shows when all steps are complete */}
        {currentStep === STEPS.length && (
          <div className="mt-8 p-6 rounded-lg border-2 border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-blue-500/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-teal-500/10">
                <Sparkles className="h-6 w-6 text-teal-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Ready to Train Your Virtual Self?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  You've completed all the training steps! Now train your AI model with your knowledge to create your personalized virtual assistant.
                </p>
                {formData.isModelTrained && (
                  <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✓ Model trained successfully!
                      {formData.lastTrainedAt && (
                        <span className="block text-xs mt-1 opacity-75">
                          Last trained: {new Date(formData.lastTrainedAt).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleTrainModel}
                  disabled={isTraining}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="h-5 w-5" />
                  {isTraining ? "Training Model..." : formData.isModelTrained ? "Retrain Model" : "Train Your Model Now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
         