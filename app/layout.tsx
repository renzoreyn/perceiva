import type { Metadata } from "next";
import { Geist, Outfit } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Perceiva",
    template: "%s | Perceiva",
  },
  description:
    "Stop misjudging your spending across currencies. Perceiva converts everything to your base currency in real time so you always know what things actually cost.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
