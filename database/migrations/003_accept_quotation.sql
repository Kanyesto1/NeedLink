-- ============================================================
-- NeedLink — Migration 003: accept_quotation RPC
-- Atomically: set the chosen quotation to 'accepted', reject all
-- others on the same procurement, and move the request to
-- 'in_progress'. The caller's JWT (auth.uid()) must be the buyer.
-- ============================================================

create or replace function public.accept_quotation(
  p_quotation_id uuid
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_procurement_id uuid;
  v_buyer_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  -- resolve the quotation and its owning procurement/buyer
  select q.procurement_id, pr.buyer_id
    into v_procurement_id, v_buyer_id
  from public.quotations q
  join public.procurement_requests pr on pr.id = q.procurement_id
  where q.id = p_quotation_id;

  if v_procurement_id is null then
    raise exception 'quotation not found' using errcode = 'P0002';
  end if;

  -- only the buyer or an admin may accept
  if v_buyer_id is distinct from auth.uid() then
    if not exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('administrator', 'super_administrator')
    ) then
      raise exception 'insufficient permissions' using errcode = '42501';
    end if;
  end if;

  -- accept the chosen quotation
  update public.quotations
     set status = 'accepted'
   where id = p_quotation_id;

  -- reject every other quotation on the same request
  update public.quotations
     set status = 'rejected'
   where procurement_id = v_procurement_id
     and id <> p_quotation_id
     and status = 'pending';

  -- move the request along
  update public.procurement_requests
     set status = 'in_progress'
   where id = v_procurement_id;

  return;
end;
$$;

revoke execute on function public.accept_quotation(uuid) from public, anon;
grant execute on function public.accept_quotation(uuid) to authenticated;