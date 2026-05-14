# Turntable Diary 🎵

> 음악으로 쓰는 일지.

브라우저에서 돌리는 가상 LP 플레이어. 좋아한 LP를 모으고, 감상을 기록하고, 함께 듣는 친구들을 만나는 곳.

## 주요 기능

- **🎼 LP 플레이어** — 턴테이블 UI에서 YouTube로 실제 음악 재생, A/B 면 전환, 진행 바 시크
- **🎨 LP 커스텀 에디터** — 색상·스플래터 패턴으로 나만의 LP 디자인
- **📜 가사 패널** — 동기화 가사 표시 (lyrics 데이터 있는 트랙)
- **👥 커뮤니티** — 글 작성, 댓글, 좋아요, 태그
- **👤 프로필** — 좋아하는 장르/아티스트/LP, 팔로우, 팔로워
- **⌨️ 키보드 단축키** — Space, ←→, T, L, M, F

## 기술 스택

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS v4
- **Auth**: NextAuth.js (Google OAuth)
- **DB**: Supabase (PostgreSQL)
- **Audio**: YouTube IFrame Player API
- **Deploy**: Netlify

## 빠른 시작

```bash
npm install
cp .env.example .env.local
npm run dev
```

외부 서비스 없이도 LP 카탈로그/플레이어는 mock 데이터로 동작합니다. 로그인·커뮤니티 기능까지 전부 켜는 방법은 **[SETUP.md](./SETUP.md)** 참고.

## 프로젝트 구조

```
app/
  api/              # 서버 라우트 (NextAuth, posts, comments, follow)
  community/        # 커뮤니티 피드
  lp/[id]/          # LP 상세
  player/[id]/      # 풀스크린 플레이어
  lp-editor/[id]/   # LP 디자인 에디터
  profile/[username]/
components/
  lp/               # Turntable, AudioPlayer, LyricsPanel ...
  layout/           # GNB 등
  ui/               # 공용 UI
lib/
  mock-data.ts      # LP 카탈로그 (실제 DB 마이그레이션 전)
  supabase.ts       # 서버 전용 service-role 클라이언트
  auth.ts           # NextAuth 옵션
  types.ts          # LP / Track / Player 타입
supabase-schema.sql # DB 스키마
proxy.ts            # 라우트 보호 (Next 16 proxy)
```

## 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
npm run lint     # ESLint
```

## 라이선스

학습용 프로젝트. 음악 재생은 YouTube에서 스트리밍되며 본 저장소에는 어떤 저작권 음원도 포함되지 않습니다.
