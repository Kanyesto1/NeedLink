const { title, pass, fail, summary, fileExists, result } = require("./lib")

title("Architecture validation")

const checks = []

const REQUIRED_DIRS = [
  "app",
  "components",
  "services",
  "features",
  "utils",
  "config",
  "database",
  "scripts",
  "types",
  "lib",
  "middleware",
  "hooks",
  "styles",
  "public",
]

REQUIRED_DIRS.forEach((dir) => {
  checks.push(result(fileExists(dir), `directory "${dir}" exists`))
})

const REQUIRED_FILES = [
  "app/layout.tsx",
  "app/page.tsx",
  "styles/globals.css",
  "types/index.ts",
  "lib/supabase.ts",
  "lib/auth.ts",
  "proxy.ts",
]

REQUIRED_FILES.forEach((f) => {
  const ok = fileExists(f)
  checks.push(result(ok, `file "${f}" exists`))
  if (ok) fsPass(`file "${f}" exists`)
})

function fsPass(msg) {
  pass(msg)
}

summary(checks)