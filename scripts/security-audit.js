const { title, pass, fail, summary, fileExists, readFile, result } = require("./lib")
const { execSync } = require("child_process")

title("Security audit")

const checks = []

// 1. .env.local must not be tracked by git
try {
  const tracked = execSync("git ls-files .env.local", { encoding: "utf8" }).trim()
  checks.push(result(tracked.length === 0, ".env.local is not tracked by git"))
  if (tracked.length > 0) fail(".env.local is TRACKED — secrets are exposed!")
} catch {
  checks.push(result(false, "git is available to verify tracking"))
}

// 2. real secret VALUES (JWT tokens / keys) must not appear in source files.
//    Env var NAMES are fine; only flag actual credential values.
const SECRET_PATTERNS = [
  /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  /\bSUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["']?eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  /-----BEGIN (RSA |EC |)PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
]

const fs = require("fs")
const path = require("path")
function walk(dir, files = []) {
  if (!fs.existsSync(path.join(process.cwd(), dir))) return files
  for (const entry of fs.readdirSync(path.join(process.cwd(), dir), { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue
      walk(full, files)
    } else if (/\.(ts|tsx|js|json)$/.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

let secretFound = false
walk(".").forEach((f) => {
  const content = readFile(f)
  SECRET_PATTERNS.forEach((re) => {
    if (re.test(content)) {
      checks.push(result(false, `possible secret value in ${f.replace(/\\/g, "/")}`))
      secretFound = true
    }
  })
})

if (!secretFound) {
  checks.push(result(true, "no hard-coded secrets in source files"))
}

// 3. SECURITY.md exists
checks.push(result(fileExists("SECURITY.md"), "SECURITY.md exists"))

summary(checks)