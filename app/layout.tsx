import type { Metadata, Viewport } from "next";
import { Orbitron, JetBrains_Mono, Sarabun } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav/Nav";

// next/font self-hosts these at build time (no runtime request to
// fonts.googleapis.com), eliminating the render-blocking @import that used
// to live in globals.css and removing layout shift via automatic font
// fallback metrics. The CSS variable names match what tailwind.config.ts
// already expects (--font-orbitron, --font-jetbrains, --font-sarabun) so no
// Tailwind config changes are needed.
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
});

const SITE_URL = "https://obixcore.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OBIXCORE AI — FPV Copilot",
    template: "%s · OBIXCORE AI",
  },
  description:
    "FPV Copilot ครบวงจร: Dashboard, My Drone Profiles, FPV Doctor AI, Blackbox Analyzer, Tuning Wizard, Problem Solver, Calculator และ Preset Library",
  keywords: [
    "FPV", "drone", "betaflight", "tuning", "PID", "preset", "โดรน",
    "blackbox", "fpv doctor", "drone profile", "fpv copilot",
  ],
  applicationName: "OBIXCORE AI",
  authors: [{ name: "OBIXCORE" }],
  manifest: undefined,
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: SITE_URL,
    siteName: "OBIXCORE AI — FPV Copilot",
    title: "OBIXCORE AI — FPV Copilot",
    description:
      "Dashboard, Drone Profiles, FPV Doctor AI และ Blackbox Analyzer ในที่เดียว",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "OBIXCORE AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OBIXCORE AI — FPV Copilot",
    description: "FPV Copilot: Dashboard, Drone Profiles, FPV Doctor AI, Blackbox Analyzer",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// themeColor/colorScheme/viewport moved out of `metadata` and into the
// dedicated `viewport` export — this matches Next.js 14.2's App Router API
// and avoids the "Unsupported metadata themeColor" build-time warning that
// the old combined-export pattern produces.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#07090d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`dark ${orbitron.variable} ${jetbrainsMono.variable} ${sarabun.variable}`}
    >
      <body className="relative isolate min-h-screen overflow-x-hidden bg-bg font-sarabun text-text antialiased">
        {/* Skip link: first focusable element on the page. Lets keyboard
            and screen-reader users jump straight past the fixed nav to the
            main content instead of tabbing through every nav item first. */}
        <a href="#main-content" className="skip-link">
          ข้ามไปเนื้อหาหลัก (Skip to content)
        </a>

        <div className="pointer-events-none fixed inset-0 -z-30 bg-[radial-gradient(circle_at_top_left,_rgba(0,232,122,0.18),_transparent_28%),radial-gradient(circle_at_82%_16%,_rgba(0,170,255,0.14),_transparent_22%),radial-gradient(circle_at_16%_78%,_rgba(176,96,255,0.16),_transparent_24%),radial-gradient(circle_at_78%_82%,_rgba(255,187,0,0.10),_transparent_20%),linear-gradient(180deg,#07090d_0%,#0a0c10_44%,#07090d_100%)]" />
        <div className="pointer-events-none fixed inset-0 -z-20 bg-grid opacity-35" />
        <div className="pointer-events-none fixed inset-0 -z-10 hud-noise" />
        <div className="pointer-events-none fixed inset-0 -z-10 scanline-overlay" />

        <div className="pointer-events-none fixed -top-28 -left-24 h-72 w-72 rounded-full bg-green-DEFAULT/15 blur-3xl animate-float-slow" />
        <div className="pointer-events-none fixed top-20 -right-24 h-80 w-80 rounded-full bg-blue-DEFAULT/12 blur-3xl animate-float-slower" />
        <div className="pointer-events-none fixed bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-DEFAULT/10 blur-3xl animate-float-slow" />

        <Nav />

        <main id="main-content" className="relative z-10 min-h-screen pb-24 md:pb-0 md:pt-24">
          {children}
        </main>
      </body>
    </html>
  );
}
