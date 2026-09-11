import { z } from "zod"
import { createServiceClient } from "@/lib/supabase"
import { ok, fail } from "@/lib/api"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role: z.enum(["buyer", "supplier"]),
  company_name: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid registration data")
  }

  const { email, password, full_name, role, company_name } = parsed.data

  const admin = createServiceClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: {
      full_name,
      role,
      company_name: company_name ?? null,
    },
  })

  if (error) {
    if (error.message.includes("already been registered")) {
      return fail("EMAIL_EXISTS", "An account with this email already exists", 409)
    }
    return fail("REGISTRATION_ERROR", error.message, 400)
  }

  const user = data.user
  if (!user) {
    return fail("REGISTRATION_ERROR", "User creation failed", 500)
  }

  return ok({
    message: "Account created. Please verify your email.",
    email: user.email,
    role,
  }, 201)
}