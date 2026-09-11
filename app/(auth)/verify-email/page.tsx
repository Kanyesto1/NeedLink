import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Verify Email",
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md px-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold">Check Your Email</h1>
        <p className="mb-8 text-muted-foreground">
          We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-primary px-6 py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
