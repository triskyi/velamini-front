"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
  text: string;
}

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.04 * i },
  }),
};

const child = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 200,
    },
  },
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 200,
    },
  },
};

export default function HeroSection({ text }: HeroSectionProps) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="visible"
      className="mt-[15vh] text-center px-4"
    >
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight flex flex-wrap justify-center gap-x-[0.2em]">
        {text.split(" ").map((word, index) => (
          <span key={index} className="inline-block whitespace-nowrap">
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={charIndex}
                variants={child}
                className="inline-block text-[#00f3ff] drop-shadow-[0_0_10px_rgba(0,243,255,0.7)]"
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>
    </motion.div>
  );
}
