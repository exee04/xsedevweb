import type { Metadata } from "next";
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
