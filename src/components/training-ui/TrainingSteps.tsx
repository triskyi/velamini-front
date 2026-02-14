"use client";

import { AlertCircle, CheckCircle2, Instagram, Linkedin, Twitter, Github } from "lucide-react";
import FileUploader from "./FileUploader";

type UploadedFile = {
  id: string;
  name: string;
  size: string;
  type: string;
};

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
  files: UploadedFile[];
  dontDo: string;
  confidential: string;
  dailyTasks: string;
  helpWith: string[];
  consentUsed: boolean;
  anonymizedData: boolean;
};

interface StepProps {
  formData: TrainingFormData;
  updateField: <K extends keyof TrainingFormData>(field: K, value: TrainingFormData[K]) => void;
}

export const IdentityStep = ({ formData, updateField }: StepProps) => (
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
        <label className="label"><span className="label-text font-bold text-zinc-400">Social Media & Presence</span></label>
        <div className="space-y-3 mt-2">
          <div className="flex items-center gap-2 bg-[#111111] border border-zinc-800 rounded-xl px-3 focus-within:border-cyan-500 transition-all">
            <Linkedin className="w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="LinkedIn URL" 
              className="w-full bg-transparent py-3 text-sm border-none focus:outline-none"
              value={formData.socials?.linkedin || ""}
              onChange={(e) => updateField("socials", { ...formData.socials, linkedin: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 bg-[#111111] border border-zinc-800 rounded-xl px-3 focus-within:border-cyan-500 transition-all">
            <Twitter className="w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="X / Twitter" 
              className="w-full bg-transparent py-3 text-sm border-none focus:outline-none"
              value={formData.socials?.twitter || ""}
              onChange={(e) => updateField("socials", { ...formData.socials, twitter: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 bg-[#111111] border border-zinc-800 rounded-xl px-3 focus-within:border-cyan-500 transition-all">
            <Instagram className="w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Instagram handle" 
              className="w-full bg-transparent py-3 text-sm border-none focus:outline-none"
              value={formData.socials?.instagram || ""}
              onChange={(e) => updateField("socials", { ...formData.socials, instagram: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 bg-[#111111] border border-zinc-800 rounded-xl px-3 focus-within:border-cyan-500 transition-all">
            <Github className="w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="GitHub Profile" 
              className="w-full bg-transparent py-3 text-sm border-none focus:outline-none"
              value={formData.socials?.github || ""}
              onChange={(e) => updateField("socials", { ...formData.socials, github: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="form-control">
        <label className="label"><span className="label-text font-bold">Language & Region</span></label>
        <div className="space-y-3">
          <select 
            className="select w-full bg-[#111111] border-zinc-800"
            value={formData.language}
            onChange={(e) => updateField("language", e.target.value)}
          >
            <option>English</option>
            <option>French</option>
            <option>Kinyarwanda</option>
            <option>Swahili</option>
          </select>
          <input 
            type="text" 
            placeholder="Timezone e.g. UTC+2" 
            className="input w-full bg-[#111111] border-zinc-800 focus:border-cyan-500"
            value={formData.timezone}
            onChange={(e) => updateField("timezone", e.target.value)}
          />
        </div>
      </div>
    </div>
  </div>
);

export const PersonalityStep = ({ formData, updateField }: StepProps) => (
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
          {(['none', 'light', 'lots'] as const).map((level) => (
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

export const KnowledgeStep = ({ formData, updateField }: StepProps) => (
  <div className="space-y-6">
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold">Knowledge & Background</h2>
        <p className="text-zinc-500">Tell Velamini about your professional world so it can provide deeper help.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className="textarea bg-[#111111] border-zinc-800 h-24"
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

      <div className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">Upload Context</span>
            <span className="label-text-alt text-zinc-500">CV, Portfolio, or Documents</span>
          </label>
          <FileUploader 
            files={formData.files || []} 
            onUpload={(files) => updateField("files", files)} 
          />
        </div>
      </div>
    </div>
  </div>
);

export const BoundariesStep = ({ formData, updateField }: StepProps) => (
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

export const WorkflowStep = ({ formData, updateField }: StepProps) => (
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
                    : formData.helpWith.filter((t: string) => t !== task);
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

export const ReviewStep = ({ formData, updateField }: StepProps) => (
  <div className="space-y-8">
    <div className="text-center">
      <CheckCircle2 className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
      <h2 className="text-3xl font-bold">Almost set!</h2>
      <p className="text-zinc-500 mt-2">Review your choices and give consent to start training.</p>
    </div>

    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="p-4 bg-black/40 rounded-2xl border border-zinc-800">
          <p className="text-zinc-500 mb-1 uppercase text-[10px] font-bold tracking-widest">Social Intelligence</p>
          <div className="space-y-1">
            {Object.entries(formData.socials || {}).map(([key, value]) => value ? (
              <div key={key} className="flex justify-between">
                <span className="capitalize text-zinc-400">{key}:</span>
                <span className="text-white font-medium">{value as string}</span>
              </div>
            ) : null)}
            {!Object.values(formData.socials || {}).some(v => !!v) && <p className="text-zinc-600 italic">No social handles provided</p>}
          </div>
        </div>
        <div className="p-4 bg-black/40 rounded-2xl border border-zinc-800">
          <p className="text-zinc-500 mb-1 uppercase text-[10px] font-bold tracking-widest">Attached Knowledge</p>
          <div className="flex gap-2 flex-wrap mt-2">
            {(formData.files || []).length > 0 ? (
              formData.files.map((file) => (
                <div key={file.id} className="px-3 py-1 bg-zinc-800 rounded-lg text-xs border border-zinc-700">
                  {file.name}
                </div>
              ))
            ) : (
              <p className="text-zinc-600 italic">No documents attached</p>
            )}
          </div>
        </div>
      </div>

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
