"use client"

import { useEffect, useState } from "react"

interface AdminUser {
  id: string
  email: string
  full_name: string
  company_name: string | null
  status: string
  email_verified: boolean
  created_at: string
  user_roles?: Array<{ role: string }>
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
  pending_verification: "bg-warning/10 text-warning",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/v1/admin/users")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          setError(d.error?.message ?? "Unable to load users")
        } else {
          setUsers(d.data?.users ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(userId: string, status: string) {
    setError(null)
    setUpdatingId(userId)
    const res = await fetch("/api/v1/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    }).catch(() => null)

    setUpdatingId(null)

    if (!res || !res.ok) {
      const body = res ? await res.json().catch(() => null) : null
      setError(body?.error?.message ?? "Unable to update user")
      return
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u)),
    )
  }

  async function toggleVerified(userId: string, verified: boolean) {
    setError(null)
    setUpdatingId(userId)
    const res = await fetch("/api/v1/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, update_email_verified: verified }),
    }).catch(() => null)

    setUpdatingId(null)

    if (!res || !res.ok) {
      const body = res ? await res.json().catch(() => null) : null
      setError(body?.error?.message ?? "Unable to update user")
      return
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, email_verified: verified } : u)),
    )
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">User Management</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Email Verified</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  {u.company_name && (
                    <p className="text-xs text-muted-foreground">{u.company_name}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(u.user_roles ?? []).map((r) => (
                      <span
                        key={r.role}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {r.role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[u.status] ?? ""}`}
                  >
                    {u.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.email_verified ? (
                    <span className="text-success">Yes</span>
                  ) : (
                    <span className="text-warning">No</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {u.status === "active" ? (
                      <button
                        onClick={() => updateStatus(u.id, "suspended")}
                        disabled={updatingId === u.id}
                        className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(u.id, "active")}
                        disabled={updatingId === u.id}
                        className="rounded-md bg-success px-2 py-1 text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                    {!u.email_verified && (
                      <button
                        onClick={() => toggleVerified(u.id, true)}
                        disabled={updatingId === u.id}
                        className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        Verify email
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}