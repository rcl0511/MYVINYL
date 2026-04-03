"use client";

import { useState, useEffect, useRef } from "react";
import type { LyricLine } from "@/lib/types";

interface LyricsPanelProps {
  lyrics: LyricLine[];
  currentTime: number;
  isPlaying: boolean;
  onClose: () => void;
}

export default function LyricsPanel({ lyrics, currentTime, isPlaying, onClose }: LyricsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 현재 재생 중인 가사 라인 찾기
  useEffect(() => {
    if (!lyrics.length) return;

    let newIndex = 0;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        newIndex = i;
        break;
      }
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [currentTime, lyrics, activeIndex]);

  // 활성 라인을 중앙으로 스크롤
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeLine = activeLineRef.current;

      const containerHeight = container.clientHeight;
      const lineTop = activeLine.offsetTop;
      const lineHeight = activeLine.clientHeight;

      container.scrollTo({
        top: lineTop - containerHeight / 2 + lineHeight / 2,
        behavior: "smooth"
      });
    }
  }, [activeIndex]);

  if (!lyrics.length) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">가사</h3>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400 text-sm text-center py-8">
            가사 정보가 없습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10 transition-all duration-300">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">가사</h3>
              <p className="text-gray-400 text-xs">
                {isPlaying ? "재생 중" : "일시정지"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/60 hover:text-white transition-colors p-2"
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Lyrics content */}
      <div
        ref={containerRef}
        className={`max-w-3xl mx-auto overflow-y-auto transition-all duration-300 ${
          isMobile
            ? (isExpanded ? "h-[70vh]" : "h-[50vh]")
            : (isExpanded ? "h-[60vh]" : "h-[40vh]")
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {lyrics.map((line, index) => (
            <div
              key={index}
              ref={index === activeIndex ? activeLineRef : null}
              className={`text-center transition-all duration-300 ${
                index === activeIndex
                  ? "text-white text-lg font-semibold scale-105"
                  : "text-gray-500 text-sm"
              }`}
              style={{
                opacity: index === activeIndex ? 1 : 0.5,
                transform: index === activeIndex ? "scale(1.05)" : "scale(1)"
              }}
            >
              {line.text}
            </div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="max-w-3xl mx-auto px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-xs tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
              style={{
                width: `${(currentTime / (lyrics[lyrics.length - 1]?.time || 1)) * 100}%`
              }}
            />
          </div>
          <span className="text-white/60 text-xs tabular-nums">
            {formatTime(lyrics[lyrics.length - 1]?.time || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}