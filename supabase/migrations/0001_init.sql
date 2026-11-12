-- KGS Academy — initial schema
-- Run with: supabase db push  (or paste into the Supabase SQL editor)

-- ---------------------------------------------------------------------------
-- Extensions & enums
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'staff', 'student');
create type public.course_mode as enum ('classroom', 'live_online', 'hybrid', 'self_paced');
create type public.course_status as enum ('draft', 'published', 'archived');
create type public.session_status as enum ('scheduled', 'open', 'full', 'completed', 'cancelled');
create type public.enquiry_status as enum ('new', 'in_progress', 'converted', 'closed');
create type public.enquiry_type as enum ('individual', 'corporate', 'custom_programme', 'other');

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text not null default '',
  role        public.app_role not null default 'student',
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile when a user signs up, defaulting to 'student'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------
create table public.standards (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,          -- e.g. 'ISO 9001'
  name        text not null,                 -- e.g. 'Quality Management'
  slug        text not null unique,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Courses & sessions
-- ---------------------------------------------------------------------------
create table public.courses (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  summary       text,
  description   text,
  category_id   uuid references public.categories (id) on delete set null,
  standard_id   uuid references public.standards (id) on delete set null,
  duration_days int,
  mode          public.course_mode not null default 'classroom',
  price_inr     numeric(10, 2),
  mrp_inr       numeric(10, 2),
  certificate   boolean not null default false,
  featured      boolean not null default false,
  status        public.course_status not null default 'draft',
  thumbnail_url text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.course_sessions (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses (id) on delete cascade,
  start_date    date not null,
  end_date      date,
  start_time    time,
  location      text,                        -- e.g. 'Bengaluru' or 'Live online'
  capacity      int,
  seats_filled  int not null default 0,
  status        public.session_status not null default 'scheduled',
  meeting_url   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index course_sessions_course_idx on public.course_sessions (course_id);
create index course_sessions_start_idx  on public.course_sessions (start_date);
create index courses_status_idx         on public.courses (status);

-- ---------------------------------------------------------------------------
-- Enquiries (public-facing form submissions)
-- ---------------------------------------------------------------------------
create table public.enquiries (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  email            text not null,
  phone            text,
  enquiry_type     public.enquiry_type not null default 'individual',
  course_interest  text,
  message          text,
  status           public.enquiry_status not null default 'new',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper: is the current user an admin?
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.standards       enable row level security;
alter table public.categories      enable row level security;
alter table public.courses         enable row level security;
alter table public.course_sessions enable row level security;
alter table public.enquiries       enable row level security;

-- profiles: users read/update their own row; admins read all
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- reference data: readable by everyone
create policy "standards_read"   on public.standards   for select using (true);
create policy "categories_read" on public.categories  for select using (true);

-- courses: public can read published; admins manage all
create policy "courses_public_read" on public.courses
  for select using (status = 'published' or public.is_admin());
create policy "courses_admin_write" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- sessions: follow parent course visibility
create policy "sessions_public_read" on public.course_sessions
  for select using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_id and c.status = 'published'
    )
  );
create policy "sessions_admin_write" on public.course_sessions
  for all using (public.is_admin()) with check (public.is_admin());

-- enquiries: anyone can insert; only admins can read/update
create policy "enquiries_insert" on public.enquiries
  for insert with check (true);
create policy "enquiries_admin_read" on public.enquiries
  for select using (public.is_admin());
create policy "enquiries_admin_update" on public.enquiries
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch    before update on public.profiles        for each row execute function public.touch_updated_at();
create trigger courses_touch     before update on public.courses         for each row execute function public.touch_updated_at();
create trigger sessions_touch    before update on public.course_sessions for each row execute function public.touch_updated_at();
create trigger enquiries_touch   before update on public.enquiries       for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Storage buckets for file uploads (course materials, session docs, images)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('course-materials',   'course-materials',   true),
  ('session-documents',  'session-documents',  false),
  ('course-thumbnails',  'course-thumbnails',  true)
on conflict (id) do nothing;

-- Public read on public buckets; admin-only write.
create policy "course_materials_public_read" on storage.objects
  for select using (bucket_id in ('course-materials', 'course-thumbnails'));

create policy "storage_admin_all" on storage.objects
  for all using (public.is_admin()) with check (public.is_admin());
