export const APP_NAME = "NeedLink"
export const APP_DESCRIPTION = "Connecting buyers with verified suppliers through competitive quotations"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
export const ENABLE_AI = process.env.NEXT_PUBLIC_ENABLE_AI === "true"
export const ENABLE_PAYMENTS = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true"
export const ENABLE_CHAT = process.env.NEXT_PUBLIC_ENABLE_CHAT === "true"

export const CACHE_PROVIDER = process.env.CACHE_PROVIDER ?? "in-memory"
export const QUEUE_PROVIDER = process.env.QUEUE_PROVIDER ?? "in-memory"

export const ROLES = {
  BUYER: "buyer",
  SUPPLIER: "supplier",
  ADMINISTRATOR: "administrator",
  SUPER_ADMINISTRATOR: "super_administrator",
} as const
