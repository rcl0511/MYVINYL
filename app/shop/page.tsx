"use client";

import { useState } from "react";

type ShopCategory = "skin" | "lp" | "background" | "sticker";

interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  description: string;
  price: number;
  color: string;
  accent: string;
  owned?: boolean;
  popular?: boolean;
  isNew?: boolean;
}

const CATEGORIES: { key: ShopCategory; label: string }[] = [
  { key: "skin",       label: "턴테이블 스킨" },
  { key: "lp",         label: "LP판 디자인" },
  { key: "background", label: "배경화면" },
  { key: "sticker",    label: "스티커 팩" },
];

const SHOP_ITEMS: ShopItem[] = [
  // Turntable skins
  { id: "s1", category: "skin", name: "로즈우드",      description: "따뜻한 나무 결이 살아있는 빈티지 스킨",      price: 1200, color: "#5c2d2d", accent: "#fcd34d", popular: true },
  { id: "s2", category: "skin", name: "마블 블랙",     description: "세련된 블랙 마블 패턴의 고급스러운 스킨",   price: 1500, color: "#1a1a1a", accent: "#9CA3AF" },
  { id: "s3", category: "skin", name: "크림 빈티지",   description: "복고풍 크림 색상의 레트로 스킨",             price: 900,  color: "#d4c5a0", accent: "#78350f", owned: true },
  { id: "s4", category: "skin", name: "네온 퍼플",     description: "형광빛 퍼플 컬러의 모던 스킨",               price: 1800, color: "#5B21B6", accent: "#a78bfa", isNew: true },
  // LP designs
  { id: "l1", category: "lp",   name: "컬러 비닐 팩", description: "레드/블루/그린 컬러 비닐 3종 세트",          price: 2000, color: "#b91c1c", accent: "#fca5a5", popular: true },
  { id: "l2", category: "lp",   name: "픽처 디스크",  description: "앨범 아트워크가 새겨진 픽처 디스크",         price: 2500, color: "#1e3a5f", accent: "#7dd3fc" },
  { id: "l3", category: "lp",   name: "골드 에디션",  description: "빛나는 골드 컬러 LP",                        price: 3000, color: "#78350f", accent: "#fcd34d", isNew: true },
  { id: "l4", category: "lp",   name: "스모키 그레이", description: "시크한 스모키 그레이 반투명 LP",             price: 1200, color: "#374151", accent: "#9CA3AF" },
  // Backgrounds
  { id: "b1", category: "background", name: "재즈 바",      description: "따뜻한 조명의 재즈 바 배경",             price: 800,  color: "#1a0d00", accent: "#fcd34d" },
  { id: "b2", category: "background", name: "레코드 스토어", description: "LP로 가득한 레코드 스토어 배경",        price: 800,  color: "#1a2f1a", accent: "#6ee7b7", popular: true },
  { id: "b3", category: "background", name: "노을빛 루프탑", description: "도시 전경이 보이는 루프탑 배경",        price: 1000, color: "#7f1d1d", accent: "#fca5a5", owned: true },
  { id: "b4", category: "background", name: "우주",          description: "별이 가득한 우주 배경",                 price: 1200, color: "#0c0f1a", accent: "#a78bfa", isNew: true },
  // Sticker packs
  { id: "st1", category: "sticker", name: "빈티지 팩",   description: "카세트, 기타, 노트 등 빈티지 스티커 12종",  price: 600,  color: "#78350f", accent: "#fcd34d" },
  { id: "st2", category: "sticker", name: "이모지 팩",   description: "음악 관련 이모지 스티커 20종",              price: 500,  color: "#5B21B6", accent: "#EDE9F8", popular: true },
  { id: "st3", category: "sticker", name: "K-팝 팩",     description: "K-팝 테마 스티커 15종",                    price: 800,  color: "#831843", accent: "#fbcfe8", isNew: true },
  { id: "st4", category: "sticker", name: "클래식 팩",   description: "음표, 악기 클래식 스티커 10종",             price: 500,  color: "#1e3a5f", accent: "#7dd3fc" },
];

export default function ShopPage() {
  const [category, setCategory] = useState<ShopCategory>("skin");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set(SHOP_ITEMS.filter(i => i.owned).map(i => i.id)));

  const items = SHOP_ITEMS.filter((i) => i.category === category);

  function handleBuy(item: ShopItem) {
    if (purchasedIds.has(item.id)) return;
    setPurchasedIds((prev) => new Set([...prev, item.id]));
  }

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lp-primary mb-2">아이템 상점</h1>
        <p className="text-lp-secondary text-sm">턴테이블과 LP를 나만의 스타일로 꾸며보세요</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-8 border-b border-lp-border">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`px-6 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              category === key
                ? "border-lp-accent text-lp-accent"
                : "border-transparent text-lp-secondary hover:text-lp-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const isOwned = purchasedIds.has(item.id);
          const isPreviewing = previewId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-lp-border overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Preview area */}
              <div
                className="relative h-44 flex items-center justify-center"
                style={{ background: `radial-gradient(circle at 30% 30%, ${item.color}dd, ${item.color})` }}
              >
                {/* Visual preview by category */}
                {item.category === "skin" && (
                  <div className="relative w-28 h-28 rounded-full"
                    style={{ background: `radial-gradient(135deg, ${item.color}44, ${item.color})`, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                    <div className="absolute inset-6 rounded-full" style={{ background: `conic-gradient(${item.accent}44, #111 50%, ${item.accent}22)` }} />
                    <div className="absolute w-5 h-5 rounded-full bg-black/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                )}
                {item.category === "lp" && (
                  <div className="relative w-24 h-24 rounded-full"
                    style={{ background: `conic-gradient(${item.color}, #111 30%, ${item.color}88 60%, #000 80%, ${item.color})`, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                    <div className="absolute inset-0 rounded-full" style={{ background: "repeating-radial-gradient(circle, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)" }} />
                    <div className="absolute w-8 h-8 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: item.accent }} />
                  </div>
                )}
                {item.category === "background" && (
                  <div className="text-4xl">🎵</div>
                )}
                {item.category === "sticker" && (
                  <div className="flex flex-wrap gap-2 justify-center px-4">
                    {["🎵", "⭐", "🎸", "🌙", "✨"].map((s) => (
                      <span key={s} className="text-2xl">{s}</span>
                    ))}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {item.popular && (
                    <span className="px-2 py-0.5 bg-lp-accent-btn text-white text-xs rounded-full font-medium">인기</span>
                  )}
                  {item.isNew && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">NEW</span>
                  )}
                  {isOwned && (
                    <span className="px-2 py-0.5 bg-gray-700/80 text-white text-xs rounded-full font-medium">보유중</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lp-primary text-sm mb-1">{item.name}</h3>
                <p className="text-lp-tertiary text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-lp-primary">
                    {item.price.toLocaleString()}
                    <span className="text-xs font-normal text-lp-tertiary ml-1">P</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewId(isPreviewing ? null : item.id)}
                      className="px-3 py-1.5 text-xs border border-lp-border rounded-lg text-lp-secondary hover:border-lp-accent hover:text-lp-accent transition-colors"
                    >
                      미리보기
                    </button>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={isOwned}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        isOwned
                          ? "bg-lp-chip text-lp-tertiary cursor-not-allowed"
                          : "bg-lp-accent-btn text-white hover:bg-lp-accent"
                      }`}
                    >
                      {isOwned ? "보유중" : "구매"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview expanded */}
              {isPreviewing && (
                <div className="border-t border-lp-border px-4 pb-4 pt-3 bg-lp-bg">
                  <p className="text-lp-secondary text-xs leading-relaxed">{item.description}</p>
                  <p className="text-lp-tertiary text-xs mt-2">
                    구매 후 커스텀 에디터에서 적용 가능합니다.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Coin balance banner */}
      <div className="mt-12 bg-gradient-to-r from-lp-accent to-lp-accent-btn rounded-2xl px-8 py-6 flex items-center justify-between text-white">
        <div>
          <p className="text-white/70 text-sm">보유 포인트</p>
          <p className="text-3xl font-bold mt-1">5,000 P</p>
        </div>
        <button className="px-6 py-3 bg-white text-lp-accent font-semibold rounded-xl text-sm hover:bg-white/90 transition-colors">
          포인트 충전
        </button>
      </div>
    </div>
  );
}
