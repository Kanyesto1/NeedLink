import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSupabase } from "@/lib/supabase"
import { getCurrentUser, isSupplier } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function SupplierDashboardPage() {
  const user = await getCurrentUser()

  if (!user || !isSupplier(user)) {
    redirect("/login")
  }

  const supabase = await getServerSupabase()

  const { data: openRequests } = await supabase
    .from("procurement_requests")
    .select("*, categories(name, slug), buyer:users(full_name, company_name)")
    .in("status", ["open", "in_progress"])
    .order("created_at", { ascending: false })

  const { count: myQuotes } = await supabase
    .from("quotations")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", user.id)

  const { count: wonDeals } = await supabase
    .from("quotations")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", user.id)
    .eq("status", "accepted")

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Supplier Dashboard</h2>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Open Requests</p>
          <p className="mt-1 text-3xl font-bold">{openRequests?.length ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">My Quotations</p>
          <p className="mt-1 text-3xl font-bold">{myQuotes ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Won Deals</p>
          <p className="mt-1 text-3xl font-bold">{wonDeals ?? 0}</p>
        </div>
      </div>

      <h3 className="mb-4 text-lg font-semibold">Open Requests in the Marketplace</h3>

      {!openRequests || openRequests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          No open procurement requests right now. Check back soon.
        </p>
      ) : (
        <div className="space-y-4">
          {openRequests.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/supplier/procurement-requests/${r.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {r.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.categories?.name ?? "Uncategorized"} · {r.quantity} {r.unit ?? ""} · Due{" "}
                    {new Date(r.deadline).toLocaleDateString()}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm">{r.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Posted by {r.buyer?.company_name ?? r.buyer?.full_name}
                  </p>
                </div>
                {r.budget_max != null && (
                  <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Budget {r.currency} {r.budget_max.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}