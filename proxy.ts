import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { checkRateLimit, getRateLimitKey } from "@/middleware/rate-limit"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/verify-email-notice",
  "/",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/reset-password",
  "/api/v1/auth/verify-email",
  "/api/v1/auth/session",
  "/api/v1/health",
  "/api/v1/categories",
  "/api/v1/diagnostics",
]

const ROLE_ROUTES: Record<string, string[]> = {
  "/buyer": ["buyer", "administrator", "super_administrator"],
  "/supplier": ["supplier", "administrator", "super_administrator"],
  "/admin": ["administrator", "super_administrator"],
}

function isPublicRoute(pathname: string): boolean {
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname.startsWith("/assets")) {
    return true
  }
  if (pathname.startsWith("/api/v1/auth/") && !pathname.startsWith("/api/v1/auth/admin")) {
    return true
  }
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))
}

function getRoleForRoute(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return roles
    }
  }
  if (pathname.startsWith("/api/v1/")) {
    return null
  }
  return null
}

function getRedirectUrl(request: NextRequest, path: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = path
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    const key = getRateLimitKey(request)
    const rateResult = checkRateLimit(key, pathname)
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "RATE_LIMIT_ERROR", message: "Too many requests" },
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        },
      )
    }
  }

  const sessionCookie = request.cookies.get("needlink_session")?.value
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : sessionCookie

  if (!token) {
    if (pathname.startsWith("/api/v1/")) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AUTHENTICATION_ERROR", message: "Authentication required" },
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
        { status: 401 },
      )
    }
    return getRedirectUrl(request, "/login")
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  })

  const { data: { user: authUser }, error } = await supabase.auth.getUser(token)

  if (error || !authUser) {
    if (pathname.startsWith("/api/v1/")) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AUTHENTICATION_ERROR", message: "Invalid or expired session" },
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
        { status: 401 },
      )
    }
    const response = getRedirectUrl(request, "/login")
    response.cookies.set("needlink_session", "", { maxAge: 0, path: "/" })
    return response
  }

  const { data: userData } = await supabase
    .from("users")
    .select("status, email_verified, user_roles(*)")
    .eq("id", authUser.id)
    .maybeSingle()

  if (!userData) {
    if (pathname.startsWith("/api/v1/")) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AUTHENTICATION_ERROR", message: "User profile not found" },
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
        { status: 401 },
      )
    }
    return getRedirectUrl(request, "/login")
  }

  if (userData.status !== "active") {
    if (pathname.startsWith("/api/v1/")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCOUNT_INACTIVE",
            message: `Account is ${userData.status}. Please contact support.`,
          },
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
        { status: 403 },
      )
    }
    return getRedirectUrl(request, "/401")
  }

  if (!userData.email_verified && !pathname.startsWith("/api/v1/auth/") && pathname !== "/verify-email-notice") {
    return getRedirectUrl(request, "/verify-email-notice")
  }

  const requiredRoles = getRoleForRoute(pathname)
  if (requiredRoles) {
    const roles = userData.user_roles as Array<{ role: string }> | undefined
    const userRoles = roles?.map((r) => r.role) ?? []
    const hasRole = userRoles.some((r) => requiredRoles.includes(r))

    if (!hasRole) {
      if (pathname.startsWith("/api/v1/")) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "AUTHORIZATION_ERROR", message: "Insufficient permissions" },
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
          { status: 403 },
        )
      }
      return getRedirectUrl(request, "/403")
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
  ],
}
