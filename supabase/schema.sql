-- ============================================================================
-- V808 Records — Supabase schema
-- Run in Supabase Dashboard → SQL Editor (or `supabase db push`).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique,
  full_name   text,
  avatar_url  text,
  role        text not null default 'customer' check (role in ('admin', 'customer')),
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Beats
-- ---------------------------------------------------------------------------
create table if not exists public.beats (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique,
  genre         text not null,
  bpm           integer not null default 120,
  key_root      text,
  price         numeric(10, 2) not null default 29.99,
  cover_url     text,
  audio_url     text,
  description   text,
  tags          text[] default '{}',
  is_published  boolean not null default true,
  owner_id      uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists beats_genre_idx on public.beats (genre);
create index if not exists beats_published_idx on public.beats (is_published);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists beats_touch_updated_at on public.beats;
create trigger beats_touch_updated_at
  before update on public.beats
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Licenses / orders
-- ---------------------------------------------------------------------------
create table if not exists public.licenses (
  id            uuid primary key default gen_random_uuid(),
  beat_id       uuid references public.beats (id) on delete cascade,
  buyer_id      uuid references public.profiles (id) on delete set null,
  tier          text not null check (tier in ('basic', 'premium', 'exclusive')),
  price         numeric(10, 2) not null,
  license_code  text not null unique,
  buyer_name    text,
  buyer_email   text,
  issued_at     timestamptz not null default now()
);

create index if not exists licenses_buyer_idx on public.licenses (buyer_id);
create index if not exists licenses_beat_idx on public.licenses (beat_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.beats    enable row level security;
alter table public.licenses enable row level security;

-- Profiles: anyone can read basic profile info; users edit only their own;
-- admins can read all.
drop policy if exists "profiles are public read" on public.profiles;
create policy "profiles are public read"
  on public.profiles for select using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Beats: published beats are publicly readable; only admins write.
drop policy if exists "published beats are readable" on public.beats;
create policy "published beats are readable"
  on public.beats for select using (is_published or public.is_admin());

drop policy if exists "admins manage beats" on public.beats;
create policy "admins manage beats"
  on public.beats for all using (public.is_admin()) with check (public.is_admin());

-- Licenses: buyers read their own; admins read all; inserts allowed to owner/admin.
drop policy if exists "licenses readable by owner or admin" on public.licenses;
create policy "licenses readable by owner or admin"
  on public.licenses for select using (auth.uid() = buyer_id or public.is_admin());

drop policy if exists "licenses insert by owner" on public.licenses;
create policy "licenses insert by owner"
  on public.licenses for insert with check (auth.uid() = buyer_id or buyer_id is null);

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

-- Public read for covers/audio; admins (or authenticated users) can upload.
create policy "public read covers"
  on storage.objects for select using (bucket_id = 'covers');
create policy "public read audio"
  on storage.objects for select using (bucket_id = 'audio');

create policy "authenticated upload covers"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'covers');
create policy "authenticated upload audio"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'audio');

-- ---------------------------------------------------------------------------
-- Promote a user to admin (run manually after signup, replace the email):
-- update public.profiles set role = 'admin' where id =
--   (select id from auth.users where email = 'you@example.com');
-- ---------------------------------------------------------------------------
