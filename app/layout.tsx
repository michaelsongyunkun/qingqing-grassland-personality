import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "青青草原型人格测试器",
  description: "一个轻松、治愈、有梗但计分稳定的草原意象人格测试器。"
};

export const viewport: Viewport = {
  themeColor: "#dbeecb"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
