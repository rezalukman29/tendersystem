import type { IRentalRecord } from "./IRentalRecord"

export interface IRentalPage {
  items: IRentalRecord[]
  page: number
  totalPages: number
  totalRecords: number
  summary: {
    requested?: number
    received?: number
    overdue?: number
    done?: number
  }
}
