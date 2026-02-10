import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/ChatPanel';
import InfoPanel from '@/components/InfoPanel';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* HUD grid background */}
      <div className="pointer-events-none fixed inset-0 hud-grid opacity-20" />

      {/* Floating particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-400 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Center Area */}
        <main className="flex flex-1 flex-col">
          <div className="flex flex-1">
            {/* Dashboard */}
            <section className="flex-1 border-r border-gray-800/50 p-8">
              <h1 className="mb-1 text-3xl font-bold">
                Good morning, <span className="neon-text text-cyan-400">Tre</span>
              </h1>
              <p className="mb-8 text-gray-400">Ready for today?</p>

              {/* Stats */}
              <div className="mb-8 grid grid-cols-2 gap-6">
                <div className="glass-panel neon-glow rounded-xl p-6">
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-400 font-bold">
                      7
                    </div>
                    <span className="text-gray-300">Active Tasks</span>
                  </div>
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-sm text-gray-400">Completion Rate</div>
                </div>

                <div className="glass-panel rounded-xl p-6">
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-400/20 text-purple-400 font-bold">
                      24
                    </div>
                    <span className="text-gray-300">AI Sessions</span>
                  </div>
                  <div className="text-2xl font-bold">99.2%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-panel rounded-xl p-6">
                <h3 className="mb-4 text-lg font-semibold neon-text text-cyan-400">
                  Quick Actions
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  {['Analyze Data', 'Generate Report', 'Run Diagnostics'].map(
                    (action) => (
                      <button
                        key={action}
                        className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-3 text-sm transition-all hover:border-cyan-400/40 hover:bg-gray-700/50"
                      >
                        {action}
                      </button>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* Chat */}
            <section className="w-1/2 border-r border-gray-800/50">
              <ChatPanel />
            </section>
          </div>
        </main>

        {/* Info Panel */}
        <InfoPanel />
      </div>
    </div>
  );
}
