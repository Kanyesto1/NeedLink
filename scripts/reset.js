const { title, summary, result } = require("./lib")

title("Database reset")

const checks = []
const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

for (const key of REQUIRED_ENV) {
  const ok = !!process.env[key]
  checks.push(result(ok, `env var ${key} is present`))
}

summary(checks)
console.log("\nTo reset: run the following in the Supabase SQL Editor:\n")
console.log("  drop table if exists public.quotations cascade;")
console.log("  drop table if exists public.procurement_requests cascade;")
console.log("  drop table if exists public.categories cascade;")
console.log("  drop table if exists public.user_roles cascade;")
console.log("  drop table if exists public.users cascade;")
console.log("\nThen re-run migrations 001-003 and the seed.")
