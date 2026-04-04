"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { LP, PlayerState, LPSide } from "@/lib/types";
import { SPLATTER_STROKES } from "@/lib/splatter-vinyl";

const RPM = 33.33;
const DEG_PER_MS = (RPM * 360) / 60000;
const SPIN_TC = 800; // spin-up/down time constant ms

interface TurntableProps {
  lp: LP;
  state: PlayerState;
  side: LPSide;
  progress?: number;
  onSeek?: (pct: number) => void;
  size?: number;
}

export default function Turntable({
  lp, state, side, progress = 0, onSeek, size = 520,
}: TurntableProps) {
  const discRef  = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const lastRef  = useRef<number | null>(null);
  const rafRef   = useRef<number>(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const isPlaying = state === "playing";

  /* ─── scale util ─── */
  const px = (n: number) => Math.round((n / 520) * size);

  /* ── Dimensions ── */
  const W  = size;
  const H  = Math.round(size * 0.82); // 높이 살짝 증가
  const platD = px(370); // 플래터 살짝 키움
  const platX = px(30);
  const platY = px(35);
  const discD = px(340); // LP 살짝 키움
  const discX = platX + px(15);
  const discY = platY + px(15);
  const armW   = px(195);
  const armH   = px(280);
  const pivX   = px(15);
  const pivY   = px(15);
  // 재생 중일 때 톤암이 안쪽으로 더 들어가도록 수정
  const tonearmDeg = isPlaying ? -5 + progress * 0.12 : 32;

  /* ── Physics Spin (유지) ── */
  useEffect(() => {
    function tick(ts: number) {
      if (lastRef.current === null) lastRef.current = ts;
      const dt = Math.min(ts - lastRef.current, 80);
      lastRef.current = ts;

      const target = stateRef.current === "playing" ? DEG_PER_MS : 0;
      speedRef.current = target + (speedRef.current - target) * Math.exp(-dt / SPIN_TC);

      if (speedRef.current > 0.0003) {
        angleRef.current = (angleRef.current + speedRef.current * dt) % 360;
        if (discRef.current)
          discRef.current.style.transform = `rotate(${angleRef.current}deg)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, []);

  const handleDisc = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onSeek) return;
      const el = e.currentTarget;
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
      const maxR  = r.width / 2;
      const inner = maxR * 0.17;
      const outer = maxR * 0.96;
      if (dist > inner && dist < outer) {
        const pct = 1 - (dist - inner) / (outer - inner);
        onSeek(Math.max(0, Math.min(100, pct * 100)));
      }
    },
    [onSeek]
  );

  const c = lp.coverColor;
  const style = (lp.vinylStyle || "color").toLowerCase();
  const isSplatter = style.includes("splatter");
  const isRed = style.includes("red");
  const isEmerald = style.includes("emerald");
  const isMarble = style.includes("marble") || style.includes("smoke");

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: W, height: H }}>
      
      {/* [수정] Ambient underside glow - 더 넓고 부드럽게 */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "110%", height: "50%", bottom: px(-20), left: "-5%",
          background: `radial-gradient(ellipse at center, ${c}${isPlaying ? "50" : "15"} 0%, transparent 75%)`,
          filter: `blur(${px(40)}px)`, transition: "background 2s ease, opacity 2s ease",
          opacity: isPlaying ? 1 : 0.7
        }}
      />

      {/* [수정] Plinth cabinet - 다크 우드 + 알루미늄 베이스 */}
      <div
        className="relative overflow-hidden"
        style={{
          width: W, height: H, borderRadius: px(12),
          // 리얼한 우드 그레인 느낌의 그라데이션
          background: `
            linear-gradient(170deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 40%),
            linear-gradient(155deg, #3d2610 0%, #2a190b 20%, #1a0f05 50%, #2a190b 80%, #3d2610 100%)
          `,
          boxShadow: `
            0 ${px(50)}px ${px(120)}px rgba(0,0,0,0.85), 
            0 0 0 1px rgba(255,255,255,0.03) inset,
            0 ${px(-4)}px 0 rgba(0,0,0,0.5) inset
          `,
        }}
      >
        {/* [추가] 하단 알루미늄 절삭 베이스 효과 */}
        <div 
          style={{
            position: 'absolute', bottom: 0, left: 0, width: '100%', height: px(25),
            background: 'linear-gradient(180deg, #888 0%, #444 10%, #666 50%, #333 90%, #555 100%)',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}
        />

        {/* [수정] Platter housing - 스트로보스코프 패턴 추가 */}
        <div
          className="absolute rounded-full"
          style={{
            width: platD, height: platD, top: platY, left: platX,
            // 금속 질감 강화
            background: "radial-gradient(circle at 35% 30%, #666 0%, #222 60%, #444 80%, #111 100%)",
            boxShadow: `0 ${px(8)}px ${px(35)}px rgba(0,0,0,0.9), inset 0 2px 8px rgba(255,255,255,0.1)`,
          }}
        >
          {/* [추가] 플래터 측면 스트로보 점무늬 패턴 */}
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <defs>
              <pattern id="strobe" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse">
                {Array.from({length: 60}).map((_, i) => (
                  <circle key={i} cx={50 + 48 * Math.cos(i * 6 * Math.PI / 180)} cy={50 + 48 * Math.sin(i * 6 * Math.PI / 180)} r="0.6" fill="rgba(255,255,255,0.15)" />
                ))}
              </pattern>
            </defs>
            <circle cx="50" cy="50" r="49.5" fill="url(#strobe)" />
          </svg>
        </div>

        {/* [수정] Rubber felt mat - 질감 깊게 */}
        <div
          className="absolute rounded-full"
          style={{
            width: platD - px(18), height: platD - px(18), top: platY + px(9), left: platX + px(9),
            background: "radial-gradient(circle at 38% 32%, #222 0%, #090909 70%, #1a1a1a 90%, #000 100%)",
            boxShadow: "inset 0 5px 20px rgba(0,0,0,0.98)",
          }}
        >
          {/* 중앙 스핀들 포스트 */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: px(8), height: px(8), borderRadius: '50%', background: 'linear-gradient(135deg, #999, #333)', boxShadow: '0 2px 4px rgba(0,0,0,0.5)'}} />
        </div>

        {/* ── LP Disc (유지) ── */}
        <div
          ref={discRef}
          className={onSeek ? "cursor-crosshair" : ""}
          style={{ position: "absolute", width: discD, height: discD, top: discY, left: discX, borderRadius: "50%", zIndex: 5 }}
          onClick={handleDisc}
        >
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "50%", boxShadow: `0 ${px(10)}px ${px(40)}px rgba(0,0,0,0.8)` }} viewBox="0 0 100 100">
            <defs>
              <clipPath id={`vclip-${lp.id}`}>
                <circle cx="50" cy="50" r="49.5"/>
              </clipPath>

              {/* 그라데이션 정의 (Red, Emerald, Smoke, Shine 등...) */}
              <radialGradient id={`redAcrylic-${lp.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#9f1239" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#9f1239" stopOpacity="0.95" />
              </radialGradient>
              <radialGradient id={`emeraldAcrylic-${lp.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#065f46" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0.95" />
              </radialGradient>
              <radialGradient id={`smokeAcrylic-${lp.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#404040" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.9" />
              </radialGradient>
              <linearGradient id={`acrylicShine-${lp.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="5%" stopColor="white" stopOpacity="0.6" />
                <stop offset="20%" stopColor="white" stopOpacity="0" />
                <stop offset="48%" stopColor="white" stopOpacity="0.2" />
                <stop offset="52%" stopColor="white" stopOpacity="0" />
                <stop offset="85%" stopColor="white" stopOpacity="0.45" />
              </linearGradient>
              <filter id={`marbleFilter-${lp.id}`}>
                <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="5" seed={lp.year} />
                <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 20 -10" />
                <feGaussianBlur stdDeviation="2.5" />
                <feDisplacementMap in="SourceGraphic" scale="45" />
              </filter>
              {/* TEAM BABY 스플래터 필터 */}
              <filter id={`roughFilter-${lp.id}`}>
                <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              {/* 크림색 센터 라벨 */}
              <radialGradient id={`vl-${lp.id}`} cx="36%" cy="28%" r="68%">
                <stop offset="0%" stopColor="#faf6ec"/>
                <stop offset="60%" stopColor="#ede5cc"/>
                <stop offset="100%" stopColor="#ddd0b0"/>
              </radialGradient>
            </defs>

            {/* ── 스타일별 렌더링 ── */}
            {isSplatter ? (
              /* ── [TEAM BABY] 화이트 스플래터 (이전 버전) ── */
              <g clipPath={`url(#vclip-${lp.id})`}>
                <circle cx="50" cy="50" r="49.5" fill="#f8f7f4"/>
                <g filter={`url(#roughFilter-${lp.id})`}>
                  {SPLATTER_STROKES.map((s, i) => (
                    <line key={i} x1="50" y1={50 - s.r2} x2="50" y2={50 - s.r1} stroke={s.c} strokeWidth={s.w * 1.8} strokeLinecap="round" opacity={s.o} transform={`rotate(${s.a}, 50, 50)`} />
                  ))}
                </g>
                <circle cx="50" cy="50" r="13.2" fill={`url(#vl-${lp.id})`}/>
                <text x="50" y="50" textAnchor="middle" fontSize="2.5" fontWeight="700" fill="#28190a">TEAM BABY</text>
              </g>
            ) : (isRed || isEmerald) ? (
              /* ── [201 & TEEN TROUBLES] 딥 아크릴 + 글리터 강화 버전 ── */
              <g clipPath={`url(#vclip-${lp.id})`}>
                <circle cx="50" cy="50" r="49.5" fill={`url(#${isRed ? 'red' : 'emerald'}Acrylic-${lp.id})`} />
                <g>
                  {Array.from({ length: 600 }).map((_, i) => {
                    const g = {
                      cx: Math.random() * 100,
                      cy: Math.random() * 100,
                      r: 0.06 + Math.random() * 0.12,
                      opacity: 0.7 + Math.random() * 0.3,
                    };
                    return <circle key={i} cx={g.cx} cy={g.cy} r={g.r} fill="#ffffff" opacity={g.opacity} />;
                  })}
                </g>
                {[46, 42.5, 39, 35.5, 32, 28.5, 25, 21.5, 18].map((r) => (
                  <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="0.08" opacity="0.1"/>
                ))}
                <circle cx="50" cy="50" r="49.5" fill={`url(#acrylicShine-${lp.id})`} />
                <circle cx="50" cy="50" r="13.5" fill="white" />
                {lp.coverUrl && <image href={lp.coverUrl} x="36.5" y="36.5" height="27" width="27" clipPath="circle(50%)" preserveAspectRatio="xMidYMid slice" />}
              </g>
            ) : isMarble ? (
              /* ── [THIRSTY] 스모크 마블 (글리터 없음) ── */
              <g clipPath={`url(#vclip-${lp.id})`}>
                <circle cx="50" cy="50" r="49.5" fill={`url(#smokeAcrylic-${lp.id})`} />
                <g filter={`url(#marbleFilter-${lp.id})`} opacity="0.8">
                  <circle cx="50" cy="50" r="48" fill="#171717" />
                  <ellipse cx="35" cy="35" rx="35" ry="18" fill="#525252" transform="rotate(40, 35, 35)" />
                  <ellipse cx="65" cy="70" rx="40" ry="12" fill="#000000" transform="rotate(-25, 65, 70)" />
                </g>
                <circle cx="50" cy="50" r="49.5" fill={`url(#acrylicShine-${lp.id})`} />
                <circle cx="50" cy="50" r="13.5" fill="#0c0c0c" />
                <text x="50" y="51" textAnchor="middle" fontSize="2.2" fill="white" fontWeight="800" letterSpacing="0.5">THIRSTY</text>
              </g>
            ) : (
              /* ── 기본 블랙/기타 ── */
              <g clipPath={`url(#vclip-${lp.id})`}>
                <circle cx="50" cy="50" r="49.5" fill={c}/>
                <circle cx="50" cy="50" r="13" fill="#ddd0b0"/>
              </g>
            )}

            <circle cx="50" cy="50" r="2.5" fill="#1a1612"/><circle cx="50" cy="50" r="1.5" fill="#0e0c0a"/>
          </svg>
        </div>

        {/* ── [수정] Tonearm - 금속 질감 강화 및 디테일 추가 ── */}
        <div
          style={{
            position: "absolute", width: armW, height: armH, top: px(15), right: px(15), zIndex: 10,
            transformOrigin: `${pivX}px ${pivY}px`, transform: `rotate(${tonearmDeg}deg)`,
            transition: "transform 2s cubic-bezier(0.25, 1, 0.3, 1)", // 더 부드럽게
          }}
        >
          {/* 피벗 베이스 - 크롬 질감 */}
          <div style={{ position: "absolute", width: px(32), height: px(32), top: 0, left: 0, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #fff 0%, #aaa 40%, #555 80%, #888 100%)", boxShadow: `0 ${px(6)}px ${px(18)}px rgba(0,0,0,0.8)` }} />
          {/* 안티스케이팅 다이얼 디테일 */}
          <div style={{ position: "absolute", width: px(12), height: px(12), top: px(10), left: px(25), borderRadius: "50%", background: "#222", border: '1px solid #444' }} />
          
          {/* 톤암 튜브 - 금속 헤어라인 질감 */}
          <div style={{ position: "absolute", width: px(7), height: armH - px(50), top: px(28), left: pivX - px(3.5), background: "linear-gradient(90deg, #e0e0e0 0%, #888 30%, #fff 60%, #999 100%)", borderRadius: px(3.5) }} />
          
          {/* 카트리지/헤드쉘 - 검은치마 포인트 */}
          <div style={{ position: "absolute", width: px(38), height: px(16), top: armH - px(52), left: px(-9), background: "linear-gradient(100deg, #333 0%, #111 100%)", borderRadius: `${px(2)}px ${px(6)}px ${px(2)}px ${px(2)}px`, transform: 'rotate(15deg)', border: '1px solid #000' }}>
            {/* 작은 검은치마 로고 'B' */}
            <span style={{color: '#fff', fontSize: px(10), fontWeight: 'bold', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)', opacity: 0.8}}>B</span>
          </div>
          
          {/* 스타일러스(바늘) - 재생 중일 때 퍼플 빛 */}
          <div
            style={{
              position: "absolute", width: px(2), height: px(18), top: armH - px(32), left: pivX + px(1),
              background: isPlaying ? `linear-gradient(180deg, #fff 0%, #9333ea 100%)` : "#666",
              boxShadow: isPlaying ? `0 0 ${px(10)}px #a855f7` : "none",
              transform: 'rotate(10deg)', transition: 'background 1s, box-shadow 1s'
            }}
          />
        </div>

        {/* ── [추가] 컨트롤 영역 (좌측 하단) ── */}
        {/* RPM 선택 버튼 */}
        <div style={{ position: 'absolute', bottom: px(40), left: px(30), display: 'flex', gap: px(6) }}>
          <div style={{ width: px(20), height: px(10), background: '#111', border: '1px solid #333', borderRadius: px(2), color: isPlaying ? '#aaa' : '#fff', fontSize: px(7), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>33</div>
          <div style={{ width: px(20), height: px(10), background: '#111', border: '1px solid #333', borderRadius: px(2), color: '#555', fontSize: px(7), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>45</div>
        </div>
        {/* Power LED (수정) */}
        <div
          style={{
            position: "absolute", bottom: px(41), left: px(85), width: px(9), height: px(9), borderRadius: "50%",
            background: isPlaying ? "#4ade80" : "#222",
            border: `1px solid ${isPlaying ? "#22c55e" : "#444"}`,
            boxShadow: isPlaying ? `0 0 ${px(12)}px rgba(74,222,128,0.8), inset 0 0 4px rgba(255,255,255,0.5)` : "inset 0 0 3px #000",
            transition: 'background 1s, box-shadow 1s'
          }}
        />
        
        {/* [추가] 톤암 리프터 레버 (우측 하단) */}
        <div style={{ position: 'absolute', bottom: px(40), right: px(70), width: px(4), height: px(25), background: 'linear-gradient(90deg, #888, #fff, #888)', borderRadius: px(2), transform: isPlaying ? 'rotate(10deg)' : 'rotate(-15deg)', transition: 'transform 1s cubic-bezier(0.23, 1, 0.32, 1)', transformOrigin: 'bottom center' }}>
          <div style={{ width: px(10), height: px(10), borderRadius: '50%', background: '#111', position: 'absolute', top: px(-5), left: px(-3), border: '1px solid #333' }} />
        </div>

      </div>
    </div>
  );
}