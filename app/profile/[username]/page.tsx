"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MOCK_LPS } from "@/lib/mock-data";
import AuthModal from "@/components/AuthModal";

type ProfileTab = "collection" | "posts" | "liked";

interface ProfileData {
  profile: {
    id: string;
    username: string;
    nickname: string;
    avatar_url: string | null;
    avatar_color: string;
    bio: string;
    follower_count: number;
    following_count: number;
  };
  collection: { lp_id: string; created_at: string }[];
  posts: { id: string; title: string; content: string; tag: string; like_count: number; comment_count: number; created_at: string }[];
  likedPosts: {
    id: string;
    title: string;
    content: string;
    tag: string;
    like_count: number;
    comment_count: number;
    created_at: string;
    profiles?: { username: string; nickname: string };
  }[];
  isFollowing: boolean;
  isMe: boolean;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60000))}분 전`;
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}일 전` : new Date(iso).toLocaleDateString();
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { status } = useSession();
  const [data, setData] = useState<ProfileData | null>(null);
  const [tab, setTab] = useState<ProfileTab>("collection");
  const [following, setFollowing] = useState(false);
  const [pendingFollow, setPendingFollow] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [authModal, setAuthModal] = useState<{ open: boolean; message?: string }>({ open: false });
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setNotFound(false);
    fetch(`/api/profiles/${encodeURIComponent(username)}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) return null;
        return r.json();
      })
      .then((d: ProfileData | null) => {
        if (!d) return;
        setData(d);
        setFollowing(d.isFollowing);
        setBio(d.profile.bio || "");
      })
      .catch(() => {});
  }, [username]);

  async function toggleFollow() {
    if (status !== "authenticated") {
      setAuthModal({ open: true, message: "팔로우는 로그인한 사용자만 이용할 수 있어요." });
      return;
    }
    if (!data || pendingFollow) return;
    const prev = following;
    setFollowing(!prev);
    setPendingFollow(true);
    try {
      const res = await fetch(`/api/users/${data.profile.id}/follow`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { following: newState } = await res.json();
      setFollowing(newState);
      setData((d) => d ? ({ ...d, profile: { ...d.profile, follower_count: d.profile.follower_count + (newState ? 1 : -1) } }) : d);
    } catch {
      setFollowing(prev);
    } finally {
      setPendingFollow(false);
    }
  }

  async function saveBio() {
    const res = await fetch(`/api/profiles/${encodeURIComponent(username)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    if (res.ok) {
      setData((d) => d ? ({ ...d, profile: { ...d.profile, bio } }) : d);
      setEditingBio(false);
    }
  }

  if (notFound) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <p className="text-lp-tertiary">사용자를 찾을 수 없습니다.</p>
        <Link href="/" className="inline-block mt-4 text-lp-accent hover:underline text-sm">홈으로</Link>
      </div>
    );
  }
  if (!data) {
    return <div className="max-w-md mx-auto py-24 text-center text-lp-tertiary">불러오는 중...</div>;
  }

  const { profile, isMe } = data;
  const collectionLPs = data.collection
    .map((row) => MOCK_LPS.find((l) => l.id === row.lp_id))
    .filter((lp): lp is NonNullable<typeof lp> => !!lp);

  return (
    <>
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-8 mb-8 sm:mb-10">
        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full shrink-0 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg" style={{ backgroundColor: profile.avatar_color }}>
          {profile.nickname.slice(0, 1).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-lp-primary">{profile.nickname}</h1>
            <span className="text-lp-tertiary text-sm">@{profile.username}</span>
            {isMe ? (
              <div className="flex gap-2">
                <button onClick={() => setEditingBio(true)} className="px-4 py-1.5 border border-lp-border rounded-full text-sm text-lp-secondary hover:border-lp-accent hover:text-lp-accent transition-colors">
                  프로필 편집
                </button>
              </div>
            ) : (
              <button
                onClick={toggleFollow}
                disabled={pendingFollow}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-60 ${
                  following
                    ? "bg-lp-chip text-lp-secondary border border-lp-border hover:border-lp-danger hover:text-lp-danger"
                    : "bg-lp-accent text-white hover:bg-lp-accent-btn"
                }`}
              >
                {following ? "팔로잉" : "팔로우"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-6 mb-3">
            <div className="text-center">
              <p className="font-bold text-lp-primary">{collectionLPs.length}</p>
              <p className="text-lp-tertiary text-xs">컬렉션</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lp-primary">{profile.follower_count}</p>
              <p className="text-lp-tertiary text-xs">팔로워</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lp-primary">{profile.following_count}</p>
              <p className="text-lp-tertiary text-xs">팔로잉</p>
            </div>
          </div>

          {editingBio ? (
            <div className="flex gap-2 items-start">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={120}
                className="flex-1 text-sm border border-lp-border rounded-xl px-3 py-2 outline-none focus:border-lp-accent resize-none"
              />
              <div className="flex flex-col gap-1">
                <button onClick={saveBio} className="px-3 py-1.5 bg-lp-accent text-white text-xs rounded-lg">저장</button>
                <button onClick={() => { setBio(profile.bio || ""); setEditingBio(false); }} className="px-3 py-1.5 border border-lp-border text-lp-secondary text-xs rounded-lg">취소</button>
              </div>
            </div>
          ) : (
            <p className="text-lp-secondary text-sm whitespace-pre-wrap">{profile.bio || (isMe ? "자기소개를 작성해보세요." : "")}</p>
          )}
        </div>
      </div>

      <div className="border-b border-lp-border mb-8 flex gap-0">
        {(["collection", "posts", "liked"] as ProfileTab[]).map((t) => {
          const labels = { collection: "컬렉션", posts: "게시글", liked: "좋아요" };
          return (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-lp-accent text-lp-accent" : "border-transparent text-lp-secondary hover:text-lp-primary"}`}>
              {labels[t]}
            </button>
          );
        })}
      </div>

      {tab === "collection" && (
        <div>
          <p className="text-lp-secondary text-sm mb-4">{collectionLPs.length}장의 LP</p>
          {collectionLPs.length === 0 ? (
            <p className="text-lp-tertiary text-sm py-12 text-center">{isMe ? "아직 컬렉션이 비어있어요. LP 상세에서 '컬렉션에 추가'를 눌러보세요." : "비어있는 컬렉션입니다."}</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {collectionLPs.map((lp) => (
                <Link key={lp.id} href={`/lp/${lp.id}`} className="group">
                  <div className="relative mb-2 rounded-xl overflow-hidden transition-transform group-hover:scale-105 aspect-square" style={{ backgroundColor: lp.coverColor }}>
                    {lp.coverUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={lp.coverUrl} alt={lp.title} className="w-full h-full object-cover opacity-90" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-lp-primary truncate">{lp.title}</p>
                  <p className="text-xs text-lp-tertiary truncate">{lp.artist}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "posts" && (
        <div className="space-y-4">
          {data.posts.length === 0 ? (
            <p className="text-lp-tertiary text-sm py-12 text-center">작성한 글이 없어요.</p>
          ) : data.posts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl border border-lp-border p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-lp-chip text-lp-secondary text-xs rounded-full"># {post.tag}</span>
                <span className="text-lp-tertiary text-xs">{timeAgo(post.created_at)}</span>
              </div>
              <h3 className="font-semibold text-lp-primary mb-1">{post.title}</h3>
              <p className="text-lp-secondary text-sm line-clamp-2">{post.content}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-lp-border">
                <span className="text-xs text-lp-tertiary">♡ {post.like_count}</span>
                <span className="text-xs text-lp-tertiary">💬 {post.comment_count}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "liked" && (
        <div className="space-y-4">
          {data.likedPosts.length === 0 ? (
            <p className="text-lp-tertiary text-sm py-12 text-center">좋아요한 글이 없어요.</p>
          ) : data.likedPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl border border-lp-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-lp-chip text-lp-secondary text-xs rounded-full"># {post.tag}</span>
                {post.profiles?.username && (
                  <Link href={`/profile/${post.profiles.username}`} className="text-lp-tertiary text-xs hover:text-lp-accent">@{post.profiles.username}</Link>
                )}
                <span className="text-lp-tertiary text-xs ml-auto">{timeAgo(post.created_at)}</span>
              </div>
              <h3 className="font-semibold text-lp-primary mb-1">{post.title}</h3>
              <p className="text-lp-secondary text-sm line-clamp-2">{post.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
    {authModal.open && <AuthModal onClose={() => setAuthModal({ open: false })} message={authModal.message} />}
    </>
  );
}
