-- KGS Academy — promotional offers / discounts
-- Admin-managed via /admin/offers; public reads only active, in-date offers.

create table if not exists public.offers (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  code           text,                          -- optional coupon code
  discount_type  text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  banner_text    text,                          -- short promo strip, e.g. "Festive sale — flat 20% off"
  course_id      uuid references public.courses (id) on delete cascade, -- null = all courses
  starts_at      timestamptz,
  ends_at        timestamptz,
  is_active      boolean not null default true,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.offers enable row level security;

create policy "offers_public_read" on public.offers
  for select using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy "offers_admin_all" on public.offers
  for all using (public.is_admin()) with check (public.is_admin());

create trigger offers_touch before update on public.offers
  for each row execute function public.touch_updated_at();
