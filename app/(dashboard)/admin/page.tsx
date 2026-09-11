export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="mt-1 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Active Buyers</p>
          <p className="mt-1 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Active Suppliers</p>
          <p className="mt-1 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Procurements</p>
          <p className="mt-1 text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}
