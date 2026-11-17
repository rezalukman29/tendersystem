import type { IGetRentalItemsRequestParams } from "../../entities/api/params/IGetRentalItemsRequestParams"
import type { IUpdateLoanItemRequestBody } from "../../entities/api/request/IUpdateLoanItemRequestBody"
import type { IUpdateOutsourceItemRequestBody } from "../../entities/api/request/IUpdateOutsourceItemRequestBody"
import type { ILoanItemResponse } from "../../entities/api/response/ILoanItemResponse"
import type { IOutsourceItemResponse } from "../../entities/api/response/IOutsourceItemResponse"
import type { IRentalPage } from "../../entities/interfaces/rentals/IRentalPage"
import type { IRentalRecord, RentalKind, RentalNextStatus, RentalStatus } from "../../entities/interfaces/rentals/IRentalRecord"
import type { IUpdateRentalStatusParams } from "../../entities/interfaces/rentals/IUpdateRentalStatusParams"
import { ApiError } from "../ApiError"
import rentalsRepositories, { type RentalsRepositories } from "../repositories/rentals.repositories"

export class RentalsServices {
  constructor(private readonly repository: RentalsRepositories = rentalsRepositories) {}

  async getRentalItems(
    kind: RentalKind,
    params: IGetRentalItemsRequestParams,
    signal?: AbortSignal
  ): Promise<IRentalPage> {
    try {
      if (kind === "loan") {
        const response = await this.repository.getLoanItems(params, signal)
        if (typeof response.success !== "boolean") {
          throw new ApiError("Request failed")
        }
        if (!response.success || !response.data) {
          throw new ApiError(response.message || "Request failed", { code: response.code })
        }
        if (!isLoanItemListResponse(response.data)) {
          throw new ApiError("Request failed")
        }
        return {
          items: response.data.data.map((item) => this.transformLoanItem(item)),
          page: response.data.page,
          totalPages: response.data.total_pages,
          totalRecords: response.data.total_records,
          summary: {
            requested: response.data.summary.waiting_to_arrive,
            received: response.data.summary.borrowed,
            overdue: response.data.summary.overdue,
            done: response.data.summary.returned,
          },
        }
      }

      const response = await this.repository.getOutsourceItems(params, signal)
      if (typeof response.success !== "boolean") {
        throw new ApiError("Request failed")
      }
      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Request failed", { code: response.code })
      }
      if (!isOutsourceItemListResponse(response.data)) {
        throw new ApiError("Request failed")
      }
      return {
        items: response.data.data.map((item) => this.transformOutsourceItem(item)),
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalRecords: response.data.total_records,
        summary: {
          requested: response.data.summary.waiting_to_arrive,
          received: response.data.summary.received_now,
          overdue: response.data.summary.overdue,
          done: response.data.summary.completed,
        },
      }
    } catch (error) {
      throw new ApiError(error)
    }
  }

  async updateRentalStatus({ record, status }: IUpdateRentalStatusParams): Promise<void> {
    try {
      if (record.kind === "loan") {
        if (status !== "BORROWED" && status !== "RETURNED") {
          throw new ApiError("Request failed")
        }
        const detailResponse = await this.repository.getLoanItem(record.id)
        if (typeof detailResponse.success !== "boolean") {
          throw new ApiError("Request failed")
        }
        if (!detailResponse.success || !detailResponse.data) {
          throw new ApiError(detailResponse.message || "Request failed", { code: detailResponse.code })
        }
        if (!isLoanItemResponse(detailResponse.data)) {
          throw new ApiError("Request failed")
        }
        const response = await this.repository.updateLoanItem(
          record.id,
          this.transformLoanItemRequest(detailResponse.data, status)
        )
        if (typeof response.success !== "boolean") {
          throw new ApiError("Request failed")
        }
        if (!response.success) {
          throw new ApiError(response.message || "Request failed", { code: response.code })
        }
        return
      }

      if (status !== "RECEIVED" && status !== "COMPLETED") {
        throw new ApiError("Request failed")
      }
      const response = await this.repository.updateOutsourceItem(
        record.id,
        this.transformOutsourceItemRequest(record, status)
      )
      if (typeof response.success !== "boolean") {
        throw new ApiError("Request failed")
      }
      if (!response.success) {
        throw new ApiError(response.message || "Request failed", { code: response.code })
      }
    } catch (error) {
      throw new ApiError(error)
    }
  }

  private transformLoanItem(item: ILoanItemResponse): IRentalRecord {
    const warehouse = typeof item.warehouse === "object" && item.warehouse !== null
      ? item.warehouse
      : undefined
    return {
      id: item.id,
      kind: "loan",
      itemName: item.item_name,
      qty: item.qty,
      unit: item.unit,
      vendorName: item.vendor?.name ?? undefined,
      vendorId: (item.vendor_id > 0 ? item.vendor_id : item.vendor?.id) ?? undefined,
      eventId: (item.event_id !== null && item.event_id > 0 ? item.event_id : item.event?.id) ?? undefined,
      eventName: item.event?.name ?? undefined,
      area: item.event?.area ?? undefined,
      subArea: item.event?.sub_area ?? undefined,
      areaId: item.area_id !== null && item.area_id > 0 ? item.area_id : undefined,
      subAreaId: item.sub_area_id !== null && item.sub_area_id > 0 ? item.sub_area_id : undefined,
      warehouse: warehouse?.name ?? undefined,
      warehouseId: (item.warehouse_id !== null && item.warehouse_id > 0 ? item.warehouse_id : warehouse?.id) ?? undefined,
      startDate: item.borrow_from,
      dueDate: item.return_by,
      costPerUnit: item.rental_cost_per_unit,
      totalCost: item.rental_cost > 0 ? item.rental_cost : item.qty * item.rental_cost_per_unit,
      status: this.transformLoanStatus(item.status),
      purpose: item.purpose,
      note: item.notes,
    }
  }

  private transformOutsourceItem(item: IOutsourceItemResponse): IRentalRecord {
    return {
      id: item.id,
      kind: "outsource",
      itemName: item.item_name,
      qty: item.qty,
      unit: item.unit,
      vendorName: item.vendor?.name ?? undefined,
      vendorId: (item.outsource_vendor_id > 0 ? item.outsource_vendor_id : item.vendor?.id) ?? undefined,
      eventId: item.event_id > 0 ? item.event_id : item.event?.id,
      eventName: item.event?.name ?? undefined,
      area: item.area_name || item.event?.area || undefined,
      subArea: item.sub_area_name || item.event?.sub_area || undefined,
      areaId: item.area_id > 0 ? item.area_id : undefined,
      subAreaId: item.sub_area_id !== null && item.sub_area_id !== undefined && item.sub_area_id > 0
        ? item.sub_area_id
        : undefined,
      itemId: item.barang_id,
      unitId: item.satuan_id,
      startDate: item.from_date,
      dueDate: item.to_date,
      costPerUnit: item.cost,
      totalCost: item.total_cost > 0 ? item.total_cost : item.qty * item.cost,
      status: this.transformOutsourceStatus(item.status),
      note: item.note,
    }
  }

  private transformLoanStatus(status: string): RentalStatus {
    switch (status.trim().toUpperCase()) {
      case "REQUESTED":
        return "REQUESTED"
      case "BORROWED":
        return "BORROWED"
      case "OVERDUE":
        return "OVERDUE"
      case "RETURNED":
        return "RETURNED"
      default:
        throw new ApiError("Request failed", { details: { status } })
    }
  }

  private transformOutsourceStatus(status: string): RentalStatus {
    switch (status.trim().toUpperCase()) {
      case "REQUESTED":
        return "REQUESTED"
      case "RECEIVED":
        return "RECEIVED"
      case "COMPLETED":
        return "COMPLETED"
      default:
        throw new ApiError("Request failed", { details: { status } })
    }
  }

  private transformLoanItemRequest(
    item: ILoanItemResponse,
    status: Extract<RentalNextStatus, "BORROWED" | "RETURNED">
  ): IUpdateLoanItemRequestBody {
    const vendorId = item.vendor_id > 0 ? item.vendor_id : item.vendor?.id
    if (vendorId === undefined || vendorId <= 0) {
      throw new ApiError("Request failed")
    }
    const warehouse = typeof item.warehouse === "object" && item.warehouse !== null
      ? item.warehouse
      : undefined
    const warehouseId =
      item.warehouse_id !== null && item.warehouse_id > 0 ? item.warehouse_id : warehouse?.id ?? 0
    const eventId = item.event_id !== null && item.event_id > 0 ? item.event_id : item.event?.id ?? 0

    return {
      item_name: item.item_name,
      qty: Number(item.qty),
      unit: item.unit,
      vendor_id: vendorId,
      ...(warehouseId > 0 ? { warehouse_id: warehouseId } : {}),
      ...(eventId > 0 ? { event_id: eventId } : {}),
      ...(item.area_id !== null && item.area_id > 0 ? { area_id: item.area_id } : {}),
      ...(item.sub_area_id !== null && item.sub_area_id > 0 ? { sub_area_id: item.sub_area_id } : {}),
      borrow_from: item.borrow_from,
      return_by: item.return_by,
      rental_cost_per_unit: item.rental_cost_per_unit,
      purpose: item.purpose || "",
      notes: item.notes || "",
      status,
    }
  }

  private transformOutsourceItemRequest(
    item: IRentalRecord,
    status: Extract<RentalNextStatus, "RECEIVED" | "COMPLETED">
  ): IUpdateOutsourceItemRequestBody {
    if (
      item.itemId === undefined ||
      item.itemId <= 0 ||
      item.unitId === undefined ||
      item.unitId <= 0 ||
      item.areaId === undefined ||
      item.areaId <= 0 ||
      item.vendorId === undefined ||
      item.vendorId <= 0
    ) {
      throw new ApiError("Request failed")
    }
    return {
      barang_id: item.itemId,
      qty: item.qty,
      satuan_id: item.unitId,
      area_id: item.areaId,
      ...(item.subAreaId !== undefined && item.subAreaId > 0 ? { sub_area_id: item.subAreaId } : {}),
      outsource_vendor_id: item.vendorId,
      from_date: item.startDate,
      to_date: item.dueDate,
      cost: item.costPerUnit,
      note: item.note || "",
      status,
    }
  }
}

function isLoanItemListResponse(value: unknown): value is {
  data: ILoanItemResponse[]
  page: number
  record_per_page: number
  total_pages: number
  total_records: number
  summary: {
    total_records?: number
    borrowed?: number
    overdue?: number
    returned?: number
    waiting_to_arrive?: number
    total_rental_cost?: number
  }
} {
  return (
    isObject(value) &&
    Array.isArray(value.data) &&
    value.data.every(isLoanItemResponse) &&
    isFiniteNumber(value.page) &&
    isFiniteNumber(value.record_per_page) &&
    isFiniteNumber(value.total_pages) &&
    isFiniteNumber(value.total_records) &&
    isObject(value.summary) &&
    isOptionalFiniteNumber(value.summary.total_records) &&
    isOptionalFiniteNumber(value.summary.borrowed) &&
    isOptionalFiniteNumber(value.summary.overdue) &&
    isOptionalFiniteNumber(value.summary.returned) &&
    isOptionalFiniteNumber(value.summary.waiting_to_arrive) &&
    isOptionalFiniteNumber(value.summary.total_rental_cost)
  )
}

function isOutsourceItemListResponse(value: unknown): value is {
  data: IOutsourceItemResponse[]
  page: number
  record_per_page: number
  total_pages: number
  total_records: number
  summary: {
    outsource_records?: number
    waiting_to_arrive?: number
    received_now?: number
    overdue?: number
    completed?: number
    total_cost?: number
  }
} {
  return (
    isObject(value) &&
    Array.isArray(value.data) &&
    value.data.every(isOutsourceItemResponse) &&
    isFiniteNumber(value.page) &&
    isFiniteNumber(value.record_per_page) &&
    isFiniteNumber(value.total_pages) &&
    isFiniteNumber(value.total_records) &&
    isObject(value.summary) &&
    isOptionalFiniteNumber(value.summary.outsource_records) &&
    isOptionalFiniteNumber(value.summary.waiting_to_arrive) &&
    isOptionalFiniteNumber(value.summary.received_now) &&
    isOptionalFiniteNumber(value.summary.overdue) &&
    isOptionalFiniteNumber(value.summary.completed) &&
    isOptionalFiniteNumber(value.summary.total_cost)
  )
}

function isLoanItemResponse(value: unknown): value is ILoanItemResponse {
  return (
    isObject(value) &&
    isFiniteNumber(value.id) &&
    isString(value.item_name) &&
    isFiniteNumber(value.qty) &&
    isString(value.unit) &&
    isFiniteNumber(value.vendor_id) &&
    isNullableParty(value.vendor) &&
    isNullableNumber(value.warehouse_id) &&
    isNullableWarehouse(value.warehouse) &&
    isNullableNumber(value.event_id) &&
    isNullableLoanEvent(value.event) &&
    isNullableNumber(value.area_id) &&
    isNullableNumber(value.sub_area_id) &&
    isString(value.borrow_from) &&
    isString(value.return_by) &&
    isString(value.purpose) &&
    isString(value.notes) &&
    isFiniteNumber(value.rental_cost_per_unit) &&
    isFiniteNumber(value.rental_cost) &&
    isString(value.status) &&
    isString(value.requested_at) &&
    isString(value.requested_by) &&
    isNullableString(value.received_at) &&
    isNullableString(value.returned_at) &&
    isString(value.created_at) &&
    isString(value.updated_at)
  )
}

function isOutsourceItemResponse(value: unknown): value is IOutsourceItemResponse {
  return (
    isObject(value) &&
    isFiniteNumber(value.id) &&
    isFiniteNumber(value.event_id) &&
    isFiniteNumber(value.barang_id) &&
    isString(value.item_name) &&
    isFiniteNumber(value.qty) &&
    isString(value.unit) &&
    isFiniteNumber(value.satuan_id) &&
    isFiniteNumber(value.area_id) &&
    isString(value.area_name) &&
    isOptionalNullableNumber(value.sub_area_id) &&
    isOptionalNullableString(value.sub_area_name) &&
    isFiniteNumber(value.outsource_vendor_id) &&
    isOptionalNullableParty(value.vendor) &&
    isOptionalNullableOutsourceEvent(value.event) &&
    isString(value.from_date) &&
    isString(value.to_date) &&
    isFiniteNumber(value.cost) &&
    isFiniteNumber(value.total_cost) &&
    isString(value.note) &&
    isString(value.status) &&
    isOptionalString(value.requested_at) &&
    isOptionalString(value.requested_by) &&
    isOptionalNullableString(value.received_at) &&
    isOptionalNullableString(value.completed_at)
  )
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === "string"
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isOptionalFiniteNumber(value: unknown): value is number | undefined {
  return value === undefined || isFiniteNumber(value)
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value)
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value)
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value)
}

function isOptionalNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || isNullableString(value)
}

function isOptionalNullableNumber(value: unknown): value is number | null | undefined {
  return value === undefined || value === null || isFiniteNumber(value)
}

function isParty(value: unknown): boolean {
  return isObject(value) && isOptionalFiniteNumber(value.id) && isOptionalString(value.name)
}

function isNullableParty(value: unknown): boolean {
  return value === null || isParty(value)
}

function isNullableWarehouse(value: unknown): boolean {
  return value === null || isFiniteNumber(value) || isParty(value)
}

function isOptionalNullableParty(value: unknown): boolean {
  return value === undefined || isNullableParty(value)
}

function isNullableLoanEvent(value: unknown): boolean {
  return (
    value === null ||
    (isObject(value) &&
      isOptionalFiniteNumber(value.id) &&
      isOptionalString(value.name) &&
      isOptionalString(value.area) &&
      isOptionalString(value.sub_area))
  )
}

function isOptionalNullableOutsourceEvent(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (isObject(value) &&
      isOptionalFiniteNumber(value.id) &&
      isOptionalString(value.name) &&
      isOptionalString(value.area) &&
      isOptionalString(value.sub_area))
  )
}

export default new RentalsServices()
