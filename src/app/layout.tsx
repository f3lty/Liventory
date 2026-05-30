import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Liventory — Nursery Inventory Management",
  description: "The operating system for plant nursery inventory management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
