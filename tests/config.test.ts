import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { ROLES } from "@/config/app"

describe("app config", () => {
  const ORIGINAL = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...ORIGINAL }
  })

  it("defines the four core roles", () => {
    expect(ROLES).toEqual({
      BUYER: "buyer",
      SUPPLIER: "supplier",
      ADMINISTRATOR: "administrator",
      SUPER_ADMINISTRATOR: "super_administrator",
    })
  })

  it("maps demo mode flag correctly", async () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "true"
    const mod = await import("@/config/app")
    expect(mod.DEMO_MODE).toBe(true)
  })

  it("reads feature flags as booleans", async () => {
    process.env.NEXT_PUBLIC_ENABLE_AI = "true"
    process.env.NEXT_PUBLIC_ENABLE_PAYMENTS = "false"
    const mod = await import("@/config/app")
    expect(mod.ENABLE_AI).toBe(true)
    expect(mod.ENABLE_PAYMENTS).toBe(false)
  })
})