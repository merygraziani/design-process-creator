import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Design Process Creator",
  description: "N26 design process plan generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <div className="w-full bg-gray-900 text-white text-xs text-center py-2 px-4">
          Have feedback?{" "}
          <a
            href="https://chat.google.com/room/AAQA2V7lOcA?cls=7"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-300 transition-colors"
          >
            Share it in the channel
          </a>
        </div>
        {children}
      </body>
    </html>
  );
}
