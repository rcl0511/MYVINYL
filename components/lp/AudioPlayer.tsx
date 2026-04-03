"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Track, PlayerState, LPSide } from "@/lib/types";

interface AudioPlayerProps {
  state: PlayerState;
  side: LPSide;
  currentTrack: Track | null;
  volume: number;
  progress: number; // 0-100
  elapsed: number;  // seconds
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onVolumeChange: (v: number) => void;
  onSideToggle: () => void;
  onSeek: (progress: number) => void;
  onCustomEdit?: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parseDuration(duration: string): number {
  const [m, s] = duration.split(":").map(Number);
  return m * 60 + (s || 0);
}

export default function AudioPlayer({
  state,
  side,
  currentTrack,
  volume,
  progress,
  elapsed,
  onPlay,
  onPause,
  onPrev,
  onNext,
  onVolumeChange,
  onSideToggle,
  onSeek,
  onCustomEdit,
}: AudioPlayerProps) {
  const isPlaying = state === "playing";
  const totalSeconds = currentTrack ? parseDuration(currentTrack.duration) : 0;
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      if (!bar || !currentTrack) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(pct * 100);
    },
    [currentTrack, onSeek]
  );

  return (
    <div className="bg-white rounded-2xl border border-lp-border p-6 shadow-sm">
      {/* Current track info */}
      <div className="text-center mb-5">
        <p className="text-lp-tertiary text-xs mb-1 uppercase tracking-widest">{side}면 재생 중</p>
        <p className="font-semibold text-lp-primary text-base leading-snug">
          {currentTrack ? currentTrack.title : "트랙을 선택하세요"}
        </p>
        {currentTrack && (
          <p className="text-lp-secondary text-xs mt-0.5">{currentTrack.duration}</p>
        )}
      </div>

      {/* Progress bar — clickable */}
      <div className="mb-5">
        <div
          ref={progressBarRef}
          className="relative h-2 bg-lp-border rounded-full overflow-hidden cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-lp-accent rounded-full transition-all duration-500 ease-linear"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-lp-accent rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between text-lp-tertiary text-xs mt-1.5">
          <span>{formatTime(elapsed)}</span>
          <span>{currentTrack?.duration ?? "—"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 mb-5">
        <button
          onClick={onPrev}
          className="w-10 h-10 flex items-center justify-center text-lp-secondary hover:text-lp-primary transition-colors rounded-full hover:bg-lp-bg"
          aria-label="이전 트랙"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          className="w-16 h-16 rounded-full bg-lp-accent flex items-center justify-center text-white shadow-lg hover:bg-lp-accent-btn transition-colors active:scale-95"
          aria-label={isPlaying ? "일시정지" : "재생"}
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
          className="w-10 h-10 flex items-center justify-center text-lp-secondary hover:text-lp-primary transition-colors rounded-full hover:bg-lp-bg"
          aria-label="다음 트랙"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      {/* A/B side toggle */}
      <div className="flex justify-center mb-5">
        <button
          onClick={onSideToggle}
          className="flex items-center gap-0 border border-lp-border rounded-full overflow-hidden text-sm font-medium hover:border-lp-accent transition-colors"
        >
          <span className={`px-5 py-2 transition-colors ${side === "A" ? "bg-lp-accent text-white" : "text-lp-tertiary hover:text-lp-secondary"}`}>
            A면
          </span>
          <span className={`px-5 py-2 transition-colors ${side === "B" ? "bg-lp-accent text-white" : "text-lp-tertiary hover:text-lp-secondary"}`}>
            B면
          </span>
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => onVolumeChange(volume === 0 ? 70 : 0)}
          className="text-lp-tertiary hover:text-lp-secondary transition-colors shrink-0"
        >
          {volume === 0 ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
            </svg>
          ) : volume < 50 ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="flex-1 accent-lp-accent h-1.5 cursor-pointer"
        />
        <span className="text-lp-tertiary text-xs w-7 text-right">{volume}</span>
      </div>

      {/* Custom edit button */}
      {onCustomEdit && (
        <button
          onClick={onCustomEdit}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-lp-border rounded-xl text-sm text-lp-secondary hover:border-lp-accent hover:text-lp-accent transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          LP 커스텀 편집
        </button>
      )}
    </div>
  );
}
