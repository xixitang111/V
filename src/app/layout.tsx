import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 客增主动推 MVP 交互原型",
  description: "抖店 AI 客增主动推送策略交互演示原型",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}