import type { WarehouseInventoryStatus } from "./WarehouseInventoryStatus"

export interface IWarehouseStockItem {
  id: number
  itemId: number
  name: string
  code: string
  warehouseId: number
  warehouseName: string
  warehouseStock: number
  itemStock: number
  minimumStock: number
  usedStock: number
  unit: string
  valuation: number
  status: WarehouseInventoryStatus
}
