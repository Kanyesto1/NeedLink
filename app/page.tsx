import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h1 className="mb-4 text-5xl font-bold">NeedLink</h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Connecting buyers with verified suppliers through competitive
          quotations
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-border px-6 py-3 font-medium hover:bg-muted transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 text-left">
          <div>
            <h3 className="mb-2 font-semibold">Post Requests</h3>
            <p className="text-sm text-muted-foreground">
              Buyers post procurement requests with specifications and budgets
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Get Quotations</h3>
            <p className="text-sm text-muted-foreground">
              Verified suppliers respond with competitive quotations
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Close Deals</h3>
            <p className="text-sm text-muted-foreground">
              Compare quotes, select suppliers, and finalize procurements
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
