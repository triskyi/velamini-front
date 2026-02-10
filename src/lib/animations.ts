import React, { ReactNode } from "react";
import { easeOut } from "framer-motion";
import { TaskStatus } from "./types";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

// Common animation variants for Framer Motion
export const animations = {
  containerSlide: {
    initial: { opacity: 0, x: -80 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: easeOut },
  },
  sidePanelSlide: {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: easeOut },
  },
  messageSlide: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
  },
  itemSlide: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    whileHover: { scale: 1.02 },
  },
  taskSlide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
  },
  buttonHover: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },
  buttonHoverSmall: {
    whileHover: { scale: 1.12 },
    whileTap: { scale: 0.95 },
  },
};

// Get status icon based on task status
export const getStatusIcon = (status: TaskStatus): ReactNode => {
  switch (status) {
    case "progress":
      return (
        React.createElement(Clock, { className: "w-4 h-4 text-cyan-400 animate-spin-slow" })
      );
    case "pending":
      return React.createElement(AlertCircle, { className: "w-4 h-4 text-yellow-400" });
    case "completed":
      return React.createElement(CheckCircle2, { className: "w-4 h-4 text-green-400" });
    default:
      return null;
  }
};

// Common className strings to reduce duplication
export const classNames = {
  glassPanel: "backdrop-blur-lg bg-gray-900/30 border border-gray-700/50 rounded-xl",
  glassCard: "p-4 rounded-xl bg-gray-800/30 border border-gray-700/50",
  inputFocus:
    "focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all",
  neonText: "neon-text text-cyan-400",
  buttonGradient: "bg-gradient-to-r from-cyan-400 to-purple-500",
};
