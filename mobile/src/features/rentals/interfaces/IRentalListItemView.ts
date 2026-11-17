import type { IRentalRecord } from "../../../entities/interfaces/rentals/IRentalRecord"

export type RentalDisplay = "Requested" | "Received" | "Done" | "Overdue"

export interface IRentalListItemView {
  record: IRentalRecord
  display: RentalDisplay
  canMarkReceived: boolean
  canMarkDone: boolean
}
