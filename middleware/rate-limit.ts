import type { NextRequest } from "next/server"

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60_000
const MAX_REQUESTS = 100

export function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown"
  return `ratelimit:${ip}`
}

export function checkRateLimit(
  key: string,
  _pathname: string,
): { allowed: boolean; resetIn: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, resetIn: WINDOW_MS }
  }

  entry.count++

  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, resetIn: entry.resetAt - now }
  }

  return { allowed: true, resetIn: entry.resetAt - now }
}
