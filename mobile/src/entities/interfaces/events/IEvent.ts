import type { ClosingTab } from "../../../core/rules"

export interface IEvent {
  id: number
  name: string
  code: string
  startDate: string
  endDate: string
  location: string
  statusId: number
  lifecycleStatus: ClosingTab
  totalItems: number
}
