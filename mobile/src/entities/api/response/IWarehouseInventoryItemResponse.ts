import type { IWarehouseInventoryLocationResponse } from "./IWarehouseInventoryLocationResponse"

export interface IWarehouseInventoryItemResponse {
  barang_gudang_id: number
  gudang_id: number
  barang_id: number
  stok_gudang: number
  kode_gudang: string
  stok_minimum: number
  nama_barang: string
  stok_barang: number
  nama_satuan: string
  gudang_name: string
  stock_used: number
  valuation: string
  status: string
  kode_barang?: string
  kode?: string
  gudang: IWarehouseInventoryLocationResponse
}
