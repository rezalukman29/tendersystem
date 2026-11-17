export interface IStockOpnameSubmission {
  period: string
  remark: string
  items: {
    warehouseItemId: number
    actualStock: number
    condition: "Good" | "Poor"
    note: string
  }[]
}
