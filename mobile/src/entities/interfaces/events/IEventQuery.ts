import type { ClosingTab } from "../../../core/rules"

export interface IEventQuery {
  lifecycleStatus?: ClosingTab
  statusIds?: number[]
  search?: string
  sortBy?: string
  sort?: "ASC" | "DESC"
  page: number
  limit: number
}
