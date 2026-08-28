-- Phase 1 mobile core schema: users, cards, links, folders, contacts.
-- B2B (companies, seat management, field permissions) and analytics (scan_events, crm_sync_log)
-- are intentionally deferred to a later migration.

create extension if not exists "pgcrypto";

-- ============================================================
-- users
-- ============================================================
create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- cards
-- One card per user for Phase 1 (single-card mobile experience).
-- ============================================================
create table cards (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references users (id) on delete cascade,

  context text not null check (context in ('employed', 'jobSeeker')),

  -- Employed / Business fields
  company_name text,
  job_title text,
  department text,

  -- Job Seeker / Student fields
  headline text,
  target_role text,
  education text,

  -- Shared fields
  full_name text not null,
  location text,
  phone text,
  email text,

  material_id text not null default 'bone',

  -- Layout template, background texture, font, accent color, per-field
  -- visibility toggles, kerning/weight overrides, audio perk URL, etc.
  -- Kept as jsonb since EDITOR_SPEC's controls are still evolving.
  style jsonb not null default '{}'::jsonb,

  -- Distinct from the back-of-card Link entries; always present, one per card.
  master_qr_asset_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cards_context_fields_check check (
    (context = 'employed' and company_name is not null and job_title is not null)
    or
    (context = 'jobSeeker' and headline is not null and target_role is not null)
  )
);

create index cards_owner_user_id_idx on cards (owner_user_id);

-- ============================================================
-- links (back-of-card, user-ordered array)
-- ============================================================
create table links (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references cards (id) on delete cascade,
  platform text not null,
  url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index links_card_id_idx on links (card_id);

-- ============================================================
-- folders (Rolodex active event folders)
-- ============================================================
create table folders (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users (id) on delete cascade,
  name text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create index folders_owner_user_id_idx on folders (owner_user_id);

-- A folder is the capture buffer for "the event I am physically at right now,"
-- so a user can have at most one active at a time. Enforced here rather than in
-- the client because the failure mode is silent: with two active folders, a
-- scanned card is routed into whichever one the query happens to return first.
create unique index folders_one_active_per_owner_idx
  on folders (owner_user_id)
  where is_active;

-- ============================================================
-- contacts (collected cards in the Rolodex)
-- ============================================================
create table contacts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users (id) on delete cascade,
  source_card_id uuid references cards (id) on delete set null,
  folder_id uuid references folders (id) on delete set null,

  starred boolean not null default false,
  note text,

  collected_at timestamptz not null default now(),
  -- NULL = still in the unsorted post-meetup swipe stack.
  sorted_at timestamptz
);

create index contacts_owner_user_id_idx on contacts (owner_user_id);
create index contacts_folder_id_idx on contacts (folder_id);
create index contacts_unsorted_idx on contacts (owner_user_id) where sorted_at is null;
