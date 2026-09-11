import Link from "next/link"
import LogoutButton from "@/components/auth/LogoutButton"

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/buyer" className="text-lg font-bold">
            NeedLink — Buyer
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/buyer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link
              href="/buyer/procurement-requests/new"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              New Request
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}