export interface IStockOpnameItemResponse {
  id: number
  stock_new: number
  stock_old: number
  comparison: string
  condition: string
  notes: string
  barang: {
    nama: string
    gudang_id: number
    gudang_name: string
    photo: string
  }
}
