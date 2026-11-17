import type { IStockOpnameItemResponse } from "./IStockOpnameItemResponse"

export interface IStockOpnameResponse {
  id: number
  period: string
  remark: string
  flag: string
  created_at: string
  userId: number
  data: IStockOpnameItemResponse[]
}
