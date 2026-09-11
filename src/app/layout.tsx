import type { Metadata, Viewport } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Shooters Poker Room",
    template: "%s · Shooters Poker Room",
  },
  description:
    "Shooters Poker Room — live cash games, tournaments, waitlist, and tournament clock. Mobile-first cardroom app.",
  applicationName: "Shooters Poker Room",
};

export const viewport: Viewport = {
  themeColor: "#0d3b2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="font-body antialiased felt-bg min-h-dvh">
        <Header />
        <main className="mx-auto max-w-3xl px-4 pt-4 pb-28">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
