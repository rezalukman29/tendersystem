export interface IGetWarehouseInventoryRequestParams {
  page: number
  limit: number
  search?: string
  gudang_id?: number
  status?: "SAFE" | "WARNING" | "CRITICAL"
  sort?: "ASC" | "DESC"
  sort_by?: string
}
