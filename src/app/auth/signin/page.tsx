"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Suspense } from "react";

// --- Configurable StarField Animation ---
const StarField = () => {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    top: (i * 37) % 100,
    left: (i * 53) % 100,
    size: 0.5 + (i % 4) * 0.5,
    duration: 10 + (i % 11) * 1.5,
  }));

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020202]">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.1 }}
          animate={{
            opacity: [0.1, 1, 0.1], 
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (star.id % 10) * 0.4,
          }}
          className="absolute rounded-full bg-white"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: `0 0 ${star.size * 4}px rgba(255, 255, 255, 0.9)`
          }}
        />
      ))}
      
      {/* Neon Nebulas */}
      <motion.div 
        animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen" 
      />
      <motion.div 
         animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.2, 1] }}
         transition={{ duration: 10, repeat: Infinity, delay: 1 }}
         className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/30 rounded-full blur-[100px] mix-blend-screen" 
      />
      
      {/* Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
    </div>
  );
};

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/Dashboard";

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen w-full flex bg-[#050505] text-white selection:bg-cyan-500/30 font-sans">
      
      {/* LEFT SIDE: Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 lg:p-12 xl:p-24 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm space-y-8 flex flex-col items-center text-center"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
             <div className="relative w-12 h-12">
                 <Image 
                   src="/logo.png" 
                   alt="VELAMINI Logo" 
                   fill
                   className="object-contain"
                   priority
                 />
             </div>
             <span className="text-2xl font-bold tracking-tight">VELAMINI</span>
          </div>

          <div className="space-y-2">
            <p className="text-zinc-400">
              Enter your portal to the virtual universe.
            </p>
          </div>

          <div className="space-y-4 pt-4 w-full">
             <button
                onClick={handleGoogleSignIn}
                className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-lg flex items-center justify-center gap-3 transition-all font-semibold text-sm shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.01] active:scale-[0.99] group overflow-hidden relative"
              >
                 <svg className="h-5 w-5 relative z-10" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
                  />
                </svg>
                <span className="relative z-10">Sign in with Google</span>
             </button>
             
             <p className="text-xs text-zinc-600 text-center leading-relaxed">
               By continuing, you agree to Velamini&apos;s Terms of Service and Privacy Policy.
             </p>
          </div>
        </motion.div>
        
        <div className="absolute bottom-8 text-[10px] text-zinc-700 font-mono">
           VELAMINI v1.0 • SECURE ACCESS
        </div>
      </div>

      {/* RIGHT SIDE: Animation Card */}
      <div className="hidden lg:block lg:w-[55%] relative p-4 pl-0">
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="w-full h-full rounded-3xl overflow-hidden relative shadow-2xl shadow-purple-900/20 border border-white/5"
         >
            <StarField />
            
            {/* Center Quote Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10 p-12">
                <div className="p-8 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 max-w-lg text-center shadow-2xl">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-relaxed font-serif italic">
                      &quot;A year spent in artificial intelligence is enough to make one believe in God&quot;
                    </h3>
                </div>
            </div>
         </motion.div>
      </div>

    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050505]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
