"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// 서버-클라이언트 동일한 값을 쓰기 위해 고정 데이터 사용 (hydration mismatch 방지)
const GROOVE_COUNTS = 18;

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
        {/* ── 바이닐 레코드 ── */}
        <div className="relative w-44 h-44 mx-auto mb-14">
          {/* 외부 글로우 */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              transform: "scale(1.25)",
              background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          {/* 레코드 본체 */}
          <div
            className="w-full h-full rounded-full relative"
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #111111 50%, #1e1e1e 100%)",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)",
              animation: mounted ? "spin-vinyl 5s linear infinite" : "none",
            }}
          >
            {/* 그루브 링 */}
            {Array.from({ length: GROOVE_COUNTS }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  inset: `${10 + i * 5}px`,
                  border: "1px solid rgba(255,255,255,0.025)",
                }}
              />
            ))}

            {/* 센터 라벨 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-[36%] h-[36%] rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(140deg, #B45309 0%, #D97706 45%, #92400E 100%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <span
                  className="text-amber-100 font-bold"
                  style={{ fontSize: "13px", letterSpacing: "0.05em", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                >
                  LP
                </span>
              </div>
            </div>

            {/* 스핀들 홀 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#0C0C0C", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8)" }}
              />
            </div>
          </div>
        </div>

        {/* ── 브랜드 이름 ── */}
        <h1
          className="text-white font-bold mb-3"
          style={{ fontSize: "clamp(2.5rem, 8vw, 3.5rem)", letterSpacing: "-0.035em", lineHeight: 1 }}
        >
          LP Player
        </h1>

        {/* ── 태그라인 ── */}
        <p
          className="text-sm mb-10"
          style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", fontWeight: 300 }}
        >
          아날로그 감성, 디지털로 재생
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
              label: "스트리밍",
              desc: "YouTube 연동",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              ),
            },
            {
              label: "턴테이블",
              desc: "가상 재생",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
                </svg>
              ),
            },
            {
              label: "커스텀 LP",
              desc: "나만의 음반",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
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
        © 2026 LP Player
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
