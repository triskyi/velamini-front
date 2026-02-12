"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useState } from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  rating: number;
  setRating: (value: number) => void;
  feedbackText: string;
  setFeedbackText: (value: string) => void;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  rating,
  setRating,
  feedbackText,
  setFeedbackText,
}: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    setErrorStatus(null);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: feedbackText }),
      });

      if (response.ok) {
        setRating(0);
        setFeedbackText("");
        onClose();
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorStatus(data.error || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setErrorStatus("Connection error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal modal-open px-8 py-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="modal-backdrop bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="modal-box m-20 relative max-w-xl bg-base-200/95 backdrop-blur-xl 
                       shadow-2xl border border-base-300/40 
                        p-10 space-y-8"
          >
            {/* Close Button */}
            {!isSubmitting && (
              <button
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost absolute right-6 top-6"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Header */}
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                Help us improve
              </h3>
              <p className="text-base-content/60 text-sm mt-2">
                How was your experience talking with Virtual Tresor?
              </p>
            </div>

            {/* Emoji Rating */}
            <div className="space-y-4">
              <div className="flex justify-between gap-4">
                {[
                  { emoji: "🤩", value: 5 },
                  { emoji: "🙂", value: 4 },
                  { emoji: "😐", value: 3 },
                  { emoji: "☹️", value: 2 },
                  { emoji: "😭", value: 1 },
                ].map((item) => (
                  <button
                    key={item.value}
                    disabled={isSubmitting}
                    onClick={() => setRating(item.value)}
                    className={`flex-1 aspect-square rounded-2xl text-3xl transition-all duration-300
                      ${
                        rating === item.value
                          ? "bg-primary text-primary-content scale-110 shadow-lg shadow-primary/30"
                          : "bg-base-300/40 hover:bg-base-300/70"
                      } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-xs text-base-content/50 uppercase tracking-widest px-1">
                <span>Satisfied</span>
                <span>Dissatisfied</span>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Tell us something more
                <span className="text-base-content/40 font-normal ml-2 text-xs">
                  (Optional)
                </span>
              </label>

              <textarea
                value={feedbackText}
                disabled={isSubmitting}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Briefly explain what happened..."
                className="textarea w-full min-h-[140px] bg-base-300/40 
                           focus:bg-base-300/70 border border-base-300/50 
                           resize-none transition-all disabled:opacity-50"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 space-y-3">
              {errorStatus && (
                <p className="text-error text-center text-sm font-medium animate-pulse">
                  {errorStatus}
                </p>
              )}
              <button
                disabled={rating === 0 || isSubmitting}
                onClick={handleSubmit}
                className="btn btn-primary w-full rounded-xl text-base font-semibold 
                           shadow-lg shadow-primary/30 
                           disabled:opacity-40 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
