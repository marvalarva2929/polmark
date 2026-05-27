-- PolMark Supabase Schema
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/<your-project>/sql/new

-- ─── Campaigns table ──────────────────────────────────────────
create table if not exists public.campaigns (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        references auth.users(id) on delete cascade not null,
  candidate_name  text        not null,
  office_title    text        default '',
  campaign_count  integer     default 0,
  monthly_budget  numeric     default 0,
  election_end_date date,
  status          text        default 'pending' not null,
  admin_notes     text,
  payload         jsonb       not null,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,

  constraint valid_status check (status in ('pending', 'approved', 'rejected'))
);

-- ─── Indexes ──────────────────────────────────────────────────
create index if not exists campaigns_user_id_idx  on public.campaigns (user_id);
create index if not exists campaigns_status_idx   on public.campaigns (status);
create index if not exists campaigns_created_idx  on public.campaigns (created_at desc);

-- ─── Auto-update updated_at ───────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_campaigns_updated on public.campaigns;
create trigger on_campaigns_updated
  before update on public.campaigns
  for each row execute procedure public.handle_updated_at();

-- ─── Row Level Security ───────────────────────────────────────
alter table public.campaigns enable row level security;

-- Users can only read their own campaigns
create policy "users_select_own"
  on public.campaigns for select
  using (auth.uid() = user_id);

-- Users can only insert their own campaigns
create policy "users_insert_own"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

-- Admins can read all campaigns and update status/notes
-- To grant admin access: run the following for each admin user:
--   insert into public.admin_users (user_id) values ('<user-uuid>');

create table if not exists public.admin_users (
  user_id uuid references auth.users(id) on delete cascade primary key
);

alter table public.admin_users enable row level security;

-- Admins can update any campaign's status and notes
create policy "admins_update_campaigns"
  on public.campaigns for update
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

create policy "admins_select_all"
  on public.campaigns for select
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

-- ─── Admin helper view ────────────────────────────────────────
-- Use this view in your admin portal to see all submissions
create or replace view public.admin_campaigns_view as
  select
    c.id,
    c.candidate_name,
    c.office_title,
    c.campaign_count,
    c.monthly_budget,
    c.election_end_date,
    c.status,
    c.admin_notes,
    c.created_at,
    c.updated_at,
    u.email as user_email,
    c.payload
  from public.campaigns c
  join auth.users u on u.id = c.user_id
  order by c.created_at desc;
