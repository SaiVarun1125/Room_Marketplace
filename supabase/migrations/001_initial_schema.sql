-- RoomMate SGF — v1 schema
-- Run in Supabase SQL editor: https://app.supabase.com → SQL Editor

-- Enums
create type listing_status as enum ('draft','pending_review','active','matched','expired','removed');
create type listing_type   as enum ('private_room','shared_room','sublease','lease_transfer','whole_unit');
create type user_role      as enum ('seeker','poster','admin');
create type report_status  as enum ('open','under_review','resolved','dismissed');

-- profiles (tied to auth.users)
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text, school text, gender text, gender_pref text,
  budget_min    integer, budget_max integer,
  move_in_date  date, bio text,
  role          user_role not null default 'seeker',
  avatar_path   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- listings
create table listings (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references auth.users(id) on delete cascade,
  type                listing_type not null default 'private_room',
  status              listing_status not null default 'draft',
  neighborhood        text,
  city                text not null default 'Springfield',
  state               text not null default 'MO',
  zipcode             text,
  rent                integer not null,
  deposit             integer,
  utilities_included  boolean not null default false,
  furnished           boolean not null default false,
  private_room        boolean not null default true,
  gender_pref         text,
  available_from      date not null,
  available_to        date,
  title               text not null,
  description         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  last_refreshed_at   timestamptz not null default now(),
  deleted_at          timestamptz
);

-- listing_compliance
create table listing_compliance (
  id                         uuid primary key default gen_random_uuid(),
  listing_id                 uuid not null unique references listings(id) on delete cascade,
  landlord_consent_required  boolean not null default false,
  landlord_consent_available boolean not null default false,
  lease_doc_available        boolean not null default false,
  transfer_fee               integer,
  prime_tenant_confirmed     boolean not null default false,
  updated_at                 timestamptz not null default now()
);

-- listing_photos
create table listing_photos (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references listings(id) on delete cascade,
  storage_path text not null,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- saved_listings
create table saved_listings (
  user_id    uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- chat_threads (unique constraint prevents duplicate threads)
create table chat_threads (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  seeker_id  uuid not null references auth.users(id) on delete cascade,
  poster_id  uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, seeker_id)
);

-- messages
create table messages (
  id        uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body      text not null,
  sent_at   timestamptz not null default now()
);

-- reports
create table reports (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references listings(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason      text not null,
  status      report_status not null default 'open',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indexes
create index on listings(city, status) where deleted_at is null;
create index on listings(owner_id);
create index on listings(available_from);
create index on listings(rent);
create index on listings(last_refreshed_at desc);
create index on messages(thread_id, sent_at asc);
create index on chat_threads(seeker_id);
create index on chat_threads(poster_id);
create index on saved_listings(user_id);

-- updated_at trigger
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_updated_at   before update on profiles          for each row execute function set_updated_at();
create trigger trg_listings_updated_at   before update on listings           for each row execute function set_updated_at();
create trigger trg_compliance_updated_at before update on listing_compliance for each row execute function set_updated_at();
create trigger trg_threads_updated_at    before update on chat_threads       for each row execute function set_updated_at();
create trigger trg_reports_updated_at    before update on reports            for each row execute function set_updated_at();

-- Row Level Security
alter table profiles           enable row level security;
alter table listings           enable row level security;
alter table listing_compliance enable row level security;
alter table listing_photos     enable row level security;
alter table saved_listings     enable row level security;
alter table chat_threads       enable row level security;
alter table messages           enable row level security;
alter table reports            enable row level security;

-- profiles
create policy "profiles_read_all"  on profiles for select using (true);
create policy "profiles_insert"    on profiles for insert with check (id = auth.uid());
create policy "profiles_update"    on profiles for update using (id = auth.uid());

-- listings
create policy "listings_read"   on listings for select using (status = 'active' and deleted_at is null or owner_id = auth.uid());
create policy "listings_insert" on listings for insert with check (owner_id = auth.uid());
create policy "listings_update" on listings for update using (owner_id = auth.uid());
create policy "listings_delete" on listings for delete using (owner_id = auth.uid());

-- listing_compliance
create policy "compliance_read"  on listing_compliance for select using (exists (select 1 from listings l where l.id = listing_id and (l.status='active' or l.owner_id=auth.uid())));
create policy "compliance_write" on listing_compliance for all    using (exists (select 1 from listings l where l.id = listing_id and l.owner_id = auth.uid()));

-- listing_photos
create policy "photos_read"  on listing_photos for select using (exists (select 1 from listings l where l.id = listing_id and (l.status='active' or l.owner_id=auth.uid())));
create policy "photos_write" on listing_photos for all    using (exists (select 1 from listings l where l.id = listing_id and l.owner_id = auth.uid()));

-- saved_listings
create policy "saved_own" on saved_listings for all using (user_id = auth.uid());

-- chat_threads
create policy "threads_read"   on chat_threads for select using (seeker_id = auth.uid() or poster_id = auth.uid());
create policy "threads_insert" on chat_threads for insert with check (seeker_id = auth.uid());

-- messages
create policy "messages_read" on messages for select using (exists (select 1 from chat_threads t where t.id = thread_id and (t.seeker_id=auth.uid() or t.poster_id=auth.uid())));
create policy "messages_send" on messages for insert with check (sender_id = auth.uid() and exists (select 1 from chat_threads t where t.id = thread_id and (t.seeker_id=auth.uid() or t.poster_id=auth.uid())));

-- reports
create policy "reports_insert"  on reports for insert with check (reporter_id = auth.uid());
create policy "reports_own"     on reports for select using (reporter_id = auth.uid());

-- Auto-create profile on signup
create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into profiles(id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Storage buckets (run after migration):
-- insert into storage.buckets(id,name,public) values ('listing-photos','listing-photos',true);
-- insert into storage.buckets(id,name,public) values ('avatars','avatars',true);
