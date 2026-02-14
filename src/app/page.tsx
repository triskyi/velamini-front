import ChatPanel from '@/components/ChatPanel';


export default function Home() {
  return (
    <div className="relative flex-1 min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* HUD grid background */}
      <div className="pointer-events-none absolute inset-0 hud-grid opacity-20" />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-400 animate-float"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 29) % 100}%`,
              animationDelay: `${(i % 7) * 0.5}s`,
              animationDuration: `${3 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Center Area */}
        <main className="flex flex-1 flex-col">
          <div className="flex flex-1">
            {/* Chat */}
            <section className="flex-1 border-r border-gray-800/50">
              <ChatPanel />
            </section>
          </div>
        </main>

        {/* Info Panel */}
     
      </div>
    </div>
  );
}
