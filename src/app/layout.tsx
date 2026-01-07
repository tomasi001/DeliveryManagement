import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/query-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArtTrack Delivery",
  description: "Professional Art Delivery Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-neutral-100 text-foreground antialiased flex justify-center",
          "dark:bg-neutral-950"
        )}
      >
        <QueryProvider>
          <div className="w-full min-h-screen bg-background shadow-xl overflow-x-hidden relative">
            {children}
          </div>
          <Toaster richColors position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
