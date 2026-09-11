const { title, pass, fail, summary, fileExists, readFile, result } = require("./lib")

title("Domain validation")

const checks = []

const types = readFile("types/index.ts")
const REQUIRED_TYPES = [
  "UserRole",
  "User",
  "UserRoleRecord",
  "ProcurementStatus",
  "ProcurementRequest",
  "Category",
  "Quotation",
  "ApiResponse",
]

REQUIRED_TYPES.forEach((t) => {
  const ok = types.includes(`export type ${t}`) || types.includes(`export interface ${t}`)
  checks.push(result(ok, `type "${t}" is defined`))
  if (!ok) fail(`type "${t}" is missing`)
})

const REQUIRED_ROUTES = [
  "app/api/v1/auth/login",
  "app/api/v1/auth/register",
  "app/api/v1/procurement-requests",
  "app/api/v1/quotations",
  "app/api/v1/categories",
]

REQUIRED_ROUTES.forEach((r) => {
  const ok = fileExists(`${r}/route.ts`)
  checks.push(result(ok, `API route "${r}" exists`))
  if (!ok) fail(`API route "${r}" missing`)
})

summary(checks)