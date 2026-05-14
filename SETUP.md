# Turntable Diary 셋업 가이드

이 문서는 Turntable Diary을 처음부터 끝까지 실제로 동작시키는 단계별 가이드입니다.

## 0. 빠른 시작 (외부 서비스 없이)

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

- `http://localhost:3000` 접속
- **로그인/커뮤니티 기능은 비활성** 상태지만, **LP 둘러보기 / 플레이어 / 가사** 등 카탈로그 기능은 모두 mock 데이터로 동작합니다.

전체 기능을 켜려면 아래 1~3단계를 진행하세요.

---

## 1. NextAuth Secret 생성 (필수, 30초)

세션 JWT 암호화에 사용됩니다.

```bash
# macOS / Linux / Git Bash
openssl rand -base64 32
```

PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

출력값을 `.env.local`의 `NEXTAUTH_SECRET=` 에 붙여넣으세요.

---

## 2. Supabase 셋업 (커뮤니티 / 프로필 / 팔로우)

### 2-1. 프로젝트 생성
1. https://supabase.com/dashboard 접속 → **New project**
2. 리전: `Northeast Asia (Seoul)` 권장
3. 비밀번호 설정 후 생성 (1~2분 소요)

### 2-2. 스키마 적용
1. 좌측 메뉴 **SQL Editor** → **New query**
2. 프로젝트 루트의 `supabase-schema.sql` 파일 전체 내용 복붙
3. **Run** 실행 — 다음 테이블이 생성됨:
   - `profiles` (username 포함), `posts`, `post_likes`, `comments`, `follows`
   - `lp_likes`, `lp_comments`, `lp_comment_likes` — LP 컬렉션/댓글
   - `playlists`, `playlist_tracks` — 플레이리스트
   - `notifications` — 좋아요/댓글/팔로우 시 자동 생성

> **재실행 안전**: `create if not exists` 패턴이므로 스키마를 여러 번 실행해도 됨. 기존 데이터는 유지.

### 2-3. 키 복사
**Settings → API** 에서:
- `Project URL` → `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`
- `service_role` 키 (⚠️ 절대 클라이언트에 노출 금지) → `SUPABASE_SERVICE_ROLE_KEY`

> 💡 현재 스키마는 RLS를 비활성화하고 모든 DB 접근을 서버 API 라우트에서 service_role로 처리합니다. 권한 검증은 API 라우트(`app/api/`)에서 직접 수행합니다.

---

## 3. Google OAuth 셋업 (로그인)

1. https://console.cloud.google.com/apis/credentials
2. **CREATE CREDENTIALS → OAuth client ID** → Application type: **Web application**
3. **Authorized redirect URIs** 에 추가:
   - 로컬: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://<your-domain>/api/auth/callback/google`
4. 생성된 Client ID / Secret → `.env.local`의 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

---

## 4. 실행

```bash
npm run dev        # 개발 서버 (http://localhost:3000)
npm run build      # 프로덕션 빌드 확인
npm run lint       # ESLint
```

---

## 5. Netlify 배포

`netlify.toml`이 이미 구성되어 있습니다.

1. GitHub에 push
2. https://app.netlify.com → **Add new site → Import from Git**
3. **Site settings → Environment variables** 에 `.env.local`의 모든 변수 등록
   - ⚠️ `NEXTAUTH_URL`은 배포 도메인으로 변경 (`https://<your-site>.netlify.app`)
4. Google OAuth redirect URI에도 배포 도메인 추가

---

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `Supabase is not configured` 에러 | `.env.local`에 Supabase 두 변수 누락. 위 2단계 참고 |
| 로그인 버튼 클릭 시 404 / 오류 | Google OAuth 미설정 또는 redirect URI 불일치 |
| 커뮤니티 글쓰기 후 500 에러 | Supabase 스키마 미적용 — `supabase-schema.sql` 실행 확인 |
| 플레이어에서 음악 안 나옴 | 해당 LP의 `youtubeId`가 mock 데이터에 누락. `lib/mock-data.ts` 확인 |
| 프로필 페이지에서 "사용자를 찾을 수 없음" | username은 첫 Google 로그인 시 자동 생성됨. 로그인 후 자기 닉네임 슬러그(@username)로 접속 |
| 알림이 항상 비어있음 | 다른 사람이 내 글에 좋아요/댓글, 나를 팔로우해야 알림이 쌓임. 본인 행위는 알림 안 옴 |
| 컬렉션 추가 후 프로필에 안 보임 | LP 좋아요 = 컬렉션. 좋아요 토글 후 프로필 새로고침 |
