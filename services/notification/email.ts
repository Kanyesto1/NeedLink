import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT ?? "587")
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const from = process.env.MAIL_FROM ?? "NeedLink <no-reply@needlink.app>"

const configured = Boolean(host && user && pass)

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!configured) return null
  if (transporter) return transporter
  transporter = nodemailer.createTransport({
    host: host as string,
    port,
    secure: port === 465,
    auth: { user: user as string, pass: pass as string },
  })
  return transporter
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

function wrap(body: string): string {
  return `
<!doctype html>
<html>
  <body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;">
            <tr>
              <td style="background:#0066cc;padding:20px 24px;">
                <h1 style="margin:0;color:#ffffff;font-size:20px;">NeedLink</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">${body}</td>
            </tr>
            <tr>
              <td style="padding:12px 24px;border-top:1px solid #e5e5e5;color:#737373;font-size:12px;">
                You are receiving this because of your activity on NeedLink.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  const client = getTransporter()

  if (!client) {
    console.log(`[email] SMTP not configured — skipping notification to ${to}: ${subject}`)
    return false
  }

  try {
    await client.sendMail({
      from,
      to,
      subject,
      html: wrap(html),
    })
    return true
  } catch (err) {
    console.error("[email] send failed:", err)
    return false
  }
}