-- Vibe Money — Supabase 数据库初始化脚本
-- 在 Supabase Dashboard > SQL Editor 中执行

-- ============================================================
-- 1. accounts 表
-- ============================================================
create table if not exists accounts (
  id text primary key,
  nickname text not null,
  avatar text,
  status text default 'valid',
  auth_file text,
  created_at text
);

alter table accounts disable row level security;

-- ============================================================
-- 2. personas 表
-- ============================================================
create table if not exists personas (
  id text primary key,
  name text not null,
  prompt text,
  bound_account_id text
);

alter table personas disable row level security;

-- ============================================================
-- 3. publish_queue 表
-- ============================================================
create table if not exists publish_queue (
  id text primary key,
  title text not null,
  content text,
  post_description text,
  persona text,
  topic text,
  status text default 'awaiting_review',
  created_at timestamptz default now(),
  updated_at timestamptz
);

alter table publish_queue disable row level security;

-- 索引：按状态查询（常用）
create index if not exists idx_publish_queue_status on publish_queue(status);
create index if not exists idx_publish_queue_created_at on publish_queue(created_at desc);

-- ============================================================
-- 4. settings 表（全局 key-value 配置，如自动化任务配置）
-- ============================================================
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table settings disable row level security;
