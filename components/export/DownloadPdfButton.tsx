"use client"

import jsPDF from "jspdf"
import { useState } from "react"

interface PdfRequest {
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

interface PdfQuotation {
  supplier?: { full_name: string; company_name: string | null } | null
  price: number
  currency: string
  delivery_days: number
  status: string
}

export default function DownloadPdfButton({
  request,
  quotations,
}: {
  request: PdfRequest
  quotations: PdfQuotation[]
}) {
  const [loading, setLoading] = useState(false)

  function handleDownload() {
    setLoading(true)
    try {
      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text("NeedLink — Procurement Request", 14, 20)

      doc.setFillColor(0, 102, 204)
      doc.rect(0, 6, 210, 2, "F")

      doc.setFontSize(12)
      doc.text(request.title, 14, 34)

      doc.setFontSize(10)
      const buyer = request.buyer?.company_name ?? request.buyer?.full_name ?? "Buyer"
      doc.text(`Posted by: ${buyer}`, 14, 42)
      doc.text(`Category: ${request.categories?.name ?? "Uncategorized"}`, 14, 48)
      doc.text(`Status: ${request.status.replace("_", " ")}`, 14, 54)
      doc.text(`Quantity: ${request.quantity} ${request.unit ?? ""}`, 14, 60)
      doc.text(`Deadline: ${new Date(request.deadline).toLocaleDateString()}`, 14, 66)
      const budget =
        request.budget_min != null
          ? `${request.currency} ${request.budget_min.toLocaleString()}${
              request.budget_max ? ` - ${request.budget_max.toLocaleString()}` : "+"
            }`
          : "Not specified"
      doc.text(`Budget: ${budget}`, 14, 72)

      doc.line(14, 78, 196, 78)

      doc.setFontSize(11)
      doc.text("Description", 14, 86)
      doc.setFontSize(10)
      const lines = doc.splitTextToSize(request.description, 182)
      doc.text(lines, 14, 92)

      let y = 92 + lines.length * 5

      doc.setFontSize(11)
      doc.text("Quotations", 14, y + 6)
      y += 12

      if (quotations.length === 0) {
        doc.setFontSize(10)
        doc.text("No quotations received yet.", 14, y)
      } else {
        doc.setFontSize(9)
        doc.text("Supplier", 14, y)
        doc.text("Price", 110, y)
        doc.text("Delivery", 150, y)
        doc.text("Status", 180, y)
        y += 5
        doc.line(14, y, 196, y)
        y += 4

        quotations.forEach((q) => {
          const name = q.supplier?.company_name ?? q.supplier?.full_name ?? "Supplier"
          doc.text(doc.splitTextToSize(name, 80) as string[], 14, y)
          doc.text(`${q.currency} ${q.price.toLocaleString()}`, 110, y)
          doc.text(`${q.delivery_days} days`, 150, y)
          doc.text(q.status, 180, y)
          y += 8
        })
      }

      doc.setFontSize(9)
      doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 290)

      doc.save(`procurement-${request.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40)}.pdf`)
    } catch (err) {
      console.error("PDF export failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
    >
      {loading ? "Generating..." : "Download PDF"}
    </button>
  )
}