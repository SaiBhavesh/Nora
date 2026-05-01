import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nora — Your AI's Privacy Conscience",
  description: "Privacy governance layer for AI assistants. Intercept, detect, and protect sensitive data before it reaches AI systems.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0f0f] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
