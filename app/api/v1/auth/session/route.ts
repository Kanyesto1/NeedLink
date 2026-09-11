import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { ok } from "@/lib/api"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("needlink_session")?.value

  if (!token) {
    return ok({ user: null, authenticated: false })
  }

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !authUser) {
    return ok({ user: null, authenticated: false })
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, company_name, status, email_verified, user_roles(*)")
    .eq("id", authUser.id)
    .maybeSingle()

  if (!profile) {
    return ok({ user: null, authenticated: false })
  }

  return ok({
    authenticated: true,
    user: profile,
    email_verified: profile.email_verified,
  })
}