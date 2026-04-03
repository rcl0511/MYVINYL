"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthModal from "@/components/AuthModal";
import type { LP } from "@/lib/types";

function getCardVinylBg(lp: LP): string {
  const c = lp.coverColor;
  const groove = `repeating-radial-gradient(circle at center, #0e0e0e 0px, #0e0e0e 1px, #1c1c1c 1px, #1c1c1c 1.8px, #0f0f0f 1.8px, #0f0f0f 3px, #1a1a1a 3px, #1a1a1a 3.8px, #0d0d0d 3.8px, #0d0d0d 5px)`;
  switch (lp.vinylStyle) {
    case "splatter":
      return [
        `radial-gradient(circle 28px at 25% 30%, ${c}bb, transparent 65%)`,
        `radial-gradient(circle 18px at 68% 20%, ${c}99, transparent 70%)`,
        `radial-gradient(circle 36px at 72% 70%, ${c}88, transparent 60%)`,
        `radial-gradient(circle 14px at 40% 78%, ${c}cc, transparent 60%)`,
        `radial-gradient(circle 22px at 85% 45%, ${c}77, transparent 65%)`,
        groove,
      ].join(",");
    case "marble":
      return [
        `conic-gradient(from 35deg at 40% 50%, ${c}30 0%, transparent 25%, ${c}20 48%, transparent 68%, ${c}28 88%, transparent 100%)`,
        `radial-gradient(ellipse 65% 45% at 40% 55%, ${c}55, transparent 70%)`,
        `repeating-radial-gradient(circle at center, #1a0808 0px, #1a0808 1px, #2a1212 1px, #2a1212 1.8px, #1c0a0a 1.8px, #1c0a0a 3px, #260e0e 3px, #260e0e 3.8px, #1a0808 3.8px, #1a0808 5px)`,
      ].join(",");
    case "color":
      return `repeating-radial-gradient(circle at center, ${c}99 0px, ${c}99 1px, ${c}cc 1px, ${c}cc 1.8px, ${c}88 1.8px, ${c}88 3px, ${c}bb 3px, ${c}bb 3.8px, ${c}77 3.8px, ${c}77 5px)`;
    default:
      return groove;
  }
}

export default function LPCard({ lp }: { lp: LP }) {
  const { status } = useSession();
  const [liked, setLiked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      <div className="bg-white rounded-xl border border-lp-border overflow-hidden hover:shadow-md transition-shadow group">
        {/* Cover */}
        <Link href={`/lp/${lp.id}`} className="block aspect-square relative overflow-hidden">
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: lp.coverColor }}
          >
            {/* Album cover image background */}
            {lp.coverUrl && (
              <img
                src={lp.coverUrl}
                alt={lp.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.85 }}
              />
            )}
            {/* LP disc illust */}
            <div className="w-28 h-28 rounded-full relative shadow-2xl z-10" style={{ border: "3px solid rgba(255,255,255,0.15)" }}>
              {/* Vinyl surface */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: getCardVinylBg(lp) }}
              />
              {/* Label area — show cover image if available */}
              <div
                className="absolute rounded-full z-10 overflow-hidden"
                style={{
                  width: "36%", height: "36%",
                  top: "32%", left: "32%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                {lp.coverUrl ? (
                  <img src={lp.coverUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: `radial-gradient(circle at 35% 30%, ${lp.coverColor}ff, ${lp.coverColor}99)` }} />
                )}
              </div>
              {/* Spindle hole */}
              <div className="absolute rounded-full z-20 bg-black/60" style={{ width: "8%", height: "8%", top: "46%", left: "46%" }} />
            </div>
          </div>

          {/* 찜 button — 항상 표시, 로그인 여부는 클릭 시 확인 */}
          <button
            onClick={handleLike}
            className="absolute top-2.5 right-2.5 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-all"
            style={{
              background: liked ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
            }}
            aria-label={liked ? "찜 취소" : "찜하기"}
          >
            <svg
              className="w-4 h-4 transition-colors"
              fill={liked ? "#ef4444" : "none"}
              stroke={liked ? "#ef4444" : "rgba(255,255,255,0.8)"}
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/player/${lp.id}`}
              className="w-14 h-14 rounded-full bg-lp-accent-btn flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </Link>
          </div>
        </Link>

        {/* Info */}
        <div className="p-4">
          <Link href={`/lp/${lp.id}`} className="block">
            <h3 className="font-semibold text-lp-primary text-sm leading-tight truncate hover:text-lp-accent transition-colors">
              {lp.title}
            </h3>
            <p className="text-lp-secondary text-xs mt-1 truncate">{lp.artist}</p>
            <p className="text-lp-tertiary text-xs mt-0.5">
              {lp.year} · {lp.genre}
            </p>
          </Link>

          <Link
            href={`/player/${lp.id}`}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-lp-accent-btn text-white text-xs font-medium rounded-lg hover:bg-lp-accent transition-colors"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            재생
          </Link>
        </div>
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
