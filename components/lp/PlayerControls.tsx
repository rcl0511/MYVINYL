"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import type { Track, PlayerState, LPSide } from "@/lib/types";

interface PlayerControlsProps {
  state: PlayerState;
  side: LPSide;
  currentTrack: Track | null;
  volume: number;
  progress: number;
  elapsed: number;
  lpId: string;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onVolumeChange: (v: number) => void;
  onSideToggle: () => void;
  onSeek: (pct: number) => void;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function parseDur(d: string) {
  const [m, s] = d.split(":").map(Number);
  return m * 60 + (s || 0);
}

export default function PlayerControls({
  state, side, currentTrack, volume, progress, elapsed, lpId,
  onPlay, onPause, onPrev, onNext, onVolumeChange, onSideToggle, onSeek,
}: PlayerControlsProps) {
  const isPlaying = state === "playing";
  const barRef    = useRef<HTMLDivElement>(null);

  const handleBar = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    if (!bar || !currentTrack) return;
    const rect = bar.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
  }, [currentTrack, onSeek]);

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl px-7 py-5"
      style={{
        background: "rgba(6,4,18,0.72)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Track info + A/B */}
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-sm leading-tight truncate">
            {currentTrack?.title ?? "트랙을 선택하세요"}
          </p>
          <p className="text-white/35 text-xs mt-0.5">
            {side}면{currentTrack ? ` · #${currentTrack.number}` : ""}
          </p>
        </div>

        {/* A / B side pill */}
        <button
          onClick={onSideToggle}
          className="flex shrink-0 ml-4 rounded-full overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
        >
          {(["A", "B"] as LPSide[]).map((s) => (
            <span
              key={s}
              className="px-3.5 py-1 text-xs font-bold transition-colors"
              style={{
                background: side === s ? "#7C3AED" : "transparent",
                color:      side === s ? "#fff"    : "rgba(255,255,255,0.28)",
              }}
            >
              {s}
            </span>
          ))}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div
          ref={barRef}
          className="relative h-1 rounded-full cursor-pointer group"
          style={{ background: "rgba(255,255,255,0.08)" }}
          onClick={handleBar}
        >
          {/* Played fill */}
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #6d28d9, #a78bfa)",
              transition: "width 0.9s linear",
            }}
          />
          {/* Scrub head */}
          <div
            className="absolute top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              width: 13, height: 13,
              left: `calc(${progress}% - 6.5px)`,
              background: "#c4b5fd",
              boxShadow: "0 0 10px rgba(196,181,253,0.85)",
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>{fmt(elapsed)}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>{currentTrack?.duration ?? "—"}</span>
        </div>
      </div>

      {/* Controls + volume row */}
      <div className="flex items-center gap-4">
        {/* Volume */}
        <div className="flex items-center gap-2 w-36 shrink-0">
          <button
            onClick={() => onVolumeChange(volume === 0 ? 70 : 0)}
            className="text-white/30 hover:text-white/60 transition-colors shrink-0"
          >
            {volume === 0 ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <input
            type="range" min={0} max={100} value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="flex-1 h-1 cursor-pointer"
            style={{ accentColor: "#7C3AED" }}
          />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", minWidth: 22, textAlign: "right" }}>
            {volume}
          </span>
        </div>

        {/* Center transport */}
        <div className="flex items-center justify-center gap-5 flex-1">
          <button
            onClick={onPrev}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all text-white/35 hover:text-white hover:bg-white/6"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="flex items-center justify-center text-white transition-all active:scale-95"
            style={{
              width: 60, height: 60,
              borderRadius: "50%",
              background: "linear-gradient(145deg, #8b5cf6, #5B21B6)",
              boxShadow: isPlaying
                ? "0 0 0 6px rgba(124,58,237,0.15), 0 10px 40px rgba(124,58,237,0.55)"
                : "0 10px 32px rgba(124,58,237,0.40)",
            }}
          >
            {isPlaying ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={onNext}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all text-white/35 hover:text-white hover:bg-white/6"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* Right: custom edit */}
        <div className="w-36 flex justify-end shrink-0">
          <Link
            href={`/lp-editor/${lpId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            커스텀
          </Link>
        </div>
      </div>
    </div>
  );
}
