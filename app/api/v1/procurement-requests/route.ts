import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { ok, fail } from "@/lib/api"
import { getCurrentUser, isAdmin, isBuyer, isSupplier } from "@/lib/auth"
import type { ProcurementStatus } from "@/types"

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.string().max(50).optional(),
  budget_min: z.number().nonnegative().optional(),
  budget_max: z.number().nonnegative().optional(),
  currency: z.string().max(3).default("USD"),
  deadline: z.string().datetime(),
  status: z.enum(["draft", "open"]).default("open"),
})

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)

  const { searchParams } = new URL(request.url)
  const scope = searchParams.get("scope") ?? "mine"
  const status = searchParams.get("status") as ProcurementStatus | null
  const category = searchParams.get("category")

  let query = supabase
    .from("procurement_requests")
    .select("*, categories(name, slug), buyer:users(full_name, company_name)")

  if (isAdmin(user) && scope !== "mine") {
    // admins see all
  } else if (isBuyer(user) && scope === "mine") {
    query = query.eq("buyer_id", user.id)
  } else if (isSupplier(user) || scope === "public") {
    query = query.in("status", ["open", "in_progress"])
  } else {
    return fail("AUTHORIZATION_ERROR", "Insufficient permissions", 403)
  }

  if (status) query = query.eq("status", status)
  if (category) query = query.eq("category_id", category)

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) return fail("DATABASE_ERROR", error.message, 500)

  return ok({ procurementRequests: data })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)
  if (!isBuyer(user)) return fail("AUTHORIZATION_ERROR", "Only buyers can post requests", 403)

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid request data")

  const { budget_min, budget_max, unit, status, ...rest } = parsed.data

  if (budget_min && budget_max && budget_max < budget_min) {
    return fail("VALIDATION_ERROR", "budget_max must be >= budget_min")
  }

  const { data, error } = await supabase
    .from("procurement_requests")
    .insert({
      buyer_id: user.id,
      title: rest.title,
      description: rest.description,
      category_id: rest.category_id,
      quantity: rest.quantity,
      unit: unit ?? null,
      budget_min: budget_min ?? null,
      budget_max: budget_max ?? null,
      currency: rest.currency,
      deadline: rest.deadline,
      status,
    })
    .select()
    .single()

  if (error) return fail("DATABASE_ERROR", error.message, 500)

  return ok({ procurementRequest: data }, 201)
}