import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Provider from "@/components/Provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#e50914",
};

export const metadata: Metadata = {
  title: "TeluguDub - Movie Streaming",
  description: "Stream movies and series online",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" }
    ],
    apple: "/icon.png",
    shortcut: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TeluguDub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head />
      <body className="bg-[#141414] text-white min-h-screen antialiased">
        <Provider>
          <Navbar />
          {children}
          <BottomNav />
        </Provider>
      </body>
    </html>
  );
}
