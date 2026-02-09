import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import InfoPanel from "@/components/InfoPanel";
import "./globals.css";



export default function RootLayout({ children}: { children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-white text-gray-900 dark:bg-bg dark:text-textPrimary font-sans">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <ChatPanel />
        </main>
        <aside className="hidden md:block w-72">
          <InfoPanel />
        </aside>
        {children}
      </body>
    </html>
  );
}

