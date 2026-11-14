import type { IEvent } from "./IEvent"

export interface IEventPage {
  items: IEvent[]
  page: number
  totalPages: number
  totalRecords: number
}
