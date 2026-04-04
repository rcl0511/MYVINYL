-- =============================================
-- LP Player Web — Supabase Schema
-- Supabase SQL Editor에서 전체 실행하세요
-- =============================================

-- 1. profiles: next-auth 유저 + 음악 취향 정보
create table if not exists profiles (
  id              text primary key,           -- next-auth token.sub (Google user ID)
  nickname        text,
  avatar_url      text,
  avatar_color    text    default '#5B21B6',
  bio             text    default '',
  -- 음악 취향
  favorite_genres text[]  default '{}',       -- ["Indie Rock", "Jazz", ...]
  favorite_artists text[] default '{}',       -- ["검정치마", "이소라", ...]
  favorite_lp_ids text[]  default '{}',       -- LP IDs from the app
  -- 팔로우 카운트 (비정규화, trigger로 관리)
  follower_count  int     default 0,
  following_count int     default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

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

-- 3. post_likes
create table if not exists post_likes (
  user_id    text not null references profiles(id) on delete cascade,
  post_id    uuid not null references posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- 4. comments
create table if not exists comments (
  id         uuid    primary key default gen_random_uuid(),
  post_id    uuid    not null references posts(id) on delete cascade,
  user_id    text    not null references profiles(id) on delete cascade,
  content    text    not null,
  like_count int     default 0,
  created_at timestamptz default now()
);

-- 5. follows
create table if not exists follows (
  follower_id  text not null references profiles(id) on delete cascade,
  following_id text not null references profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- =============================================
-- Functions: 카운트 증감 헬퍼
-- =============================================

create or replace function increment_post_like(p_post_id uuid)
returns void language plpgsql as $$
begin
  update posts set like_count = like_count + 1 where id = p_post_id;
end; $$;

create or replace function decrement_post_like(p_post_id uuid)
returns void language plpgsql as $$
begin
  update posts set like_count = greatest(0, like_count - 1) where id = p_post_id;
end; $$;

create or replace function increment_comment_count(p_post_id uuid)
returns void language plpgsql as $$
begin
  update posts set comment_count = comment_count + 1 where id = p_post_id;
end; $$;

create or replace function decrement_comment_count(p_post_id uuid)
returns void language plpgsql as $$
begin
  update posts set comment_count = greatest(0, comment_count - 1) where id = p_post_id;
end; $$;

create or replace function increment_follower_count(p_user_id text)
returns void language plpgsql as $$
begin
  update profiles set follower_count = follower_count + 1 where id = p_user_id;
end; $$;

create or replace function decrement_follower_count(p_user_id text)
returns void language plpgsql as $$
begin
  update profiles set follower_count = greatest(0, follower_count - 1) where id = p_user_id;
end; $$;

create or replace function increment_following_count(p_user_id text)
returns void language plpgsql as $$
begin
  update profiles set following_count = following_count + 1 where id = p_user_id;
end; $$;

create or replace function decrement_following_count(p_user_id text)
returns void language plpgsql as $$
begin
  update profiles set following_count = greatest(0, following_count - 1) where id = p_user_id;
end; $$;

-- =============================================
-- RLS: service role key로 접근하므로 비활성화
-- =============================================
alter table profiles    disable row level security;
alter table posts       disable row level security;
alter table post_likes  disable row level security;
alter table comments    disable row level security;
alter table follows     disable row level security;
