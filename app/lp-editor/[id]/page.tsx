"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { getLPById } from "@/lib/mock-data";
import type { LP } from "@/lib/types";

// ─── Preset definitions ────────────────────────────────────────────────────
const PRESETS = [
  { id: "p1", name: "Classic Black",  color: "#1a1a1a", accent: "#ffffff", pattern: "grooves" },
  { id: "p2", name: "Violet Dream",   color: "#5B21B6", accent: "#EDE9F8", pattern: "swirl" },
  { id: "p3", name: "Midnight Jazz",  color: "#1a3a5c", accent: "#93c5fd", pattern: "dots" },
  { id: "p4", name: "Forest Green",   color: "#064e3b", accent: "#6ee7b7", pattern: "waves" },
  { id: "p5", name: "Crimson",        color: "#7f1d1d", accent: "#fca5a5", pattern: "grooves" },
  { id: "p6", name: "Amber",          color: "#78350f", accent: "#fcd34d", pattern: "swirl" },
  { id: "p7", name: "Ocean Blue",     color: "#1e3a5f", accent: "#7dd3fc", pattern: "waves" },
  { id: "p8", name: "Sakura",         color: "#831843", accent: "#fbcfe8", pattern: "dots" },
];

const COLORS = [
  "#1a1a1a", "#5B21B6", "#1a3a5c", "#064e3b",
  "#7f1d1d", "#78350f", "#0c4a6e", "#1e1b4b",
  "#7C3AED", "#2563EB", "#059669", "#DC2626",
];

const PATTERNS = [
  { id: "grooves", label: "그루브" },
  { id: "swirl",   label: "소용돌이" },
  { id: "dots",    label: "도트" },
  { id: "waves",   label: "웨이브" },
];

const SHAPES = [
  { id: "12inch",   label: '12인치',      desc: "표준 LP" },
  { id: "7inch",    label: '7인치',       desc: "싱글" },
  { id: "colored",  label: "컬러 비닐",   desc: "유색 LP" },
  { id: "picture",  label: "픽처 디스크", desc: "그림 LP" },
];

const STICKERS = ["🎵", "⭐", "🌙", "🌊", "🔥", "❤️", "✨", "🎸", "🎹", "🎺", "🎻", "🥁"];

type EditorTab = "preset" | "simple" | "advanced";

interface CustomConfig {
  presetId: string | null;
  color: string;
  accentColor: string;
  pattern: string;
  shape: string;
  labelText: string;
  stickers: string[];
}

// ─── Mini LP Preview ────────────────────────────────────────────────────────
function LPPreview({ lp, config }: { lp: LP; config: CustomConfig }) {
  const displayColor = config.color || lp.coverColor;
  const isColored = config.shape === "colored";
  const isPicture = config.shape === "picture";
  const is7inch = config.shape === "7inch";
  const size = is7inch ? "w-48 h-48" : "w-72 h-72";

  return (
    <div className={`relative ${size} mx-auto`}>
      {/* Base shadow */}
      <div className="absolute inset-0 rounded-full" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }} />

      {/* LP disc */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: isPicture
            ? `conic-gradient(from 0deg, ${displayColor}, #111 30%, ${displayColor}88 60%, #000 80%, ${displayColor})`
            : isColored
            ? `radial-gradient(circle, ${displayColor}dd, ${displayColor}88)`
            : `conic-gradient(from 0deg, ${displayColor}, #111 30%, ${displayColor}88 60%, #000 80%, ${displayColor})`,
        }}
      >
        {/* Groove rings */}
        {[40, 35, 30, 25, 20, 15].map((pct) => (
          <div
            key={pct}
            className="absolute rounded-full border border-white/[0.06]"
            style={{ inset: `${pct}px` }}
          />
        ))}

        {/* Center label */}
        <div
          className="absolute rounded-full flex flex-col items-center justify-center"
          style={{
            width: is7inch ? 48 : 72,
            height: is7inch ? 48 : 72,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: config.accentColor,
          }}
        >
          <span className="text-black/70 font-bold text-center leading-none" style={{ fontSize: is7inch ? 5 : 7 }}>
            {config.labelText || lp.title}
          </span>
        </div>

        {/* Spindle */}
        <div
          className="absolute w-2 h-2 rounded-full bg-gray-900"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />

        {/* Stickers */}
        {config.stickers.slice(0, 3).map((s, i) => (
          <span
            key={i}
            className="absolute text-xl"
            style={{
              top: `${25 + i * 20}%`,
              left: `${15 + i * 15}%`,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Shape label badge */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="px-3 py-1 bg-lp-chip text-lp-secondary text-xs rounded-full">
          {SHAPES.find((s) => s.id === config.shape)?.label ?? "12인치"}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function LPEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const lpFound = getLPById(id);
  if (!lpFound) notFound();
  const lp = lpFound!;

  const [tab, setTab] = useState<EditorTab>("preset");
  const [config, setConfig] = useState<CustomConfig>({
    presetId: null,
    color: lp.coverColor,
    accentColor: "#ffffff",
    pattern: "grooves",
    shape: "12inch",
    labelText: "",
    stickers: [],
  });
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  /* 저장된 커스텀 설정 불러오기 */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`lp-custom-${id}`);
      if (stored) setConfig(JSON.parse(stored));
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, [id]);

  function applyPreset(preset: typeof PRESETS[0]) {
    setConfig((c) => ({
      ...c,
      presetId: preset.id,
      color: preset.color,
      accentColor: preset.accent,
      pattern: preset.pattern,
    }));
  }

  function handleSave() {
    try {
      localStorage.setItem(`lp-custom-${id}`, JSON.stringify(config));
    } catch {
      // localStorage 접근 불가 시 무시
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setConfig({
      presetId: null,
      color: lp.coverColor,
      accentColor: "#ffffff",
      pattern: "grooves",
      shape: "12inch",
      labelText: "",
      stickers: [],
    });
    setShowResetConfirm(false);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-lp-bg">
      {/* Left: Preview panel */}
      <div className="w-[420px] shrink-0 bg-lp-nav flex flex-col items-center px-8 py-10">
        {/* Back */}
        <div className="w-full mb-8">
          <Link
            href={`/player/${lp.id}`}
            className="inline-flex items-center gap-1.5 text-white/60 text-sm hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            재생 화면으로
          </Link>
        </div>

        <h2 className="text-white font-bold text-lg mb-2">미리보기</h2>
        <p className="text-white/40 text-xs mb-12">{lp.title} — {lp.artist}</p>

        {/* LP Preview */}
        <div className="flex items-center justify-center mb-16">
          <LPPreview lp={lp} config={config} />
        </div>

        {/* Shape presets */}
        <div className="w-full mt-4">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">LP 모양</p>
          <div className="grid grid-cols-2 gap-2">
            {SHAPES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setConfig((c) => ({ ...c, shape: shape.id }))}
                className={`px-3 py-2.5 rounded-xl text-left transition-colors border ${
                  config.shape === shape.id
                    ? "bg-lp-accent border-lp-accent text-white"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                <p className="text-sm font-medium">{shape.label}</p>
                <p className="text-xs opacity-60 mt-0.5">{shape.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Save / Reset */}
        <div className="w-full mt-8 space-y-2">
          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
              saved
                ? "bg-green-500 text-white"
                : "bg-lp-accent-btn text-white hover:bg-lp-accent"
            }`}
          >
            {saved ? "✓ 저장 완료!" : "커스텀 저장"}
          </button>
          {showResetConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm border border-white/20 text-white/60 hover:bg-white/5 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                초기화 확인
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 rounded-xl text-sm border border-white/20 text-white/60 hover:bg-white/5 transition-colors"
            >
              기본값으로 초기화
            </button>
          )}
        </div>
      </div>

      {/* Right: Editor panel */}
      <div className="flex-1 overflow-y-auto">
        {/* Tab bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-lp-border px-8 py-0 flex items-center">
          {(["preset", "simple", "advanced"] as EditorTab[]).map((t) => {
            const labels = { preset: "프리셋 선택", simple: "간단 편집", advanced: "고급 편집" };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? "border-lp-accent text-lp-accent"
                    : "border-transparent text-lp-secondary hover:text-lp-primary"
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>

        <div className="px-8 py-8">
          {/* ── Preset tab ── */}
          {tab === "preset" && (
            <div>
              <h3 className="text-lp-primary font-semibold mb-1">테마 프리셋</h3>
              <p className="text-lp-secondary text-sm mb-6">마음에 드는 스타일을 선택하면 즉시 미리보기에 반영됩니다.</p>
              <div className="grid grid-cols-2 gap-4">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all text-left group ${
                      config.presetId === preset.id
                        ? "border-lp-accent shadow-lg scale-[1.02]"
                        : "border-transparent hover:border-lp-border hover:shadow-md"
                    }`}
                  >
                    {/* Swatch */}
                    <div
                      className="h-28 flex items-center justify-center relative"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${preset.color}ee, ${preset.color})`,
                      }}
                    >
                      {/* Mini disc */}
                      <div
                        className="w-16 h-16 rounded-full"
                        style={{
                          background: `conic-gradient(${preset.color}, #111 30%, ${preset.color}88 60%, #000 80%, ${preset.color})`,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                        }}
                      >
                        <div
                          className="absolute w-6 h-6 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-white">
                      <p className="font-semibold text-sm text-lp-primary">{preset.name}</p>
                      <p className="text-xs text-lp-tertiary capitalize">{preset.pattern}</p>
                    </div>
                    {config.presetId === preset.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-lp-accent flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Simple tab ── */}
          {tab === "simple" && (
            <div className="space-y-8">
              {/* Color */}
              <div>
                <h3 className="text-lp-primary font-semibold mb-1">LP 색상</h3>
                <p className="text-lp-secondary text-sm mb-4">LP판의 메인 색상을 선택하세요.</p>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setConfig((c) => ({ ...c, color: col, presetId: null }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        config.color === col ? "border-lp-accent scale-110 shadow-md" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                  {/* Custom color picker */}
                  <div className="relative">
                    <input
                      type="color"
                      value={config.color}
                      onChange={(e) => setConfig((c) => ({ ...c, color: e.target.value, presetId: null }))}
                      className="w-10 h-10 rounded-full cursor-pointer border-2 border-dashed border-lp-border p-0.5"
                      title="직접 선택"
                    />
                  </div>
                </div>
              </div>

              {/* Pattern */}
              <div>
                <h3 className="text-lp-primary font-semibold mb-1">패턴</h3>
                <p className="text-lp-secondary text-sm mb-4">LP판 표면 패턴을 선택하세요.</p>
                <div className="grid grid-cols-4 gap-3">
                  {PATTERNS.map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() => setConfig((c) => ({ ...c, pattern: pat.id }))}
                      className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                        config.pattern === pat.id
                          ? "bg-lp-accent-light border-lp-accent text-lp-accent"
                          : "bg-white border-lp-border text-lp-secondary hover:border-lp-accent"
                      }`}
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label text */}
              <div>
                <h3 className="text-lp-primary font-semibold mb-1">라벨 텍스트</h3>
                <p className="text-lp-secondary text-sm mb-4">가운데 라벨에 표시될 텍스트를 입력하세요.</p>
                <input
                  type="text"
                  value={config.labelText}
                  onChange={(e) => setConfig((c) => ({ ...c, labelText: e.target.value }))}
                  placeholder={lp.title}
                  maxLength={20}
                  className="w-full px-4 py-3 border border-lp-border rounded-xl text-sm text-lp-primary placeholder:text-lp-tertiary outline-none focus:border-lp-accent transition-colors"
                />
                <p className="text-lp-tertiary text-xs mt-1.5 text-right">{config.labelText.length}/20</p>
              </div>

              {/* Label accent color */}
              <div>
                <h3 className="text-lp-primary font-semibold mb-1">라벨 색상</h3>
                <p className="text-lp-secondary text-sm mb-4">가운데 라벨 배경 색상을 선택하세요.</p>
                <div className="flex flex-wrap gap-3">
                  {["#ffffff", "#EDE9F8", "#FEF3C7", "#D1FAE5", "#DBEAFE", "#FFE4E6", "#F3F4F6"].map((col) => (
                    <button
                      key={col}
                      onClick={() => setConfig((c) => ({ ...c, accentColor: col }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        config.accentColor === col ? "border-lp-accent scale-110 shadow-md" : "border-lp-border hover:scale-105"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Advanced tab ── */}
          {tab === "advanced" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lp-primary font-semibold mb-1">스티커 레이어</h3>
                <p className="text-lp-secondary text-sm mb-4">
                  스티커를 추가하면 LP 미리보기에 최대 3개까지 표시됩니다.
                </p>
                <div className="grid grid-cols-6 gap-3">
                  {STICKERS.map((s) => {
                    const added = config.stickers.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() =>
                          setConfig((c) => ({
                            ...c,
                            stickers: added
                              ? c.stickers.filter((x) => x !== s)
                              : c.stickers.length < 3
                              ? [...c.stickers, s]
                              : c.stickers,
                          }))
                        }
                        className={`aspect-square rounded-xl text-2xl flex items-center justify-center border-2 transition-all ${
                          added
                            ? "border-lp-accent bg-lp-accent-light scale-105"
                            : "border-lp-border bg-white hover:border-lp-accent hover:scale-105"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                <p className="text-lp-tertiary text-xs mt-3">
                  선택됨: {config.stickers.length}/3
                  {config.stickers.length > 0 && (
                    <button
                      onClick={() => setConfig((c) => ({ ...c, stickers: [] }))}
                      className="ml-3 text-lp-danger hover:underline"
                    >
                      전체 삭제
                    </button>
                  )}
                </p>
              </div>

              {/* Position note */}
              <div className="bg-lp-accent-light rounded-xl p-4">
                <p className="text-lp-accent text-sm font-medium mb-1">위치/크기 조절 안내</p>
                <p className="text-lp-secondary text-xs leading-relaxed">
                  스티커의 위치와 크기는 LP 모양에 따라 자동으로 배치됩니다.
                  더 세밀한 조절은 추후 업데이트에서 지원될 예정입니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
