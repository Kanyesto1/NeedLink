import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { ok, fail } from "@/lib/api"
import { getCurrentUser, isAdmin } from "@/lib/auth"

const createSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  parent_id: z.string().uuid().optional(),
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)
  if (!isAdmin(user)) return fail("AUTHORIZATION_ERROR", "Admin access required", 403)

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) return fail("DATABASE_ERROR", error.message, 500)

  return ok({ categories: data })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)
  if (!isAdmin(user)) return fail("AUTHORIZATION_ERROR", "Admin access required", 403)

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid category data")

  const { data, error } = await supabase
    .from("categories")
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return fail("DUPLICATE_CATEGORY", "A category with this slug already exists", 409)
    }
    return fail("DATABASE_ERROR", error.message, 500)
  }

  return ok({ category: data }, 201)
}