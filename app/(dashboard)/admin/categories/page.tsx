"use client"

import { useEffect, useState } from "react"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/v1/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          setError(d.error?.message ?? "Unable to load categories")
        } else {
          setCategories(d.data?.categories ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const form = new FormData(e.currentTarget)

    const payload = {
      name: form.get("name") as string,
      slug: (form.get("slug") as string)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-"),
      description: (form.get("description") as string) || undefined,
    }

    const res = await fetch("/api/v1/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null)

    if (!res || !res.ok) {
      const body = res ? await res.json().catch(() => null) : null
      setError(body?.error?.message ?? "Unable to create category")
      setSubmitting(false)
      return
    }

    const body = await res.json()
    setCategories([body.data.category, ...categories])
    e.currentTarget.reset()
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-2xl font-bold">Category Management</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border border-border p-5">
        <h3 className="font-semibold">Add Category</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. IT Hardware"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="it-hardware"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description (optional)
          </label>
          <input
            id="description"
            name="description"
            type="text"
            className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-6 py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Category"}
        </button>
      </form>

      <h3 className="mb-4 text-lg font-semibold">
        Existing Categories ({categories.length})
      </h3>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          No categories yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((c) => (
            <div key={c.id} className="rounded-lg border border-border p-4">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">/{c.slug}</p>
              {c.description && (
                <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}