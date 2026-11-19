export interface IGetEventsRequestParams {
  status?: string
  status_id?: string
  search?: string
  sort_by?: string
  sort?: "ASC" | "DESC"
  page: number
  limit: number
}
