import { describe, it, expect } from "vitest"
import { cn } from "@/utils/classnames"

describe("cn", () => {
  it("merges simple class strings", () => {
    expect(cn("a", "b", "c")).toBe("a b c")
  })

  it("filters out falsy values", () => {
    expect(cn("a", false, undefined, null, "", "b")).toBe("a b")
  })

  it("handles conditional objects", () => {
    expect(cn({ active: true, hidden: false })).toBe("active")
  })

  it("merges tailwind conflicts (twMerge)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
    expect(cn("p-2", "px-4")).toBe("p-2 px-4")
  })

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("")
  })
})