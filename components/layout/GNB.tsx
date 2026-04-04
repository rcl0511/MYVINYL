"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// href: 링크 경로, label: 표시명, protected: 로그인 필요 여부
const NAV_LINKS = [
  { href: "/",          label: "LP 탐색",   protected: false },
  { href: "/community", label: "커뮤니티",  protected: true  },
  { href: "/shop",      label: "상점",      protected: false },
  { href: "/playlist",  label: "내 컬렉션", protected: true  },
];

const UNREAD_COUNT = 3; // mock

export default function GNB() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const loggedIn = status === "authenticated";
  const [mobileOpen, setMobileOpen] = useState(false);

  const initial = session?.user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-4 sm:px-8 bg-lp-nav">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 mr-6 sm:mr-12 shrink-0 group"
          onClick={() => setMobileOpen(false)}
        >
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 transition-transform duration-500 ease-out group-hover:rotate-[25deg]">
            <defs>
              <radialGradient id="gnb-rec" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1c1c1c"/>
                <stop offset="100%" stopColor="#070707"/>
              </radialGradient>
              <radialGradient id="gnb-lbl" cx="32%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#A56BFF"/>
                <stop offset="100%" stopColor="#6D28D9"/>
              </radialGradient>
              <radialGradient id="gnb-shn" cx="28%" cy="28%" r="55%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18"/>
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
              </radialGradient>
            </defs>
            {/* Record body */}
            <circle cx="20" cy="20" r="19.5" fill="url(#gnb-rec)" stroke="#2a2a2a" strokeWidth="0.5"/>
            {/* Groove rings */}
            <circle cx="20" cy="20" r="17.5" fill="none" stroke="#222" strokeWidth="0.6"/>
            <circle cx="20" cy="20" r="15.5" fill="none" stroke="#1e1e1e" strokeWidth="0.6"/>
            <circle cx="20" cy="20" r="13.5" fill="none" stroke="#222" strokeWidth="0.6"/>
            <circle cx="20" cy="20" r="11.5" fill="none" stroke="#1e1e1e" strokeWidth="0.6"/>
            <circle cx="20" cy="20" r="9.5" fill="none" stroke="#222" strokeWidth="0.6"/>
            {/* Purple label */}
            <circle cx="20" cy="20" r="7.8" fill="url(#gnb-lbl)"/>
            <circle cx="20" cy="20" r="7.8" fill="url(#gnb-shn)"/>
            {/* Center hole */}
            <circle cx="20" cy="20" r="1.8" fill="#060606"/>
          </svg>
          <div className="flex items-baseline gap-0.5">
            <span className="text-white/40 text-sm font-medium tracking-wide">My</span>
            <span className="text-white text-lg font-bold tracking-tight">Vinyl</span>
          </div>
        </Link>

        {/* Nav links — desktop only */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ href, label, protected: isProtected }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            const locked = isProtected && status !== "loading" && !loggedIn;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? "text-white bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
                {locked && (
                  <svg
                    className="w-3 h-3 opacity-40 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </Link>
            );
          })}
        </div>

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden" />

        {/* Right: notification + avatar/login */}
        <div className="flex items-center gap-2">
          {/* Notification bell — 로그인 상태에서만 */}
          {loggedIn && (
            <Link
              href="/notifications"
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                pathname === "/notifications" ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              aria-label="알림"
              onClick={() => setMobileOpen(false)}
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
          )}

          {/* Avatar — desktop only */}
          {loggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/profile/me"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors overflow-hidden ${
                  pathname.startsWith("/profile") ? "ring-2 ring-lp-accent" : "hover:ring-2 hover:ring-white/30"
                }`}
                style={{ backgroundColor: "#5B21B6" }}
                aria-label="내 프로필"
              >
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={initial}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initial
                )}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/intro" })}
                className="text-white/40 hover:text-white text-xs transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                로그아웃
              </button>
            </div>
          )}

          {/* Login button — desktop only */}
          {!loggedIn && (
            <Link
              href="/auth"
              className="hidden md:inline-flex px-4 py-1.5 bg-lp-accent-btn text-white text-sm font-medium rounded-md hover:bg-lp-accent transition-colors"
            >
              로그인
            </Link>
          )}

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer — nav links + auth */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Drawer */}
          <div
            className="absolute top-16 left-0 right-0 bg-lp-nav border-t border-white/10 py-3 px-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map(({ href, label, protected: isProtected }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              const locked = isProtected && status !== "loading" && !loggedIn;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                  {locked && (
                    <svg className="w-3 h-3 opacity-40 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </Link>
              );
            })}

            <div className="border-t border-white/10 mt-3 pt-3">
              {loggedIn ? (
                <div className="flex items-center gap-3 px-4 py-2">
                  <Link
                    href="/profile/me"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0"
                    style={{ backgroundColor: "#5B21B6" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {session?.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.user.image} alt={initial} className="w-full h-full object-cover" />
                    ) : (
                      initial
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{session?.user?.name ?? "사용자"}</p>
                    <p className="text-white/40 text-xs truncate">{session?.user?.email}</p>
                  </div>
                  <button
                    onClick={() => { signOut({ callbackUrl: "/intro" }); setMobileOpen(false); }}
                    className="text-white/40 hover:text-white text-xs transition-colors px-3 py-1.5 rounded-lg border border-white/10"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center justify-center w-full px-4 py-3 bg-lp-accent-btn text-white text-sm font-medium rounded-lg hover:bg-lp-accent transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
