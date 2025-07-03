import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "SentimentAI - Video Emotion Analysis",
  description: "AI-powered video sentiment analysis with real-time emotion detection. Upload videos and get detailed emotional insights.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} font-sans`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
