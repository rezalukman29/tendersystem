import type { ApiNullableInt64 } from "./ApiNullableInt64"
import type { ApiNullableTime } from "./ApiNullableTime"
import type { IEventBrokenItemResponse } from "./IEventBrokenItemResponse"
import type { IEventItemOwnershipResponse } from "./IEventItemOwnershipResponse"
import type { IEventItemPackageResponse } from "./IEventItemPackageResponse"
import type { IEventItemWarehouseResponse } from "./IEventItemWarehouseResponse"

export interface IEventItemResponse {
  id: number
  scan_out: number
  scan_in: number
  qty: number
  notes: string
  event_id: number
  barang_id: number
  nama_barang: string
  code?: string | null
  photo?: string | null
  satuan?: string | null
  kategori?: string | null
  area_name: string
  gudang?: IEventItemWarehouseResponse[] | null
  event_status_id: number
  sub_list_id?: ApiNullableInt64
  sub_list_name?: string
  scan_in_date?: ApiNullableTime
  scan_out_date?: ApiNullableTime
  scan_in_counter?: number
  scan_out_counter?: number
  input_by?: string
  pic?: string
  ownerships?: IEventItemOwnershipResponse
  package?: IEventItemPackageResponse | null
  is_new_production_item?: boolean
  is_converted?: boolean
  converted_qty?: number
  broken_item?: IEventBrokenItemResponse | null
}
