-- ============================================================================
-- V808 Records — Fortified Supabase schema & Row Level Security
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

-- Auto-create a profile row when a new auth user signs up (Email or Google OAuth).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(coalesce(new.email, new.id::text), '@', 1) || '_' || substr(new.id::text, 1, 6)
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', ''),
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

-- Prevent users from self-promoting their role via client updates.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Role modification is restricted to server administrators.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

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
  id            text primary key,
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
  has_stems     boolean not null default false,
  has_midi      boolean not null default false,
  stems_url     text,
  midi_url      text,
  is_published  boolean not null default true,
  owner_id      uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.beats add column if not exists has_stems boolean not null default false;
alter table public.beats add column if not exists has_midi boolean not null default false;
alter table public.beats add column if not exists stems_url text;
alter table public.beats add column if not exists midi_url text;

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
-- Payment Orders (server-managed state machine)
-- ---------------------------------------------------------------------------
create table if not exists public.payment_orders (
  id            uuid primary key default gen_random_uuid(),
  tx_ref        text not null unique,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  beat_id       text not null,
  beat_title    text not null,
  tier          text not null check (tier in ('basic', 'premium', 'exclusive')),
  provider      text not null check (provider in ('chapa', 'telebirr', 'cbe', 'stripe_card', 'paypal')),
  currency      text not null check (currency in ('USD', 'ETB')),
  amount_usd    numeric(10, 2) not null check (amount_usd > 0),
  amount_etb    numeric(12, 2) not null check (amount_etb > 0),
  buyer_name    text not null,
  buyer_email   text not null,
  buyer_phone   text,
  status        text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider_ref  text,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  verified_at   timestamptz
);

create index if not exists payment_orders_user_idx on public.payment_orders (user_id);
create index if not exists payment_orders_tx_ref_idx on public.payment_orders (tx_ref);

-- ---------------------------------------------------------------------------
-- Licenses / verified orders
-- ---------------------------------------------------------------------------
create table if not exists public.licenses (
  id                uuid primary key default gen_random_uuid(),
  beat_id           text not null,
  buyer_id          uuid not null references public.profiles (id) on delete cascade,
  payment_order_id  uuid unique references public.payment_orders (id) on delete restrict,
  tier              text not null check (tier in ('basic', 'premium', 'exclusive')),
  price             numeric(10, 2) not null check (price > 0),
  currency          text not null default 'USD',
  amount_paid       numeric(12, 2),
  payment_provider  text,
  payment_ref       text,
  signature_hash    text not null,
  license_code      text not null unique,
  buyer_name        text not null,
  buyer_email       text not null,
  issued_at         timestamptz not null default now()
);

create index if not exists licenses_buyer_idx on public.licenses (buyer_id);
create index if not exists licenses_beat_idx on public.licenses (beat_id);

-- ---------------------------------------------------------------------------
-- Security Audit Logs
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null,
  user_id     uuid references public.profiles (id) on delete set null,
  tx_ref      text,
  provider    text,
  ip_address  text,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Studio Service Requests (1-on-1 production, customization, on-call, mixing)
-- ---------------------------------------------------------------------------
create table if not exists public.service_requests (
  id                 uuid primary key default gen_random_uuid(),
  booking_code       text not null unique,
  user_id            uuid references public.profiles (id) on delete set null,
  service_type       text not null check (service_type in ('custom_production', 'beat_customization', 'on_call_session', 'mixing_mastering')),
  artist_name        text not null,
  email              text not null,
  contact_handle     text not null,
  project_title      text not null,
  beat_id            text,
  reference_url      text,
  preferred_schedule text,
  notes              text not null,
  status             text not null default 'new' check (status in ('new', 'scheduled', 'in_progress', 'completed')),
  created_at         timestamptz not null default now()
);

create index if not exists service_requests_user_idx on public.service_requests (user_id);
create index if not exists service_requests_created_idx on public.service_requests (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security (Zero client-side license forgery)
-- ---------------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.beats          enable row level security;
alter table public.payment_orders enable row level security;
alter table public.licenses         enable row level security;
alter table public.audit_logs       enable row level security;
alter table public.service_requests enable row level security;

-- Profiles: users read/update only their own profile; admins read all.
drop policy if exists "profiles are public read" on public.profiles;
drop policy if exists "profiles readable by owner or admin" on public.profiles;
create policy "profiles readable by owner or admin"
  on public.profiles for select using (auth.uid() = id or public.is_admin());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Beats: published beats are publicly readable; only admins write.
drop policy if exists "published beats are readable" on public.beats;
create policy "published beats are readable"
  on public.beats for select using (is_published or public.is_admin());

drop policy if exists "admins manage beats" on public.beats;
create policy "admins manage beats"
  on public.beats for all using (public.is_admin()) with check (public.is_admin());

-- Payment orders: buyers read their own; admins read all; ONLY service_role writes.
drop policy if exists "payment orders readable by owner or admin" on public.payment_orders;
create policy "payment orders readable by owner or admin"
  on public.payment_orders for select using (auth.uid() = user_id or public.is_admin());

-- Licenses: buyers read their own; admins read all; ONLY service_role inserts after verified payment!
drop policy if exists "licenses insert by owner" on public.licenses;
drop policy if exists "licenses readable by owner or admin" on public.licenses;
create policy "licenses readable by owner or admin"
  on public.licenses for select using (auth.uid() = buyer_id or public.is_admin());

-- Audit logs: admins read only; service_role writes.
drop policy if exists "audit logs readable by admin" on public.audit_logs;
create policy "audit logs readable by admin"
  on public.audit_logs for select using (public.is_admin());

-- Service requests: owner or admin read; service_role writes via hardened API.
drop policy if exists "service requests readable by owner or admin" on public.service_requests;
create policy "service requests readable by owner or admin"
  on public.service_requests for select using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets (Public covers & tagged previews; private stems/MIDI; admin-only writes)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('stems', 'stems', false)
on conflict (id) do nothing;

drop policy if exists "public read covers" on storage.objects;
create policy "public read covers"
  on storage.objects for select using (bucket_id = 'covers');

drop policy if exists "public read audio" on storage.objects;
create policy "public read audio"
  on storage.objects for select using (bucket_id = 'audio');

drop policy if exists "authenticated upload covers" on storage.objects;
drop policy if exists "admins upload covers" on storage.objects;
create policy "admins manage covers"
  on storage.objects for all to authenticated
  using (bucket_id = 'covers' and public.is_admin())
  with check (bucket_id = 'covers' and public.is_admin());

drop policy if exists "authenticated upload audio" on storage.objects;
drop policy if exists "admins upload audio" on storage.objects;
create policy "admins manage audio"
  on storage.objects for all to authenticated
  using (bucket_id = 'audio' and public.is_admin())
  with check (bucket_id = 'audio' and public.is_admin());

drop policy if exists "admins manage stems" on storage.objects;
create policy "admins manage stems"
  on storage.objects for all to authenticated
  using (bucket_id = 'stems' and public.is_admin())
  with check (bucket_id = 'stems' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Promote a user to admin (run manually after signup, replace the email):
-- update public.profiles set role = 'admin' where id =
--   (select id from auth.users where email = 'you@example.com');
-- ---------------------------------------------------------------------------
