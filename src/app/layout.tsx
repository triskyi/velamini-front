import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velamini | Virtual Tresor",
  description: "The digital twin of Ishimwe Tresor Bertrand.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen bg-white text-gray-900 dark:bg-bg dark:text-textPrimary font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

