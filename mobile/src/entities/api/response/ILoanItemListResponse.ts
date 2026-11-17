import type { ILoanItemResponse } from "./ILoanItemResponse"

export interface ILoanItemListResponse {
  data: ILoanItemResponse[]
  page: number
  record_per_page: number
  total_records: number
  total_pages: number
  summary: {
    total_records?: number
    borrowed?: number
    overdue?: number
    returned?: number
    waiting_to_arrive?: number
    total_rental_cost?: number
  }
}
