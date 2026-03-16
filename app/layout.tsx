import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export const metadata: Metadata = {
  title: "StreamGrid - Movie Source Manager",
  description: "Manage your movie metadata and streaming sources with ease",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
