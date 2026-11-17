import type { WarehouseInventoryStatus } from "../../../entities/interfaces/stock/WarehouseInventoryStatus"

export interface IStockListItemView {
  id: number
  name: string
  code: string
  warehouseName: string
  stock: number
  unit: string
  status: WarehouseInventoryStatus
}
