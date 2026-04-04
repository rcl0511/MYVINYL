"use client";

import { use, useState } from "react";
import Link from "next/link";
import { MOCK_LPS, MOCK_USER, MOCK_POSTS } from "@/lib/mock-data";

type ProfileTab = "collection" | "posts" | "liked";

// Custom LP thumbnails per LP (simulate saved customizations)
const CUSTOM_LP_COLORS: Record<string, { color: string; accentColor: string }> = {
  "lp-001": { color: "#5B21B6", accentColor: "#EDE9F8" },
  "lp-003": { color: "#064e3b", accentColor: "#6ee7b7" },
  "lp-006": { color: "#7f1d1d", accentColor: "#fca5a5" },
};

function CustomLPThumbnail({
  lp,
  custom,
}: {
  lp: (typeof MOCK_LPS)[0];
  custom?: { color: string; accentColor: string };
}) {
  const color = custom?.color ?? lp.coverColor;
  const accent = custom?.accentColor ?? "#ffffff";
  return (
    <div
      className="w-full aspect-square rounded-xl relative overflow-hidden"
      style={{
        background: `conic-gradient(from 0deg, ${color}, #111 30%, ${color}88 60%, #000 80%, ${color})`,
      }}
    >
      {[40, 32, 24, 16].map((inset) => (
        <div
          key={inset}
          className="absolute rounded-full border border-white/[0.05]"
          style={{ inset }}
        />
      ))}
      <div
        className="absolute rounded-full"
        style={{
          width: 32,
          height: 32,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: accent,
        }}
      />
      <div
        className="absolute w-2 h-2 rounded-full bg-gray-900"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />
      {custom && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-lp-accent rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const isMe = username === MOCK_USER.nickname || username === "me";
  const user = MOCK_USER;

  const [tab, setTab] = useState<ProfileTab>("collection");
  const [following, setFollowing] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(user.bio);

  // Simulate: first 6 LPs are in collection
  const collectionLPs = MOCK_LPS.slice(0, 6);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-8 mb-8 sm:mb-10">
        {/* Avatar */}
        <div
          className="w-20 h-20 sm:w-28 sm:h-28 rounded-full shrink-0 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg"
          style={{ backgroundColor: user.avatarColor }}
        >
          {user.nickname.slice(0, 1).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-lp-primary">{user.nickname}</h1>
            {isMe ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingBio(true)}
                  className="px-4 py-1.5 border border-lp-border rounded-full text-sm text-lp-secondary hover:border-lp-accent hover:text-lp-accent transition-colors"
                >
                  프로필 편집
                </button>
                <Link
                  href="/lp-editor/lp-001"
                  className="px-4 py-1.5 border border-lp-border rounded-full text-sm text-lp-secondary hover:border-lp-accent hover:text-lp-accent transition-colors"
                >
                  LP 커스텀
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setFollowing((f) => !f)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  following
                    ? "bg-lp-chip text-lp-secondary border border-lp-border hover:border-lp-danger hover:text-lp-danger"
                    : "bg-lp-accent text-white hover:bg-lp-accent-btn"
                }`}
              >
                {following ? "팔로잉" : "팔로우"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-3">
            <div className="text-center">
              <p className="font-bold text-lp-primary">{user.collectionCount}</p>
              <p className="text-lp-tertiary text-xs">컬렉션</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lp-primary">{user.followerCount}</p>
              <p className="text-lp-tertiary text-xs">팔로워</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lp-primary">{user.followingCount}</p>
              <p className="text-lp-tertiary text-xs">팔로잉</p>
            </div>
          </div>

          {/* Bio */}
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
                <button
                  onClick={() => setEditingBio(false)}
                  className="px-3 py-1.5 bg-lp-accent text-white text-xs rounded-lg"
                >
                  저장
                </button>
                <button
                  onClick={() => { setBio(user.bio); setEditingBio(false); }}
                  className="px-3 py-1.5 border border-lp-border text-lp-secondary text-xs rounded-lg"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="text-lp-secondary text-sm">{bio}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-lp-border mb-8 flex gap-0">
        {(["collection", "posts", "liked"] as ProfileTab[]).map((t) => {
          const labels = { collection: "컬렉션", posts: "게시글", liked: "좋아요" };
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-lp-accent text-lp-accent"
                  : "border-transparent text-lp-secondary hover:text-lp-primary"
              }`}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* Collection tab */}
      {tab === "collection" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-lp-secondary text-sm">{collectionLPs.length}장의 LP</p>
            {isMe && (
              <p className="text-lp-tertiary text-xs">
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 bg-lp-accent rounded-full inline-block" />
                  커스텀 적용됨
                </span>
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {collectionLPs.map((lp) => {
              const custom = CUSTOM_LP_COLORS[lp.id];
              return (
                <Link key={lp.id} href={`/lp/${lp.id}`} className="group">
                  <div className="relative mb-2 rounded-xl overflow-hidden transition-transform group-hover:scale-105">
                    <CustomLPThumbnail lp={lp} custom={custom} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-lp-primary truncate">{lp.title}</p>
                  <p className="text-xs text-lp-tertiary truncate">{lp.artist}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Posts tab */}
      {tab === "posts" && (
        <div className="space-y-4">
          {MOCK_POSTS.slice(0, 3).map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl border border-lp-border p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-lp-chip text-lp-secondary text-xs rounded-full">
                  # {post.tag}
                </span>
                <span className="text-lp-tertiary text-xs">{post.timeAgo}</span>
              </div>
              <h3 className="font-semibold text-lp-primary mb-1 hover:text-lp-accent cursor-pointer transition-colors">
                {post.title}
              </h3>
              <p className="text-lp-secondary text-sm line-clamp-2">{post.preview}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-lp-border">
                <span className="text-xs text-lp-tertiary flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {post.likeCount}
                </span>
                <span className="text-xs text-lp-tertiary flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {post.commentCount}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Liked tab */}
      {tab === "liked" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {MOCK_LPS.slice(2, 8).map((lp) => (
            <Link key={lp.id} href={`/lp/${lp.id}`} className="group">
              <div className="relative mb-2 rounded-xl overflow-hidden transition-transform group-hover:scale-105">
                <div
                  className="w-full aspect-square rounded-xl flex items-center justify-center"
                  style={{
                    background: `conic-gradient(from 0deg, ${lp.coverColor}, #111 30%, ${lp.coverColor}88 60%, #000 80%, ${lp.coverColor})`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: `${lp.coverColor}aa` }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-medium text-lp-primary truncate">{lp.title}</p>
              <p className="text-xs text-lp-tertiary truncate">{lp.artist}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
