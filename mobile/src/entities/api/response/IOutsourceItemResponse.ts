export interface IOutsourceItemResponse {
  id: number
  event_id: number
  barang_id: number
  item_name: string
  qty: number
  unit: string
  satuan_id: number
  area_id: number
  area_name: string
  sub_area_id?: number | null
  sub_area_name?: string | null
  outsource_vendor_id: number
  vendor?: { id?: number; name?: string } | null
  event?: { id?: number; name?: string; area?: string; sub_area?: string } | null
  from_date: string
  to_date: string
  cost: number
  total_cost: number
  note: string
  status: string
  requested_at?: string
  requested_by?: string
  received_at?: string | null
  completed_at?: string | null
}
