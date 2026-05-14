"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthModal from "@/components/AuthModal";
import type { LP, LPSide } from "@/lib/types";

interface LPCommentRow {
  id: string;
  lp_id: string;
  user_id: string;
  content: string;
  like_count: number;
  created_at: string;
  profiles: {
    id: string;
    username: string | null;
    nickname: string | null;
    avatar_url: string | null;
    avatar_color: string | null;
  } | null;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return new Date(iso).toLocaleDateString();
}

export default function LPDetailClient({ lp }: { lp: LP }) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const meId = session?.user?.id;

  const [activeSide, setActiveSide] = useState<LPSide>("A");
  const [liked, setLiked] = useState(false);
  const [pendingLike, setPendingLike] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; message?: string }>({ open: false });
  const [comments, setComments] = useState<LPCommentRow[]>([]);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sideTracks = lp.tracks.filter((t) => t.side === activeSide);
  const totalTracks = lp.tracks.length;
  const totalDuration = lp.tracks.reduce((acc, t) => {
    const [m, s] = t.duration.split(":").map(Number);
    return acc + m * 60 + s;
  }, 0);
  const totalMin = Math.floor(totalDuration / 60);

  useEffect(() => {
    fetch(`/api/lps/${lp.id}/comments`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setComments(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [lp.id]);

  useEffect(() => {
    if (!isLoggedIn) { setLiked(false); return; }
    fetch(`/api/lps/${lp.id}/like`)
      .then((r) => r.json())
      .then((d) => setLiked(!!d.liked))
      .catch(() => {});
  }, [isLoggedIn, lp.id]);

  function requireAuth(message: string, action: () => void) {
    if (!isLoggedIn) {
      setAuthModal({ open: true, message });
      return;
    }
    action();
  }

  async function toggleLike() {
    if (pendingLike) return;
    const prev = liked;
    setLiked(!prev);
    setPendingLike(true);
    try {
      const res = await fetch(`/api/lps/${lp.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { liked: newState } = await res.json();
      setLiked(newState);
    } catch {
      setLiked(prev);
    } finally {
      setPendingLike(false);
    }
  }

  async function submitComment() {
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lps/${lp.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      if (!res.ok) throw new Error();
      const newComment = (await res.json()) as LPCommentRow;
      setComments((prev) => [newComment, ...prev]);
      setDraft("");
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(id: string) {
    if (!confirm("댓글을 삭제할까요?")) return;
    const res = await fetch(`/api/lp-comments/${id}`, { method: "DELETE" });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== id));
  }

  async function toggleCommentLike(id: string) {
    if (!isLoggedIn) {
      setAuthModal({ open: true, message: "좋아요는 로그인한 사용자만 이용할 수 있어요." });
      return;
    }
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, like_count: c.like_count + 1 } : c))
    );
    const res = await fetch(`/api/lp-comments/${id}`, { method: "POST" });
    if (!res.ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, like_count: Math.max(0, c.like_count - 1) } : c))
      );
      return;
    }
    const { liked: newState } = await res.json();
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, like_count: newState ? c.like_count : Math.max(0, c.like_count - 1) } : c
      )
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-64px)] flex flex-col md:flex-row">
        {/* Left panel */}
        <div className="w-full md:w-[440px] md:shrink-0 bg-lp-bg flex flex-col items-center px-6 sm:px-10 py-8 md:py-10">
          <div className="w-full mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-lp-secondary text-sm hover:text-lp-accent transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" />
              </svg>
              LP 탐색으로
            </Link>
          </div>

          <div className="w-full aspect-square rounded-2xl shadow-xl relative overflow-hidden mb-8" style={{ backgroundColor: lp.coverColor }}>
            {lp.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lp.coverUrl} alt={lp.title} className="absolute inset-0 w-full h-full object-cover opacity-85" />
            )}
            <span className="absolute top-4 right-4 px-3 py-1 bg-black/40 text-white text-xs font-medium rounded-full backdrop-blur-sm z-10">{lp.genre}</span>
          </div>

          <div className="w-full space-y-3">
            <Link href={`/player/${lp.id}`} className="w-full flex items-center justify-center gap-2 py-3 bg-lp-accent-btn text-white font-semibold rounded-xl hover:bg-lp-accent transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              지금 재생하기
            </Link>
            <button
              onClick={() => requireAuth("컬렉션 추가는 로그인한 사용자만 이용할 수 있어요.", toggleLike)}
              disabled={pendingLike}
              className={`w-full flex items-center justify-center gap-2 py-3 border-2 font-semibold rounded-xl transition-colors disabled:opacity-60 ${
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
              <a href={lp.externalPurchaseUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 border border-lp-border text-lp-secondary font-medium rounded-xl hover:border-lp-accent hover:text-lp-accent transition-colors text-sm">
                외부 구매처 바로가기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                </svg>
              </a>
            )}
          </div>

          <div className="w-full mt-6 pt-6 border-t border-lp-border text-xs text-lp-tertiary space-y-1.5">
            <p>발매사: {lp.label}</p>
            <p>발매연도: {lp.year}</p>
            <p>총 트랙: {totalTracks}곡 · 약 {totalMin}분</p>
            <p className="mt-3">라이선스 고지 | 저작권 정보 © {lp.label}</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="max-w-3xl px-4 sm:px-8 md:px-12 py-6 md:py-10">
            <h1 className="text-2xl sm:text-4xl font-bold text-lp-primary leading-tight">{lp.title}</h1>
            <p className="text-lp-secondary mt-2 text-base">{lp.artist} · {lp.year} · {lp.genre} · {lp.label}</p>
            {lp.description && <p className="mt-4 text-lp-secondary text-sm leading-relaxed">{lp.description}</p>}

            <div className="border-t border-lp-border mt-8" />

            {/* Tracks */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-lp-primary">트랙리스트</h2>
                <div className="flex gap-1">
                  {(["A", "B"] as LPSide[]).map((s) => (
                    <button key={s} onClick={() => setActiveSide(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeSide === s ? "bg-lp-accent-light text-lp-accent" : "bg-lp-chip text-lp-secondary hover:bg-lp-border"}`}>{s}면</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                {sideTracks.map((track, idx) => (
                  <div key={track.id} className={`flex items-center gap-4 px-4 py-3 rounded-xl ${idx % 2 === 0 ? "bg-white" : "bg-lp-bg"} hover:bg-lp-accent-light group transition-colors`}>
                    <span className="w-6 text-center text-xs text-lp-tertiary tabular-nums group-hover:hidden">{track.number}</span>
                    <Link href={`/player/${lp.id}`} className="w-6 items-center justify-center hidden group-hover:flex" aria-label={`${track.title} 재생`}>
                      <svg className="w-4 h-4 text-lp-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
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
                댓글 <span className="text-lp-tertiary font-normal text-sm ml-1">{comments.length}</span>
              </h2>

              {isLoggedIn ? (
                <div className="flex gap-3 mb-8">
                  <div className="w-9 h-9 rounded-full bg-lp-accent-btn shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    {session?.user?.name?.slice(0, 1).toUpperCase() ?? "나"}
                  </div>
                  <div className="flex-1 border border-lp-border rounded-xl overflow-hidden focus-within:border-lp-accent transition-colors">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="LP에 대한 감상을 남겨보세요..."
                      rows={2}
                      maxLength={500}
                      className="w-full px-4 pt-3 text-sm text-lp-primary placeholder:text-lp-tertiary resize-none outline-none bg-transparent"
                    />
                    <div className="flex justify-end px-3 pb-2">
                      <button
                        onClick={submitComment}
                        disabled={!draft.trim() || submitting}
                        className="px-4 py-1.5 bg-lp-accent-btn text-white text-xs font-medium rounded-lg hover:bg-lp-accent transition-colors disabled:opacity-50"
                      >
                        {submitting ? "등록 중..." : "등록"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModal({ open: true, message: "댓글 작성은 로그인한 사용자만 이용할 수 있어요." })}
                  className="flex items-center gap-3 w-full mb-8 px-4 py-3 rounded-xl border border-dashed border-lp-border text-lp-secondary text-sm hover:border-lp-accent hover:text-lp-accent transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  로그인하고 댓글을 남겨보세요
                </button>
              )}

              <div className="space-y-6">
                {comments.length === 0 && (
                  <p className="text-lp-tertiary text-sm text-center py-6">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
                )}
                {comments.map((c) => {
                  const isMine = c.user_id === meId;
                  const nick = c.profiles?.nickname || "사용자";
                  const username = c.profiles?.username;
                  return (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c.profiles?.avatar_color || "#5B21B6" }}>
                        {nick.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          {username ? (
                            <Link href={`/profile/${username}`} className="font-semibold text-sm text-lp-primary hover:text-lp-accent">{nick}</Link>
                          ) : (
                            <span className="font-semibold text-sm text-lp-primary">{nick}</span>
                          )}
                          <span className="text-lp-tertiary text-xs">{timeAgo(c.created_at)}</span>
                          {isMine && (
                            <button onClick={() => deleteComment(c.id)} className="ml-auto text-lp-tertiary hover:text-lp-danger text-xs">
                              삭제
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-lp-secondary leading-relaxed whitespace-pre-wrap">{c.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button onClick={() => toggleCommentLike(c.id)} className="flex items-center gap-1 text-xs text-lp-tertiary hover:text-lp-danger transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {c.like_count}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {authModal.open && <AuthModal onClose={() => setAuthModal({ open: false })} message={authModal.message} />}
    </>
  );
}
