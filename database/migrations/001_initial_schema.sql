-- ============================================================
-- NeedLink — Initial Schema
-- Tables: users, user_roles, categories, procurement_requests, quotations
-- Includes: updated_at triggers, indexes, RLS policies
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- updated_at trigger helper ----------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  company_name text,
  phone text,
  avatar_url text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'suspended', 'pending_verification')),
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_email on public.users (email);
create index idx_users_status on public.users (status);

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

-- ============================================================
-- USER ROLES
-- ============================================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null
    check (role in ('buyer', 'supplier', 'administrator', 'super_administrator')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index idx_user_roles_user on public.user_roles (user_id);
create index idx_user_roles_role on public.user_roles (role);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_categories_parent on public.categories (parent_id);

-- ============================================================
-- PROCUREMENT REQUESTS
-- ============================================================
create table public.procurement_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  category_id uuid references public.categories(id) on delete set null,
  quantity numeric not null check (quantity > 0),
  unit text,
  budget_min numeric check (budget_min >= 0),
  budget_max numeric check (budget_max >= 0),
  currency text not null default 'USD',
  deadline timestamptz not null,
  status text not null default 'open'
    check (status in ('draft', 'open', 'in_progress', 'completed', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pr_buyer on public.procurement_requests (buyer_id);
create index idx_pr_category on public.procurement_requests (category_id);
create index idx_pr_status on public.procurement_requests (status);
create index idx_pr_deadline on public.procurement_requests (deadline);

create trigger trg_pr_updated_at
  before update on public.procurement_requests
  for each row execute function public.handle_updated_at();

-- ============================================================
-- QUOTATIONS
-- ============================================================
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  procurement_id uuid not null references public.procurement_requests(id) on delete cascade,
  supplier_id uuid not null references public.users(id) on delete cascade,
  price numeric not null check (price >= 0),
  currency text not null default 'USD',
  delivery_days integer not null check (delivery_days > 0),
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (procurement_id, supplier_id)
);

create index idx_quotations_procurement on public.quotations (procurement_id);
create index idx_quotations_supplier on public.quotations (supplier_id);
create index idx_quotations_status on public.quotations (status);

create trigger trg_quotations_updated_at
  before update on public.quotations
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.procurement_requests enable row level security;
alter table public.quotations enable row level security;

-- ---------- Helper: current user id ----------
-- auth.uid() is the signed-in auth.users id.

-- ---------- USERS policies ----------
-- Users can read/update their own profile.
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins manage all users.
create policy "users_select_admin"
  on public.users for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('administrator', 'super_administrator')
    )
  );

create policy "users_insert_service"
  on public.users for insert
  with check (auth.uid() = id);

-- ---------- USER ROLES policies ----------
create policy "user_roles_select_own"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "user_roles_select_admin"
  on public.user_roles for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('administrator', 'super_administrator')
    )
  );

create policy "user_roles_insert_own"
  on public.user_roles for insert
  with check (auth.uid() = user_id);

-- ---------- CATEGORIES policies ----------
-- Categories are public-read.
create policy "categories_select_all"
  on public.categories for select
  using (true);

-- ---------- PROCUREMENT REQUESTS policies ----------
-- Buyers can CRUD their own requests.
create policy "pr_select_own"
  on public.procurement_requests for select
  using (auth.uid() = buyer_id);

create policy "pr_insert_own"
  on public.procurement_requests for insert
  with check (auth.uid() = buyer_id);

create policy "pr_update_own"
  on public.procurement_requests for update
  using (auth.uid() = buyer_id)
  with check (auth.uid() = buyer_id);

create policy "pr_delete_own"
  on public.procurement_requests for delete
  using (auth.uid() = buyer_id);

-- Suppliers can view open requests.
create policy "pr_select_open_supplier"
  on public.procurement_requests for select
  using (
    status in ('open', 'in_progress')
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'supplier'
    )
  );

-- Admins see everything.
create policy "pr_select_admin"
  on public.procurement_requests for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('administrator', 'super_administrator')
    )
  );

-- ---------- QUOTATIONS policies ----------
-- Suppliers manage their own quotations.
create policy "quotations_select_own_supplier"
  on public.quotations for select
  using (auth.uid() = supplier_id);

create policy "quotations_insert_own_supplier"
  on public.quotations for insert
  with check (auth.uid() = supplier_id);

create policy "quotations_update_own_supplier"
  on public.quotations for update
  using (auth.uid() = supplier_id)
  with check (auth.uid() = supplier_id);

create policy "quotations_delete_own_supplier"
  on public.quotations for delete
  using (auth.uid() = supplier_id);

-- Buyers can view quotations for their own procurement requests.
create policy "quotations_select_buyer"
  on public.quotations for select
  using (
    exists (
      select 1 from public.procurement_requests pr
      where pr.id = quotations.procurement_id
        and pr.buyer_id = auth.uid()
    )
  );

-- Admins see everything.
create policy "quotations_select_admin"
  on public.quotations for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('administrator', 'super_administrator')
    )
  );