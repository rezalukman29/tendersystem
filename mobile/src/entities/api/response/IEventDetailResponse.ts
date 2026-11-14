import type { ApiNullableString } from "./ApiNullableString"

export interface IEventDetailResponse {
  id: number
  description: ApiNullableString
  name: ApiNullableString
  event_start: ApiNullableString
  event_end: ApiNullableString
  PIC: ApiNullableString
  event_code: ApiNullableString
  is_complete: number
  is_finished: number
  status: number
  images: ApiNullableString
  address: ApiNullableString
  type: ApiNullableString
  notes: ApiNullableString
  date_event: ApiNullableString
  date_start?: ApiNullableString
}
