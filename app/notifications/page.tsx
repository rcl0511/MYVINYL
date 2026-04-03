"use client";

import React, { useState } from "react";
import Link from "next/link";

type NotifType = "comment" | "follow" | "notice" | "penalty" | "like";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timeAgo: string;
  read: boolean;
  link?: string;
  avatarColor?: string;
  sender?: string;
}

const INITIAL_NOTIFS: Notification[] = [
  { id: "n1", type: "comment", title: "새 댓글", body: "vinyl_lover님이 댓글을 달았습니다: \"So What 첫 소절만 들어도 소름이 돋아요!\"", timeAgo: "5분 전", read: false, link: "/lp/lp-001", avatarColor: "#5B21B6", sender: "vinyl_lover" },
  { id: "n2", type: "follow",  title: "새 팔로워", body: "jazz_fan_kr님이 회원님을 팔로우하기 시작했습니다.", timeAgo: "1시간 전", read: false, avatarColor: "#10B981", sender: "jazz_fan_kr" },
  { id: "n3", type: "like",    title: "좋아요", body: "crate_digger님이 회원님의 게시글에 좋아요를 눌렀습니다.", timeAgo: "2시간 전", read: false, link: "/community", avatarColor: "#EF4444", sender: "crate_digger" },
  { id: "n4", type: "comment", title: "답글", body: "music_historian님이 회원님의 댓글에 답글을 달았습니다.", timeAgo: "어제", read: true, link: "/lp/lp-002", avatarColor: "#3B82F6", sender: "music_historian" },
  { id: "n5", type: "notice",  title: "공지사항", body: "LP Player 베타 서비스를 출시했습니다! 불편한 점은 고객지원으로 문의해 주세요.", timeAgo: "2일 전", read: true },
  { id: "n6", type: "follow",  title: "새 팔로워", body: "record_collector님이 회원님을 팔로우하기 시작했습니다.", timeAgo: "3일 전", read: true, avatarColor: "#F59E0B", sender: "record_collector" },
  { id: "n7", type: "notice",  title: "서비스 점검 안내", body: "2026년 4월 5일 새벽 2시~4시 정기 점검이 예정되어 있습니다.", timeAgo: "4일 전", read: true },
  { id: "n8", type: "penalty", title: "커뮤니티 경고", body: "작성하신 게시글이 운영 정책에 위반되어 숨김 처리되었습니다. 자세한 내용은 고객지원을 통해 문의해 주세요.", timeAgo: "1주 전", read: true },
];

const FILTER_TABS: { key: "all" | NotifType; label: string }[] = [
  { key: "all",     label: "전체" },
  { key: "comment", label: "댓글/답글" },
  { key: "follow",  label: "팔로우" },
  { key: "like",    label: "좋아요" },
  { key: "notice",  label: "공지" },
  { key: "penalty", label: "제재" },
];

const TYPE_ICON: Record<NotifType, React.ReactElement> = {
  comment: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  follow: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM20 8v6M23 11h-6" />
    </svg>
  ),
  notice: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  penalty: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  like: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

const TYPE_COLOR: Record<NotifType, string> = {
  comment: "bg-blue-100 text-blue-600",
  follow:  "bg-green-100 text-green-600",
  notice:  "bg-purple-100 text-purple-600",
  penalty: "bg-red-100 text-red-600",
  like:    "bg-pink-100 text-pink-600",
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | NotifType>("all");
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);

  const filtered = filter === "all" ? notifs : notifs.filter((n) => n.type === filter);
  const unreadCount = notifs.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-lp-primary">알림</h1>
          {unreadCount > 0 && (
            <p className="text-lp-secondary text-sm mt-1">읽지 않은 알림 {unreadCount}개</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-lp-accent hover:underline font-medium"
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      {/* Filter chips */}
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
                filter === key
                  ? "bg-lp-accent text-white"
                  : "bg-white border border-lp-border text-lp-secondary hover:border-lp-accent hover:text-lp-accent"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === key ? "bg-white/20" : "bg-lp-accent text-white"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-lp-tertiary">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p>알림이 없습니다</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const Wrapper = notif.link ? Link : "div";
            const wrapperProps = notif.link
              ? { href: notif.link, onClick: () => markRead(notif.id) }
              : { onClick: () => markRead(notif.id) };

            return (
              <Wrapper
                key={notif.id}
                {...(wrapperProps as any)}
                className={`flex gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
                  notif.read
                    ? "bg-white border-lp-border hover:bg-lp-bg"
                    : "bg-lp-accent-light border-lp-accent/30 hover:bg-lp-accent-light"
                }`}
              >
                {/* Avatar or icon */}
                <div className="shrink-0 mt-0.5">
                  {notif.avatarColor ? (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: notif.avatarColor }}
                    >
                      <span className="text-white text-xs font-bold">
                        {notif.sender?.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${TYPE_COLOR[notif.type]}`}>
                      {TYPE_ICON[notif.type]}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[notif.type]}`}>
                        {TYPE_ICON[notif.type]}
                        {notif.title}
                      </span>
                    </div>
                    <span className="text-lp-tertiary text-xs shrink-0">{notif.timeAgo}</span>
                  </div>
                  <p className="text-sm text-lp-secondary mt-1.5 leading-relaxed line-clamp-2">
                    {notif.body}
                  </p>
                  {notif.type === "penalty" && (
                    <Link
                      href="/support"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-block mt-2 text-xs text-lp-accent hover:underline"
                    >
                      고객지원 이의 제기 →
                    </Link>
                  )}
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="shrink-0 mt-2">
                    <div className="w-2 h-2 rounded-full bg-lp-accent" />
                  </div>
                )}
              </Wrapper>
            );
          })
        )}
      </div>
    </div>
  );
}
