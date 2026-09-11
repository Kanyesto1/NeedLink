import { supabase } from "@/lib/supabase"
import { ok, fail } from "@/lib/api"

export async function GET() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("name")

  if (error) {
    return fail("DATABASE_ERROR", error.message, 500)
  }

  return ok({ categories: data })
}