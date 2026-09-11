const { title, pass, fail, summary, fileExists, readFile, result } = require("./lib")

title("Build verification")

const checks = []

checks.push(result(fileExists(".next/BUILD_ID"), "production build exists"))
checks.push(result(fileExists(".next/server"), "server output exists"))

if (fileExists(".next/BUILD_ID")) {
  const buildId = readFile(".next/BUILD_ID").trim()
  checks.push(result(buildId.length > 0, "BUILD_ID is valid"))
}

const REQUIRED_ROUTES = [
  ["login", ".next/server/app/login", ".next/server/app/login.html"],
  ["register", ".next/server/app/register", ".next/server/app/register.html"],
  ["buyer", ".next/server/app/(dashboard)/buyer", ".next/server/app/buyer"],
  ["supplier", ".next/server/app/(dashboard)/supplier", ".next/server/app/supplier"],
  ["admin", ".next/server/app/(dashboard)/admin", ".next/server/app/admin"],
  ["health", ".next/server/app/api/v1/health"],
  ["procurement-requests", ".next/server/app/api/v1/procurement-requests"],
]

REQUIRED_ROUTES.forEach(([label, ...paths]) => {
  const ok = paths.some((p) => fileExists(p))
  checks.push(result(ok, `route "${label}" in build output`))
  if (!ok) fail(`route "${label}" not found in build output`)
})

summary(checks)
