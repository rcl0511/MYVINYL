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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-lp-primary mb-2">아이템 상점</h1>
        <p className="text-lp-secondary text-sm">턴테이블과 LP를 나만의 스타일로 꾸며보세요</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-6 sm:mb-8 border-b border-lp-border overflow-x-auto">
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
                className="relative h-48 flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(145deg, ${item.color}cc 0%, ${item.color}55 50%, #0a0a0a 100%)` }}
              >
                {/* Turntable skin: top-down platter + tonearm */}
                {item.category === "skin" && (
                  <svg viewBox="0 0 160 160" className="w-40 h-40" style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.7))" }}>
                    <defs>
                      <radialGradient id={`platter-${item.id}`} cx="40%" cy="36%" r="68%">
                        <stop offset="0%" stopColor={item.color} stopOpacity="0.9"/>
                        <stop offset="60%" stopColor={item.color} stopOpacity="0.55"/>
                        <stop offset="100%" stopColor="#080808"/>
                      </radialGradient>
                      <radialGradient id={`mat-${item.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={item.accent} stopOpacity="0.35"/>
                        <stop offset="100%" stopColor={item.accent} stopOpacity="0.08"/>
                      </radialGradient>
                      <radialGradient id={`hub-${item.id}`} cx="38%" cy="32%" r="66%">
                        <stop offset="0%" stopColor={item.accent}/>
                        <stop offset="100%" stopColor={item.color}/>
                      </radialGradient>
                    </defs>
                    {/* Platter body */}
                    <circle cx="78" cy="82" r="68" fill="url(#platter-${item.id})"/>
                    <circle cx="78" cy="82" r="68" fill={`url(#platter-${item.id})`}/>
                    {/* Platter edge grip ridges */}
                    <circle cx="78" cy="82" r="67" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>
                    <circle cx="78" cy="82" r="65" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
                    <circle cx="78" cy="82" r="63" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5"/>
                    {/* Rubber mat */}
                    <circle cx="78" cy="82" r="60" fill={`url(#mat-${item.id})`}/>
                    <circle cx="78" cy="82" r="60" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>
                    {/* Mat groove rings */}
                    <circle cx="78" cy="82" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.7"/>
                    <circle cx="78" cy="82" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.7"/>
                    <circle cx="78" cy="82" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.7"/>
                    {/* Center hub */}
                    <circle cx="78" cy="82" r="14" fill={`url(#hub-${item.id})`}/>
                    <circle cx="78" cy="82" r="14" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
                    <circle cx="78" cy="82" r="5" fill="rgba(0,0,0,0.7)"/>
                    <circle cx="78" cy="82" r="2.5" fill="#0a0a0a"/>
                    {/* Tonearm base */}
                    <circle cx="142" cy="26" r="9" fill="rgba(200,200,200,0.25)"/>
                    <circle cx="142" cy="26" r="6" fill="rgba(255,255,255,0.15)"/>
                    {/* Tonearm tube */}
                    <line x1="142" y1="26" x2="90" y2="84" stroke="rgba(255,255,255,0.45)" strokeWidth="2.2" strokeLinecap="round"/>
                    {/* Headshell */}
                    <ellipse cx="88" cy="86" rx="7" ry="4" fill="rgba(255,255,255,0.3)" transform="rotate(-45 88 86)"/>
                    {/* Stylus */}
                    <line x1="91" y1="89" x2="94" y2="94" stroke={item.accent} strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="94" cy="94" r="2" fill={item.accent}/>
                  </svg>
                )}

                {/* LP design: detailed vinyl record */}
                {item.category === "lp" && (
                  <svg viewBox="0 0 160 160" className="w-40 h-40" style={{ filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.75))" }}>
                    <defs>
                      <radialGradient id={`rec-${item.id}`} cx="36%" cy="30%" r="75%">
                        <stop offset="0%" stopColor={item.color} stopOpacity="0.65"/>
                        <stop offset="45%" stopColor="#0d0d0d"/>
                        <stop offset="100%" stopColor="#040404"/>
                      </radialGradient>
                      <radialGradient id={`lbl-${item.id}`} cx="36%" cy="30%" r="72%">
                        <stop offset="0%" stopColor={item.accent} stopOpacity="0.95"/>
                        <stop offset="65%" stopColor={item.accent} stopOpacity="0.7"/>
                        <stop offset="100%" stopColor={item.color} stopOpacity="0.5"/>
                      </radialGradient>
                      <radialGradient id={`gloss-${item.id}`} cx="28%" cy="22%" r="55%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.13)"/>
                        <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                      </radialGradient>
                    </defs>
                    {/* Record body */}
                    <circle cx="80" cy="80" r="75" fill={`url(#rec-${item.id})`}/>
                    <circle cx="80" cy="80" r="75" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6"/>
                    {/* Groove rings */}
                    {[70,65,60,55,50,45,40,35,30].map((r) => (
                      <circle key={r} cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.7"/>
                    ))}
                    {/* Lead-out groove */}
                    <circle cx="80" cy="80" r="26" fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth="0.9"/>
                    {/* Center label */}
                    <circle cx="80" cy="80" r="22" fill={`url(#lbl-${item.id})`}/>
                    <circle cx="80" cy="80" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6"/>
                    {/* Spindle hole */}
                    <circle cx="80" cy="80" r="5" fill="#050505"/>
                    <circle cx="80" cy="80" r="3.5" fill="#020202"/>
                    {/* Gloss overlay */}
                    <circle cx="80" cy="80" r="75" fill={`url(#gloss-${item.id})`}/>
                  </svg>
                )}

                {/* Background: atmospheric scene */}
                {item.category === "background" && (
                  <svg viewBox="0 0 200 140" className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <linearGradient id={`sky-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={item.color}/>
                        <stop offset="100%" stopColor={item.accent} stopOpacity="0.5"/>
                      </linearGradient>
                    </defs>
                    <rect width="200" height="140" fill={`url(#sky-${item.id})`}/>
                    {/* Scene variants */}
                    {item.id === "b1" && <>
                      {/* Jazz bar — warm lamplight circles + bar silhouette */}
                      <ellipse cx="100" cy="40" rx="30" ry="20" fill="rgba(252,211,77,0.15)"/>
                      <ellipse cx="50" cy="55" rx="18" ry="12" fill="rgba(252,211,77,0.10)"/>
                      <ellipse cx="155" cy="50" rx="18" ry="12" fill="rgba(252,211,77,0.10)"/>
                      <rect x="0" y="95" width="200" height="45" fill="rgba(0,0,0,0.6)"/>
                      <rect x="20" y="70" width="12" height="25" rx="1" fill="rgba(0,0,0,0.75)"/>
                      <rect x="80" y="60" width="10" height="35" rx="1" fill="rgba(0,0,0,0.75)"/>
                      <rect x="140" y="65" width="14" height="30" rx="1" fill="rgba(0,0,0,0.75)"/>
                      <circle cx="100" cy="35" r="4" fill="rgba(252,211,77,0.5)"/>
                      <circle cx="50" cy="50" r="2.5" fill="rgba(252,211,77,0.4)"/>
                      <circle cx="155" cy="45" r="2.5" fill="rgba(252,211,77,0.4)"/>
                    </>}
                    {item.id === "b2" && <>
                      {/* Record store — shelves */}
                      <rect x="0" y="85" width="200" height="55" fill="rgba(0,0,0,0.5)"/>
                      {[15,35,55,75,95,115,135,155,175].map((x) => (
                        <rect key={x} x={x} y={60} width={14} height={25} rx="1" fill={`rgba(${Math.floor(Math.random()*100)+80},${Math.floor(Math.random()*60)+20},${Math.floor(Math.random()*80)+40},0.7)`}/>
                      ))}
                      <rect x="0" y="85" width="200" height="4" fill="rgba(255,255,255,0.07)"/>
                      <rect x="0" y="105" width="200" height="3" fill="rgba(255,255,255,0.05)"/>
                      {[15,35,55,75,95,115,135,155,175].map((x, i) => (
                        <rect key={x+200} x={x} y={107} width={14} height={18} rx="1" fill={`rgba(${60+i*18},${40+i*8},${120-i*10},0.65)`}/>
                      ))}
                    </>}
                    {item.id === "b3" && <>
                      {/* Sunset rooftop */}
                      <ellipse cx="100" cy="80" rx="90" ry="40" fill="rgba(251,146,60,0.25)"/>
                      <rect x="0" y="95" width="200" height="45" fill="rgba(0,0,0,0.65)"/>
                      <rect x="10" y="50" width="22" height="45" rx="1" fill="rgba(0,0,0,0.7)"/>
                      <rect x="55" y="35" width="30" height="60" rx="1" fill="rgba(0,0,0,0.7)"/>
                      <rect x="110" y="45" width="18" height="50" rx="1" fill="rgba(0,0,0,0.7)"/>
                      <rect x="148" y="30" width="25" height="65" rx="1" fill="rgba(0,0,0,0.7)"/>
                      <rect x="25" y="60" width="6" height="3" fill="rgba(252,165,165,0.3)"/>
                      <rect x="70" y="52" width="6" height="3" fill="rgba(252,165,165,0.3)"/>
                    </>}
                    {item.id === "b4" && <>
                      {/* Space — stars */}
                      {[
                        [20,15],[45,8],[80,22],[120,10],[160,18],[190,5],
                        [10,40],[35,55],[65,35],[100,48],[140,38],[175,50],
                        [25,70],[55,80],[90,65],[130,75],[170,68],[195,80],
                        [15,95],[50,100],[85,90],[115,105],[155,92],[185,100],
                      ].map(([x,y], i) => (
                        <circle key={i} cx={x} cy={y} r={i%3===0?1.2:0.7} fill="rgba(255,255,255,0.75)"/>
                      ))}
                      <ellipse cx="100" cy="110" rx="55" ry="22" fill="rgba(167,139,250,0.18)" style={{filter:"blur(6px)"}}/>
                      <ellipse cx="100" cy="112" rx="35" ry="14" fill="rgba(167,139,250,0.14)"/>
                    </>}
                  </svg>
                )}

                {/* Sticker pack: styled card grid */}
                {item.category === "sticker" && (() => {
                  const packs: Record<string, Array<{e:string;r:number}>> = {
                    st1: [{e:"🎸",r:-8},{e:"📼",r:5},{e:"🎵",r:-4},{e:"🎶",r:7},{e:"🎹",r:-6},{e:"📻",r:3}],
                    st2: [{e:"🎤",r:-5},{e:"🎧",r:8},{e:"🥁",r:-7},{e:"🎺",r:4},{e:"🎻",r:-9},{e:"🪗",r:6}],
                    st3: [{e:"⭐",r:-4},{e:"💜",r:7},{e:"🌸",r:-8},{e:"✨",r:5},{e:"🌟",r:-3},{e:"💫",r:9}],
                    st4: [{e:"🎼",r:-6},{e:"🎹",r:4},{e:"🎵",r:-9},{e:"🎶",r:7},{e:"🎷",r:-4},{e:"🎻",r:5}],
                  };
                  const stickers = packs[item.id] ?? packs.st1;
                  return (
                    <div className="grid grid-cols-3 gap-2.5 p-2">
                      {stickers.map(({e, r}, i) => (
                        <div
                          key={i}
                          className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-2xl"
                          style={{
                            transform: `rotate(${r}deg)`,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
                          }}
                        >
                          {e}
                        </div>
                      ))}
                    </div>
                  );
                })()}

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
      <div className="mt-10 sm:mt-12 bg-gradient-to-r from-lp-accent to-lp-accent-btn rounded-2xl px-6 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
        <div>
          <p className="text-white/70 text-sm">보유 포인트</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">5,000 P</p>
        </div>
        <button className="w-full sm:w-auto px-6 py-3 bg-white text-lp-accent font-semibold rounded-xl text-sm hover:bg-white/90 transition-colors text-center">
          포인트 충전
        </button>
      </div>
    </div>
  );
}
