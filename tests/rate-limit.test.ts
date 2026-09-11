import { describe, it, expect, beforeEach, vi } from "vitest"
import { getRateLimitKey, checkRateLimit } from "@/middleware/rate-limit"

vi.mock("next/server", () => ({}))

function makeRequest(ip: string | null) {
  return {
    headers: {
      get: (name: string) => (name === "x-forwarded-for" ? ip : null),
    },
  }
}

describe("getRateLimitKey", () => {
  it("uses the forwarded IP", () => {
    const request = makeRequest("1.2.3.4") as never
    expect(getRateLimitKey(request)).toBe("ratelimit:1.2.3.4")
  })

  it("normalizes when IP is unknown", () => {
    const request = makeRequest(null) as never
    expect(getRateLimitKey(request)).toBe("ratelimit:unknown")
  })

  it("takes the first IP from a forwarded chain", () => {
    const request = makeRequest("5.6.7.8, 9.9.9.9") as never
    expect(getRateLimitKey(request)).toBe("ratelimit:5.6.7.8")
  })
})

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it("allows the first request", () => {
    const r = checkRateLimit("key-1", "/api/v1/test")
    expect(r.allowed).toBe(true)
  })

  it("resets the window for a new key", () => {
    checkRateLimit("key-2", "/api/v1/test")
    const r = checkRateLimit("key-2", "/api/v1/test")
    expect(r.allowed).toBe(true)
  })

  it("blocks requests beyond the limit and reports resetIn", () => {
    const key = "burst-key"
    for (let i = 0; i < 100; i++) {
      expect(checkRateLimit(key, "/api/v1/test").allowed).toBe(true)
    }
    const blocked = checkRateLimit(key, "/api/v1/test")
    expect(blocked.allowed).toBe(false)
    expect(blocked.resetIn).toBeGreaterThan(0)
    expect(blocked.resetIn).toBeLessThanOrEqual(60_000)
  })

  it("allows again after the window elapses", () => {
    const key = "window-key"
    for (let i = 0; i < 101; i++) {
      checkRateLimit(key, "/api/v1/test")
    }
    expect(checkRateLimit(key, "/api/v1/test").allowed).toBe(false)

    vi.advanceTimersByTime(61_000)
    expect(checkRateLimit(key, "/api/v1/test").allowed).toBe(true)
  })
})