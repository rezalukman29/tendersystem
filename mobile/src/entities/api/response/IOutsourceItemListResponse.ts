import type { IOutsourceItemResponse } from "./IOutsourceItemResponse"

export interface IOutsourceItemListResponse {
  data: IOutsourceItemResponse[]
  page: number
  record_per_page: number
  total_records: number
  total_pages: number
  summary: {
    outsource_records?: number
    waiting_to_arrive?: number
    received_now?: number
    overdue?: number
    completed?: number
    total_cost?: number
  }
}
