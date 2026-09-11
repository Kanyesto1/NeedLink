export default function BuyerDashboardPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Buyer Dashboard</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Active Requests</p>
          <p className="mt-1 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Received Quotations</p>
          <p className="mt-1 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Completed Deals</p>
          <p className="mt-1 text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}
