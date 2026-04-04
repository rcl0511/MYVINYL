"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_POSTS, MOCK_LPS } from "@/lib/mock-data";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

const TAGS = ["전체", "LP 추천", "장비 리뷰", "컬렉션 자랑", "음악 이야기", "뉴비 질문"];
const POPULAR_COUNTS = [312, 248, 197, 143, 98];

export default function CommunityPage() {
  const [activeTag, setActiveTag] = useState("전체");

  const filtered = activeTag === "전체"
    ? MOCK_POSTS
    : MOCK_POSTS.filter((p) => p.tag === activeTag);

  return (
    <div className="min-h-[calc(100vh-64px)] flex max-w-[1440px] mx-auto overflow-x-hidden">
      {/* Left sidebar: topics + following — tablet 이하 숨김 */}
      <aside className="hidden lg:block w-72 shrink-0 border-r border-lp-border bg-lp-sidebar px-6 py-8">
        <h2 className="text-sm font-semibold text-lp-primary mb-3">인기 토픽</h2>
        <div className="space-y-1.5">
          {TAGS.slice(1).map((tag, i) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTag === tag
                  ? "bg-lp-accent-light text-lp-accent font-medium"
                  : "text-lp-secondary hover:bg-lp-chip"
              }`}
            >
              <span># {tag}</span>
              <span className="text-lp-tertiary text-xs">{POPULAR_COUNTS[i]}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-lp-border mt-6 pt-6">
          <h2 className="text-sm font-semibold text-lp-primary mb-3">팔로우한 사용자</h2>
          <div className="space-y-3">
            {["vinyl_lover", "jazz_fan_kr", "crate_digger", "music_historian"].map((nick, i) => {
              const colors = ["#5B21B6", "#10B981", "#EF4444", "#3B82F6"];
              return (
                <div key={nick} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: colors[i] }} />
                  <div>
                    <p className="text-sm font-medium text-lp-primary">{nick}</p>
                    <p className="text-xs text-lp-tertiary">LP {(i + 1) * 12}장</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Center: feed */}
      <div className="flex-1 overflow-y-auto">
        {/* Feed header */}
        <div className="sticky top-0 z-10 bg-white border-b border-lp-border px-4 sm:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <h1 className="text-lg sm:text-xl font-bold text-lp-primary">커뮤니티</h1>
            <Button size="sm">글쓰기</Button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 mt-2 sm:mt-0 sm:hidden">
            {["전체", ...TAGS.slice(1)].map((tag) => (
              <Chip key={tag} label={tag} active={activeTag === tag} onClick={() => setActiveTag(tag)} />
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 mt-2 flex-wrap">
            {["전체", ...TAGS.slice(1)].map((tag) => (
              <Chip key={tag} label={tag} active={activeTag === tag} onClick={() => setActiveTag(tag)} />
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-4">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl border border-lp-border p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: post.avatarColor }}
                />
                <div>
                  <p className="font-semibold text-sm text-lp-primary">{post.nickname}</p>
                  <p className="text-lp-tertiary text-xs">{post.timeAgo}</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-lp-chip text-lp-secondary text-xs rounded-full">
                  # {post.tag}
                </span>
              </div>

              <h2 className="font-semibold text-lp-primary mb-2 hover:text-lp-accent cursor-pointer transition-colors">
                {post.title}
              </h2>
              <p className="text-lp-secondary text-sm leading-relaxed line-clamp-2">{post.preview}</p>

              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-lp-border">
                <button className="flex items-center gap-1.5 text-xs text-lp-tertiary hover:text-lp-danger transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {post.likeCount}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-lp-tertiary hover:text-lp-accent transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {post.commentCount}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-lp-tertiary hover:text-lp-accent transition-colors ml-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  저장
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Right sidebar: trending LPs — 넓은 화면에서만 */}
      <aside className="hidden xl:block w-80 shrink-0 border-l border-lp-border bg-lp-sidebar px-6 py-8">
        <h2 className="text-sm font-semibold text-lp-primary mb-4">지금 인기 있는 LP</h2>
        <div className="space-y-4">
          {MOCK_LPS.slice(0, 5).map((lp, i) => (
            <Link
              key={lp.id}
              href={`/lp/${lp.id}`}
              className="flex items-center gap-3 group"
            >
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
    </div>
  );
}
