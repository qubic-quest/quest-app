import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Qubic Quest - AI Blockchain Explorer",
  description: "ChatGPT-like interface for querying Qubic blockchain data. Explore transactions, asset trades, wallet activity, and on-chain analytics with natural language queries powered by AI.",
  keywords: ["qubic", "blockchain", "explorer", "ai", "analytics", "defi", "qx", "smart contracts"],
  authors: [{ name: "DeepSight Team" }],
  openGraph: {
    title: "Qubic Quest - AI Blockchain Explorer",
    description: "Explore Qubic blockchain with AI-powered natural language queries",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`h-dvh ${playfair.variable}`}>{children}</body>
    </html>
  );
}
