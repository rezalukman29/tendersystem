import type { ApiNullableString } from "../../entities/api/response/ApiNullableString"
import type { IEventResponse } from "../../entities/api/response/IEventResponse"
import type { IEventStatusResponse } from "../../entities/api/response/IEventStatusResponse"
import type { IEventDetailResponse } from "../../entities/api/response/IEventDetailResponse"
import type { IEventItemResponse } from "../../entities/api/response/IEventItemResponse"
import type { IEvent } from "../../entities/interfaces/events/IEvent"
import type { IEventDetail } from "../../entities/interfaces/events/IEventDetail"
import type { IEventItem } from "../../entities/interfaces/events/IEventItem"
import type { IEventPage } from "../../entities/interfaces/events/IEventPage"
import type { IEventQuery } from "../../entities/interfaces/events/IEventQuery"
import type { IEventStatus } from "../../entities/interfaces/events/IEventStatus"
import type { ClosingTab } from "../../core/rules"
import { ApiError } from "../ApiError"
import eventsRepositories, { type EventsRepositories } from "../repositories/events.repositories"

const LIFECYCLE_STATUSES = new Set<ClosingTab>([
  "upcoming",
  "on-going",
  "ready-to-close",
  "checking-inventory",
  "returned-completed",
  "transferred",
])

export class EventsServices {
  constructor(private readonly repository: EventsRepositories = eventsRepositories) {}

  async getEvents(query: IEventQuery, signal?: AbortSignal): Promise<IEventPage> {
    try {
      const response = await this.repository.getEvents(
        {
          status: query.lifecycleStatus,
          search: query.search || undefined,
          sort_by: query.sortBy ?? "date_event",
          sort: query.sort ?? "ASC",
          page: query.page,
          limit: query.limit,
        },
        signal
      )

      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed to get events", {
          code: response.code,
        })
      }

      return {
        items: response.data.data.map((item) => this.transformEvent(item)),
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalRecords: response.data.total_records,
      }
    } catch (error) {
      throw new ApiError(error)
    }
  }

  async getEventDetail(eventId: number, signal?: AbortSignal): Promise<IEventDetail> {
    try {
      const response = await this.repository.getEventDetail(eventId, signal)
      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed to get event detail", {
          code: response.code,
        })
      }
      return this.transformEventDetail(response.data)
    } catch (error) {
      throw new ApiError(error)
    }
  }

  async getEventItems(eventId: number, signal?: AbortSignal): Promise<IEventItem[]> {
    try {
      const response = await this.repository.getEventItems({ event_id: eventId, order: "asc" }, signal)
      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed to get event items", {
          code: response.code,
        })
      }
      return response.data.map((item) => this.transformEventItem(item))
    } catch (error) {
      throw new ApiError(error)
    }
  }

  async getEventStatuses(signal?: AbortSignal): Promise<IEventStatus[]> {
    try {
      const response = await this.repository.getEventStatuses(
        {
          page: 1,
          limit: 100,
          sort_by: "order_data",
          sort: "ASC",
        },
        signal
      )

      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed to get event statuses", {
          code: response.code,
        })
      }

      return response.data.data.map((item) => this.transformEventStatus(item))
    } catch (error) {
      throw new ApiError(error)
    }
  }

  private transformEvent(item: IEventResponse): IEvent {
    const lifecycleStatus = LIFECYCLE_STATUSES.has(item.lifecycle_status as ClosingTab) ? (item.lifecycle_status as ClosingTab) : "upcoming"
    const eventDate = readNullableString(item.date_event) || readNullableString(item.event_start) || readNullableString(item.event_end)
    const startDate = readNullableString(item.event_start) || eventDate
    const endDate = readNullableString(item.event_end) || startDate

    return {
      id: item.id,
      name: readNullableString(item.name) || "Untitled event",
      code: readNullableString(item.event_code) || "—",
      startDate,
      endDate,
      location: readNullableString(item.address) || "—",
      statusId: item.status,
      lifecycleStatus,
      totalItems: Math.max(0, item.total_items ?? 0),
    }
  }

  private transformEventDetail(item: IEventDetailResponse): IEventDetail {
    const eventDate = readNullableString(item.date_event)
    const startDate = readNullableString(item.event_start) || eventDate
    const endDate = readNullableString(item.event_end) || startDate

    return {
      id: item.id,
      name: readNullableString(item.name) || "Untitled event",
      description: readNullableString(item.description),
      code: readNullableString(item.event_code) || "—",
      startDate,
      endDate,
      eventDate: eventDate || startDate,
      location: readNullableString(item.address) || "—",
      pic: readNullableString(item.PIC),
      notes: readNullableString(item.notes),
      statusId: item.status,
      isComplete: item.is_complete === 1,
      isFinished: item.is_finished === 1,
      imageUrl: readNullableString(item.images),
    }
  }

  private transformEventItem(item: IEventItemResponse): IEventItem {
    const ownerships = [
      item.ownerships?.ihc ? "IHC" : "",
      item.ownerships?.ihp ? "IHP" : "",
      item.ownerships?.outsource ? "Outsource" : "",
    ].filter(Boolean)

    return {
      id: item.id,
      name: item.nama_barang?.trim() || "Untitled item",
      code: item.code?.trim() || "—",
      qty: Math.max(0, item.qty ?? 0),
      unit: item.satuan?.trim() || "pcs",
      notes: item.notes?.trim() || "",
      areaName: item.area_name?.trim() || "No area",
      subAreaName: item.sub_list_name?.trim() || "",
      pic: item.pic?.trim() || item.input_by?.trim() || "",
      photoUrl: item.photo?.trim() || "",
      warehouseName: item.gudang?.[0]?.nama?.trim() || "",
      statusId: item.event_status_id,
      scanIn: item.scan_in === 1 || (item.scan_in_counter ?? 0) > 0,
      scanOut: item.scan_out === 1 || (item.scan_out_counter ?? 0) > 0,
      ownerships,
      packageId: item.package?.id ?? null,
      packageName: item.package?.name?.trim() || "",
      isNewProductionItem: item.is_new_production_item === true,
      isConverted: item.is_converted === true,
      convertedQty: Math.max(0, item.converted_qty ?? 0),
      brokenQty: Math.max(0, item.broken_item?.qty ?? 0),
      brokenNotes: item.broken_item?.notes?.trim() || "",
    }
  }

  private transformEventStatus(item: IEventStatusResponse): IEventStatus {
    return {
      id: item.id,
      name: item.name,
      action: item.action?.trim().toUpperCase() ?? "",
      order: item.order_data,
      activeEvent: item.active_event,
    }
  }
}

export function readNullableString(value: ApiNullableString): string {
  if (typeof value === "string") return value
  if (!value) return ""
  const valid = value.valid ?? value.Valid
  if (valid === false) return ""
  return value.string ?? value.String ?? ""
}

export default new EventsServices()
