import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookieConsentProvider } from "@/components/providers/CookieConsentContext";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import CookieBanner from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DayOne",
  description: "Launch your SaaS in 48 hours with AI-assisted coding. Production-ready starter kit with authentication, subscriptions, and admin dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CookieConsentProvider>
          <PostHogProvider>
            {children}
          </PostHogProvider>
          <CookieBanner />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
