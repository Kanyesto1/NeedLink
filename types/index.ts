export type UserRole = "buyer" | "supplier" | "administrator" | "super_administrator"

export type UserStatus = "active" | "inactive" | "suspended" | "pending_verification"

export interface User {
  id: string
  email: string
  full_name: string
  company_name?: string
  phone?: string
  avatar_url?: string
  status: UserStatus
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface UserRoleRecord {
  id: string
  user_id: string
  role: UserRole
  created_at: string
}

export type ProcurementStatus =
  | "draft"
  | "open"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired"

export interface ProcurementRequest {
  id: string
  buyer_id: string
  title: string
  description: string
  category_id: string
  quantity: number
  unit: string
  budget_min?: number
  budget_max?: number
  currency: string
  deadline: string
  status: ProcurementStatus
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
}

export type QuotationStatus = "pending" | "accepted" | "rejected" | "withdrawn"

export interface Quotation {
  id: string
  procurement_id: string
  supplier_id: string
  price: number
  currency: string
  delivery_days: number
  notes?: string
  status: QuotationStatus
  created_at: string
  updated_at: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  timestamp: string
  requestId: string
}
