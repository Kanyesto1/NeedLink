import { supabase } from "@/lib/supabase"
import { ok, fail } from "@/lib/api"
import { getCurrentUser, isAdmin } from "@/lib/auth"

function groupBy<T>(rows: T[], key: keyof T, fallback: string): Array<{ key: string; count: number }> {
  const map = new Map<string, number>()
  rows.forEach((r) => {
    const k = String(r[key] ?? fallback)
    map.set(k, (map.get(k) ?? 0) + 1)
  })
  return Array.from(map.entries()).map(([keyName, count]) => ({ key: keyName, count }))
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return fail("AUTHENTICATION_ERROR", "Authentication required", 401)
  if (!isAdmin(user)) return fail("AUTHORIZATION_ERROR", "Admin access required", 403)

  const [{ data: requests }, { data: quotations, count: quotationCount }, { data: users }] =
    await Promise.all([
      supabase.from("procurement_requests").select("status, category_id"),
      supabase.from("quotations").select("status", { count: "exact" }),
      supabase.from("users").select("status"),
    ])

  if (requests === null || quotations === null || users === null) {
    return fail("DATABASE_ERROR", "Unable to load analytics data", 500)
  }

  return ok({
    requests,
    quotations,
    quotationCount: quotationCount ?? 0,
    users,
    summary: {
      requestsByStatus: groupBy(requests, "status", "unknown"),
      quotationsByStatus: groupBy(quotations, "status", "unknown"),
      usersByStatus: groupBy(users, "status", "unknown"),
    },
  })
}