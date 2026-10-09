import type { Metadata, Viewport } from "next";
import "./globals.css";
import './fonts.css';
import fontPreloads from './font-preloads.json';
import "@/templates/system/quality.css";

export const metadata: Metadata = {
  title: "Ode — create their world",
  description:
    "A curated generator for art-directed, interactive birthday websites made of someone's photos, personality and memories.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F4F0E7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* The original six editorial families are served locally, with their licenses. */}
        {fontPreloads.map(font=><link key={font} rel="preload" href={font} as="font" type="font/woff2" crossOrigin="anonymous" />)}
      </head>
      <body className="grain font-sans">
        {children}
      </body>
    </html>
  );
}
