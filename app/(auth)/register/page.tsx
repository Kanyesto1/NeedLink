import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Create Account",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md px-4">
        <h1 className="mb-2 text-center text-2xl font-bold">Create Account</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Join NeedLink as a buyer or supplier
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              I want to join as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center justify-center rounded-lg border border-border p-3 hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="role" value="buyer" className="sr-only" defaultChecked />
                <span className="font-medium">Buyer</span>
              </label>
              <label className="flex cursor-pointer items-center justify-center rounded-lg border border-border p-3 hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="role" value="supplier" className="sr-only" />
                <span className="font-medium">Supplier</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
