import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { ok, fail } from "@/lib/api"
import { getCurrentUser, isAdmin } from "@/lib/auth"

const updateSchema = z.object({
  status: z.enum(["active", "inactive", "suspended", "pending_verification"]).optional(),
  update_email_verified: z.boolean().optional(),
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)
  if (!isAdmin(user)) return fail("AUTHORIZATION_ERROR", "Admin access required", 403)

  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, company_name, status, email_verified, created_at, user_roles(*)")
    .order("created_at", { ascending: false })

  if (error) return fail("DATABASE_ERROR", error.message, 500)

  return ok({ users: data })
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)
  if (!isAdmin(user)) return fail("AUTHORIZATION_ERROR", "Admin access required", 403)

  const body = await request.json().catch(() => null)
  const { userId, ...patch } = body ?? {}

  if (!userId || typeof userId !== "string") {
    return fail("VALIDATION_ERROR", "userId is required")
  }

  const parsed = updateSchema.safeParse(patch)
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid update data")

  const updates: Record<string, unknown> = {}
  if (parsed.data.status) updates.status = parsed.data.status
  if (parsed.data.update_email_verified !== undefined) {
    updates.email_verified = parsed.data.update_email_verified
  }

  if (Object.keys(updates).length === 0) {
    return fail("VALIDATION_ERROR", "Nothing to update")
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, email, full_name, company_name, status, email_verified, user_roles(*)")
    .single()

  if (error) return fail("DATABASE_ERROR", error.message, 500)

  return ok({ user: data })
}