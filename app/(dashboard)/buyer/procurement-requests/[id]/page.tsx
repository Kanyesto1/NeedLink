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
}

interface Quotation {
  id: string
  procurement_id: string
  supplier_id: string
  price: number
  currency: string
  delivery_days: number
  notes: string | null
  status: string
  supplier?: { full_name: string; company_name: string | null } | null
}

export default function BuyerRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string | null>(null)
  const [request, setRequest] = useState<ProcurementRequest | null>(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ id: routeId }) => setId(routeId))
  }, [params])

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/v1/procurement-requests/${id}`).then((r) => r.json()),
      fetch(`/api/v1/quotations?procurementId=${id}`).then((r) => r.json()),
    ])
      .then(([reqRes, quoteRes]) => {
        setRequest(reqRes.data?.procurementRequest ?? null)
        setQuotations(quoteRes.data?.quotations ?? [])
        if (!reqRes.data?.procurementRequest) {
          setError(reqRes.error?.message ?? "Request not found")
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  async function updateQuotation(quotationId: string, status: string) {
    setError(null)
    const res = await fetch(`/api/v1/quotations/${quotationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null)

    if (!res || !res.ok) {
      const body = res ? await res.json().catch(() => null) : null
      setError(body?.error?.message ?? "Unable to update quotation")
      return
    }

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId ? { ...q, status } : q.status === "pending" && status === "accepted" ? { ...q, status: "rejected" } : q,
      ),
    )
    if (status === "accepted") {
      setRequest((prev) => (prev ? { ...prev, status: "in_progress" } : prev))
    }
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
        <Link href="/buyer" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (!request) return null

  return (
    <div className="max-w-3xl">
      <Link href="/buyer" className="mb-4 inline-block text-sm text-muted-foreground hover:underline">
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
      </div>

      <h3 className="mb-4 text-lg font-semibold">
        Quotations ({quotations.length})
      </h3>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {quotations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          No quotations yet. Suppliers will see this request and submit quotes.
        </p>
      ) : (
        <div className="space-y-4">
          {quotations.map((q) => (
            <div key={q.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">
                    {q.supplier?.company_name ?? q.supplier?.full_name ?? "Supplier"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {q.currency} {q.price.toLocaleString()} · {q.delivery_days} day
                    {q.delivery_days === 1 ? "" : "s"}
                  </p>
                  {q.notes && <p className="mt-2 text-sm">{q.notes}</p>}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    q.status === "accepted"
                      ? "bg-success/10 text-success"
                      : q.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {q.status}
                </span>
              </div>
              {request.status === "open" && q.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateQuotation(q.id, "accepted")}
                    className="rounded-lg bg-success px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateQuotation(q.id, "rejected")}
                    className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}