const { title, pass, fail, summary, fileExists, readFile, result } = require("./lib")

title("Database validation")

const checks = []

const MIGRATIONS = ["001_initial_schema.sql", "002_auto_provision_user.sql", "003_accept_quotation.sql"]

MIGRATIONS.forEach((m) => {
  const ok = fileExists(`database/migrations/${m}`)
  checks.push(result(ok, `migration "${m}" exists`))
  if (!ok) fail(`migration "${m}" missing`)
})

const seed = fileExists("database/seeds/001_initial_seed.sql")
checks.push(result(seed, "seed file exists"))

if (fileExists("database/migrations/001_initial_schema.sql")) {
  const schema = readFile("database/migrations/001_initial_schema.sql")
  const TABLES = ["users", "user_roles", "categories", "procurement_requests", "quotations"]
  TABLES.forEach((t) => {
    const ok = schema.includes(`create table public.${t}`)
    checks.push(result(ok, `table "${t}" defined`))
    if (!ok) fail(`table "${t}" missing`)
  })
  checks.push(result(schema.includes("enable row level security"), "RLS enabled"))
  checks.push(result(schema.includes("create policy"), "policies defined"))
}

summary(checks)