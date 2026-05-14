"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function IntroPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative px-6"
      style={{ background: "#0C0C0C" }}>

      {/* 상단 웜 앰비언트 라이트 */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center top, rgba(245,158,11,0.07) 0%, transparent 65%)",
        }}
      />

      {/* 하단 어두운 그라디언트 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }}
      />

      {/* 메인 콘텐츠 */}
      <div
        className="relative z-10 text-center max-w-lg w-full"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* ── 로고 ── */}
        <div className="relative w-44 h-44 mx-auto mb-12">
          {/* 외부 글로우 */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              transform: "scale(1.3)",
              background: "radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <div
            className="relative w-full h-full"
            style={{
              animation: mounted ? "spin-vinyl 14s linear infinite" : "none",
              transformOrigin: "center",
            }}
          >
            <BrandLogo size={176} withShadow={false} />
          </div>
        </div>

        {/* ── 브랜드 이름 ── */}
        <h1
          className="mb-3 flex items-baseline justify-center gap-2 sm:gap-3 flex-wrap"
          style={{ fontSize: "clamp(2.2rem, 7vw, 3.4rem)", letterSpacing: "-0.025em", lineHeight: 1 }}
        >
          <span
            className="text-white"
            style={{
              fontFamily: "var(--font-diary), 'Fraunces', Georgia, serif",
              fontWeight: 600,
            }}
          >
            Turntable
          </span>
          <span
            style={{
              fontFamily: "var(--font-diary), 'Fraunces', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 500,
              color: "rgba(245,158,11,0.92)",
              letterSpacing: "-0.01em",
            }}
          >
            Diary
          </span>
        </h1>

        {/* ── 태그라인 ── */}
        <p
          className="mb-10"
          style={{
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.08em",
            fontWeight: 300,
            fontSize: "0.95rem",
          }}
        >
          음악으로 쓰는 일지
        </p>

        {/* ── 구분선 + 스펙 정보 ── */}
        <div className="flex items-center gap-4 justify-center mb-10">
          <div className="h-px flex-1 max-w-[48px]" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div
            className="flex gap-4 text-xs"
            style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}
          >
            <span>SIDE A</span>
            <span>·</span>
            <span>33⅓ RPM</span>
            <span>·</span>
            <span>STEREO</span>
          </div>
          <div className="h-px flex-1 max-w-[48px]" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* ── 피처 카드 ── */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            {
              label: "감상 기록",
              desc: "오늘의 LP",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              ),
            },
            {
              label: "내 컬렉션",
              desc: "좋아한 LP",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ),
            },
            {
              label: "함께 듣기",
              desc: "음악 친구",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
            },
          ].map((f) => (
            <div
              key={f.label}
              className="py-4 px-3 rounded-xl flex flex-col items-center gap-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ color: "rgba(245,158,11,0.7)" }}>{f.icon}</span>
              <div>
                <div
                  className="text-xs font-semibold uppercase"
                  style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em" }}
                >
                  {f.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA 버튼 ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth"
            className="flex-1 flex items-center justify-center px-8 py-3.5 rounded-lg font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              color: "#0C0C0C",
              boxShadow: "0 0 30px rgba(245,158,11,0.25)",
            }}
          >
            시작하기
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center px-8 py-3.5 rounded-lg font-medium text-sm transition-all active:scale-[0.98]"
            style={{
              color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            둘러보기
          </Link>
        </div>
      </div>

      {/* ── 푸터 ── */}
      <p
        className="absolute bottom-8 text-xs"
        style={{ color: "rgba(255,255,255,0.12)", letterSpacing: "0.06em" }}
      >
        © 2026 Turntable Diary
      </p>

      <style>{`
        @keyframes spin-vinyl {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
