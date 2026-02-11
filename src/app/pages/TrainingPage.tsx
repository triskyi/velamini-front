"use client";

import { useState } from "react";
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
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Basics", icon: User },
  { id: 2, title: "Personality", icon: Settings },
  { id: 3, title: "Knowledge", icon: BookOpen },
  { id: 4, title: "Boundaries", icon: ShieldCheck },
  { id: 5, title: "Workflow", icon: Zap },
  { id: 6, title: "Review", icon: FileText },
];

export default function TrainingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basics
    nickname: "",
    pronouns: "",
    language: "English",
    timezone: "",
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

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Identity Basics</h2>
            <p className="text-zinc-500">Let’s start with how your assistant should address you and the context it needs for scheduling.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Display Name / Nickname</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Tresor" 
                  className="input bg-[#111111] border-zinc-800 focus:border-cyan-500"
                  value={formData.nickname}
                  onChange={(e) => updateField("nickname", e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Pronouns</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. He/Him" 
                  className="input bg-[#111111] border-zinc-800 focus:border-cyan-500"
                  value={formData.pronouns}
                  onChange={(e) => updateField("pronouns", e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Language</span></label>
                <select 
                  className="select bg-[#111111] border-zinc-800"
                  value={formData.language}
                  onChange={(e) => updateField("language", e.target.value)}
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Kinyarwanda</option>
                  <option>Swahili</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Timezone</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. UTC+2" 
                  className="input bg-[#111111] border-zinc-800 focus:border-cyan-500"
                  value={formData.timezone}
                  onChange={(e) => updateField("timezone", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Voice & Personality</h2>
            <p className="text-zinc-500">This is what makes Velamini feel like you. Choose your style carefully.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Tone</span></label>
                <select 
                  className="select bg-[#111111] border-zinc-800"
                  value={formData.tone}
                  onChange={(e) => updateField("tone", e.target.value)}
                >
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Direct</option>
                  <option>Funny</option>
                  <option>Calm</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Speaking Style</span></label>
                <select 
                  className="select bg-[#111111] border-zinc-800"
                  value={formData.speakingStyle}
                  onChange={(e) => updateField("speakingStyle", e.target.value)}
                >
                  <option>Short answers</option>
                  <option>Detailed</option>
                  <option>Bullet points</option>
                  <option>Step-by-step</option>
                </select>
              </div>
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text font-bold">Words you like / Phrases you use</span></label>
                <textarea 
                  className="textarea bg-[#111111] border-zinc-800 focus:border-cyan-500"
                  placeholder="e.g. 'Let’s go', 'Got it', 'Perfect'..."
                  value={formData.wordsILike}
                  onChange={(e) => updateField("wordsILike", e.target.value)}
                />
              </div>
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text font-bold">Emoji Preference</span></label>
                <div className="flex gap-4">
                  {['none', 'light', 'lots'].map((level) => (
                    <button
                      key={level}
                      onClick={() => updateField("emojiPreference", level)}
                      className={`btn flex-1 ${formData.emojiPreference === level ? 'btn-primary' : 'bg-zinc-800 border-none hover:bg-zinc-700'}`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Knowledge & Background</h2>
            <p className="text-zinc-500">Tell Velamini about your professional world so it can provide deeper help.</p>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Your Role</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Frontend Developer" 
                  className="input bg-[#111111] border-zinc-800 focus:border-cyan-500"
                  value={formData.role}
                  onChange={(e) => updateField("role", e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Skills / Knowledge</span></label>
                <textarea 
                  className="textarea bg-[#111111] border-zinc-800"
                  placeholder="What topics do you know well? (e.g. React, UI/UX, Backend scaling...)"
                  value={formData.skills}
                  onChange={(e) => updateField("skills", e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Tools You Use</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Next.js, GitHub, Figma, VS Code" 
                  className="input bg-[#111111] border-zinc-800 focus:border-cyan-500"
                  value={formData.tools}
                  onChange={(e) => updateField("tools", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Rules & Boundaries</h2>
            <p className="text-zinc-500 text-sm p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              Keep Velamini safe. Defining what it should NOT talk about is just as important as what it should.
            </p>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">“Do not do” list</span></label>
                <textarea 
                  className="textarea bg-[#111111] border-zinc-800"
                  placeholder="e.g. 'do not talk about politics', 'do not give legal advice'"
                  value={formData.dontDo}
                  onChange={(e) => updateField("dontDo", e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Confidential topics to avoid</span></label>
                <textarea 
                  className="textarea bg-[#111111] border-zinc-800"
                  placeholder="Topics or data points the assistant should never mention or reference."
                  value={formData.confidential}
                  onChange={(e) => updateField("confidential", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Daily Workflows</h2>
            <p className="text-zinc-500">How should Velamini join your team? Define its primary tasks.</p>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Typical Daily Tasks</span></label>
                <textarea 
                  className="textarea bg-[#111111] border-zinc-800"
                  placeholder="Explain your routine..."
                  value={formData.dailyTasks}
                  onChange={(e) => updateField("dailyTasks", e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Velamini can help me with:</span></label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    "Writing Emails", "Planning Tasks", "Coding Help", 
                    "Replying to Clients", "Reminders", "Summarizing Notes"
                  ].map((task) => (
                    <label key={task} className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800 transition-all">
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-primary"
                        checked={formData.helpWith.includes(task)}
                        onChange={(e) => {
                          const newList = e.target.checked 
                            ? [...formData.helpWith, task] 
                            : formData.helpWith.filter(t => t !== task);
                          updateField("helpWith", newList);
                        }}
                      />
                      <span className="text-sm">{task}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold">Almost set!</h2>
              <p className="text-zinc-500 mt-2">Review your choices and give consent to start training.</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary mt-1" 
                  checked={formData.consentUsed}
                  onChange={(e) => updateField("consentUsed", e.target.checked)}
                />
                <div>
                  <label className="font-bold text-lg block italic underline">Consent & Privacy Agreement</label>
                  <p className="text-zinc-400 text-sm mt-1">
                    I agree that the information I provided can be used to personalize my Virtual Velamini assistant. 
                    I understand this data is used only for my personalized experience.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                <div>
                  <h4 className="font-bold">Allow anonymous training</h4>
                  <p className="text-xs text-zinc-500">Helps improve the platform for everyone.</p>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary"
                  checked={formData.anonymizedData}
                  onChange={(e) => updateField("anonymizedData", e.target.checked)}
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button className="btn btn-outline flex-1 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white">
                  Save Draft
                </button>
                <button 
                  disabled={!formData.consentUsed}
                  className="btn btn-primary flex-[2] font-bold text-lg shadow-xl shadow-cyan-500/20"
                >
                  Confirm & Train Assistant
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <button className="text-sm text-zinc-500 hover:text-red-400 font-bold transition-all">
                Delete all my training data
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar Wizard Navigation */}
      <div className="w-full md:w-80 bg-zinc-900/30 border-r border-zinc-800 p-8 flex flex-col gap-10">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
            Velamini <span className="text-cyan-500">Train</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-bold">Personalization Hub</p>
        </div>

        <div className="flex-1 space-y-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button 
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" 
                    : isCompleted 
                      ? "text-zinc-500" 
                      : "text-zinc-600 opacity-50 hover:opacity-100"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "bg-zinc-800"
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className="font-bold text-sm">{step.title}</span>
              </button>
            );
          })}
        </div>
        
        <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <p className="text-xs text-zinc-400 leading-relaxed italic">
            "Teach Velamini your style, preferences, and workflow—so it can guide you like you guide yourself."
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 md:px-16 pt-12 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
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

      {/* Live Preview Panel (Desktop Only) */}
      <div className="hidden xl:flex w-96 border-l border-zinc-800 p-8 flex-col gap-6 bg-zinc-950/50">
        <div>
          <h3 className="font-bold text-zinc-500 flex items-center gap-2 mb-6">
            <div className="p-2 bg-zinc-900 rounded-lg"><Zap className="w-4 h-4 text-cyan-400" /></div>
            Assistant Preview
          </h3>
          
          <div className="space-y-6">
            <div className="chat chat-start">
              <div className="chat-bubble bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm">
                Hey! I'm your Virtual Velamini. Based on what you've told me...
              </div>
            </div>
            
            <div className="chat chat-start">
              <div className="chat-bubble bg-[#111111] border border-zinc-800 text-zinc-100 text-[15px] p-6 rounded-2xl shadow-xl">
                <p>Hello {formData.nickname || "[Name]"}!</p>
                <p className="mt-3">
                  I'll respond with a <span className="text-cyan-400 font-bold">{formData.tone}</span> tone 
                  and keep my answers <span className="text-cyan-400 font-bold">{formData.speakingStyle}</span>. 
                  {formData.role && ` Since I know you are a ${formData.role}, `}
                  I'm ready to help you with {formData.helpWith.length > 0 ? formData.helpWith.join(", ") : "your projects"}.
                </p>
                <p className="mt-3">Shall we get started? {formData.emojiPreference === 'lots' ? '🚀✨🔥' : formData.emojiPreference === 'light' ? '✨' : ''}</p>
              </div>
            </div>

            <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
              <p className="text-[10px] text-cyan-500 uppercase font-black tracking-widest mb-1">Live Logic</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Rules active: {formData.dontDo ? "Privacy constraints loaded." : "No specific boundaries set yet."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
