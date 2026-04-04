"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthModal from "@/components/AuthModal";
import type { LP } from "@/lib/types";

export default function LPCard({ lp }: { lp: LP }) {
  const { status } = useSession();
  const [liked, setLiked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // LP 에디터에서 저장한 바이닐 색상 읽기
  const [vinylColor, setVinylColor] = useState(lp.coverColor);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`lp-custom-${lp.id}`);
      if (stored) {
        const config = JSON.parse(stored);
        if (config.color) setVinylColor(config.color);
      }
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, [lp.id]);

  function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
    setLiked((v) => !v);
  }


  return (
    <>
      <div className="group">
        {/* ── 슬리브 + 바이닐 레이아웃 (3:2 비율) ── */}
        {/*
          컨테이너 3:2 → width=3u height=2u
          슬리브: left=0, width=66.67% (=2u) → 정사각형 ✓
          바이닐: right=0, width=66.67% (=2u) → 원형 ✓, 1u(33%)가 슬리브 뒤에 숨김
        */}
        <div className="relative mb-3" style={{ aspectRatio: "3/2" }}>

          {/* ── 바이닐 레코드 (슬리브 뒤, 오른쪽 절반만 노출) ── */}
          <div
            className="absolute top-0 right-0 bottom-0 transition-transform duration-300 ease-out group-hover:translate-x-2"
            style={{
              width: "66.67%",
              filter: "drop-shadow(-8px 0 18px rgba(0,0,0,0.55)) drop-shadow(-2px 0 6px rgba(0,0,0,0.4))",
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* 레코드 본체 그라디언트 — 커스텀 바이닐 색상 */}
                <radialGradient id={`vb-${lp.id}`} cx="38%" cy="32%" r="72%">
                  <stop offset="0%" stopColor={vinylColor}/>
                  <stop offset="60%" stopColor={vinylColor}/>
                  <stop offset="100%" stopColor={vinylColor + "cc"}/>
                </radialGradient>
                {/* 크림색 센터 라벨 */}
                <radialGradient id={`vl-${lp.id}`} cx="36%" cy="28%" r="68%">
                  <stop offset="0%" stopColor="#faf6ec"/>
                  <stop offset="60%" stopColor="#ede5cc"/>
                  <stop offset="100%" stopColor="#ddd0b0"/>
                </radialGradient>
                {/* 레코드 표면 반사광 */}
                <radialGradient id={`vs-${lp.id}`} cx="28%" cy="20%" r="52%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.22)"/>
                  <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                </radialGradient>
              </defs>

              {/* 레코드 본체 */}
              <circle cx="50" cy="50" r="49.5" fill={`url(#vb-${lp.id})`}/>
              {/* 외곽 테두리 */}
              <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6"/>

              {/* 그루브 링 — 컬러 바이닐 위에 어두운 링 */}
              {[45, 41.5, 38, 34.5, 31, 27.5, 24, 20.5, 17].map((r) => (
                <circle
                  key={r}
                  cx="50" cy="50" r={r}
                  fill="none"
                  stroke="rgba(0,0,0,0.18)"
                  strokeWidth="0.55"
                />
              ))}

              {/* 리드아웃 구분선 */}
              <circle cx="50" cy="50" r="14.5" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="0.9"/>

              {/* 센터 라벨 */}
              <circle cx="50" cy="50" r="13" fill={`url(#vl-${lp.id})`}/>
              {/* 라벨 동심원 */}
              <circle cx="50" cy="50" r="13" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.4"/>
              <circle cx="50" cy="50" r="10.5" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.35"/>
              <circle cx="50" cy="50" r="8" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.35"/>

              {/* 스핀들 홀 */}
              <circle cx="50" cy="50" r="3.2" fill="#080808"/>
              <circle cx="50" cy="50" r="2.4" fill="#030303"/>

              {/* 반사광 오버레이 */}
              <circle cx="50" cy="50" r="49.5" fill={`url(#vs-${lp.id})`}/>
            </svg>
          </div>

          {/* ── 앨범 슬리브 (겉표지) ── */}
          <div
            className="absolute inset-y-0 left-0 z-10 overflow-hidden rounded-lg transition-transform duration-300 ease-out group-hover:-translate-x-1"
            style={{
              width: "66.67%",
              boxShadow: "4px 0 24px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.25)",
            }}
          >
            {lp.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lp.coverUrl}
                alt={lp.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: lp.coverColor }}/>
            )}

            {/* 슬리브 오른쪽 개구부 그림자 (레코드가 나오는 방향) */}
            <div
              className="absolute inset-y-0 right-0 w-12 pointer-events-none"
              style={{ background: "linear-gradient(to left, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.10) 60%, transparent 100%)" }}
            />
          </div>

          {/* ── 찜 버튼 ── */}
          <button
            onClick={handleLike}
            className="absolute top-2 left-2 z-20 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              background: liked ? "rgba(239,68,68,0.18)" : "rgba(0,0,0,0.42)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            aria-label={liked ? "찜 취소" : "찜하기"}
          >
            <svg
              className="w-3.5 h-3.5 transition-colors"
              fill={liked ? "#ef4444" : "none"}
              stroke={liked ? "#ef4444" : "rgba(255,255,255,0.9)"}
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* ── 재생 버튼 (바이닐 위, 호버 시 표시) ── */}
          <div
            className="absolute top-0 bottom-0 right-0 z-20 flex items-center justify-center"
            style={{ width: "33.34%" }}
          >
            <Link
              href={`/player/${lp.id}`}
              className="w-11 h-11 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1.5px solid rgba(255,255,255,0.22)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ── 정보 ── */}
        <Link href={`/lp/${lp.id}`} className="block">
          <h3 className="font-semibold text-lp-primary text-sm leading-tight truncate group-hover:text-lp-accent transition-colors">
            {lp.title}
          </h3>
          <p className="text-lp-secondary text-xs mt-0.5 truncate">{lp.artist}</p>
          <p className="text-lp-tertiary text-xs mt-0.5">{lp.year} · {lp.genre}</p>
        </Link>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          message="찜하기는 로그인한 사용자만 이용할 수 있어요."
        />
      )}
    </>
  );
}
