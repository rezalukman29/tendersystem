export interface ILoanItemResponse {
  id: number
  item_name: string
  qty: number
  unit: string
  vendor_id: number
  vendor: { id?: number; name?: string } | null
  warehouse_id: number | null
  warehouse: number | { id?: number; name?: string } | null
  event_id: number | null
  event: { id?: number; name?: string; area?: string; sub_area?: string } | null
  area_id: number | null
  sub_area_id: number | null
  borrow_from: string
  return_by: string
  purpose: string
  notes: string
  rental_cost_per_unit: number
  rental_cost: number
  status: string
  requested_at: string
  requested_by: string
  received_at: string | null
  returned_at: string | null
  created_at: string
  updated_at: string
}
