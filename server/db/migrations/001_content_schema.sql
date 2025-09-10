-- content_units: single source of truth per publishable item
create table content_units (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  kind text not null check (kind in ('video','podcast','short','livestream')),
  status text not null check (status in (
    'idea','script','recording','edit','packaging',
    'ready_to_upload','scheduled','published','archived','canceled'
  )),
  summary text default '',
  tags text[] default '{}',
  visibility text not null default 'private' check (visibility in ('private','unlisted','public')),
  platform_plan jsonb not null default '{}'::jsonb, -- per-platform knobs (titles, desc, hashtags, schedule, thumbnail ref)
  ai_meta jsonb not null default '{}'::jsonb,       -- prompts/models/seeds for thumbnails/descriptions
  metrics jsonb not null default '{}'::jsonb,       -- view/ctr backfill later
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index cu_status_idx on content_units(status);
create index cu_tags_idx on content_units using gin(tags);

-- scripts: versioned teleprompter/outline content + markup/colors/cues
create table scripts (
  id uuid primary key default gen_random_uuid(),
  content_unit_id uuid not null references content_units(id) on delete cascade,
  version int not null,
  kind text not null default 'teleprompter', -- teleprompter|outline|notes
  content text not null,
  markup jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(content_unit_id, version)
);

-- assets: files tied to a unit (raws, renders, thumbnail, transcript, etc.)
create table assets (
  id uuid primary key default gen_random_uuid(),
  content_unit_id uuid not null references content_units(id) on delete cascade,
  role text not null check (role in (
    'raw_video','raw_audio','mixdown','render','thumbnail','transcript','image','document'
  )),
  storage_uri text not null,              -- file://, s3://, gdrive://
  meta jsonb not null default '{}'::jsonb, -- codec, duration, dims, checksum
  created_at timestamptz not null default now()
);
create index assets_unit_role_idx on assets(content_unit_id, role);

-- uploads: one row per platform execution (idempotent + retryable)
create table uploads (
  id uuid primary key default gen_random_uuid(),
  content_unit_id uuid not null references content_units(id) on delete cascade,
  platform text not null check (platform in ('youtube','rumble','spotify')),
  status text not null check (status in ('pending','in_progress','succeeded','failed','canceled')),
  request jsonb not null default '{}'::jsonb,  -- exact payload we attempted
  response jsonb not null default '{}'::jsonb, -- api result/videoId/errors
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index uploads_unit_platform_idx on uploads(content_unit_id, platform);
create index uploads_status_idx on uploads(status);

-- events: append-only audit of state transitions & notable actions
create table content_events (
  id bigserial primary key,
  content_unit_id uuid not null references content_units(id) on delete cascade,
  type text not null,   -- e.g. state.transition, asset.added, upload.succeeded
  actor text not null default 'system',
  from_state text,
  to_state text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index events_unit_idx on content_events(content_unit_id);

-- touch trigger
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

create trigger trg_content_units_touch before update on content_units
for each row execute function touch_updated_at();

create trigger trg_uploads_touch before update on uploads
for each row execute function touch_updated_at();
