const { title, pass, fail, summary, fileExists, readFile, result } = require("./lib")

title("Operational validation")

const checks = []

const ENV_FILES = [".env.example", ".env.development", ".env.staging", ".env.production", ".env.testing"]
ENV_FILES.forEach((e) => {
  const ok = fileExists(e)
  checks.push(result(ok, `env template "${e}" exists`))
})

const REQUIRE_ENV_KEYS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
if (fileExists(".env.example")) {
  const tmpl = readFile(".env.example")
  REQUIRE_ENV_KEYS.forEach((k) => {
    const ok = tmpl.includes(k)
    checks.push(result(ok, `env key "${k}" in .env.example`))
  })
}

const OPS_FILES = ["Dockerfile", "docker-compose.yml", "vitest.config.ts", "playwright.config.ts"]
OPS_FILES.forEach((f) => {
  const ok = fileExists(f)
  checks.push(result(ok, `ops config "${f}" exists`))
})

summary(checks)