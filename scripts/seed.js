const { title, summary, fileExists, result, fail } = require("./lib")

title("Database seed status")

const checks = []

checks.push(result(fileExists("database/seeds/001_initial_seed.sql"), "seed file exists"))

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
for (const key of REQUIRED_ENV) {
  const ok = !!process.env[key]
  checks.push(result(ok, `env var ${key} is present`))
  if (!ok) fail(`env var ${key} missing`)
}

summary(checks)
console.log("\nApply the seed by pasting database/seeds/*.sql into the Supabase SQL Editor.")
