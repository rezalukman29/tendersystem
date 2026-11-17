export type RentalKind = "loan" | "outsource"

export type RentalStatus =
  | "REQUESTED"
  | "BORROWED"
  | "OVERDUE"
  | "RETURNED"
  | "RECEIVED"
  | "COMPLETED"

export type RentalNextStatus = "BORROWED" | "RETURNED" | "RECEIVED" | "COMPLETED"

export interface IRentalRecord {
  id: number
  kind: RentalKind
  itemName: string
  qty: number
  unit: string
  vendorName?: string
  vendorId?: number
  eventId?: number
  eventName?: string
  area?: string
  subArea?: string
  areaId?: number
  subAreaId?: number
  warehouse?: string
  warehouseId?: number
  itemId?: number
  unitId?: number
  startDate: string
  dueDate: string
  costPerUnit: number
  totalCost: number
  status: RentalStatus
  purpose?: string
  note?: string
}
