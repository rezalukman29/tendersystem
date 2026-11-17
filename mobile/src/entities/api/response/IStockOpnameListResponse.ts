import type { IStockOpnameResponse } from "./IStockOpnameResponse"

export interface IStockOpnameListResponse {
  page: number
  total_pages: number
  total_records: number
  record_per_page: number
  data: IStockOpnameResponse[]
}
