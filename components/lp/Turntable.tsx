"use client";

import { useEffect, useRef, useCallback } from "react";
import type { LP, PlayerState, LPSide } from "@/lib/types";

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

  /* ─── scale util: designed at size=520 ─── */
  const px = (n: number) => Math.round((n / 520) * size);

  /* ── Plinth dimensions ── */
  const W  = size;
  const H  = Math.round(size * 0.80);
  const platD = px(365);         // platter outer diameter
  const platX = px(32);          // platter left edge
  const platY = px(32);          // platter top
  const discD = px(335);         // vinyl disc
  const discX = platX + px(15);
  const discY = platY + px(15);
  const labelD = px(108);
  const armW   = px(190);
  const armH   = px(270);
  const pivX   = px(14);
  const pivY   = px(14);
  const tonearmDeg = isPlaying ? -4 + progress * 0.10 : 30;

  /* ── RAF physics spin ── */
  useEffect(() => {
    function tick(ts: number) {
      if (lastRef.current === null) lastRef.current = ts;
      const dt = Math.min(ts - lastRef.current, 80);
      lastRef.current = ts;

      const target = stateRef.current === "playing" ? DEG_PER_MS : 0;
      speedRef.current =
        target + (speedRef.current - target) * Math.exp(-dt / SPIN_TC);

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

  /* ── Click-to-seek on vinyl surface ── */
  const handleDisc = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onSeek) return;
      const el = e.currentTarget;
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
      const maxR  = r.width / 2;
      const inner = maxR * 0.17; // inside label
      const outer = maxR * 0.96;
      if (dist > inner && dist < outer) {
        const pct = 1 - (dist - inner) / (outer - inner);
        onSeek(Math.max(0, Math.min(100, pct * 100)));
      }
    },
    [onSeek]
  );

  const c = lp.coverColor;

  /* ── Vinyl surface layers based on vinylStyle ── */
  const stdGroove = `repeating-radial-gradient(circle at center, #0d0d0d 0px, #0d0d0d 1.1px, #191919 1.1px, #191919 2px, #0e0e0e 2px, #0e0e0e 3.2px, #181818 3.2px, #181818 4px, #0c0c0c 4px, #0c0c0c 5.5px)`;
  const sheen    = `conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.055) 9%, rgba(255,255,255,0.01) 16%, transparent 25%, transparent 54%, rgba(255,255,255,0.035) 62%, transparent 70%, transparent 100%)`;

  const vinylSurface = (() => {
    switch (lp.vinylStyle) {
      case "splatter": {
        // Team Baby: hand-splattered pink/magenta on dark base
        const spots = [
          `radial-gradient(circle ${px(38)}px at 22% 28%, ${c}bb, transparent 65%)`,
          `radial-gradient(circle ${px(20)}px at 68% 17%, ${c}99, transparent 70%)`,
          `radial-gradient(circle ${px(48)}px at 74% 70%, ${c}88, transparent 60%)`,
          `radial-gradient(circle ${px(16)}px at 38% 80%, ${c}cc, transparent 60%)`,
          `radial-gradient(circle ${px(30)}px at 88% 44%, ${c}77, transparent 65%)`,
          `radial-gradient(circle ${px(12)}px at 52% 55%, ${c}ee, transparent 60%)`,
          `radial-gradient(circle ${px(26)}px at 14% 65%, ${c}66, transparent 65%)`,
          `radial-gradient(circle ${px(10)}px at 45% 10%, ${c}dd, transparent 60%)`,
        ].join(",");
        return `${sheen}, ${spots}, ${stdGroove}`;
      }
      case "marble": {
        // Thirsty: smoke-transparent marble vinyl (dark crimson smoke)
        const smoke = [
          `conic-gradient(from 30deg at 38% 48%, ${c}28 0%, transparent 22%, ${c}18 42%, transparent 62%, ${c}22 82%, transparent 100%)`,
          `radial-gradient(ellipse 70% 45% at 42% 58%, ${c}44, transparent 70%)`,
          `radial-gradient(ellipse 45% 70% at 62% 28%, ${c}33, transparent 70%)`,
          `radial-gradient(ellipse 30% 55% at 18% 75%, ${c}22, transparent 65%)`,
        ].join(",");
        const marbleGroove = `repeating-radial-gradient(circle at center, #1a0808 0px, #1a0808 1.1px, #2a1212 1.1px, #2a1212 2px, #1c0a0a 2px, #1c0a0a 3.2px, #261010 3.2px, #261010 4px, #1a0808 4px, #1a0808 5.5px)`;
        return `${sheen}, ${smoke}, ${marbleGroove}`;
      }
      case "color": {
        // Translucent solid colored vinyl
        const colorGroove = `repeating-radial-gradient(circle at center, ${c}99 0px, ${c}99 1.1px, ${c}cc 1.1px, ${c}cc 2px, ${c}88 2px, ${c}88 3.2px, ${c}bb 3.2px, ${c}bb 4px, ${c}77 4px, ${c}77 5.5px)`;
        return `${sheen}, ${colorGroove}`;
      }
      default:
        // Standard black vinyl
        return `${sheen}, ${stdGroove}`;
    }
  })();

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: W, height: H }}
    >
      {/* ── Ambient underside glow ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "100%", height: "40%",
          bottom: -16, left: 0,
          background: `radial-gradient(ellipse, ${c}${isPlaying ? "60" : "25"} 0%, transparent 70%)`,
          filter: "blur(28px)",
          transition: "background 1.5s ease",
        }}
      />

      {/* ── Plinth cabinet ── */}
      <div
        className="relative overflow-hidden"
        style={{
          width: W, height: H,
          borderRadius: px(18),
          background:
            "linear-gradient(155deg, #2c1b0a 0%, #190e04 30%, #0a0500 60%, #1d1107 85%, #2e1b0a 100%)",
          boxShadow: [
            "0 60px 140px rgba(0,0,0,1)",
            "0 0 0 1px rgba(255,255,255,0.035)",
            "inset 0 1px 0 rgba(255,255,255,0.06)",
            "inset 0 -2px 0 rgba(0,0,0,0.7)",
          ].join(","),
        }}
      >
        {/* Wood grain texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: px(18),
            backgroundImage: [
              "repeating-linear-gradient(3deg, transparent 0, transparent 5px, rgba(255,255,255,0.006) 5px, rgba(255,255,255,0.006) 6px, transparent 6px, transparent 14px)",
              "repeating-linear-gradient(-1.5deg, transparent 0, transparent 9px, rgba(0,0,0,0.06) 9px, rgba(0,0,0,0.06) 11px)",
            ].join(","),
          }}
        />

        {/* Brushed chrome strip along top edge */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: px(12),
            borderRadius: `${px(18)}px ${px(18)}px 0 0`,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        />

        {/* ── Platter housing (chrome bearing ring) ── */}
        <div
          className="absolute rounded-full"
          style={{
            width: platD, height: platD,
            top: platY, left: platX,
            background: "radial-gradient(circle at 35% 30%, #545454, #111)",
            boxShadow: [
              `0 ${px(6)}px ${px(28)}px rgba(0,0,0,0.9)`,
              "inset 0 2px 6px rgba(255,255,255,0.07)",
              "inset 0 -2px 6px rgba(0,0,0,0.6)",
            ].join(","),
          }}
        />

        {/* ── Rubber felt mat ── */}
        <div
          className="absolute rounded-full"
          style={{
            width: platD - px(16), height: platD - px(16),
            top: platY + px(8), left: platX + px(8),
            background: "radial-gradient(circle at 38% 32%, #1e1e1e, #060606)",
            boxShadow:
              "inset 0 4px 16px rgba(0,0,0,0.95), inset 0 -1px 4px rgba(255,255,255,0.02)",
          }}
        >
          {/* Mat center slug */}
          <div
            className="absolute rounded-full"
            style={{
              width: px(18), height: px(18),
              top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              background: "#030303",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.9)",
            }}
          />
        </div>

        {/* ── LP Disc — RAF-rotated ── */}
        <div
          ref={discRef}
          className={onSeek ? "cursor-crosshair" : ""}
          style={{
            position: "absolute",
            width: discD, height: discD,
            top: discY, left: discX,
            borderRadius: "50%",
          }}
          onClick={handleDisc}
        >
          {/* Vinyl surface: groove rings + style-specific effect */}
          <div
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: vinylSurface,
              boxShadow: [
                "0 0 0 1px rgba(255,255,255,0.02)",
                "0 8px 32px rgba(0,0,0,0.75)",
              ].join(","),
            }}
          />

          {/* Iridescent oil-slick highlight */}
          <div
            style={{
              position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none",
              background:
                "radial-gradient(ellipse 55% 28% at 28% 18%, rgba(160,120,255,0.07), transparent 60%)",
            }}
          />

          {/* ── Center label ── */}
          <div
            style={{
              position: "absolute",
              width: labelD, height: labelD,
              top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              borderRadius: "50%",
              background: lp.coverUrl ? "transparent" : `radial-gradient(circle at 30% 25%, ${c}ff, ${c}bb)`,
              boxShadow: [
                `0 0 0 ${px(2)}px ${c}55`,
                `0 0 0 ${px(3)}px rgba(255,255,255,0.05)`,
                `0 ${px(4)}px ${px(16)}px rgba(0,0,0,0.7)`,
              ].join(","),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Real album cover image in label */}
            {lp.coverUrl && (
              <img
                src={lp.coverUrl}
                alt={lp.title}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", opacity: 0.88 }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            {/* Label gloss dome */}
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 28% 20%, rgba(255,255,255,0.18), transparent 52%)", pointerEvents: "none", zIndex: 2 }} />
            {/* Label concentric rings */}
            {[px(8), px(14), px(20)].map((inset) => (
              <div key={inset} style={{ position: "absolute", inset, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.10)", pointerEvents: "none", zIndex: 2 }} />
            ))}
            {/* Label text (only when no cover image) */}
            {!lp.coverUrl && (
              <>
                <p style={{ fontSize: px(8), color: "rgba(255,255,255,0.92)", fontWeight: 700, textAlign: "center", lineHeight: 1.2, padding: `0 ${px(8)}px`, zIndex: 3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", maxWidth: "100%" }}>
                  {lp.title}
                </p>
                <div style={{ width: px(36), height: 1, background: "rgba(255,255,255,0.18)", margin: `${px(3)}px 0 ${px(2)}px`, zIndex: 3 }} />
                <p style={{ fontSize: px(7), color: "rgba(255,255,255,0.55)", zIndex: 3 }}>{side}면</p>
                <p style={{ fontSize: px(5.5), color: "rgba(255,255,255,0.28)", zIndex: 3, marginTop: px(1) }}>{lp.label}</p>
              </>
            )}
          </div>

          {/* Spindle hole */}
          <div style={{ position: "absolute", width: px(7), height: px(7), top: "50%", left: "50%", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "#020202", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }} />
        </div>

        {/* ── Strobe dots ── */}
        <div
          style={{
            position: "absolute",
            bottom: platY + px(8),
            left: platX + platD / 2,
            transform: "translateX(-50%)",
            display: "flex",
            gap: px(3),
          }}
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: px(3.5), height: px(3.5),
                borderRadius: "50%",
                background: isPlaying
                  ? i % 4 === 0
                    ? "rgba(255,215,40,0.95)"
                    : "rgba(255,215,40,0.15)"
                  : "rgba(255,255,255,0.07)",
                transition: "background 0.5s",
              }}
            />
          ))}
        </div>

        {/* ── Tonearm assembly ── */}
        <div
          style={{
            position: "absolute",
            width: armW, height: armH,
            top: px(18), right: px(18),
            transformOrigin: `${pivX}px ${pivY}px`,
            transform: `rotate(${tonearmDeg}deg)`,
            transition: "transform 1.8s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          {/* Counterweight cylinder */}
          <div style={{ position: "absolute", width: px(22), height: px(22), top: px(-12), left: px(2), borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #787878, #1c1c1c)", boxShadow: `0 ${px(2)}px ${px(10)}px rgba(0,0,0,0.6)` }} />
          {/* Pivot base disc */}
          <div style={{ position: "absolute", width: px(28), height: px(28), top: 0, left: 0, borderRadius: "50%", background: "radial-gradient(circle at 28% 25%, #aaaaaa, #2a2a2a)", boxShadow: [`0 ${px(4)}px ${px(14)}px rgba(0,0,0,0.7)`, `inset 0 ${px(1)}px 0 rgba(255,255,255,0.25)`].join(",") }} />
          {/* Arm shaft */}
          <div style={{ position: "absolute", width: px(6), height: armH - px(52), top: px(28), left: pivX - px(3), background: "linear-gradient(90deg, #b8b8b8 0%, #5a5a5a 40%, #d0d0d0 65%, #6a6a6a 100%)", borderRadius: px(3), boxShadow: `${px(1.5)}px 0 ${px(5)}px rgba(0,0,0,0.45)` }} />
          {/* S-bend */}
          <div style={{ position: "absolute", width: px(26), height: px(18), top: armH - px(64), left: px(1), borderLeft: `${px(5)}px solid #909090`, borderBottom: `${px(5)}px solid #909090`, borderRadius: `0 0 0 ${px(10)}px` }} />
          {/* Headshell */}
          <div style={{ position: "absolute", width: px(34), height: px(13), top: armH - px(50), left: px(-7), background: "linear-gradient(90deg, #c8c8c8, #6e6e6e 55%, #c0c0c0 100%)", borderRadius: px(4), boxShadow: `0 ${px(2)}px ${px(8)}px rgba(0,0,0,0.5)` }} />
          {/* Cartridge body */}
          <div style={{ position: "absolute", width: px(18), height: px(10), top: armH - px(38), left: px(2), background: "linear-gradient(180deg, #7a7a7a, #292929)", borderRadius: px(2) }} />
          {/* Stylus */}
          <div
            style={{
              position: "absolute",
              width: px(2), height: px(20),
              top: armH - px(30),
              left: pivX - px(1),
              borderRadius: `0 0 ${px(2)}px ${px(2)}px`,
              background: isPlaying
                ? `linear-gradient(180deg, #d0d0d0 0%, #7c3aed 100%)`
                : `linear-gradient(180deg, #c0c0c0 0%, #808080 100%)`,
              boxShadow: isPlaying
                ? `0 0 ${px(9)}px rgba(124,58,237,0.95), 0 0 ${px(22)}px rgba(124,58,237,0.35)`
                : "none",
              transition: "box-shadow 0.7s ease, background 0.7s ease",
            }}
          />
          {/* Cantilever contact glow when playing */}
          {isPlaying && (
            <div
              style={{
                position: "absolute",
                width: px(10), height: px(10),
                top: armH - px(12),
                left: pivX - px(5),
                borderRadius: "50%",
                background: "rgba(167,139,250,0.35)",
                filter: `blur(${px(4)}px)`,
                animation: "stylus-pulse 1.2s ease-in-out infinite alternate",
              }}
            />
          )}
        </div>

        {/* ── Indicator panel (right strip) ── */}
        <div
          style={{
            position: "absolute",
            top: px(110), right: px(18),
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: px(8),
          }}
        >
          {/* Power LED */}
          <div
            style={{
              width: px(8), height: px(8),
              borderRadius: "50%",
              background: isPlaying ? "#4ade80" : "#141414",
              boxShadow: isPlaying
                ? `0 0 ${px(9)}px rgba(74,222,128,0.9), 0 0 ${px(20)}px rgba(74,222,128,0.3)`
                : "none",
              transition: "all 0.5s",
            }}
          />
          {/* Speed labels */}
          {["33⅓", "45"].map((s, i) => (
            <p
              key={s}
              style={{
                fontSize: px(7.5),
                fontFamily: "monospace",
                color: i === 0 ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.09)",
                letterSpacing: "0.05em",
              }}
            >
              {s}
            </p>
          ))}
        </div>

        {/* ── Bottom brand plate ── */}
        <div
          style={{
            position: "absolute",
            bottom: px(14), right: px(22),
            fontSize: px(8),
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.08)",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          LP Player
        </div>

        {/* Top chrome highlight */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, borderRadius: `${px(18)}px ${px(18)}px 0 0`, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)", pointerEvents: "none" }} />
      </div>

      {/* Stylus pulse keyframe */}
      <style>{`
        @keyframes stylus-pulse {
          from { opacity: 0.35; transform: scale(0.8); }
          to   { opacity: 0.9;  transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
