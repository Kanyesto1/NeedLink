import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

export interface SessionUser {
  id: string
  email: string
  full_name: string
  company_name: string | null
  status: string
  email_verified: boolean
  roles: string[]
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("needlink_session")?.value

  if (!token) return null

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) return null

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, company_name, status, email_verified, user_roles(*)")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) return null

  const roles =
    (profile.user_roles as Array<{ role: string }> | undefined)?.map((r) => r.role) ?? []

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    company_name: profile.company_name,
    status: profile.status,
    email_verified: profile.email_verified,
    roles,
  }
}

export function hasRole(user: SessionUser, roles: string[]): boolean {
  return user.roles.some((r) => roles.includes(r))
}

export function isBuyer(user: SessionUser): boolean {
  return hasRole(user, ["buyer", "administrator", "super_administrator"])
}

export function isSupplier(user: SessionUser): boolean {
  return hasRole(user, ["supplier", "administrator", "super_administrator"])
}

export function isAdmin(user: SessionUser): boolean {
  return hasRole(user, ["administrator", "super_administrator"])
}