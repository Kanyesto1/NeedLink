import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSupabase } from "@/lib/supabase"
import { getCurrentUser, isBuyer } from "@/lib/auth"

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-success/10 text-success",
  in_progress: "bg-info/10 text-info",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
}

export const dynamic = "force-dynamic"

export default async function BuyerDashboardPage() {
  const user = await getCurrentUser()

  if (!user || !isBuyer(user)) {
    redirect("/login")
  }

  const supabase = await getServerSupabase()

  const { data: requests } = await supabase
    .from("procurement_requests")
    .select("*, categories(name, slug)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  const openCount = requests?.filter((r) => r.status === "open").length ?? 0
  const inProgressCount = requests?.filter((r) => r.status === "in_progress").length ?? 0
  const completedCount = requests?.filter((r) => r.status === "completed").length ?? 0

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Buyer Dashboard</h2>
        <Link
          href="/buyer/procurement-requests/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          New Request
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Open Requests</p>
          <p className="mt-1 text-3xl font-bold">{openCount}</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="mt-1 text-3xl font-bold">{inProgressCount}</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="mt-1 text-3xl font-bold">{completedCount}</p>
        </div>
      </div>

      <h3 className="mb-4 text-lg font-semibold">My Procurement Requests</h3>

      {!requests || requests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="mb-4">You haven&apos;t posted any requests yet.</p>
          <Link href="/buyer/procurement-requests/new" className="text-primary font-medium hover:underline">
            Post your first request
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link href={`/buyer/procurement-requests/${r.id}`} className="font-medium hover:underline">
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.categories?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {r.quantity} {r.unit ?? ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status] ?? ""}`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(r.deadline).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}