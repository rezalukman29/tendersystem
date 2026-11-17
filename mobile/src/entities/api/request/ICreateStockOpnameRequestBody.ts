export interface ICreateStockOpnameRequestBody {
  period: string
  remark: string
  data: {
    condition: "GOOD" | "POOR"
    id: number
    notes: string
    stok: number
  }[]
}
