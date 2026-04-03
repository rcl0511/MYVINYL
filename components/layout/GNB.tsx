"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MOCK_USER } from "@/lib/mock-data";

const NAV_LINKS = [
  { href: "/",          label: "LP 탐색" },
  { href: "/community", label: "커뮤니티" },
  { href: "/shop",      label: "상점" },
  { href: "/playlist",  label: "내 컬렉션" },
];

const UNREAD_COUNT = 3; // mock

export default function GNB() {
  const pathname = usePathname();
  const [loggedIn] = useState(true); // mock: treat as logged in for demo

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-8 bg-lp-nav">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-12 shrink-0">
        <div className="w-8 h-8 rounded-full bg-lp-accent-btn flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <span className="text-white font-bold text-base tracking-tight">LP Player</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1 flex-1">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right: notification + avatar/login */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Link
          href="/notifications"
          className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            pathname === "/notifications" ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
          aria-label="알림"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {UNREAD_COUNT > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-lp-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {UNREAD_COUNT}
            </span>
          )}
        </Link>

        {loggedIn ? (
          /* Avatar → Profile */
          <Link
            href={`/profile/${MOCK_USER.nickname}`}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors ${
              pathname.startsWith("/profile") ? "ring-2 ring-lp-accent" : "hover:ring-2 hover:ring-white/30"
            }`}
            style={{ backgroundColor: "#5B21B6" }}
            aria-label="내 프로필"
          >
            L
          </Link>
        ) : (
          <Link
            href="/auth"
            className="px-4 py-1.5 bg-lp-accent-btn text-white text-sm font-medium rounded-md hover:bg-lp-accent transition-colors"
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
