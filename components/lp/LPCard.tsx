"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import type { LP } from "@/lib/types";
import { SPLATTER_STROKES } from "@/lib/splatter-vinyl";

export default function LPCard({ lp, isAuthenticated, priority }: { lp: LP; isAuthenticated?: boolean; priority?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [vinylColor, setVinylColor] = useState(lp.coverColor);

  // ── 1. 글리터 설정 (아크릴 계열 전용) ──
  const glitters = useMemo(() => {
    return Array.from({ length: 600 }).map((_, i) => ({
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: 0.06 + Math.random() * 0.12,
      opacity: 0.7 + Math.random() * 0.3,
    }));
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`lp-custom-${lp.id}`);
      if (stored) {
        const config = JSON.parse(stored);
        if (config.color) setVinylColor(config.color);
      }
    } catch {}
  }, [lp.id]);

  function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setLiked((v) => !v);
  }

  const style = (lp.vinylStyle || "color").toLowerCase();
  const isSplatter = style.includes("splatter");
  const isRed = style.includes("red");
  const isEmerald = style.includes("emerald");
  const isMarble = style.includes("marble") || style.includes("smoke");

  return (
    <>
      <div className="group">
        <div className="relative mb-3" style={{ aspectRatio: "3/2" }}>
          {/* ── 바이닐 레코드 영역 ── */}
          <div
            className="absolute top-0 right-0 bottom-0 transition-all duration-500 ease-out group-hover:translate-x-8"
            style={{ 
              width: "66.67%", 
              filter: isSplatter ? "drop-shadow(-8px 5px 15px rgba(0,0,0,0.15))" : "none" 
            }} 
          >
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id={`vclip-${lp.id}`}>
                  <circle cx="50" cy="50" r="49.5"/>
                </clipPath>

                {/* 그라데이션 정의 (Red, Emerald, Smoke, Shine 등...) */}
                <radialGradient id={`redAcrylic-${lp.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#9f1239" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#9f1239" stopOpacity="0.95" />
                </radialGradient>
                <radialGradient id={`emeraldAcrylic-${lp.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#065f46" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.95" />
                </radialGradient>
                <radialGradient id={`smokeAcrylic-${lp.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#404040" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.9" />
                </radialGradient>
                <linearGradient id={`acrylicShine-${lp.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="5%" stopColor="white" stopOpacity="0.6" />
                  <stop offset="20%" stopColor="white" stopOpacity="0" />
                  <stop offset="48%" stopColor="white" stopOpacity="0.2" />
                  <stop offset="52%" stopColor="white" stopOpacity="0" />
                  <stop offset="85%" stopColor="white" stopOpacity="0.45" />
                </linearGradient>
                <filter id={`marbleFilter-${lp.id}`}>
                  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="5" seed={lp.year} />
                  <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 20 -10" />
                  <feGaussianBlur stdDeviation="2.5" />
                  <feDisplacementMap in="SourceGraphic" scale="45" />
                </filter>
              </defs>

              {/* ── 스타일별 렌더링 ── */}
              {isSplatter ? (
                /* ── [TEAM BABY] 화이트 스플래터 ── */
                <g clipPath={`url(#vclip-${lp.id})`}>
                  {/* 베이스 컬러 (주로 연한 베이지/화이트) */}
                  <circle cx="50" cy="50" r="49.5" fill="#fdfdfb" />
                  
                  {/* 스플래터 스트로크 (lib에서 가져온 데이터) */}
                  {SPLATTER_STROKES.map((s, i) => (
                    <line 
                      key={i} 
                      x1="50" y1={50 - s.r2} x2="50" y2={50 - s.r1} 
                      stroke={s.c} 
                      strokeWidth={s.w * 1.8} 
                      strokeLinecap="round" 
                      opacity={s.o} 
                      transform={`rotate(${s.a}, 50, 50)`} 
                    />
                  ))}
                  
                  {/* 스플래터 전용 소리 골 (매우 연하게) */}
                  {[46, 42.5, 39, 35.5, 32, 28.5, 25, 21.5, 18].map((r) => (
                    <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="black" strokeWidth="0.05" opacity="0.05"/>
                  ))}
                  
                  {/* 중앙 라벨 (TEAM BABY 특유의 감성) */}
                  <circle cx="50" cy="50" r="13.5" fill="#e8dec5" />
                  {lp.coverUrl && <image href={lp.coverUrl} x="37.5" y="37.5" height="25" width="25" clipPath="circle(50%)" preserveAspectRatio="xMidYMid slice" />}
                </g>
              ) : (isRed || isEmerald) ? (
                /* ── [201 & TEEN TROUBLES] 딥 아크릴 + 글리터 강화 버전 ── */
                <g clipPath={`url(#vclip-${lp.id})`}>
                  <circle cx="50" cy="50" r="49.5" fill={`url(#${isRed ? 'red' : 'emerald'}Acrylic-${lp.id})`} />
                  <g>
                    {glitters.map((g, i) => (
                      <circle key={i} cx={g.cx} cy={g.cy} r={g.r} fill="#ffffff" opacity={g.opacity} />
                    ))}
                  </g>
                  {[46, 42.5, 39, 35.5, 32, 28.5, 25, 21.5, 18].map((r) => (
                    <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="0.08" opacity="0.1"/>
                  ))}
                  <circle cx="50" cy="50" r="49.5" fill={`url(#acrylicShine-${lp.id})`} />
                  <circle cx="50" cy="50" r="13.5" fill="white" />
                  {lp.coverUrl && <image href={lp.coverUrl} x="36.5" y="36.5" height="27" width="27" clipPath="circle(50%)" preserveAspectRatio="xMidYMid slice" />}
                </g>
              ) : isMarble ? (
                /* ── [THIRSTY] 스모크 마블 (글리터 없음) ── */
                <g clipPath={`url(#vclip-${lp.id})`}>
                  <circle cx="50" cy="50" r="49.5" fill={`url(#smokeAcrylic-${lp.id})`} />
                  <g filter={`url(#marbleFilter-${lp.id})`} opacity="0.8">
                    <circle cx="50" cy="50" r="48" fill="#171717" />
                    <ellipse cx="35" cy="35" rx="35" ry="18" fill="#525252" transform="rotate(40, 35, 35)" />
                    <ellipse cx="65" cy="70" rx="40" ry="12" fill="#000000" transform="rotate(-25, 65, 70)" />
                  </g>
                  <circle cx="50" cy="50" r="49.5" fill={`url(#acrylicShine-${lp.id})`} />
                  <circle cx="50" cy="50" r="13.5" fill="#0c0c0c" />
                  <text x="50" y="51" textAnchor="middle" fontSize="2.2" fill="white" fontWeight="800" letterSpacing="0.5">THIRSTY</text>
                </g>
              ) : (
                /* ── 기본 블랙/기타 ── */
                <g clipPath={`url(#vclip-${lp.id})`}>
                  <circle cx="50" cy="50" r="49.5" fill={vinylColor}/>
                  <circle cx="50" cy="50" r="13" fill="#ddd0b0"/>
                </g>
              )}
              
              <circle cx="50" cy="50" r="2.5" fill="#1a1612"/><circle cx="50" cy="50" r="1.5" fill="#0e0c0a"/>
            </svg>
          </div>

          {/* 슬리브 (클릭 가능하도록 Link로 감쌈) */}
          <Link
            href={`/lp/${lp.id}`}
            className="absolute inset-y-0 left-0 z-10 overflow-hidden rounded-lg transition-transform duration-300 group-hover:-translate-x-2"
            style={{ width: "66.67%", boxShadow: "10px 0 30px rgba(0,0,0,0.3)" }}
          >
            {lp.coverUrl ? (
              <Image src={lp.coverUrl} alt={lp.title} fill className="object-cover" priority={priority} />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: lp.coverColor }}/>
            )}
          </Link>

          {/* ── 찜 버튼 (왼쪽 상단) ── */}
          <button
            onClick={handleLike}
            className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
            aria-label={liked ? "찜 취소" : "찜하기"}
          >
            <svg
              className="w-4 h-4 transition-colors"
              fill={liked ? "currentColor" : "none"}
              stroke={liked ? "none" : "currentColor"}
              strokeWidth={2}
              viewBox="0 0 24 24"
              style={{ color: liked ? "#ef4444" : "rgba(255,255,255,0.85)" }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* ── 재생 버튼 (하단 중앙, 호버 시 표시) ── */}
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
          >
            <Link
              href={`/player/${lp.id}`}
              className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
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

        <Link href={`/lp/${lp.id}`} className="block px-1">
          <h3 className="font-bold text-lp-primary text-sm truncate group-hover:text-lp-accent transition-colors">{lp.title}</h3>
          <p className="text-lp-secondary text-xs mt-0.5 truncate font-medium">{lp.artist}</p>
        </Link>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} message="로그인이 필요한 서비스입니다." />}
    </>
  );
}