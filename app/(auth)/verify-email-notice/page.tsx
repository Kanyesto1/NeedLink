import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Email Verification Notice",
}

export default function VerifyEmailNoticePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md px-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
          <svg className="h-8 w-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold">Email Not Verified</h1>
        <p className="mb-8 text-muted-foreground">
          Your email address has not been verified yet. Please check your inbox for the verification link, or contact support if you need assistance.
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
