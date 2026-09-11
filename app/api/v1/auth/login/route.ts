import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { ok, fail } from "@/lib/api"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid login data")
  }

  const { email, password } = parsed.data

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return fail("EMAIL_NOT_VERIFIED", "Please verify your email before signing in", 403)
    }
    return fail("AUTH_ERROR", "Invalid email or password", 401)
  }

  const accessToken = data.session.access_token
  const user = data.session.user

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, full_name, company_name, status, email_verified, user_roles(*)")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return fail("AUTH_ERROR", "User profile not found", 404)
  }

  if (profile.status === "suspended" || profile.status === "inactive") {
    return fail("ACCOUNT_INACTIVE", `Account is ${profile.status}`, 403)
  }

  const response = ok({
    user: profile,
    session: {
      expiresAt: data.session.expires_at,
    },
  })

  response.cookies.set("needlink_session", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: data.session.expires_in,
  })

  return response
}

export function GET() {
  return fail("METHOD_NOT_ALLOWED", "Use POST", 405)
}