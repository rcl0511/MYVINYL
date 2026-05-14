-- =============================================
-- Turntable Diary — Supabase Schema (전체)
-- Supabase SQL Editor에서 전체 실행하세요
-- 재실행해도 안전합니다 (create if not exists / upsert).
-- =============================================

-- 1. profiles
create table if not exists profiles (
  id              text primary key,           -- next-auth token.sub (Google user ID)
  username        text unique,                -- URL 슬러그 (signIn 콜백에서 자동 생성)
  nickname        text,
  avatar_url      text,
  avatar_color    text    default '#5B21B6',
  bio             text    default '',
  favorite_genres text[]  default '{}',
  favorite_artists text[] default '{}',
  follower_count  int     default 0,
  following_count int     default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_profiles_username on profiles(username);

-- 2. posts
create table if not exists posts (
  id            uuid    primary key default gen_random_uuid(),
  user_id       text    not null references profiles(id) on delete cascade,
  title         text    not null,
  content       text    not null,
  tag           text    not null default '음악 이야기',
  like_count    int     default 0,
  comment_count int     default 0,
  created_at    timestamptz default now()
);
create index if not exists idx_posts_created on posts(created_at desc);
create index if not exists idx_posts_user on posts(user_id);

-- 3. post_likes
create table if not exists post_likes (
  user_id    text not null references profiles(id) on delete cascade,
  post_id    uuid not null references posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- 4. comments (커뮤니티 글에 달리는 댓글)
create table if not exists comments (
  id         uuid    primary key default gen_random_uuid(),
  post_id    uuid    not null references posts(id) on delete cascade,
  user_id    text    not null references profiles(id) on delete cascade,
  content    text    not null,
  like_count int     default 0,
  created_at timestamptz default now()
);
create index if not exists idx_comments_post on comments(post_id);

-- 5. follows
create table if not exists follows (
  follower_id  text not null references profiles(id) on delete cascade,
  following_id text not null references profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- 6. lp_likes (LP 컬렉션 / 좋아요)
-- lp_id는 mock-data의 LP id 문자열 ("lp-001" 등)
create table if not exists lp_likes (
  user_id    text not null references profiles(id) on delete cascade,
  lp_id      text not null,
  created_at timestamptz default now(),
  primary key (user_id, lp_id)
);
create index if not exists idx_lp_likes_user on lp_likes(user_id, created_at desc);

-- 7. lp_comments (LP 상세 페이지 댓글)
create table if not exists lp_comments (
  id         uuid    primary key default gen_random_uuid(),
  lp_id      text    not null,
  user_id    text    not null references profiles(id) on delete cascade,
  content    text    not null,
  like_count int     default 0,
  created_at timestamptz default now()
);
create index if not exists idx_lp_comments_lp on lp_comments(lp_id, created_at desc);

-- 8. lp_comment_likes
create table if not exists lp_comment_likes (
  user_id    text not null references profiles(id) on delete cascade,
  comment_id uuid not null references lp_comments(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, comment_id)
);

-- 9. playlists
create table if not exists playlists (
  id          uuid    primary key default gen_random_uuid(),
  user_id     text    not null references profiles(id) on delete cascade,
  name        text    not null,
  color       text    default '#5B21B6',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_playlists_user on playlists(user_id, updated_at desc);

-- 10. playlist_tracks (트랙 단위로 저장 — track_id는 mock-data의 트랙 id)
create table if not exists playlist_tracks (
  playlist_id uuid    not null references playlists(id) on delete cascade,
  track_id    text    not null,
  lp_id       text    not null,
  position    int     not null default 0,
  added_at    timestamptz default now(),
  primary key (playlist_id, track_id)
);
create index if not exists idx_playlist_tracks on playlist_tracks(playlist_id, position);

-- 11. notifications
create table if not exists notifications (
  id           uuid    primary key default gen_random_uuid(),
  user_id      text    not null references profiles(id) on delete cascade,  -- 수신자
  actor_id     text    references profiles(id) on delete set null,           -- 행위자 (nullable: 시스템 공지)
  type         text    not null check (type in ('comment', 'follow', 'like_post', 'like_comment', 'lp_comment', 'notice', 'penalty')),
  target_type  text,           -- 'post', 'lp', 'comment', 'lp_comment', 'profile', null
  target_id    text,
  content      text    not null default '',
  read         boolean default false,
  created_at   timestamptz default now()
);
create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on notifications(user_id, read) where read = false;

-- =============================================
-- Functions: 카운트 증감 헬퍼
-- =============================================
create or replace function increment_post_like(p_post_id uuid)
returns void language plpgsql as $$
begin update posts set like_count = like_count + 1 where id = p_post_id; end; $$;

create or replace function decrement_post_like(p_post_id uuid)
returns void language plpgsql as $$
begin update posts set like_count = greatest(0, like_count - 1) where id = p_post_id; end; $$;

create or replace function increment_comment_count(p_post_id uuid)
returns void language plpgsql as $$
begin update posts set comment_count = comment_count + 1 where id = p_post_id; end; $$;

create or replace function decrement_comment_count(p_post_id uuid)
returns void language plpgsql as $$
begin update posts set comment_count = greatest(0, comment_count - 1) where id = p_post_id; end; $$;

create or replace function increment_follower_count(p_user_id text)
returns void language plpgsql as $$
begin update profiles set follower_count = follower_count + 1 where id = p_user_id; end; $$;

create or replace function decrement_follower_count(p_user_id text)
returns void language plpgsql as $$
begin update profiles set follower_count = greatest(0, follower_count - 1) where id = p_user_id; end; $$;

create or replace function increment_following_count(p_user_id text)
returns void language plpgsql as $$
begin update profiles set following_count = following_count + 1 where id = p_user_id; end; $$;

create or replace function decrement_following_count(p_user_id text)
returns void language plpgsql as $$
begin update profiles set following_count = greatest(0, following_count - 1) where id = p_user_id; end; $$;

create or replace function increment_lp_comment_like(p_comment_id uuid)
returns void language plpgsql as $$
begin update lp_comments set like_count = like_count + 1 where id = p_comment_id; end; $$;

create or replace function decrement_lp_comment_like(p_comment_id uuid)
returns void language plpgsql as $$
begin update lp_comments set like_count = greatest(0, like_count - 1) where id = p_comment_id; end; $$;

-- =============================================
-- RLS: service role key로 접근하므로 비활성화
-- =============================================
alter table profiles         disable row level security;
alter table posts            disable row level security;
alter table post_likes       disable row level security;
alter table comments         disable row level security;
alter table follows          disable row level security;
alter table lp_likes         disable row level security;
alter table lp_comments      disable row level security;
alter table lp_comment_likes disable row level security;
alter table playlists        disable row level security;
alter table playlist_tracks  disable row level security;
alter table notifications    disable row level security;
