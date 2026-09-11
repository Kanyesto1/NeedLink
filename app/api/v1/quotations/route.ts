import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { ok, fail } from "@/lib/api"
import { getCurrentUser, isBuyer, isSupplier } from "@/lib/auth"
import { notifyBuyerOfNewQuotation } from "@/services/notification/service"

const createSchema = z.object({
  procurement_id: z.string().uuid(),
  price: z.number().nonnegative(),
  currency: z.string().max(3).default("USD"),
  delivery_days: z.number().int().positive(),
  notes: z.string().max(2000).optional(),
})

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)

  const { searchParams } = new URL(request.url)
  const procurementId = searchParams.get("procurementId")

  const baseSelect =
    "*, procurement:procurement_requests(id, title, buyer_id, status), supplier:users(full_name, company_name)"

  let query = supabase.from("quotations").select(baseSelect)

  if (procurementId) {
    query = query.eq("procurement_id", procurementId)
  } else if (isSupplier(user) && !isBuyer(user)) {
    query = query.eq("supplier_id", user.id)
  } else if (isBuyer(user)) {
    const { data: ownRequests } = await supabase
      .from("procurement_requests")
      .select("id")
      .eq("buyer_id", user.id)
    const ids = ownRequests?.map((r) => r.id) ?? []
    if (ids.length === 0) return ok({ quotations: [] })
    query = supabase
      .from("quotations")
      .select(baseSelect)
      .in("procurement_id", ids)
  } else {
    return fail("AUTHORIZATION_ERROR", "Insufficient permissions", 403)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) return fail("DATABASE_ERROR", error.message, 500)

  return ok({ quotations: data })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)
  if (!isSupplier(user)) return fail("AUTHORIZATION_ERROR", "Only suppliers can quote", 403)

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid quotation data")

  const { procurement_id, price, currency, delivery_days, notes } = parsed.data

  const { data: procurement, error: prError } = await supabase
    .from("procurement_requests")
    .select("id, buyer_id, title, status")
    .eq("id", procurement_id)
    .maybeSingle()

  if (prError) return fail("DATABASE_ERROR", prError.message, 500)
  if (!procurement) return fail("NOT_FOUND", "Procurement request not found", 404)

  if (procurement.buyer_id === user.id) {
    return fail("VALIDATION_ERROR", "You cannot quote on your own request", 400)
  }

  if (procurement.status !== "open") {
    return fail("VALIDATION_ERROR", "This request is not accepting quotations", 400)
  }

  const { data, error } = await supabase
    .from("quotations")
    .insert({
      procurement_id,
      supplier_id: user.id,
      price,
      currency,
      delivery_days,
      notes: notes ?? null,
    })
    .select("*, procurement:procurement_requests(id, title, buyer_id, status)")
    .single()

  if (error) {
    if (error.code === "23505") {
      return fail("DUPLICATE_QUOTATION", "You have already quoted on this request", 409)
    }
    return fail("DATABASE_ERROR", error.message, 500)
  }

  void (async () => {
    const { data: buyer } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", data.procurement.buyer_id)
      .maybeSingle()

    if (buyer) {
      await notifyBuyerOfNewQuotation({
        buyerEmail: buyer.email,
        buyerName: buyer.full_name,
        requestTitle: data.procurement.title,
        supplierName: user.full_name,
        price,
        currency,
        requestId: procurement_id,
      })
    }
  })()

  return ok({ quotation: data }, 201)
}