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
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 15,
      stiffness: 150,
    },
  },
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
    transition: {
      type: "spring" as const,
      damping: 15,
      stiffness: 150,
    },
  },
};

export default function HeroSection({ text }: HeroSectionProps) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="visible"
      className="mt-[22vh] text-center px-4"
    >
      <h1 className="text-4xl md:text-7xl font-bold tracking-tight flex flex-wrap justify-center gap-x-[0.2em] select-none">
        {text.split(" ").map((word, index) => (
          <span key={index} className="inline-block whitespace-nowrap">
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={charIndex}
                variants={child}
                whileHover={{ 
                  scale: 1.2, 
                  transition: { duration: 0.2 } 
                }}
                className="inline-block text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 cursor-default"
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
