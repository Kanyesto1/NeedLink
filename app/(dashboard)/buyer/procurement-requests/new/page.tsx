"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Category {
  id: string
  name: string
}

export default function NewRequestPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/v1/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data?.categories ?? []))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const deadline = form.get("deadline") as string

    const payload = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      category_id: form.get("category_id") as string,
      quantity: Number(form.get("quantity")),
      unit: (form.get("unit") as string) || undefined,
      budget_min: form.get("budget_min")
        ? Number(form.get("budget_min"))
        : undefined,
      budget_max: form.get("budget_max")
        ? Number(form.get("budget_max"))
        : undefined,
      currency: (form.get("currency") as string) || "USD",
      deadline: new Date(deadline).toISOString(),
      status: (form.get("status") as string) || "open",
    }

    const res = await fetch("/api/v1/procurement-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null)

    if (!res || !res.ok) {
      const body = res ? await res.json().catch(() => null) : null
      setError(body?.error?.message ?? "Unable to create request")
      setLoading(false)
      return
    }

    router.push("/buyer")
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">Post a Procurement Request</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Office Laptops — 15 Units"
            className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe specs, requirements, delivery expectations..."
            className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category_id" className="mb-1 block text-sm font-medium">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="deadline" className="mb-1 block text-sm font-medium">
              Deadline
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="quantity" className="mb-1 block text-sm font-medium">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              step="any"
              placeholder="15"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="unit" className="mb-1 block text-sm font-medium">
              Unit
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              placeholder="units"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="currency" className="mb-1 block text-sm font-medium">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="USD">USD</option>
              <option value="KES">KES</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="budget_min" className="mb-1 block text-sm font-medium">
              Budget Min (optional)
            </label>
            <input
              id="budget_min"
              name="budget_min"
              type="number"
              min={0}
              step="any"
              placeholder="450000"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="budget_max" className="mb-1 block text-sm font-medium">
              Budget Max (optional)
            </label>
            <input
              id="budget_max"
              name="budget_max"
              type="number"
              min={0}
              step="any"
              placeholder="750000"
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Publish</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-border p-3 hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="radio" name="status" value="open" className="sr-only" defaultChecked />
              <span className="font-medium">Open now</span>
            </label>
            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-border p-3 hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="radio" name="status" value="draft" className="sr-only" />
              <span className="font-medium">Save as draft</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Request"}
          </button>
          <Link
            href="/buyer"
            className="rounded-lg border border-border px-6 py-2.5 font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}