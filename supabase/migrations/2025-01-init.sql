-- =========================================================
-- AI Note-Taker 2.0 — Supabase schema + RLS + indexes
-- Assumes Supabase Auth (auth.uid()) for RLS evaluation.
-- You can still use Clerk on the frontend; just ensure
-- your API routes call Supabase in a way that preserves the user.
-- =========================================================

-- 1) Extensions
create schema if not exists extensions;
create extension if not exists pgcrypto;              -- gen_random_uuid()
create extension if not exists vector with schema extensions;                -- pgvector
create extension if not exists pg_trgm with schema extensions;               -- trigram for fuzzy text search

-- 2) Schemas are default (public/auth/storage). We stay in public.

-- 3) Tables

-- Minimal profile mirror (optional; handy for display names, onboarding flags)
create table if not exists public.profiles (
  user_id uuid primary key,
  name text,
  created_at timestamptz not null default now()
);

-- Core notes table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  content text,                 -- raw text (optional if file-only)
  file_url text,                -- path to Supabase storage object
  source_type text not null check (source_type in ('text','audio','pdf','web')),
  tokens int not null default 0,
  summary text,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chunks table for embeddings
-- NOTE: set the dimension to match your embedding model.
-- text-embedding-3-small = 1536 dims.
create table if not exists public.note_chunks (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(1536) not null
);

-- Event log for observability
create table if not exists public.note_events (
  id bigserial primary key,
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null,
  event_type text not null,     -- 'created','embedded','summarized','error', etc.
  details jsonb,
  created_at timestamptz not null default now()
);

-- 4) Row Level Security
alter table public.profiles enable row level security;
alter table public.notes enable row level security;
alter table public.note_chunks enable row level security;
alter table public.note_events enable row level security;

-- Helper policy functions (optional but tidy)
create or replace function public.current_user_id() returns uuid
language sql stable
set search_path = ''
as $$
  select auth.uid()
$$;

-- PROFILES: each user can read/write only their own profile
drop policy if exists "select own profile" on public.profiles;
create policy "select own profile" on public.profiles
  for select using (user_id = auth.uid());

drop policy if exists "upsert own profile" on public.profiles;
create policy "upsert own profile" on public.profiles
  for insert with check (user_id = auth.uid());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- NOTES: strict ownership
drop policy if exists "select own notes" on public.notes;
create policy "select own notes" on public.notes
  for select using (user_id = auth.uid());

drop policy if exists "insert own notes" on public.notes;
create policy "insert own notes" on public.notes
  for insert with check (user_id = auth.uid());

drop policy if exists "update own notes" on public.notes;
create policy "update own notes" on public.notes
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "delete own notes" on public.notes;
create policy "delete own notes" on public.notes
  for delete using (user_id = auth.uid());

-- NOTE_CHUNKS: visible iff parent note belongs to user
drop policy if exists "select chunks via parent ownership" on public.note_chunks;
create policy "select chunks via parent ownership" on public.note_chunks
  for select using (
    exists (
      select 1 from public.notes n
      where n.id = note_chunks.note_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "insert chunks via parent ownership" on public.note_chunks;
create policy "insert chunks via parent ownership" on public.note_chunks
  for insert with check (
    exists (
      select 1 from public.notes n
      where n.id = note_chunks.note_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "delete chunks via parent ownership" on public.note_chunks;
create policy "delete chunks via parent ownership" on public.note_chunks
  for delete using (
    exists (
      select 1 from public.notes n
      where n.id = note_chunks.note_id
        and n.user_id = auth.uid()
    )
  );

-- NOTE_EVENTS: user can read their own events, insert events for themselves
drop policy if exists "select own events" on public.note_events;
create policy "select own events" on public.note_events
  for select using (user_id = auth.uid());

drop policy if exists "insert own events" on public.note_events;
create policy "insert own events" on public.note_events
  for insert with check (user_id = auth.uid());

-- 5) Triggers

-- Auto-update updated_at on notes
create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_notes_updated_at on public.notes;
create trigger trg_notes_updated_at
before update on public.notes
for each row
execute procedure public.set_updated_at();

-- 6) Indexes for performance

-- Notes basic indexes
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists notes_created_at_idx on public.notes(created_at desc);

-- Tags array GIN index (for tag filters)
create index if not exists notes_tags_gin on public.notes using gin (tags);

-- Trigram indexes for fuzzy text search (title/content/summary)
create index if not exists notes_title_trgm on public.notes using gin (title extensions.gin_trgm_ops);
create index if not exists notes_content_trgm on public.notes using gin (content extensions.gin_trgm_ops);
create index if not exists notes_summary_trgm on public.notes using gin (summary extensions.gin_trgm_ops);

-- Chunks: vector index (IVFFLAT) for fast ANN; requires row count & ANALYZE
-- Adjust lists as needed (typical = 100). You must run:
--   set ivfflat.probes = 10;  -- at query time for recall/latency tradeoff
create index if not exists note_chunks_note_id_idx on public.note_chunks(note_id);
create index if not exists note_chunks_embedding_ivfflat on public.note_chunks
using ivfflat (embedding extensions.vector_cosine_ops) with (lists = 100);

-- Events
create index if not exists note_events_user_id_idx on public.note_events(user_id);
create index if not exists note_events_note_id_idx on public.note_events(note_id);
create index if not exists note_events_created_at_idx on public.note_events(created_at desc);

-- 7) Helper views (optional)

-- Latest summary/tags per note (trivial now, but handy if you version later)
-- SECURITY INVOKER ensures RLS policies are enforced for the querying user
create or replace view public.v_notes_compact
with (security_invoker = true) as
select
  n.id,
  n.user_id,
  coalesce(n.title, left(coalesce(n.content, ''), 60)) as display_title,
  n.summary,
  n.tags,
  n.created_at,
  n.updated_at
from public.notes n;

-- 8) Security sanity: ensure RLS is on (it is) and no bypass roles are granted.
-- (No extra grants needed; Supabase defaults are safe.)

-- 9) Seed (optional)
-- insert into public.profiles(user_id, name) values ('00000000-0000-0000-0000-000000000000', 'Demo');

