import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Forgot Password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md px-4">
        <h1 className="mb-2 text-center text-2xl font-bold">Forgot Password</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>

        <form className="space-y-4">
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
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
