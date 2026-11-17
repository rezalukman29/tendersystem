import type { WarehouseInventoryStatus } from "./WarehouseInventoryStatus"

export interface IWarehouseInventoryQuery {
  page: number
  limit: number
  search?: string
  warehouseId?: number
  status?: Exclude<WarehouseInventoryStatus, "NOT_SET">
  sort?: "ASC" | "DESC"
  sortBy?: string
}
