import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { ok, fail } from "@/lib/api"
import { getCurrentUser, isAdmin, isSupplier } from "@/lib/auth"

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  category_id: z.string().uuid().optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().max(50).nullable().optional(),
  budget_min: z.number().nonnegative().nullable().optional(),
  budget_max: z.number().nonnegative().nullable().optional(),
  currency: z.string().max(3).optional(),
  deadline: z.string().datetime().optional(),
  status: z
    .enum(["draft", "open", "in_progress", "completed", "cancelled", "expired"])
    .optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)

  const { data, error } = await supabase
    .from("procurement_requests")
    .select("*, categories(name, slug), buyer:users(full_name, company_name)")
    .eq("id", id)
    .maybeSingle()

  if (error) return fail("DATABASE_ERROR", error.message, 500)
  if (!data) return fail("NOT_FOUND", "Procurement request not found", 404)

  const canView =
    data.buyer_id === user.id ||
    isAdmin(user) ||
    (isSupplier(user) && ["open", "in_progress"].includes(data.status))

  if (!canView) return fail("AUTHORIZATION_ERROR", "Insufficient permissions", 403)

  return ok({ procurementRequest: data })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)

  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid update data")

  const { data: existing } = await supabase
    .from("procurement_requests")
    .select("buyer_id, status")
    .eq("id", id)
    .maybeSingle()

  if (!existing) return fail("NOT_FOUND", "Procurement request not found", 404)

  const canEdit = existing.buyer_id === user.id || isAdmin(user)
  if (!canEdit) return fail("AUTHORIZATION_ERROR", "Insufficient permissions", 403)

  if (existing.status === "completed" && parsed.data.status && parsed.data.status !== "completed") {
    return fail("VALIDATION_ERROR", "Completed requests cannot be reopened")
  }

  const { data, error } = await supabase
    .from("procurement_requests")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single()

  if (error) return fail("DATABASE_ERROR", error.message, 500)

  return ok({ procurementRequest: data })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)

  const { data: existing } = await supabase
    .from("procurement_requests")
    .select("buyer_id, status")
    .eq("id", id)
    .maybeSingle()

  if (!existing) return fail("NOT_FOUND", "Procurement request not found", 404)

  const canDelete = existing.buyer_id === user.id || isAdmin(user)
  if (!canDelete) return fail("AUTHORIZATION_ERROR", "Insufficient permissions", 403)

  const { error } = await supabase
    .from("procurement_requests")
    .delete()
    .eq("id", id)

  if (error) return fail("DATABASE_ERROR", error.message, 500)

  return ok({ deleted: true })
}