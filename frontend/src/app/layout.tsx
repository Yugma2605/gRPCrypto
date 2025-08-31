// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";  // Sans font
import { Roboto_Mono } from "next/font/google"; // Mono font

export const metadata = {
  title: "Ticker Tracker",
  description: "Demo with Next.js fonts",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
