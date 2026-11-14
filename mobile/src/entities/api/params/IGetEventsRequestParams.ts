export interface IGetEventsRequestParams {
  status?: string
  search?: string
  sort_by?: string
  sort?: "ASC" | "DESC"
  page: number
  limit: number
}
