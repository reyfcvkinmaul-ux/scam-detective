import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scam Detective — Web3 Safety Academy",
  description:
    "Learn to detect crypto scams before they detect you. Interactive investigation missions that train you to spot fake airdrops, phishing, rugpulls, and malicious approvals.",
  openGraph: {
    title: "Scam Detective — Web3 Safety Academy",
    description: "Train your scam-detection instincts through detective-style missions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
