"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface ProcurementRequest {
  id: string
  title: string
  description: string
  quantity: number
  unit: string | null
  budget_min: number | null
  budget_max: number | null
  currency: string
  deadline: string
  status: string
  categories?: { name: string } | null
  buyer?: { full_name: string; company_name: string | null } | null
}

interface Quotation {
  id: string
  price: number
  currency: string
  delivery_days: number
  notes: string | null
  status: string
}

export default function SupplierRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string | null>(null)
  const [request, setRequest] = useState<ProcurementRequest | null>(null)
  const [myQuotations, setMyQuotations] = useState<Quotation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    params.then(({ id: routeId }) => setId(routeId))
  }, [params])

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/v1/procurement-requests/${id}`).then((r) => r.json()),
      fetch(`/api/v1/quotations`).then((r) => r.json()),
    ])
      .then(([reqRes, quoteRes]) => {
        setRequest(reqRes.data?.procurementRequest ?? null)
        const all = (quoteRes.data?.quotations ?? []) as Array<
          Quotation & { procurement_id: string }
        >
        setMyQuotations(all.filter((q) => q.procurement_id === id))
        if (!reqRes.data?.procurementRequest) {
          setError(reqRes.error?.message ?? "Request not found")
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const form = new FormData(e.currentTarget)

    const payload = {
      procurement_id: id,
      price: Number(form.get("price")),
      currency: (form.get("currency") as string) || "USD",
      delivery_days: Number(form.get("delivery_days")),
      notes: (form.get("notes") as string) || undefined,
    }

    const res = await fetch("/api/v1/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null)

    if (!res || !res.ok) {
      const body = res ? await res.json().catch(() => null) : null
      setError(body?.error?.message ?? "Unable to submit quotation")
      setSubmitting(false)
      return
    }

    const body = await res.json()
    setMyQuotations([body.data.quotation, ...myQuotations])
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  if (error && !request) {
    return (
      <div>
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
        <Link href="/supplier" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (!request) return null

  const alreadyQuoted = myQuotations.length > 0

  return (
    <div className="max-w-3xl">
      <Link href="/supplier" className="mb-4 inline-block text-sm text-muted-foreground hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-bold">{request.title}</h2>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            {request.status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {request.categories?.name ?? "Uncategorized"} · {request.quantity} {request.unit ?? ""} · Due{" "}
          {new Date(request.deadline).toLocaleDateString()}
        </p>
        <p className="mt-4 text-sm leading-relaxed">{request.description}</p>
        {request.budget_min != null && (
          <p className="mt-2 text-sm text-muted-foreground">
            Budget: {request.currency} {request.budget_min.toLocaleString()}
            {request.budget_max ? ` – ${request.budget_max.toLocaleString()}` : "+"}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Buyer: {request.buyer?.company_name ?? request.buyer?.full_name}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <h3 className="mb-4 text-lg font-semibold">Submit a Quotation</h3>

      {alreadyQuoted ? (
        <div className="rounded-lg border border-border p-5">
          <p className="font-medium text-success">You have submitted quotations for this request:</p>
          <div className="mt-2 space-y-2">
            {myQuotations.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span>
                  {q.currency} {q.price.toLocaleString()} · {q.delivery_days} day{q.delivery_days === 1 ? "" : "s"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    q.status === "accepted"
                      ? "bg-success/10 text-success"
                      : q.status === "withdrawn"
                        ? "bg-muted text-muted-foreground"
                        : "bg-info/10 text-info"
                  }`}
                >
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : request.status === "open" ? (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="price" className="mb-1 block text-sm font-medium">
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                step="any"
                className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
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
            <div>
              <label htmlFor="delivery_days" className="mb-1 block text-sm font-medium">
                Delivery (days)
              </label>
              <input
                id="delivery_days"
                name="delivery_days"
                type="number"
                min={1}
                className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full rounded-lg border border-border px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-6 py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Quotation"}
          </button>
        </form>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
          This request is not open for quotations.
        </p>
      )}
    </div>
  )
}