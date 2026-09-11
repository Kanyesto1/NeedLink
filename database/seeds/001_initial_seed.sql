-- ============================================================
-- NeedLink — Seed Data
-- Categories, plus helper functions for user provisioning
-- ============================================================

-- ---------- CATEGORIES ----------
insert into public.categories (name, slug, description) values
  ('Office Supplies', 'office-supplies', 'Stationery, paper, and general office consumables'),
  ('IT Hardware', 'it-hardware', 'Computers, peripherals, networking equipment'),
  ('Software & Licensing', 'software-licensing', 'Software licenses, SaaS subscriptions, maintenance'),
  ('Construction Materials', 'construction-materials', 'Cement, steel, timber, and building materials'),
  ('Industrial Equipment', 'industrial-equipment', 'Machinery, tools, and industrial supplies'),
  ('Furniture & Fixtures', 'furniture-fixtures', 'Office and institutional furniture'),
  ('Transportation & Logistics', 'transportation-logistics', 'Vehicles, freight, and logistics services'),
  ('Professional Services', 'professional-services', 'Consulting, legal, accounting, and advisory services'),
  ('Cleaning & Facility Services', 'cleaning-facility-services', 'Cleaning, maintenance, and facility management'),
  ('Healthcare & Medical', 'healthcare-medical', 'Medical supplies, equipment, and healthcare services'),
  ('Food & Catering', 'food-catering', 'Food supplies and catering services'),
  ('Printing & Marketing', 'printing-marketing', 'Printing, branding, and marketing materials')
on conflict (slug) do nothing;

-- ---------- HELPER: provision a new user ----------
-- Called after auth.users row is created (e.g. from a Supabase trigger or app code).
create or replace function public.provision_user(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_role text,
  p_company_name text default null
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, company_name)
  values (p_user_id, p_email, p_full_name, p_company_name)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (p_user_id, p_role)
  on conflict (user_id, role) do nothing;

  return true;
end;
$$;

-- ============================================================
-- DEMO DATA (optional, delete before production)
-- ============================================================

-- Demo buyer
insert into public.users (id, email, full_name, company_name, status, email_verified)
values (
  '00000000-0000-0000-0000-000000000001',
  'demo-buyer@needlink.app',
  'Demo Buyer',
  'Acme Corporation',
  'active',
  true
) on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000001', 'buyer')
on conflict (user_id, role) do nothing;

-- Demo supplier
insert into public.users (id, email, full_name, company_name, status, email_verified)
values (
  '00000000-0000-0000-0000-000000000002',
  'demo-supplier@needlink.app',
  'Demo Supplier',
  'Globex Trading Ltd',
  'active',
  true
) on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000002', 'supplier')
on conflict (user_id, role) do nothing;

-- Demo procurement request
insert into public.procurement_requests (
  id, buyer_id, title, description,
  category_id, quantity, unit, budget_min, budget_max,
  currency, deadline, status
)
select
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Office Laptops — 15 Units',
  'We need 15 business-grade laptops (8GB+ RAM, 256GB+ SSD) with standard warranty for our finance team.',
  id, 15, 'units', 450000, 750000, 'KES',
  now() + interval '21 days', 'open'
from public.categories
where slug = 'it-hardware'
on conflict (id) do nothing;