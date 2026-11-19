import type { ApiNullableString } from "./ApiNullableString"

export interface IEventResponse {
  id: number
  name: ApiNullableString
  event_code: ApiNullableString
  event_start: ApiNullableString
  event_end: ApiNullableString
  date_event: ApiNullableString
  address: ApiNullableString
  status: number
  lifecycle_status?: string
  total_items: number
  scan_in_total?: number
  scan_out_total?: number
}
