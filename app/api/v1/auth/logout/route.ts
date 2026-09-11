import { ok } from "@/lib/api"

export async function POST() {
  const response = ok({ message: "Signed out" })

  response.cookies.set("needlink_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  return response
}