import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import GNB from "@/components/layout/GNB";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-sans" });
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-diary",
});

export const metadata: Metadata = {
  title: "Turntable Diary — 음악으로 쓰는 일지",
  description: "내가 좋아한 LP를 모으고, 감상을 기록하고, 함께 듣는 친구들을 만나는 곳.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${fraunces.variable} ${inter.className}`}>
      <body className="min-h-screen bg-lp-bg text-lp-primary">
        <SessionProvider>
          <GNB />
          <main className="pt-16">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
