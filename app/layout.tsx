import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#dc2626",
};

export const metadata: Metadata = {
  title: "StreamGrid - Movie Streaming",
  description: "Stream movies and series online",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" }
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StreamGrid",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
