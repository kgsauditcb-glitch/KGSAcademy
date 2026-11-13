-- Grant academy admin access to active super_admin users from public.users
-- (the shared IAM table used by the audit app on the same Supabase project).

create or replace function public.is_admin()
returns boolean
language sql
stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) or exists (
    select 1 from public.users
    where id = auth.uid()
      and role = 'super_admin'
      and is_active
      and deleted_at is null
  );
$$;
