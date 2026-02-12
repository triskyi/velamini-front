import { auth } from "@/auth";
import Sidebar from '@/components/Sidebar';
import { Sparkles, Share, MoreVertical, ChevronDown, Mic, ArrowUp } from 'lucide-react';

export default async function Dashboard() {
  const session = await auth();
  const userName = session?.user?.name || "Creator";

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={session?.user} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black pointer-events-none" />
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-900/50 z-10">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-zinc-900/50 px-3 py-1.5 rounded-lg transition-colors">
            <span className="font-semibold text-zinc-200">Velamini 1.0</span>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </div>
          
          <div className="flex items-center gap-2">
             <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors">
                <Share className="w-5 h-5" />
             </button>
             <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
             </button>
             {session?.user?.image && (
               <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full ml-2 border border-zinc-800" />
             )}
          </div>
        </header>

        {/* Chat Area - We can conditionally render the Welcome Screen or the Active Chat here. 
            For now, let's just render ChatPanel, but we need to update ChatPanel to match the design. 
            However, since ChatPanel isn't updated yet, I'll direct embed the visual for the user requirement.
        */}
        
        {/* Ideally, we should pass props to ChatPanel to show this welcome state, or update ChatPanel. 
            Let's assume ChatPanel will be updated next. For this step, I will render the desired layout structure.
        */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-6 z-10">
            
            {/* Logo/Icon */}
             <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/10 border border-white/5">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">V</span>
                </div>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-12 space-y-3">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
                  Welcome Back, {userName.split(' ')[0]}
                </h1>
                <p className="text-xl text-zinc-400 font-light">
                  What vision do you want to bring to life today?
                </p>
            </div>

            {/* Input Area */}
            <div className="w-full max-w-3xl relative mb-12 group">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/30 to-amber-600/30 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                 <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
                    <textarea 
                        className="w-full bg-transparent text-lg text-white placeholder:text-zinc-600 resize-none h-14 md:h-24 focus:outline-none scrollbar-none p-2"
                        placeholder="Ask Anything..."
                    />
                    <div className="flex items-center justify-between mt-2 px-1">
                        <button className="p-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors">
                           <Sparkles className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                             <button className="p-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors">
                                <Mic className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors shadow-lg shadow-orange-500/20">
                                <ArrowUp className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
                {/* Card 1 */}
                <div className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <MessageSquareIcon className="w-4 h-4" />
                         </div>
                    </div>
                    <h3 className="text-white font-medium mb-2 pr-8">Enhance Your Chat Experience</h3>
                    <p className="text-zinc-500 text-sm mb-4 leading-relaxed">
                        Upgrade your AI chat with real-time memory, personalized responses.
                    </p>
                    <span className="text-orange-400 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Learn more <span aria-hidden="true">&rarr;</span>
                    </span>
                </div>

                {/* Card 2 */}
                <div className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <ZapIcon className="w-4 h-4" />
                         </div>
                    </div>
                    <h3 className="text-white font-medium mb-2 pr-8">Automate Your Tasks</h3>
                    <p className="text-zinc-500 text-sm mb-4 leading-relaxed">
                        Connect AI to your daily tools and automate complex workflows.
                    </p>
                    <span className="text-orange-400 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Learn more <span aria-hidden="true">&rarr;</span>
                    </span>
                </div>

                {/* Card 3 */}
                <div className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 transition-all cursor-pointer relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <BarChartIcon className="w-4 h-4" />
                         </div>
                    </div>
                    <h3 className="text-white font-medium mb-2 pr-8">Analyze Smarter</h3>
                    <p className="text-zinc-500 text-sm mb-4 leading-relaxed">
                        Visualize data trends, monitor chat activity, and uncover insights.
                    </p>
                    <span className="text-orange-400 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Learn more <span aria-hidden="true">&rarr;</span>
                    </span>
                </div>
            </div>
            
            {/* Tag */}
            <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-400 text-xs shadow-lg">
                <span className="text-orange-500 text-lg">🔥</span> 
                Modern UI Design
            </div>

        </div>
      </main>
    </div>
  );
}

// Simple icons for the cards locally to avoid import errors if lucide doesn't have them exactly named this way in the version used
function MessageSquareIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  )
}
function ZapIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    )
}
function BarChartIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
    )
}
