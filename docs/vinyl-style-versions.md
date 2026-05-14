# Vinyl Style Versions — Red / Emerald (투명 LP 시도 백업)

각 버전은 `LPCard.tsx` 및 `Turntable.tsx`의 두 그라데이션 정의를 동시에 교체합니다.
복원할 때는 원하는 버전 블록을 두 파일에 그대로 붙여넣으세요.

---

## V0 · Original (불투명 아크릴, 시작 상태)

```tsx
<radialGradient id={`redAcrylic-${lp.id}`} cx="70%" cy="70%" r="%">
  <stop offset="80%" stopColor="#9f1239" stopOpacity="0.95" />
  <stop offset="100%" stopColor="#9f1239" stopOpacity="0.95" />
</radialGradient>
<radialGradient id={`emeraldAcrylic-${lp.id}`} cx="50%" cy="50%" r="50%">
  <stop offset="0%" stopColor="#065f46" stopOpacity="0.7" />
  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.95" />
</radialGradient>
```

> `r="%"` 는 잘못된 값(빈 숫자) — 모든 버전에서 `r="70%"`로 수정.

---

## V_A · 컬러 틴트 + 백라이트 (정통 클리어 바이닐)

베이스 투명도 낮추고 가장자리 두께감 강조.

```tsx
<radialGradient id={`redAcrylic-${lp.id}`} cx="50%" cy="50%" r="60%">
  <stop offset="0%"   stopColor="#fecaca" stopOpacity="0.25" />
  <stop offset="55%"  stopColor="#dc2626" stopOpacity="0.45" />
  <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.85" />
</radialGradient>
<radialGradient id={`emeraldAcrylic-${lp.id}`} cx="50%" cy="50%" r="60%">
  <stop offset="0%"   stopColor="#a7f3d0" stopOpacity="0.25" />
  <stop offset="55%"  stopColor="#059669" stopOpacity="0.45" />
  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.85" />
</radialGradient>
```

---

## V_B · 글래스 모피즘 (현대적 반사광 강조)

여러 단계 opacity + 강한 specular.

```tsx
<radialGradient id={`redAcrylic-${lp.id}`} cx="35%" cy="30%" r="75%">
  <stop offset="0%"   stopColor="#fff1f2" stopOpacity="0.55" />
  <stop offset="25%"  stopColor="#fb7185" stopOpacity="0.35" />
  <stop offset="65%"  stopColor="#be123c" stopOpacity="0.55" />
  <stop offset="100%" stopColor="#4c0519" stopOpacity="0.9" />
</radialGradient>
<radialGradient id={`emeraldAcrylic-${lp.id}`} cx="35%" cy="30%" r="75%">
  <stop offset="0%"   stopColor="#ecfdf5" stopOpacity="0.55" />
  <stop offset="25%"  stopColor="#34d399" stopOpacity="0.35" />
  <stop offset="65%"  stopColor="#047857" stopOpacity="0.55" />
  <stop offset="100%" stopColor="#022c22" stopOpacity="0.9" />
</radialGradient>
```

---

## V_C · 글리터 살리고 배경 비치게 (스파클 인 클리어)

```tsx
<radialGradient id={`redAcrylic-${lp.id}`} cx="50%" cy="50%" r="65%">
  <stop offset="0%"   stopColor="#ef4444" stopOpacity="0.3" />
  <stop offset="70%"  stopColor="#b91c1c" stopOpacity="0.4" />
  <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.7" />
</radialGradient>
<radialGradient id={`emeraldAcrylic-${lp.id}`} cx="50%" cy="50%" r="65%">
  <stop offset="0%"   stopColor="#10b981" stopOpacity="0.3" />
  <stop offset="70%"  stopColor="#047857" stopOpacity="0.4" />
  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.7" />
</radialGradient>
```
