import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Reset Password",
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md px-4">
        <h1 className="mb-2 text-center text-2xl font-bold">Reset Password</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Enter your new password below
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              New Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter new password"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Reset Password
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
