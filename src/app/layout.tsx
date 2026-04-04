import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Preloader } from "@/components/animations/Preloader";
import "./globals.css";

/* ─────────────────────────────────────────────
   FONTS
───────────────────────────────────────────── */
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

/* ─────────────────────────────────────────────
   METADATA
───────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "HackDays 2026 | The Innovation Grid",
  description: "Engines on. Lights out. A 24-hour Formula-style tech race by ACM Student Chapter.",
};

/* ─────────────────────────────────────────────
   ROOT LAYOUT — Server Component
   SmoothScroll is a client component that wraps
   children with ReactLenis from the "lenis" package.
   Do NOT import @studio-freight/lenis here.
───────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${bebasNeue.variable} ${ibmPlexMono.variable} font-mono antialiased bg-void text-[#ededed]`}
        suppressHydrationWarning
      >
        <SmoothScroll>
          <Preloader />
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}