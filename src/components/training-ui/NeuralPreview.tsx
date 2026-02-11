"use client";

import { motion } from "framer-motion";

interface NeuralPreviewProps {
  progress: number; // 0 to 100
  isActive: boolean;
}

export default function NeuralPreview({ progress, isActive }: NeuralPreviewProps) {
  return (
    <div className="relative w-full h-64 flex items-center justify-center bg-zinc-900/20 rounded-3xl border border-zinc-800/50 overflow-hidden">
      {/* Background Pulse */}
      {isActive && (
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-40 h-40 bg-cyan-500 rounded-full blur-3xl"
        />
      )}

      {/* Grid Dots */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* The "Neural" Core */}
      <div className="relative">
        {/* Connection Lines (Representing data connections) */}
        <svg width="200" height="200" viewBox="0 0 200 200" className="absolute -top-10 -left-10">
          <motion.circle 
            cx="100" cy="100" r="80" 
            stroke="#1d4ed8" strokeWidth="0.5" fill="none" 
            strokeDasharray="5 5"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle 
            cx="100" cy="100" r="60" 
            stroke="#06b6d4" strokeWidth="1" fill="none" 
            strokeDasharray="10 5"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Central Nodes */}
        <div className="relative flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: isActive ? [1, 1.1, 1] : 1,
              boxShadow: isActive ? [
                "0 0 20px rgba(6,182,212,0.2)",
                "0 0 40px rgba(6,182,212,0.4)",
                "0 0 20px rgba(6,182,212,0.2)"
              ] : "0 0 20px rgba(6,182,212,0.1)"
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-zinc-950 border-2 border-cyan-500/50 flex items-center justify-center z-10"
          >
            <div className={`w-8 h-8 rounded-lg bg-cyan-500 transition-all duration-1000 ${isActive ? "opacity-100" : "opacity-20 flex scale-50"}`} />
          </motion.div>

          {/* Orbiting Particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-cyan-400"
              animate={{
                x: Math.cos(i * 45 * Math.PI / 180) * 50,
                y: Math.sin(i * 45 * Math.PI / 180) * 50,
                scale: isActive ? [0.5, 1, 0.5] : 0.5,
              }}
              transition={{
                x: { duration: 0 },
                y: { duration: 0 },
                scale: { duration: 2, repeat: Infinity, delay: i * 0.2 }
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Label */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-cyan-500 mb-1">Neural Integration</p>
        <div className="w-32 h-1 bg-zinc-800 mx-auto rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
