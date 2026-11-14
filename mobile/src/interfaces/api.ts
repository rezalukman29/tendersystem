export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  code?: number
}

export interface PaginatedData<T> {
  data: T[]
  page: number
  total_pages: number
  total_records: number
  record_per_page: number
  prev?: number
  next?: number
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>
