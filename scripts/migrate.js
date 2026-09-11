const { title, pass, fail, summary, fileExists, result } = require("./lib")

title("Database migration status")

const checks = []

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

for (const key of REQUIRED_ENV) {
  const ok = !!process.env[key]
  checks.push(result(ok, `env var ${key} is present`))
  if (!ok) fail(`env var ${key} missing — check .env.local`)
}

if (!checks.every((c) => c.ok)) {
  fail("Configure .env.local from .env.example before migrating.")
}

const MIGRATIONS = ["001_initial_schema.sql", "002_auto_provision_user.sql", "003_accept_quotation.sql"]
for (const m of MIGRATIONS) {
  checks.push(result(fileExists(`database/migrations/${m}`), `migration ${m} found`))
}

summary(checks)
console.log("\nApply migrations by pasting database/migrations/*.sql into the Supabase SQL Editor,\nin order, then run npm run db:seed and npm run db:reset as needed.")
