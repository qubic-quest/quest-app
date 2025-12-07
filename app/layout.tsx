import type { Metadata } from "next";
import "./globals.css";

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
      <body className="h-dvh">{children}</body>
    </html>
  );
}
