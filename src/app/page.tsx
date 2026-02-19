
import Human3DSection from '@/components/Human3DSection';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#0a0a23] via-[#1a1333] to-[#2a0a3c] text-white flex flex-col justify-center items-center overflow-hidden font-sans">
      {/* Subtle grid lines background */}
      <svg className="absolute inset-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#a855f7" stopOpacity="0.08" />
            <stop offset="1" stopColor="#06b6d4" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <g>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={i * 80} y1={0} x2={i * 80} y2={1000} stroke="url(#gridGradient)" strokeWidth="1" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={0} y1={i * 80} x2={1000} y2={i * 80} stroke="url(#gridGradient)" strokeWidth="1" />
          ))}
        </g>
      </svg>
      {/* Floating particles remain */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-cyan-400 animate-float"
            style={{
              left: `${(i * 13) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${(i % 7) * 0.4}s`,
              animationDuration: `${3 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar at the top */}
      <nav className="fixed top-0 left-0 w-full z-20 flex items-center justify-between px-8 py-4 bg-gradient-to-r from-[#18182f] via-[#23234a] to-[#2a2a4c] border-b border-[#2a2a4c] backdrop-blur-xl shadow-2xl rounded-b-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-purple-700 shadow-lg">
            <img src="/logo.png" alt="Velamini Logo" className="h-8 w-8 rounded-full border border-white" />
          </div>
          <div className="flex flex-col ml-2">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">Velamini</span>
            <span className="text-xs text-zinc-300 mt-[-2px]">Your Virtual Me</span>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-base font-semibold">
          <a href="#features" className="relative group transition">
            <span className="text-white group-hover:text-cyan-400 transition">Features</span>
            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </a>
          <a href="#how" className="relative group transition">
            <span className="text-white group-hover:text-cyan-400 transition">How It Works</span>
            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </a>
          <a href="#about" className="relative group transition">
            <span className="text-white group-hover:text-cyan-400 transition">About</span>
            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </a>
          <a href="#pricing" className="relative group transition">
            <span className="text-white group-hover:text-cyan-400 transition">Pricing</span>
            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </a>
        </div>
        <div className="flex gap-3">
          <a href="/onboarding" className="px-6 py-2 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-purple-700 text-white font-bold shadow-lg border border-[#2a2a4c] hover:scale-105 hover:from-cyan-300 hover:to-purple-600 transition-all">Sign Up</a>
          <a href="/login" className="px-6 py-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white font-bold shadow-lg border border-[#2a2a4c] hover:scale-105 hover:from-purple-400 hover:to-purple-600 transition-all">Login</a>
        </div>
      </nav>

      {/* Main container with hero section below navbar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto mt-32 mb-10 rounded-2xl flex flex-col">
        <div className="flex flex-col md:flex-row items-center justify-between px-8 py-8 md:py-16 gap-12 w-full">
          {/* Left: Headline and CTA */}
          <div className="flex-1 flex flex-col items-start justify-center max-w-lg">
            <div className="mb-4">
              <span className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 text-black font-semibold text-sm shadow-lg">Meet Your AI Twin</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight font-sans">
              <span className="text-white">Your AI That</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent">Thinks & Works</span>
              <span className="text-white">Like You</span>
            </h1>
            <p className="text-base md:text-lg text-zinc-300 mb-8 max-w-md">
              Learn, remember, and act on your behalf. Manage your <span className="text-cyan-300 font-semibold">tasks</span>, <span className="text-purple-300 font-semibold">knowledge</span>, and life — all in one <span className="text-white font-bold">personal AI workspace</span>.
            </p>
          </div>

          {/* Right: Interactive 3D human body */}
          <Human3DSection />
        </div>
      </div>
    </div>
  );
}
