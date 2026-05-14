"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type NotifType = "comment" | "follow" | "like_post" | "like_comment" | "lp_comment" | "notice" | "penalty";

interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotifType;
  target_type: string | null;
  target_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
  actor?: { id: string; username: string | null; nickname: string | null; avatar_color: string | null } | null;
}

const FILTER_TABS: { key: "all" | NotifType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "comment", label: "댓글" },
  { key: "lp_comment", label: "LP 댓글" },
  { key: "follow", label: "팔로우" },
  { key: "like_post", label: "좋아요" },
  { key: "notice", label: "공지" },
];

const TYPE_LABEL: Record<NotifType, string> = {
  comment: "새 댓글",
  lp_comment: "LP 댓글",
  follow: "새 팔로워",
  like_post: "좋아요",
  like_comment: "댓글 좋아요",
  notice: "공지",
  penalty: "제재",
};

const TYPE_COLOR: Record<NotifType, string> = {
  comment: "bg-blue-100 text-blue-600",
  lp_comment: "bg-indigo-100 text-indigo-600",
  follow: "bg-green-100 text-green-600",
  like_post: "bg-pink-100 text-pink-600",
  like_comment: "bg-pink-100 text-pink-600",
  notice: "bg-purple-100 text-purple-600",
  penalty: "bg-red-100 text-red-600",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}일 전` : new Date(iso).toLocaleDateString();
}

function linkFor(n: Notification): string | undefined {
  if (n.target_type === "post") return `/community`;
  if (n.target_type === "lp" || n.target_type === "lp_comment") return n.target_id ? `/lp/${n.target_id}` : undefined;
  if (n.target_type === "profile") return n.actor?.username ? `/profile/${n.actor.username}` : undefined;
  return undefined;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | NotifType>("all");
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setNotifs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? notifs : notifs.filter((n) => n.type === filter);
  const unreadCount = notifs.filter((n) => !n.read).length;

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read_all: true }),
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-lp-primary">알림</h1>
          {unreadCount > 0 && <p className="text-lp-secondary text-sm mt-1">읽지 않은 알림 {unreadCount}개</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-lp-accent hover:underline font-medium">모두 읽음 처리</button>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTER_TABS.map(({ key, label }) => {
          const count = key === "all"
            ? notifs.filter((n) => !n.read).length
            : notifs.filter((n) => n.type === key && !n.read).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === key ? "bg-lp-accent text-white" : "bg-white border border-lp-border text-lp-secondary hover:border-lp-accent hover:text-lp-accent"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === key ? "bg-white/20" : "bg-lp-accent text-white"}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-16 text-lp-tertiary">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-lp-tertiary">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p>알림이 없습니다</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const href = linkFor(notif);
            const Wrapper: React.ElementType = href ? Link : "div";
            return (
              <Wrapper
                key={notif.id}
                {...(href ? { href, onClick: () => markRead(notif.id) } : { onClick: () => markRead(notif.id) })}
                className={`flex gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
                  notif.read ? "bg-white border-lp-border hover:bg-lp-bg" : "bg-lp-accent-light border-lp-accent/30"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {notif.actor ? (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: notif.actor.avatar_color || "#5B21B6" }}>
                      {notif.actor.nickname?.slice(0, 1).toUpperCase() ?? "?"}
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${TYPE_COLOR[notif.type]}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[notif.type]}`}>
                      {TYPE_LABEL[notif.type]}
                    </span>
                    <span className="text-lp-tertiary text-xs shrink-0">{timeAgo(notif.created_at)}</span>
                  </div>
                  <p className="text-sm text-lp-secondary mt-1.5 leading-relaxed line-clamp-2">{notif.content}</p>
                </div>
                {!notif.read && <div className="shrink-0 mt-2"><div className="w-2 h-2 rounded-full bg-lp-accent" /></div>}
              </Wrapper>
            );
          })
        )}
      </div>
    </div>
  );
}
