import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Perceiva — See Your Money in Its Real Value",
    template: "%s | Perceiva",
  },
  description:
    "Perceiva corrects currency perception so you never misjudge your spending again. Multi-currency finance tracking with live normalization.",
  robots: { index: false, follow: false }, // Private app
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="noise-overlay">{children}</body>
    </html>
  );
}
