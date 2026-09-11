const { title, pass, fail, summary, fileExists, readFile, result } = require("./lib")

title("Business validation")

const checks = []

const FEATURE_PATHS = [
  "app/page.tsx",
  "app/(dashboard)/buyer/page.tsx",
  "app/(dashboard)/supplier/page.tsx",
  "app/(dashboard)/admin/page.tsx",
  "app/(dashboard)/buyer/procurement-requests/new/page.tsx",
  "app/(dashboard)/buyer/procurement-requests/[id]/page.tsx",
  "app/(dashboard)/supplier/procurement-requests/[id]/page.tsx",
]

FEATURE_PATHS.forEach((p) => {
  const ok = fileExists(p)
  checks.push(result(ok, `feature page "${p}" exists`))
  if (!ok) fail(`"${p}" missing`)
})

if (fileExists("app/api/v1/procurement-requests/route.ts")) {
  const pr = readFile("app/api/v1/procurement-requests/route.ts")
  checks.push(result(pr.includes("POST") || pr.includes("export async function POST"), "buyer can create requests"))
}

if (fileExists("config/app.ts")) {
  const config = readFile("config/app.ts")
  const flags = ["DEMO_MODE", "ENABLE_AI", "ENABLE_PAYMENTS", "ENABLE_CHAT"]
  flags.forEach((f) => {
    const ok = config.includes(f)
    checks.push(result(ok, `feature flag "${f}" configured`))
  })
}

summary(checks)