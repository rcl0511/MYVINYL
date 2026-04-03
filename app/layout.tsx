import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GNB from "@/components/layout/GNB";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LP Player — 가상 LP 스트리밍",
  description: "LP를 소유하지 않아도 아날로그 감성을 느낄 수 있는 LP 청취 & 커뮤니티 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.className}>
      <body className="min-h-screen bg-lp-bg text-lp-primary">
        <GNB />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
