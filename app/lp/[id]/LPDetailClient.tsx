"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MOCK_COMMENTS } from "@/lib/mock-data";
import AuthModal from "@/components/AuthModal";
import type { LP, LPSide } from "@/lib/types";

export default function LPDetailClient({ lp }: { lp: LP }) {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [activeSide, setActiveSide] = useState<LPSide>("A");
  const [liked, setLiked] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; message?: string }>({ open: false });

  const sideTracks = lp.tracks.filter((t) => t.side === activeSide);
  const totalTracks = lp.tracks.length;
  const totalDuration = lp.tracks.reduce((acc, t) => {
    const [m, s] = t.duration.split(":").map(Number);
    return acc + m * 60 + s;
  }, 0);
  const totalMin = Math.floor(totalDuration / 60);

  function requireAuth(message: string, action: () => void) {
    if (!isLoggedIn) {
      setAuthModal({ open: true, message });
      return;
    }
    action();
  }

  return (
    <>
      <div className="min-h-[calc(100vh-64px)] flex">
        {/* Left panel */}
        <div className="w-[440px] shrink-0 bg-lp-bg flex flex-col items-center px-10 py-10">
          {/* Back */}
          <div className="w-full mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-lp-secondary text-sm hover:text-lp-accent transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" />
              </svg>
              LP 탐색으로
            </Link>
          </div>

          {/* Album cover */}
          <div
            className="w-full aspect-square rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden mb-8"
            style={{ backgroundColor: lp.coverColor }}
          >
            {lp.coverUrl && (
              <img
                src={lp.coverUrl}
                alt={lp.title}
                className="absolute inset-0 w-full h-full object-cover opacity-85"
              />
            )}
            <div className="w-36 h-36 rounded-full border-4 border-white/20 relative flex items-center justify-center z-10">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle at 40% 40%, ${lp.coverColor}cc, #000)` }}
              />
              <div className="w-12 h-12 rounded-full bg-white/30 z-10" />
            </div>
            {/* Genre badge */}
            <span className="absolute top-4 right-4 px-3 py-1 bg-black/40 text-white text-xs font-medium rounded-full backdrop-blur-sm z-10">
              {lp.genre}
            </span>
          </div>

          {/* CTA buttons */}
          <div className="w-full space-y-3">
            {/* 재생 — 누구나 가능 */}
            <Link
              href={`/player/${lp.id}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-lp-accent-btn text-white font-semibold rounded-xl hover:bg-lp-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              지금 재생하기
            </Link>

            {/* 컬렉션에 추가 — 로그인 필요 */}
            <button
              onClick={() =>
                requireAuth("컬렉션 추가는 로그인한 사용자만 이용할 수 있어요.", () =>
                  setLiked((l) => !l)
                )
              }
              className={`w-full flex items-center justify-center gap-2 py-3 border-2 font-semibold rounded-xl transition-colors ${
                liked
                  ? "border-lp-danger text-lp-danger bg-red-50"
                  : "border-lp-border text-lp-secondary hover:border-lp-accent hover:text-lp-accent"
              }`}
            >
              <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {liked ? "컬렉션에서 제거" : "컬렉션에 추가"}
            </button>

            {lp.externalPurchaseUrl && (
              <a
                href={lp.externalPurchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 border border-lp-border text-lp-secondary font-medium rounded-xl hover:border-lp-accent hover:text-lp-accent transition-colors text-sm"
              >
                외부 구매처 바로가기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                </svg>
              </a>
            )}
          </div>

          {/* Meta */}
          <div className="w-full mt-6 pt-6 border-t border-lp-border text-xs text-lp-tertiary space-y-1.5">
            <p>발매사: {lp.label}</p>
            <p>발매연도: {lp.year}</p>
            <p>총 트랙: {totalTracks}곡 · 약 {totalMin}분</p>
            <p className="mt-3">라이선스 고지 | 저작권 정보 © {lp.label}</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="max-w-3xl px-12 py-10">
            {/* Title */}
            <h1 className="text-4xl font-bold text-lp-primary leading-tight">{lp.title}</h1>
            <p className="text-lp-secondary mt-2 text-base">
              {lp.artist} · {lp.year} · {lp.genre} · {lp.label}
            </p>

            {/* Description */}
            {lp.description && (
              <p className="mt-4 text-lp-secondary text-sm leading-relaxed">{lp.description}</p>
            )}

            <div className="border-t border-lp-border mt-8" />

            {/* Track list */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-lp-primary">트랙리스트</h2>
                <div className="flex gap-1">
                  {(["A", "B"] as LPSide[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setActiveSide(s)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        activeSide === s
                          ? "bg-lp-accent-light text-lp-accent"
                          : "bg-lp-chip text-lp-secondary hover:bg-lp-border"
                      }`}
                    >
                      {s}면
                    </button>
                  ))}
                </div>
              </div>

              {/* Track rows */}
              <div className="space-y-1">
                {sideTracks.map((track, idx) => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                      idx % 2 === 0 ? "bg-white" : "bg-lp-bg"
                    } hover:bg-lp-accent-light group transition-colors`}
                  >
                    <span className="w-6 text-center text-xs text-lp-tertiary tabular-nums group-hover:hidden">
                      {track.number}
                    </span>
                    <Link
                      href={`/player/${lp.id}`}
                      className="w-6 items-center justify-center hidden group-hover:flex"
                      aria-label={`${track.title} 재생`}
                    >
                      <svg className="w-4 h-4 text-lp-accent" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </Link>
                    <span className="flex-1 text-sm text-lp-primary font-medium">{track.title}</span>
                    <span className="text-lp-tertiary text-xs tabular-nums">{track.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-lp-border mt-10" />

            {/* Comments */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-lp-primary mb-6">
                댓글 <span className="text-lp-tertiary font-normal text-sm ml-1">{MOCK_COMMENTS.length}</span>
              </h2>

              {/* Comment input */}
              {isLoggedIn ? (
                <div className="flex gap-3 mb-8">
                  <div className="w-9 h-9 rounded-full bg-lp-accent-btn shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    나
                  </div>
                  <div className="flex-1 border border-lp-border rounded-xl overflow-hidden focus-within:border-lp-accent transition-colors">
                    <textarea
                      placeholder="LP에 대한 감상을 남겨보세요..."
                      rows={2}
                      className="w-full px-4 pt-3 text-sm text-lp-primary placeholder:text-lp-tertiary resize-none outline-none bg-transparent"
                    />
                    <div className="flex justify-end px-3 pb-2">
                      <button className="px-4 py-1.5 bg-lp-accent-btn text-white text-xs font-medium rounded-lg hover:bg-lp-accent transition-colors">
                        등록
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 비로그인: 댓글 쓰기 유도 배너 */
                <button
                  onClick={() => setAuthModal({ open: true, message: "댓글 작성은 로그인한 사용자만 이용할 수 있어요." })}
                  className="flex items-center gap-3 w-full mb-8 px-4 py-3 rounded-xl border border-dashed border-lp-border text-lp-secondary text-sm hover:border-lp-accent hover:text-lp-accent transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  로그인하고 댓글을 남겨보세요
                </button>
              )}

              {/* Comment list — 누구나 읽기 가능 */}
              <div className="space-y-6">
                {MOCK_COMMENTS.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div
                      className="w-9 h-9 rounded-full shrink-0"
                      style={{ backgroundColor: comment.avatarColor }}
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm text-lp-primary">{comment.nickname}</span>
                        <span className="text-lp-tertiary text-xs">{comment.timeAgo}</span>
                      </div>
                      <p className="text-sm text-lp-secondary leading-relaxed">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => requireAuth("좋아요는 로그인한 사용자만 이용할 수 있어요.", () => {})}
                          className="flex items-center gap-1 text-xs text-lp-tertiary hover:text-lp-danger transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          {comment.likeCount}
                        </button>
                        <button
                          onClick={() => requireAuth("답글은 로그인한 사용자만 이용할 수 있어요.", () => {})}
                          className="text-xs text-lp-tertiary hover:text-lp-accent transition-colors"
                        >
                          답글
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {authModal.open && (
        <AuthModal
          onClose={() => setAuthModal({ open: false })}
          message={authModal.message}
        />
      )}
    </>
  );
}
