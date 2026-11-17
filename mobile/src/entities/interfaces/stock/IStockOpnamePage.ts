import type { IStockOpname } from "./IStockOpname"

export interface IStockOpnamePage {
  items: IStockOpname[]
  page: number
  totalPages: number
  totalRecords: number
}
