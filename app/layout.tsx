import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--main-font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "xsedev_terminal",
  description: "Terminal Portfolio",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetBrainsMono.variable} h-full antialiased`}>
      <body>{children}</body>
    </html>
  );
}
