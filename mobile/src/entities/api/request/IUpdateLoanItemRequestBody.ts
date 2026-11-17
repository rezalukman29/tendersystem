export interface IUpdateLoanItemRequestBody {
  item_name: string
  qty: number
  unit: string
  vendor_id: number
  warehouse_id?: number
  event_id?: number
  area_id?: number
  sub_area_id?: number
  borrow_from: string
  return_by: string
  rental_cost_per_unit: number
  purpose: string
  notes: string
  status: "BORROWED" | "RETURNED"
}
