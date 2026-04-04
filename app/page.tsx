"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import LPCard from "@/components/lp/LPCard";
import Chip from "@/components/ui/Chip";
import { MOCK_LPS, GENRES } from "@/lib/mock-data";

export default function BrowsePage() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [selectedGenre, setSelectedGenre] = useState("전체");
  const [query, setQuery] = useState("");

  const filtered = MOCK_LPS.filter((lp) => {
    const matchGenre = selectedGenre === "전체" || lp.genre === selectedGenre;
    const matchQuery =
      !query ||
      lp.title.toLowerCase().includes(query.toLowerCase()) ||
      lp.artist.toLowerCase().includes(query.toLowerCase());
    return matchGenre && matchQuery;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      {/* Hero */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-lp-primary mb-2">LP 탐색</h1>
        <p className="text-lp-secondary text-sm">
          {MOCK_LPS.length}장의 LP를 가상 턴테이블로 감상하세요
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <div className="flex items-center bg-white border border-lp-border rounded-xl overflow-hidden shadow-sm">
          <div className="pl-4 pr-2 text-lp-tertiary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="LP 제목, 아티스트, 장르 검색..."
            className="flex-1 px-3 py-3.5 text-sm outline-none text-lp-primary placeholder:text-lp-tertiary bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="px-3 text-lp-tertiary hover:text-lp-secondary"
            >
              ×
            </button>
          )}
          <button className="px-6 py-3.5 bg-lp-accent text-white text-sm font-medium hover:bg-lp-accent-btn transition-colors">
            검색
          </button>
        </div>
      </div>

      {/* Genre filter chips */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {GENRES.map((genre) => (
          <Chip
            key={genre}
            label={genre}
            active={selectedGenre === genre}
            onClick={() => setSelectedGenre(genre)}
          />
        ))}
      </div>

      {/* Results count */}
      {query && (
        <p className="text-lp-secondary text-sm mb-4">
          &ldquo;{query}&rdquo; 검색 결과 {filtered.length}건
        </p>
      )}

      {/* LP Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filtered.map((lp, i) => (
            <LPCard key={lp.id} lp={lp} isAuthenticated={isAuthenticated} priority={i < 8} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-lp-tertiary">
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <p className="text-base font-medium">검색 결과가 없습니다</p>
          <p className="text-sm mt-1">다른 키워드나 장르를 선택해보세요</p>
        </div>
      )}
    </div>
  );
}
