import type { IStockOpnameLine } from "./IStockOpnameLine"

export interface IStockOpname {
  id: number
  period: string
  appliedAt: string
  appliedBy: string
  warehouse?: string
  countedCount: number
  amount: number
  status: "Pending" | "Approved"
  items: IStockOpnameLine[]
}
