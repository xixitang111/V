import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 客增主动推 MVP 交互原型",
  description: "AI 客增 MVP 诊断策略前端交互原型",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
