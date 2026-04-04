"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MOCK_LPS } from "@/lib/mock-data";
import Chip from "@/components/ui/Chip";
import WritePostModal from "./WritePostModal";

const TAGS = ["전체", "LP 추천", "장비 리뷰", "컬렉션 자랑", "음악 이야기", "뉴비 질문"];

interface DBPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tag: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  liked: boolean;
  profiles: { id: string; nickname: string; avatar_url: string | null; avatar_color: string };
}

interface DBComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { id: string; nickname: string; avatar_url: string | null; avatar_color: string };
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}

function Avatar({ src, color, name }: { src: string | null; color: string; name: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />;
  }
  return (
    <div
      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold"
      style={{ backgroundColor: color }}
    >
      {name[0]?.toUpperCase() ?? "U"}
    </div>
  );
}

function CommentSection({ postId, currentUserId }: { postId: string; currentUserId?: string }) {
  const [comments, setComments] = useState<DBComment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => { setComments(data); setLoaded(true); });
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setInput("");
    }
    setSubmitting(false);
  };

  const deleteComment = async (commentId: string) => {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  if (!loaded) {
    return <div className="px-6 py-4 text-xs text-lp-tertiary">불러오는 중...</div>;
  }

  return (
    <div className="border-t border-lp-border bg-lp-bg px-6 py-4 space-y-3">
      {comments.length === 0 && (
        <p className="text-xs text-lp-tertiary">댓글이 없습니다. 첫 번째로 남겨보세요!</p>
      )}
      {comments.map((c) => (
        <div key={c.id} className="flex gap-3 items-start">
          <Avatar src={c.profiles.avatar_url} color={c.profiles.avatar_color} name={c.profiles.nickname} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-lp-primary">{c.profiles.nickname}</span>
              <span className="text-[11px] text-lp-tertiary">{timeAgo(c.created_at)}</span>
            </div>
            <p className="text-sm text-lp-secondary mt-0.5 leading-relaxed">{c.content}</p>
          </div>
          {currentUserId === c.user_id && (
            <button
              onClick={() => deleteComment(c.id)}
              className="text-lp-tertiary hover:text-lp-danger transition-colors shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      {currentUserId && (
        <form onSubmit={submit} className="flex gap-2 pt-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-lp-border focus:outline-none focus:border-lp-accent bg-white"
          />
          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="px-3 py-2 rounded-lg bg-lp-accent text-white text-xs font-medium disabled:opacity-50 hover:bg-lp-accent-btn transition-colors"
          >
            등록
          </button>
        </form>
      )}
    </div>
  );
}

function PostCard({
  post,
  currentUserId,
  onDelete,
}: {
  post: DBPost;
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);

  const toggleLike = async () => {
    if (!currentUserId) return;
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (res.ok) {
      const { liked: newLiked } = await res.json();
      setLiked(newLiked);
      setLikeCount((n) => n + (newLiked ? 1 : -1));
    }
  };

  const handleDelete = async () => {
    if (!confirm("이 글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) onDelete(post.id);
  };

  return (
    <article className="bg-white rounded-xl border border-lp-border hover:shadow-sm transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar
            src={post.profiles.avatar_url}
            color={post.profiles.avatar_color}
            name={post.profiles.nickname}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-lp-primary">{post.profiles.nickname}</p>
            <p className="text-lp-tertiary text-xs">{timeAgo(post.created_at)}</p>
          </div>
          <span className="px-3 py-1 bg-lp-chip text-lp-secondary text-xs rounded-full shrink-0">
            # {post.tag}
          </span>
          {currentUserId === post.user_id && (
            <button
              onClick={handleDelete}
              className="text-lp-tertiary hover:text-lp-danger transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          )}
        </div>

        <h2 className="font-semibold text-lp-primary mb-2">{post.title}</h2>
        <p className="text-lp-secondary text-sm leading-relaxed whitespace-pre-line line-clamp-3">
          {post.content}
        </p>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-lp-border">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              liked ? "text-lp-danger" : "text-lp-tertiary hover:text-lp-danger"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {likeCount}
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-lp-tertiary hover:text-lp-accent transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            댓글 {post.comment_count}개
          </button>
        </div>
      </div>

      {showComments && (
        <CommentSection postId={post.id} currentUserId={currentUserId} />
      )}
    </article>
  );
}

export default function CommunityPage() {
  const { data: session, status } = useSession();
  const [activeTag, setActiveTag] = useState("전체");
  const [posts, setPosts] = useState<DBPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWrite, setShowWrite] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = activeTag !== "전체" ? `?tag=${encodeURIComponent(activeTag)}` : "";
    const res = await fetch(`/api/posts${params}`);
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }, [activeTag]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleWrite = async (body: { title: string; content: string; tag: string }) => {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("작성 실패");
    const newPost = await res.json();
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex max-w-[1440px] mx-auto">
      {/* 좌측 사이드바 */}
      <aside className="w-72 shrink-0 border-r border-lp-border bg-lp-sidebar px-6 py-8">
        <h2 className="text-sm font-semibold text-lp-primary mb-3">토픽</h2>
        <div className="space-y-1.5">
          {TAGS.slice(1).map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTag === tag
                  ? "bg-lp-accent-light text-lp-accent font-medium"
                  : "text-lp-secondary hover:bg-lp-chip"
              }`}
            >
              # {tag}
            </button>
          ))}
        </div>

        {status === "authenticated" && (
          <div className="border-t border-lp-border mt-6 pt-6">
            <h2 className="text-sm font-semibold text-lp-primary mb-3">내 정보</h2>
            <div className="flex items-center gap-3">
              <Avatar
                src={session.user?.image ?? null}
                color="#5B21B6"
                name={session.user?.name ?? "나"}
              />
              <div>
                <p className="text-sm font-medium text-lp-primary">{session.user?.name}</p>
                <Link href="/profile/me" className="text-xs text-lp-accent hover:underline">
                  프로필 보기
                </Link>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* 피드 */}
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-lp-border px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-xl font-bold text-lp-primary shrink-0">커뮤니티</h1>
            <div className="flex gap-1.5 flex-wrap">
              {TAGS.map((tag) => (
                <Chip key={tag} label={tag} active={activeTag === tag} onClick={() => setActiveTag(tag)} />
              ))}
            </div>
          </div>
          {status === "authenticated" && (
            <button
              onClick={() => setShowWrite(true)}
              className="px-4 py-1.5 bg-lp-accent text-white text-sm font-medium rounded-lg hover:bg-lp-accent-btn transition-colors shrink-0"
            >
              글쓰기
            </button>
          )}
        </div>

        <div className="px-8 py-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin w-8 h-8 text-lp-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-lp-tertiary">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm font-medium">아직 게시글이 없습니다</p>
              {status === "authenticated" && (
                <button
                  onClick={() => setShowWrite(true)}
                  className="mt-3 text-sm text-lp-accent hover:underline"
                >
                  첫 번째 글을 작성해보세요
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={session?.user?.id}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* 우측 사이드바: 인기 LP */}
      <aside className="w-80 shrink-0 border-l border-lp-border bg-lp-sidebar px-6 py-8">
        <h2 className="text-sm font-semibold text-lp-primary mb-4">지금 인기 있는 LP</h2>
        <div className="space-y-4">
          {MOCK_LPS.slice(0, 5).map((lp, i) => (
            <Link key={lp.id} href={`/lp/${lp.id}`} className="flex items-center gap-3 group">
              <div
                className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center"
                style={{ backgroundColor: lp.coverColor }}
              >
                <div className="w-7 h-7 rounded-full border-2 border-white/30" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-lp-primary truncate group-hover:text-lp-accent transition-colors">
                  {lp.title}
                </p>
                <p className="text-xs text-lp-secondary truncate">{lp.artist}</p>
                <p className="text-xs text-lp-tertiary mt-0.5">
                  재생 {((lp.playCount ?? 0) / 1000).toFixed(0)}k회
                </p>
              </div>
              <span className="text-lp-tertiary text-xs font-medium shrink-0">#{i + 1}</span>
            </Link>
          ))}
        </div>
      </aside>

      {showWrite && (
        <WritePostModal
          onClose={() => setShowWrite(false)}
          onSubmit={handleWrite}
        />
      )}
    </div>
  );
}
