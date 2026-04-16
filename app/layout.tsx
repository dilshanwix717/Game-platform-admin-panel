import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers"; // <-- React Query providers
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Modern admin dashboard built with Next.js",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans antialiased ${_geist.className} ${_geistMono.className}`}
      >
        {/* Wrap client providers here — this is a server component rendering client components */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Providers>
            <SessionProviderWrapper>
              {children}
              <Toaster />
            </SessionProviderWrapper>
          </Providers>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
