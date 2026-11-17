import type { IRentalRecord, RentalNextStatus } from "./IRentalRecord"

export interface IUpdateRentalStatusParams {
  record: IRentalRecord
  status: RentalNextStatus
}
