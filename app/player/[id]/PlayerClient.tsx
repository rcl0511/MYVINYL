"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Turntable from "@/components/lp/Turntable";
import PlayerControls from "@/components/lp/PlayerControls";
import LyricsPanel from "@/components/lp/LyricsPanel";
import { MOCK_LPS } from "@/lib/mock-data";
import type { LP, Track, PlayerState, LPSide } from "@/lib/types";

/* YouTube IFrame Player 최소 타입 */
interface YTPlayer {
  cueVideoById(videoId: string): void;
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  destroy(): void;
}

function parseDuration(d: string): number {
  const [m, s] = d.split(":").map(Number);
  return m * 60 + (s || 0);
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export default function PlayerClient({ lp }: { lp: LP }) {
  const router = useRouter();

  /* ── State ── */
  const [state, setState] = useState<PlayerState>("paused");
  const [side, setSide] = useState<LPSide>("A");
  const [volume, setVolume] = useState(70);
  const [trackIdx, setTrackIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showTracklist, setShowTracklist] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [turntableSize, setTurntableSize] = useState(520);
  const [ytError, setYtError] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const ytReadyRef = useRef(false);

  const sideTracks = lp.tracks.filter((t) => t.side === side);
  const currentTrack: Track | null = sideTracks[trackIdx] ?? null;
  const totalSeconds = currentTrack ? parseDuration(currentTrack.duration) : 0;

  /* 트랙의 youtubeId 우선, 없으면 앨범 youtubeId */
  const currentYoutubeId = currentTrack?.youtubeId ?? lp.youtubeId ?? null;
  const currentYoutubeIdRef = useRef(currentYoutubeId);
  currentYoutubeIdRef.current = currentYoutubeId;

  /* sideTracksLength ref — onStateChange 클로저의 stale 참조 방지 */
  const sideTracksLengthRef = useRef(sideTracks.length);
  sideTracksLengthRef.current = sideTracks.length;

  /* ── YouTube API 초기화 (마운트 1회) */
  useEffect(() => {
    const onReady = () => {
      ytReadyRef.current = true;
      const vid = currentYoutubeIdRef.current;
      if (vid) ytPlayerRef.current?.cueVideoById(vid);
    };

    const createPlayer = (videoId: string) => {
      ytPlayerRef.current = new (window as any).YT.Player("yt-audio-player", {
        height: "1", width: "1",
        videoId,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, rel: 0 },
        events: {
          onReady,
          onStateChange: (e: { data: number }) => {
            /* YT.PlayerState.ENDED = 0 → 트랙 자동 넘김
               sideTracksLengthRef로 최신 사이드 트랙 수를 참조 (stale closure 방지) */
            if (e.data === 0) {
              setTrackIdx((i) => (i + 1) % sideTracksLengthRef.current);
              setProgress(0);
              setElapsed(0);
            }
          },
        },
      }) as YTPlayer;
    };

    const initYT = () => {
      createPlayer(currentYoutubeIdRef.current ?? "");
    };

    if ((window as any).YT?.Player) {
      initYT();
    } else {
      (window as any).onYouTubeIframeAPIReady = initYT;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.onerror = () => setYtError(true);
        document.head.appendChild(tag);
      }
    }

    return () => {
      try { ytPlayerRef.current?.destroy(); } catch {}
      ytPlayerRef.current = null;
      ytReadyRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 트랙 변경 → 영상 교체 */
  useEffect(() => {
    if (!ytPlayerRef.current || !ytReadyRef.current || !currentYoutubeId) return;
    if (state === "playing") {
      ytPlayerRef.current.loadVideoById(currentYoutubeId);
    } else {
      ytPlayerRef.current.cueVideoById(currentYoutubeId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYoutubeId]);

  /* 재생/정지 */
  useEffect(() => {
    if (!ytPlayerRef.current || !ytReadyRef.current) return;
    if (state === "playing") ytPlayerRef.current.playVideo();
    else ytPlayerRef.current.pauseVideo();
  }, [state]);

  /* 볼륨 */
  useEffect(() => {
    if (!ytPlayerRef.current || !ytReadyRef.current) return;
    ytPlayerRef.current.setVolume(volume);
  }, [volume]);

  const { r, g, b } = hexToRgb(lp.coverColor.length === 7 ? lp.coverColor : "#1a1a2e");

  /* ── Turntable sizing ── */
  useEffect(() => {
    function calc() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 768;

      let base;
      if (isMobile) {
        base = Math.min(vw * 0.7, vh * 0.4, 400);
      } else {
        base = Math.min(vw * 0.56, vh * 0.62, 640);
      }

      setTurntableSize(Math.max(isMobile ? 280 : 320, Math.round(base)));
    }
    calc();
    let debounceTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(calc, 150);
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(debounceTimer);
    };
  }, []);

  /* ── Progress ticker ── */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (state === "playing" && currentTrack) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= totalSeconds) {
            setTrackIdx((i) => (i + 1) % sideTracksLengthRef.current);
            setProgress(0);
            return 0;
          }
          setProgress((next / totalSeconds) * 100);
          return next;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state, currentTrack, totalSeconds]);

  useEffect(() => { setProgress(0); setElapsed(0); }, [trackIdx, side]);

  /* ── UI auto-hide ── */
  const resetHideTimer = useCallback(() => {
    setUiVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (state === "playing") {
      hideTimerRef.current = setTimeout(() => setUiVisible(false), 4000);
    }
  }, [state]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [state, resetHideTimer]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      resetHideTimer();
      switch (e.code) {
        case "Space": e.preventDefault(); setState((s) => s === "playing" ? "paused" : "playing"); break;
        case "ArrowRight": setTrackIdx((i) => (i + 1) % sideTracksLengthRef.current); break;
        case "ArrowLeft": setTrackIdx((i) => (i - 1 + sideTracksLengthRef.current) % sideTracksLengthRef.current); break;
        case "KeyT": setShowTracklist((v) => !v); break;
        case "KeyL": setShowLyrics((v) => !v); break;
        case "KeyM": setVolume((v) => v === 0 ? 70 : 0); break;
        case "KeyF": setSide((s) => s === "A" ? "B" : "A"); setTrackIdx(0); setState("paused"); break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetHideTimer]);

  const handleSeek = useCallback((pct: number) => {
    if (!currentTrack) return;
    const secs = Math.floor((pct / 100) * totalSeconds);
    setProgress(pct);
    setElapsed(secs);
    if (ytPlayerRef.current && ytReadyRef.current) {
      ytPlayerRef.current.seekTo(secs, true);
    }
  }, [currentTrack, totalSeconds]);

  const handleSideChange = useCallback((newSide: LPSide) => {
    setSide(newSide);
    setTrackIdx(0);
    setState("paused");
  }, []);

  const handleSideToggle = useCallback(() => {
    handleSideChange(side === "A" ? "B" : "A");
  }, [side, handleSideChange]);

  const lpIndex = MOCK_LPS.findIndex((l) => l.id === lp.id);
  const prevLp = MOCK_LPS[(lpIndex - 1 + MOCK_LPS.length) % MOCK_LPS.length];
  const nextLp = MOCK_LPS[(lpIndex + 1) % MOCK_LPS.length];

  return (
    /* Full-screen overlay — covers GNB */
    <div
      className="fixed inset-0 z-[60] flex flex-col overflow-hidden"
      style={{ background: "#03030a" }}
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
    >
      {/* ── Ambient color blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main bloom */}
        <div
          className="absolute rounded-full"
          style={{
            width: "70vw", height: "70vw",
            top: "50%", left: "50%",
            transform: "translate(-50%, -55%)",
            background: `radial-gradient(circle, rgba(${r},${g},${b},${state === "playing" ? 0.28 : 0.10}) 0%, transparent 65%)`,
            filter: "blur(60px)",
            transition: "background 2s ease",
          }}
        />
        {/* Side glow left */}
        <div
          className="absolute rounded-full"
          style={{
            width: "45vw", height: "45vw",
            bottom: "-10%", left: "-10%",
            background: `radial-gradient(circle, rgba(${r},${g},${b},0.12) 0%, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
        {/* Side glow right */}
        <div
          className="absolute rounded-full"
          style={{
            width: "40vw", height: "40vw",
            top: "-5%", right: "-5%",
            background: `radial-gradient(circle, rgba(${Math.min(r+30,255)},${Math.min(g+20,255)},${Math.min(b+60,255)},0.10) 0%, transparent 70%)`,
            filter: "blur(90px)",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 75% 75% at 50% 50%,
                transparent 40%,
                rgba(0,0,0,0.55) 100%
              )
            `,
          }}
        />
      </div>

      {/* ── Top bar ── */}
      <div
        className="relative z-10 flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-2 transition-all duration-700"
        style={{ opacity: uiVisible ? 1 : 0, pointerEvents: uiVisible ? "auto" : "none" }}
      >
        {/* Back */}
        <Link
          href={`/lp/${lp.id}`}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs sm:text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          <span className="hidden sm:inline">LP 상세로</span>
        </Link>

        {/* Album info center */}
        <div className="text-center flex-1 px-2">
          <p className="text-white/80 font-semibold text-xs sm:text-sm leading-tight truncate">{lp.title}</p>
          <p className="text-white/40 text-[10px] sm:text-xs mt-0.5 truncate">{lp.artist} · {lp.year}</p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tracklist toggle */}
          <button
            onClick={() => setShowTracklist((v) => !v)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showTracklist
                ? "bg-white/15 text-white"
                : "text-white/40 hover:text-white hover:bg-white/8"
            }`}
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            트랙 목록
            <span className="text-white/25">T</span>
          </button>
          {/* Lyrics toggle */}
          <button
            onClick={() => setShowLyrics((v) => !v)}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-colors ${
              showLyrics
                ? "bg-white/15 text-white"
                : "text-white/40 hover:text-white hover:bg-white/8"
            }`}
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span className="hidden sm:inline">가사</span>
            <span className="text-white/25">L</span>
          </button>
          {/* Custom */}
          <Link
            href={`/lp-editor/${lp.id}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/40 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            커스텀
          </Link>
        </div>
      </div>

      {/* ── Main stage ── */}
      <div className="relative flex-1 flex items-center justify-center">

        {/* Prev LP ghost */}
        <button
          onClick={() => router.push(`/player/${prevLp.id}`)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group z-10 transition-all duration-700"
          style={{ opacity: uiVisible ? 0.4 : 0, pointerEvents: uiVisible ? "auto" : "none" }}
        >
          <div
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-full group-hover:scale-110 transition-transform"
            style={{
              background: `conic-gradient(from 0deg, ${prevLp.coverColor}, #111 40%, ${prevLp.coverColor}88)`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          />
          <p className="hidden sm:block text-white/50 text-[10px] group-hover:text-white/80 transition-colors max-w-[72px] text-center truncate">
            {prevLp.title}
          </p>
          <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 sm:-mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* ── Turntable ── */}
        <div className="relative flex items-center justify-center">
          <Turntable
            lp={lp}
            state={state}
            side={side}
            progress={progress}
            onSeek={handleSeek}
            size={turntableSize}
          />

          {/* Click center to play/pause */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
            onClick={() => setState((s) => s === "playing" ? "paused" : "playing")}
            style={{ borderRadius: "50%", maxWidth: turntableSize * 0.6, maxHeight: turntableSize * 0.6, margin: "auto" }}
          />
        </div>

        {/* Next LP ghost */}
        <button
          onClick={() => router.push(`/player/${nextLp.id}`)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group z-10 transition-all duration-700"
          style={{ opacity: uiVisible ? 0.4 : 0, pointerEvents: uiVisible ? "auto" : "none" }}
        >
          <div
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-full group-hover:scale-110 transition-transform"
            style={{
              background: `conic-gradient(from 0deg, ${nextLp.coverColor}, #111 40%, ${nextLp.coverColor}88)`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          />
          <p className="hidden sm:block text-white/50 text-[10px] group-hover:text-white/80 transition-colors max-w-[72px] text-center truncate">
            {nextLp.title}
          </p>
          <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 sm:-mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* ── Track list drawer ── */}
        <div
          className="absolute top-0 bottom-0 left-0 z-20 flex flex-col w-full sm:w-[300px]"
          style={{
            transform: showTracklist ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
            background: "rgba(5,5,15,0.92)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/6">
            <div>
              <p className="text-white/80 font-semibold text-sm">{lp.title}</p>
              <p className="text-white/35 text-xs mt-0.5">{side}면 · {sideTracks.length}트랙</p>
            </div>
            {/* Mobile close button */}
            <button
              className="sm:hidden w-8 h-8 flex items-center justify-center text-white/40 hover:text-white ml-2"
              onClick={() => setShowTracklist(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            {/* A/B */}
            <div className="flex gap-0 rounded-full overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
              {(["A", "B"] as LPSide[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSideChange(s)}
                  className="px-3 py-1 text-xs font-semibold transition-colors"
                  style={{
                    background: side === s ? "#7C3AED" : "transparent",
                    color: side === s ? "#fff" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {sideTracks.map((track, idx) => {
              const active = idx === trackIdx;
              return (
                <button
                  key={track.id}
                  onClick={() => { setTrackIdx(idx); setState("playing"); }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/5"
                  style={{ background: active ? "rgba(124,58,237,0.15)" : "transparent" }}
                >
                  <span className="w-5 flex items-center justify-center shrink-0">
                    {active && state === "playing" ? (
                      <span className="flex gap-0.5 items-end h-4">
                        {[3, 5, 4, 5, 3].map((h, i) => (
                          <span
                            key={i}
                            className="w-0.5 rounded-full"
                            style={{
                              height: h * 2.5,
                              background: "#a78bfa",
                              animation: `eq-bar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                            }}
                          />
                        ))}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: active ? "#a78bfa" : "rgba(255,255,255,0.25)" }}>
                        {track.number}
                      </span>
                    )}
                  </span>
                  <span
                    className="flex-1 text-sm truncate"
                    style={{ color: active ? "#c4b5fd" : "rgba(255,255,255,0.65)", fontWeight: active ? 600 : 400 }}
                  >
                    {track.title}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }} className="tabular-nums">
                    {track.duration}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div
        className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6 transition-all duration-700"
        style={{ opacity: uiVisible ? 1 : 0, pointerEvents: uiVisible ? "auto" : "none" }}
      >
        <PlayerControls
          state={state}
          side={side}
          currentTrack={currentTrack}
          volume={volume}
          progress={progress}
          elapsed={elapsed}
          lpId={lp.id}
          onPlay={() => setState("playing")}
          onPause={() => setState("paused")}
          onPrev={() => setTrackIdx((i) => (i - 1 + sideTracksLengthRef.current) % sideTracksLengthRef.current)}
          onNext={() => { setTrackIdx((i) => (i + 1) % sideTracksLengthRef.current); setState("playing"); }}
          onVolumeChange={setVolume}
          onSideToggle={handleSideToggle}
          onSeek={handleSeek}
        />
      </div>

      {/* ── Keyboard hint ── */}
      <div
        className="hidden sm:flex absolute bottom-3 right-4 gap-3 text-white/15 text-[10px] transition-all duration-700"
        style={{ opacity: uiVisible ? 1 : 0 }}
      >
        <span>Space 재생/정지</span>
        <span>← → 트랙 이동</span>
        <span>T 트랙목록</span>
        <span>L 가사</span>
        <span>M 음소거</span>
        <span>F 면전환</span>
      </div>

      {/* ── Hidden YouTube audio player ── */}
      <div id="yt-audio-player" style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none", overflow: "hidden" }} />

      {/* ── YouTube 로드 실패 알림 ── */}
      {ytError && (
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          style={{
            background: "rgba(220,38,38,0.18)",
            border: "1px solid rgba(220,38,38,0.35)",
            color: "rgba(252,165,165,0.9)",
            backdropFilter: "blur(12px)",
          }}
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          오디오를 불러올 수 없습니다. 네트워크 연결을 확인하세요.
        </div>
      )}

      {/* ── EQ bar animation ── */}
      <style>{`
        @keyframes eq-bar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>

      {/* ── Lyrics panel ── */}
      {showLyrics && currentTrack?.lyrics && (
        <LyricsPanel
          lyrics={currentTrack.lyrics}
          currentTime={elapsed}
          isPlaying={state === "playing"}
          onClose={() => setShowLyrics(false)}
        />
      )}
    </div>
  );
}
