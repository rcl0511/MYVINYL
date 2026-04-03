import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import GNB from "@/components/layout/GNB";
import SessionProvider from "@/components/SessionProvider";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "MyVinyl — 프리미엄 바이닐 스트리밍",
  description: "아날로그 감성의 LP를 디지털로 — 소장하고, 감상하고, 공유하세요.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={outfit.className}>
      <body className="min-h-screen bg-lp-bg text-lp-primary">
        <SessionProvider>
          <GNB />
          <main className="pt-16">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
