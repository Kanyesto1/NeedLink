import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { ok, fail } from "@/lib/api"
import { getCurrentUser, isAdmin } from "@/lib/auth"

const updateSchema = z.object({
  status: z.enum(["accepted", "rejected", "withdrawn"]),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)

  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid quotation update")

  const { status } = parsed.data

  const { data: quotation, error: qError } = await supabase
    .from("quotations")
    .select("id, supplier_id, procurement_id, status")
    .eq("id", id)
    .maybeSingle()

  if (qError) return fail("DATABASE_ERROR", qError.message, 500)
  if (!quotation) return fail("NOT_FOUND", "Quotation not found", 404)

  const { data: procurement } = await supabase
    .from("procurement_requests")
    .select("id, buyer_id, status")
    .eq("id", quotation.procurement_id)
    .maybeSingle()

  if (!procurement) return fail("NOT_FOUND", "Procurement request not found", 404)

  const isOwnerSupplier = quotation.supplier_id === user.id
  const isOwnerBuyer = procurement.buyer_id === user.id
  const isAdminUser = isAdmin(user)

  if (status === "withdrawn") {
    if (!isOwnerSupplier && !isAdminUser) {
      return fail("AUTHORIZATION_ERROR", "Only the supplier can withdraw a quotation", 403)
    }
  } else {
    if (!isOwnerBuyer && !isAdminUser) {
      return fail("AUTHORIZATION_ERROR", "Only the buyer can accept or reject quotations", 403)
    }
    if (procurement.status !== "open" && !isAdminUser) {
      return fail("VALIDATION_ERROR", "This request is not accepting quotations", 400)
    }
  }

  if (status === "accepted") {
    const { error: txnError } = await supabase.rpc("accept_quotation", {
      p_quotation_id: id,
    })
    if (txnError) return fail("DATABASE_ERROR", txnError.message, 500)

    const { data: updated } = await supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .single()

    return ok({ quotation: updated })
  }

  const { data, error } = await supabase
    .from("quotations")
    .update({ status })
    .eq("id", id)
    .select()
    .single()

  if (error) return fail("DATABASE_ERROR", error.message, 500)

  return ok({ quotation: data })
}