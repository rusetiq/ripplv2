import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rippl — Sustainability, Gamified",
  description: "Log sustainable actions, compete with friends, and track your real impact on UAE's Net Zero 2050 goals.",
  keywords: "sustainability, UAE, Net Zero, eco, green, leaderboard, carbon",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
