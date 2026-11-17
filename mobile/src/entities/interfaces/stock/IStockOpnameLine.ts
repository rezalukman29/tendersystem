export interface IStockOpnameLine {
  rowId: number
  name: string
  before: number
  after: number
  diff: number
  condition: "Good" | "Poor"
  note: string
}
