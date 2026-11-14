export interface IUserPlanResponse {
  success: boolean
  message: string
  code?: number
  data?: {
    plan_id: number
    plan_name: string
    storage_limit: number
    storage_limit_readable: string
    price: number
    currency: string
    billing_cycle: string
    status: string
    started_at: string
    expires_at: string | null
    storage_used: number
    storage_used_readable: string
    storage_remaining: number
    storage_remaining_readable: string
    usage_percentage: number
    event_management_price?: number | null
    inventory_management_price?: number | null
    warehouse_management_price?: number | null
    qr_scanning_price?: number | null
    reports_dashboard_price?: number | null
    item_loan_price?: number | null
    ai_analyzer_price?: number | null
  }
}
