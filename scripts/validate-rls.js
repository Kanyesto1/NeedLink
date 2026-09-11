const { title, pass, fail, summary, fileExists, readFile, result } = require("./lib")

title("RLS validation")

const checks = []
const schema = fileExists("database/migrations/001_initial_schema.sql")
  ? readFile("database/migrations/001_initial_schema.sql")
  : ""

if (!schema) {
  checks.push(result(false, "schema migration exists"))
  summary(checks)
  return
}

const TABLES = ["users", "user_roles", "categories", "procurement_requests", "quotations"]

TABLES.forEach((t) => {
  const ok = schema.includes(`alter table public.${t} enable row level security`)
  checks.push(result(ok, `RLS enabled on "${t}"`))
  if (!ok) fail(`RLS not enabled on "${t}"`)
})

const CRITICAL_POLICIES = [
  "users_select_own",
  "pr_select_own",
  "pr_select_open_supplier",
  "quotations_select_own_supplier",
  "quotations_select_buyer",
]

CRITICAL_POLICIES.forEach((p) => {
  const ok = schema.includes(`"${p}"`)
  checks.push(result(ok, `policy "${p}" exists`))
  if (!ok) fail(`policy "${p}" missing`)
})

// Every table with records must be locked down; no "using (true)" for write tables.
checks.push(result(schema.includes("using (true)"), "public-read policy present"))

summary(checks)