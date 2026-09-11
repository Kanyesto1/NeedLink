-- ============================================================
-- NeedLink — Migration 002: Auto-provision user profile on signup
-- When a new auth.users row is created (registration), insert
-- matching rows into public.users and public.user_roles using
-- the role supplied in raw_user_meta_data.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text;
  v_status text;
begin
  v_role := coalesce(lower(new.raw_user_meta_data ->> 'role'), 'buyer');

  if v_role not in ('buyer', 'supplier') then
    v_role := 'buyer';
  end if;

  -- Every new user starts pending verification; proxy.ts blocks until verified.
  v_status := 'pending_verification';

  insert into public.users (id, email, full_name, company_name, status, email_verified)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'company_name',
    v_status,
    false
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, v_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();