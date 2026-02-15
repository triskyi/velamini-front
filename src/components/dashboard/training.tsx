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
          <div className="space-y-6 w-full">
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
    <div className="h-full w-full bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 overflow-y-auto">
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Training Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
            Build your intelligent virtual self step by step
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`rounded-2xl p-5 shadow-lg border ${
              message.type === "success"
                ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : "bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-700 dark:text-red-300 border-red-500/20"
            }`}
          >
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        {/* Modern Progress Steps */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8 shadow-xl">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl transition-all duration-300 ${
                      currentStep === step.id
                        ? "bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30 scale-110"
                        : currentStep > step.id
                        ? "bg-gradient-to-br from-teal-500 to-cyan-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                    ) : (
                      <step.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                    )}
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-3 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          currentStep > step.id
                            ? "w-full bg-gradient-to-r from-teal-500 to-cyan-600"
                            : "w-0 bg-slate-300"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Step Labels */}
          <div className="flex items-center justify-between">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className="flex-1 text-center px-2"
              >
                <p className={`text-xs font-semibold transition-colors ${
                  currentStep === step.id
                    ? "text-teal-600 dark:text-teal-400"
                    : currentStep > step.id
                    ? "text-slate-600 dark:text-slate-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}>
                  {step.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content Card with Modern Design */}
        <div className="bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 lg:p-10 shadow-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-xl shadow-teal-500/25">
              <StepIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                {STEPS[currentStep - 1].name}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                Step {currentStep} of {STEPS.length}
              </p>
            </div>
          </div>
          
          {renderStepContent()}
        </div>

        {/* Navigation Buttons with Modern Design */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            Previous
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 rounded-2xl font-semibold hover:from-purple-500/20 hover:to-pink-500/20 border-2 border-purple-500/20 hover:border-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            <Save className="h-5 w-5" strokeWidth={2.5} />
            {isSaving ? "Saving..." : "Save Progress"}
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all shadow-xl hover:shadow-2xl"
            >
              Next Step
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl disabled:shadow-none"
            >
              <Check className="h-5 w-5" strokeWidth={2.5} />
              {isSaving ? "Completing..." : "Complete"}
            </button>
          )}
        </div>

        {/* Train Model Section - Modern Card */}
        {currentStep === STEPS.length && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-blue-500/10 p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl -mt-32 -mr-32"></div>
            
            <div className="relative flex items-start gap-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-2xl shadow-teal-500/30">
                <Sparkles className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  🎉 Ready to Train Your Virtual Self!
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  You've completed all training steps! Train your AI model now to create your personalized virtual assistant.
                </p>
                
                {formData.isModelTrained && (
                  <div className="mb-6 p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20">
                    <p className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      Model trained successfully!
                    </p>
                    {formData.lastTrainedAt && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                        Last trained: {new Date(formData.lastTrainedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                
                <button
                  onClick={handleTrainModel}
                  disabled={isTraining}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white rounded-2xl font-bold hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xl hover:shadow-3xl disabled:shadow-none text-lg"
                >
                  <Sparkles className="h-6 w-6" strokeWidth={2.5} />
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
         