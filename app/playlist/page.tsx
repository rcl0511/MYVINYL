"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_LPS } from "@/lib/mock-data";
import Button from "@/components/ui/Button";

const PLAYLISTS = [
  { id: "pl-1", name: "즐겨찾는 LP",   color: "#5B21B6", trackCount: 12, duration: "42분" },
  { id: "pl-2", name: "주말 저녁",     color: "#10B981", trackCount: 8,  duration: "31분" },
  { id: "pl-3", name: "재즈 무드",     color: "#F59E0B", trackCount: 15, duration: "58분" },
  { id: "pl-4", name: "클래식 모음",   color: "#3B82F6", trackCount: 6,  duration: "24분" },
  { id: "pl-5", name: "드라이브 BGM",  color: "#EF4444", trackCount: 10, duration: "37분" },
];

export default function PlaylistPage() {
  const [selectedId, setSelectedId] = useState("pl-1");
  const selected = PLAYLISTS.find((p) => p.id === selectedId)!;

  // Use first N tracks from MOCK_LPS as mock playlist tracks
  const tracks = MOCK_LPS.flatMap((lp) =>
    lp.tracks.slice(0, 2).map((t) => ({ ...t, lpTitle: lp.title, artist: lp.artist, lpId: lp.id }))
  ).slice(0, selected.trackCount);

  return (
    <div className="min-h-[calc(100vh-64px)] flex max-w-[1440px] mx-auto">
      {/* Left sidebar: playlist list */}
      <aside className="w-72 shrink-0 border-r border-lp-border bg-lp-sidebar px-6 py-8 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-lp-primary">내 플레이리스트</h2>
        </div>
        <Button variant="outline" size="sm" className="mb-4 w-full">
          + 새 플레이리스트
        </Button>

        <div className="space-y-1 flex-1 overflow-y-auto">
          {PLAYLISTS.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setSelectedId(pl.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                selectedId === pl.id
                  ? "bg-lp-accent-light"
                  : "hover:bg-lp-chip"
              }`}
            >
              <div
                className="w-10 h-10 rounded-lg shrink-0"
                style={{ backgroundColor: pl.color }}
              />
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${selectedId === pl.id ? "text-lp-accent" : "text-lp-primary"}`}>
                  {pl.name}
                </p>
                <p className="text-xs text-lp-tertiary">{pl.trackCount}곡</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main: playlist detail */}
      <div className="flex-1 overflow-y-auto">
        {/* Playlist header */}
        <div className="bg-lp-accent-light px-8 py-8 flex items-center gap-6">
          <div
            className="w-28 h-28 rounded-2xl shrink-0 shadow-md"
            style={{ backgroundColor: selected.color }}
          />
          <div>
            <p className="text-lp-secondary text-xs mb-1">플레이리스트</p>
            <h1 className="text-3xl font-bold text-lp-primary">{selected.name}</h1>
            <p className="text-lp-secondary text-sm mt-2">
              {selected.trackCount}곡 · {selected.duration}
            </p>
            <div className="flex gap-2 mt-4">
              <Button size="sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                전체 재생
              </Button>
              <Button variant="outline" size="sm">편집</Button>
            </div>
          </div>
        </div>

        {/* Track list header */}
        <div className="grid grid-cols-[2rem_1fr_1fr_5rem] gap-4 px-8 py-3 border-b border-lp-border bg-lp-chip text-lp-secondary text-xs font-semibold">
          <span>#</span>
          <span>제목</span>
          <span>앨범</span>
          <span className="text-right">시간</span>
        </div>

        {/* Track rows */}
        <div>
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              className={`grid grid-cols-[2rem_1fr_1fr_5rem] gap-4 px-8 py-3.5 border-b border-lp-border items-center group hover:bg-lp-bg transition-colors ${
                idx % 2 === 0 ? "bg-white" : "bg-lp-bg/50"
              }`}
            >
              <span className="text-xs text-lp-tertiary tabular-nums group-hover:hidden">{idx + 1}</span>
              <button className="hidden group-hover:flex items-center justify-start">
                <svg className="w-4 h-4 text-lp-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              <div className="min-w-0">
                <p className="text-sm font-medium text-lp-primary truncate">{track.title}</p>
                <p className="text-xs text-lp-tertiary truncate">{track.artist}</p>
              </div>

              <Link href={`/lp/${track.lpId}`} className="text-sm text-lp-secondary truncate hover:text-lp-accent hover:underline transition-colors">
                {track.lpTitle}
              </Link>

              <div className="flex items-center justify-end gap-2">
                <button className="opacity-0 group-hover:opacity-100 text-lp-tertiary hover:text-lp-danger transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
                <span className="text-xs text-lp-tertiary tabular-nums">{track.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
