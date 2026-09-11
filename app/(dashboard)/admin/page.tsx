import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSupabase } from "@/lib/supabase"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts"

export const dynamic = "force-dynamic"

function groupBy<T>(rows: T[], key: keyof T, fallback: string): Array<{ key: string; count: number }> {
  const map = new Map<string, number>()
  rows.forEach((r) => {
    const k = String(r[key] ?? fallback)
    map.set(k, (map.get(k) ?? 0) + 1)
  })
  return Array.from(map.entries()).map(([name, count]) => ({ key: name, count }))
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user || !isAdmin(user)) {
    redirect("/login")
  }

  const supabase = await getServerSupabase()

  const [
    { count: totalUsers },
    { count: buyers },
    { count: suppliers },
    { count: requests },
    { data: requestRows },
    { data: quotationRows },
    { data: userRows },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "buyer"),
    supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "supplier"),
    supabase.from("procurement_requests").select("id", { count: "exact", head: true }),
    supabase.from("procurement_requests").select("status"),
    supabase.from("quotations").select("status"),
    supabase.from("users").select("status"),
  ])

  const analytics = {
    summary: {
      requestsByStatus: groupBy(requestRows ?? [], "status", "unknown"),
      quotationsByStatus: groupBy(quotationRows ?? [], "status", "unknown"),
      usersByStatus: groupBy(userRows ?? [], "status", "unknown"),
    },
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Admin Dashboard</h2>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users" className="rounded-lg border border-border p-6 hover:bg-muted transition-colors">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="mt-1 text-3xl font-bold">{totalUsers ?? 0}</p>
        </Link>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Buyers</p>
          <p className="mt-1 text-3xl font-bold">{buyers ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Suppliers</p>
          <p className="mt-1 text-3xl font-bold">{suppliers ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Procurement Requests</p>
          <p className="mt-1 text-3xl font-bold">{requests ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/users"
          className="rounded-lg border border-border p-6 hover:bg-muted transition-colors"
        >
          <h3 className="font-semibold">Manage Users</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            View all users, change account status, verify emails
          </p>
        </Link>
        <Link
          href="/admin/categories"
          className="rounded-lg border border-border p-6 hover:bg-muted transition-colors"
        >
          <h3 className="font-semibold">Manage Categories</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add and view procurement categories
          </p>
        </Link>
      </div>

      <h3 className="mb-4 mt-8 text-lg font-semibold">Analytics</h3>
      <AnalyticsCharts data={analytics} />
    </div>
  )
}