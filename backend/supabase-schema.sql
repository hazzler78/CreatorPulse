-- Supabase schema for CreatorPulse

-- Goals: one row per user describing their growth framing
create table if not exists public.goals (
  user_id text primary key,
  previous_revenue numeric default 0,
  current_revenue numeric default 0,
  growth_target_percent numeric default 30,
  updated_at timestamptz default now()
);

-- Platform accounts: which platforms a user is tracking
create table if not exists public.platform_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  platform text not null,
  handle text not null,
  status text not null default 'demo',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists platform_accounts_user_platform_idx
  on public.platform_accounts (user_id, platform);

-- Optional: run if table already existed without token columns
-- alter table public.platform_accounts add column if not exists access_token text;
-- alter table public.platform_accounts add column if not exists refresh_token text;
-- alter table public.platform_accounts add column if not exists token_expires_at timestamptz;

