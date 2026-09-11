const { title, pass, fail, summary, fileExists, readFile, result } = require("./lib")

title("Security headers validation")

const checks = []

const config = fileExists("next.config.ts") ? readFile("next.config.ts") : ""

if (!config) {
  checks.push(result(false, "next.config.ts exists"))
  summary(checks)
  return
}

const REQUIRED_HEADERS = [
  "Strict-Transport-Security",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Content-Security-Policy",
  "Referrer-Policy",
  "Permissions-Policy",
]

REQUIRED_HEADERS.forEach((h) => {
  const ok = config.includes(h)
  checks.push(result(ok, `header "${h}" configured`))
  if (!ok) fail(`"${h}" missing from next.config.ts`)
})

checks.push(result(config.includes("poweredByHeader: false"), "X-Powered-By disabled"))

summary(checks)