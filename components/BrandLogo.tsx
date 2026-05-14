/**
 * Turntable Diary 로고
 *
 * 컨셉: 턴테이블 위에 만년필 — "음악을 적는다"는 메타포.
 * - 따뜻한 앰버 라벨 + 검은 디스크
 * - 우상단에서 라벨 가장자리로 내려오는 만년필
 * - 라벨 위 손글씨 'td' 서명
 */
export default function BrandLogo({
  size = 36,
  className,
  withShadow = true,
}: {
  size?: number;
  className?: string;
  withShadow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      style={withShadow ? { filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" } : undefined}
      aria-hidden
    >
      <defs>
        <radialGradient id="td-body" cx="34%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#2a241c" />
          <stop offset="45%" stopColor="#0e0b08" />
          <stop offset="100%" stopColor="#040302" />
        </radialGradient>
        <radialGradient id="td-label" cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#eab277" />
          <stop offset="55%" stopColor="#a55b1f" />
          <stop offset="100%" stopColor="#4a2207" />
        </radialGradient>
        <radialGradient id="td-lsheen" cx="30%" cy="22%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="td-shine" cx="28%" cy="18%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="td-pen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a8896a" />
          <stop offset="45%" stopColor="#f0deb6" />
          <stop offset="100%" stopColor="#7a5e44" />
        </linearGradient>
      </defs>

      {/* 디스크 본체 */}
      <circle cx="22" cy="22" r="21" fill="url(#td-body)" />
      <circle cx="22" cy="22" r="21" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5" />

      {/* 그루브 링 */}
      <circle cx="22" cy="22" r="19.4" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <circle cx="22" cy="22" r="17.6" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
      <circle cx="22" cy="22" r="15.8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <circle cx="22" cy="22" r="14.0" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
      <circle cx="22" cy="22" r="12.2" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />

      {/* Lead-out 구분선 */}
      <circle cx="22" cy="22" r="10.6" fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth="0.6" />

      {/* 중앙 라벨 */}
      <circle cx="22" cy="22" r="8.6" fill="url(#td-label)" />
      <circle cx="22" cy="22" r="8.6" fill="url(#td-lsheen)" />
      <circle cx="22" cy="22" r="8.6" fill="none" stroke="rgba(255,210,150,0.22)" strokeWidth="0.4" />

      {/* 손글씨 'td' 서명 */}
      <g stroke="rgba(255,243,213,0.92)" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* t */}
        <path d="M19.4 19.6 L19.4 24.0 Q19.4 25.0 20.3 24.8" />
        <path d="M18.6 21.4 L20.4 21.4" />
        {/* d */}
        <path d="M24.6 19.6 L24.6 25.0" />
        <path d="M24.6 22.0 Q22.8 22.0 22.8 23.5 Q22.8 25.2 24.6 24.8" />
      </g>

      {/* 만년필 — 우상단에서 라벨 가장자리로 (rotate 45°) */}
      <g transform="rotate(45 22 22)">
        {/* 펜 몸통 */}
        <rect x="21.3" y="-2.5" width="1.4" height="12" rx="0.4" fill="url(#td-pen)" />
        {/* 펜 캡 */}
        <rect x="21.3" y="-2.5" width="1.4" height="2.2" rx="0.4" fill="#3a2e1d" />
        <line x1="21.3" y1="-1" x2="22.7" y2="-1" stroke="#d4b88a" strokeWidth="0.18" />
        {/* 닙 */}
        <path d="M21.1 9.5 L22 13.0 L22.9 9.5 Z" fill="#211609" />
        <line x1="22" y1="9.5" x2="22" y2="12.6" stroke="#000" strokeWidth="0.15" />
        {/* 잉크 하이라이트 */}
        <circle cx="22" cy="12.9" r="0.42" fill="#fff2cf" />
      </g>

      {/* 스핀들 홀 */}
      <circle cx="22" cy="22" r="1.5" fill="#060503" />

      {/* 디스크 표면 specular */}
      <circle cx="22" cy="22" r="21" fill="url(#td-shine)" />
    </svg>
  );
}

export function BrandWordmark({
  size = "md",
  tone = "dark",
}: {
  /** sm: GNB용, md: 페이지 헤더, lg: 히어로 */
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
}) {
  const styles = {
    sm: { turntable: "text-[17px]", diary: "text-[19px]" },
    md: { turntable: "text-2xl", diary: "text-3xl" },
    lg: { turntable: "text-5xl sm:text-6xl", diary: "text-5xl sm:text-6xl" },
  }[size];

  const colors = tone === "light"
    ? { turntable: "text-white", diary: "text-amber-300/90" }
    : { turntable: "text-lp-primary", diary: "text-amber-700" };

  return (
    <span className="inline-flex items-baseline gap-1.5 leading-none">
      <span
        className={`${styles.turntable} ${colors.turntable} font-semibold tracking-tight`}
        style={{ fontFamily: "var(--font-diary), 'Fraunces', Georgia, serif" }}
      >
        Turntable
      </span>
      <span
        className={`${styles.diary} ${colors.diary}`}
        style={{
          fontFamily: "var(--font-diary), 'Fraunces', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 500,
        }}
      >
        Diary
      </span>
    </span>
  );
}
