"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Sparkles
} from "lucide-react";

import TrainingSidebar from "@/components/training-ui/TrainingSidebar";
import NeuralPreview from "@/components/training-ui/NeuralPreview";
import QuickFillTemplates from "@/components/training-ui/QuickFillTemplates";
import { 
  IdentityStep, 
  PersonalityStep, 
  KnowledgeStep, 
  BoundariesStep, 
  WorkflowStep, 
  ReviewStep 
} from "@/components/training-ui/TrainingSteps";

const STEPS = [
  { id: 1, title: "Basics", icon: User },
  { id: 2, title: "Personality", icon: Settings },
  { id: 3, title: "Knowledge", icon: BookOpen },
  { id: 4, title: "Boundaries", icon: ShieldCheck },
  { id: 5, title: "Workflow", icon: Zap },
  { id: 6, title: "Review", icon: FileText },
];

type TrainingFormData = {
  nickname: string;
  pronouns: string;
  language: string;
  timezone: string;
  socials: { linkedin: string; twitter: string; instagram: string; github: string };
  tone: string;
  speakingStyle: string;
  wordsILike: string;
  wordsIHate: string;
  emojiPreference: "none" | "light" | "lots";
  role: string;
  skills: string;
  projects: string;
  tools: string;
  files: Array<{ id: string; name: string; size: string; type: string }>;
  dontDo: string;
  confidential: string;
  dailyTasks: string;
  helpWith: string[];
  consentUsed: boolean;
  anonymizedData: boolean;
};

export default function TrainingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TrainingFormData>({
    // Basics
    nickname: "",
    pronouns: "",
    language: "English",
    timezone: "",
    socials: { linkedin: "", twitter: "", instagram: "", github: "" },
    // Personality
    tone: "Friendly",
    speakingStyle: "Detailed",
    wordsILike: "",
    wordsIHate: "",
    emojiPreference: "light",
    // Background
    role: "",
    skills: "",
    projects: "",
    tools: "",
    files: [],
    // Boundaries
    dontDo: "",
    confidential: "",
    // Workflow
    dailyTasks: "",
    helpWith: [] as string[],
    // Training
    consentUsed: false,
    anonymizedData: true,
  });

  const updateField = <K extends keyof TrainingFormData>(field: K, value: TrainingFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyTemplate = (templateData: Partial<TrainingFormData>) => {
    setFormData(prev => ({ ...prev, ...templateData }));
  };

  const progressPercentage = useMemo(() => {
    return Math.round((currentStep / STEPS.length) * 100);
  }, [currentStep]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    const props = { formData, updateField };
    switch (currentStep) {
      case 1: return <IdentityStep {...props} />;
      case 2: return <PersonalityStep {...props} />;
      case 3: return <KnowledgeStep {...props} />;
      case 4: return <BoundariesStep {...props} />;
      case 5: return <WorkflowStep {...props} />;
      case 6: return <ReviewStep {...props} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row overflow-hidden">
      
      <TrainingSidebar 
        steps={STEPS} 
        currentStep={currentStep} 
        setCurrentStep={setCurrentStep} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 md:px-16 pt-12 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto space-y-12"
            >
              {currentStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl"
                >
                  <div className="flex items-center gap-2 text-cyan-400 mb-4">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-widest text-xs">AI Smart Start</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Want to save time?</h3>
                  <p className="text-zinc-400 text-sm mb-6">Select a profile type to instantly configure your Virtual Velamini with best-practice settings.</p>
                  <QuickFillTemplates onSelect={applyTemplate} />
                </motion.div>
              )}

              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Nav */}
        <div className="p-8 border-t border-zinc-800 bg-[#0A0A0A]/80 backdrop-blur-md flex justify-between items-center px-6 md:px-24">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn btn-ghost text-zinc-400 disabled:opacity-0"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          
          <div className="flex gap-2">
            {STEPS.map(s => (
              <div key={s.id} className={`w-2 h-2 rounded-full transition-all ${currentStep === s.id ? "w-8 bg-cyan-500" : "bg-zinc-800"}`} />
            ))}
          </div>

          <button 
            onClick={nextStep}
            disabled={currentStep === STEPS.length}
            className="btn bg-white text-black hover:bg-zinc-200 border-none px-8 font-bold disabled:opacity-0"
          >
            Next <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Right Intelligence Panel */}
      <div className="hidden xl:flex w-[400px] border-l border-zinc-800 p-8 flex-col gap-8 bg-zinc-950/50">
        <div>
          <h3 className="font-bold text-zinc-500 flex items-center gap-2 mb-6 uppercase tracking-widest text-xs">
            Assistant Consciousness
          </h3>
          
          <NeuralPreview progress={progressPercentage} isActive={true} />
        </div>

        <div className="space-y-6 flex-1">
          <h3 className="font-bold text-zinc-500 uppercase tracking-widest text-xs">Identity Simulation</h3>
          
          <div className="chat chat-start">
            <div className="chat-bubble bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm">
              {"I'm processing your profile..."}
            </div>
          </div>
          
          <div className="chat chat-start">
            <div className="chat-bubble bg-[#111111] border border-zinc-800 text-zinc-100 text-[15px] p-6 rounded-2xl shadow-xl">
              <p>Hello {formData.nickname || "[Name]"}!</p>
              <p className="mt-3">
                {"I'll respond with a "}<span className="text-cyan-400 font-bold">{formData.tone}</span> tone 
                and keep my answers <span className="text-cyan-400 font-bold">{formData.speakingStyle}</span>. 
                {formData.role && ` Since I know you are a ${formData.role}, `}
                {"I'm ready to help you with "}{formData.helpWith.length > 0 ? formData.helpWith.join(", ") : "your specific projects"}.
              </p>
              <p className="mt-3 leading-relaxed text-zinc-400 italic text-sm">
                {formData.wordsILike
                  ? `I'll be sure to use phrases like: ${formData.wordsILike}`
                  : "I'm still learning your unique catchphrases."}
              </p>
              <p className="mt-3">Shall we get started? {formData.emojiPreference === 'lots' ? '🚀✨🔥' : formData.emojiPreference === 'light' ? '✨' : ''}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Training Accuracy</span>
            <span className="text-xs text-cyan-500 font-black">{progressPercentage}%</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
