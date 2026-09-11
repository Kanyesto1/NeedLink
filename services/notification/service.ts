import { sendEmail } from "./email"
import { APP_URL } from "@/config/app"

function link(path: string): string {
  return `${APP_URL}${path}`
}

export async function notifyBuyerOfNewQuotation(params: {
  buyerEmail: string
  buyerName: string
  requestTitle: string
  supplierName: string
  price: number
  currency: string
  requestId: string
}) {
  const { buyerEmail, buyerName, requestTitle, supplierName, price, currency, requestId } = params

  return sendEmail({
    to: buyerEmail,
    subject: `New quotation on "${requestTitle}"`,
    html: `
      <p>Hi ${buyerName || "there"},</p>
      <p><strong>${supplierName}</strong> has submitted a quotation on your request<strong> "${requestTitle}"</strong>.</p>
      <p style="font-size:20px;"><strong>${currency} ${price.toLocaleString()}</strong></p>
      <p>Review quotations and choose the best offer.</p>
      <p style="margin-top:20px;">
        <a href="${link(`/buyer/procurement-requests/${requestId}`)}"
           style="background:#0066cc;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;">
          View Quotation
        </a>
      </p>`,
  })
}

export async function notifySupplierQuotationAccepted(params: {
  supplierEmail: string
  supplierName: string
  requestTitle: string
  price: number
  currency: string
}) {
  const { supplierEmail, supplierName, requestTitle, price, currency } = params

  return sendEmail({
    to: supplierEmail,
    subject: `Your quotation was accepted`,
    html: `
      <p>Hi ${supplierName || "there"},</p>
      <p>Congratulations! Your quotation of <strong>${currency} ${price.toLocaleString()}</strong>
      for <strong>"${requestTitle}"</strong> has been <strong>accepted</strong>.</p>
      <p>The buyer will be in touch about next steps.</p>`,
  })
}

export async function notifySupplierQuotationRejected(params: {
  supplierEmail: string
  supplierName: string
  requestTitle: string
}) {
  const { supplierEmail, supplierName, requestTitle } = params

  return sendEmail({
    to: supplierEmail,
    subject: `Update on your quotation`,
    html: `
      <p>Hi ${supplierName || "there"},</p>
      <p>Unfortunately, your quotation for <strong>"${requestTitle}"</strong> was not selected this time.</p>
      <p>Keep an eye on the marketplace for new opportunities.</p>`,
  })
}