export interface IUpdateOutsourceItemRequestBody {
  barang_id: number
  qty: number
  satuan_id: number
  area_id: number
  sub_area_id?: number
  outsource_vendor_id: number
  from_date: string
  to_date: string
  cost: number
  note: string
  status: "RECEIVED" | "COMPLETED"
}
