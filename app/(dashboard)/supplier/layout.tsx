export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-lg font-bold">NeedLink — Supplier</h1>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
