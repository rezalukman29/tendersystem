import type { IWarehouseStockItem } from "./IWarehouseStockItem"

export interface IWarehouseInventoryPage {
  items: IWarehouseStockItem[]
  page: number
  totalPages: number
  totalRecords: number
}
