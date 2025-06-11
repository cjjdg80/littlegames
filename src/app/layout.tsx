// src/app/layout.tsx - 根布局组件，定义全局HTML结构和元数据
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 配置Geist字体，支持拉丁字符集
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO元数据配置 - 面向欧美用户的英文内容
export const metadata: Metadata = {
  title: "Play Browser Mini Games - Free Online Mini Games Platform",
  description: "Discover and play thousands of free online mini games. Enjoy puzzle games, action games, arcade games and more. No download required, play instantly in your browser.",
  keywords: "free games, online games, mini games, browser games, puzzle games, action games",
  authors: [{ name: "Play Browser Mini Games Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
