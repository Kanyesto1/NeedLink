const { title, pass, fail, summary, fileExists, readFile, result } = require("./lib")

title("Auth validation")

const checks = []

const AUTH_ROUTES = [
  "app/api/v1/auth/login",
  "app/api/v1/auth/register",
  "app/api/v1/auth/logout",
  "app/api/v1/auth/session",
  "app/api/v1/auth/reset-password",
]

AUTH_ROUTES.forEach((r) => {
  const ok = fileExists(`${r}/route.ts`)
  checks.push(result(ok, `auth route "${r}" exists`))
  if (!ok) fail(`auth route "${r}" missing`)
})

const authPages = [
  "app/(auth)/login/page.tsx",
  "app/(auth)/register/page.tsx",
  "app/(auth)/forgot-password/page.tsx",
  "app/(auth)/reset-password/page.tsx",
  "app/(auth)/verify-email/page.tsx",
  "app/(auth)/verify-email-notice/page.tsx",
]

authPages.forEach((p) => {
  const ok = fileExists(p)
  checks.push(result(ok, `auth page "${p}" exists`))
  if (!ok) fail(`auth page "${p}" missing`)
})

if (fileExists("app/api/v1/auth/login/route.ts")) {
  const login = readFile("app/api/v1/auth/login/route.ts")
  checks.push(result(login.includes("needlink_session"), "session cookie set on login"))
  checks.push(result(login.includes("signInWithPassword"), "uses Supabase signInWithPassword"))
}

if (fileExists("app/api/v1/auth/register/route.ts")) {
  const register = readFile("app/api/v1/auth/register/route.ts")
  checks.push(result(register.includes("admin.createUser"), "uses service-role createUser"))
}

if (fileExists("lib/auth.ts")) {
  const authLib = readFile("lib/auth.ts")
  checks.push(result(authLib.includes("getCurrentUser"), "getCurrentUser helper exists"))
  checks.push(result(authLib.includes("hasRole"), "hasRole helper exists"))
}

summary(checks)