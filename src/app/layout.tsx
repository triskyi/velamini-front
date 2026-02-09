import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import InfoPanel from "@/components/InfoPanel";
import "@/styles/globals.css";


export default function RootLayout({ children}: { children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="flex h-screen">
        <Sidebar />
        <ChatPanel />
        <InfoPanel />
        {children}
      </body>
    </html>
  );
}

