import type { IStockOpnameListResponse } from "../../entities/api/response/IStockOpnameListResponse"
import type { ICreateStockOpnameRequestBody } from "../../entities/api/request/ICreateStockOpnameRequestBody"
import type { IWarehouseInventoryItemResponse } from "../../entities/api/response/IWarehouseInventoryItemResponse"
import type { IWarehouseResponse } from "../../entities/api/response/IWarehouseResponse"
import type { IWarehouse } from "../../entities/interfaces/stock/IWarehouse"
import type { IWarehouseInventoryPage } from "../../entities/interfaces/stock/IWarehouseInventoryPage"
import type { IWarehouseInventoryQuery } from "../../entities/interfaces/stock/IWarehouseInventoryQuery"
import type { IWarehouseInventorySummary } from "../../entities/interfaces/stock/IWarehouseInventorySummary"
import type { IWarehouseStockItem } from "../../entities/interfaces/stock/IWarehouseStockItem"
import type { IStockOpname } from "../../entities/interfaces/stock/IStockOpname"
import type { IStockOpnamePage } from "../../entities/interfaces/stock/IStockOpnamePage"
import type { IStockOpnameSubmission } from "../../entities/interfaces/stock/IStockOpnameSubmission"
import type { WarehouseInventoryStatus } from "../../entities/interfaces/stock/WarehouseInventoryStatus"
import { ApiError } from "../ApiError"
import stockRepositories, { type StockRepositories } from "../repositories/stock.repositories"

const WAREHOUSE_LIST_LIMIT = 1000

export class StockServices {
  constructor(private readonly repository: StockRepositories = stockRepositories) {}

  async getWarehouseInventory(query: IWarehouseInventoryQuery, signal?: AbortSignal): Promise<IWarehouseInventoryPage> {
    try {
      const response = await this.repository.getWarehouseInventory(
        {
          page: query.page,
          limit: query.limit,
          search: query.search ?? undefined,
          gudang_id: query.warehouseId,
          status: query.status,
          sort: query.sort ?? "ASC",
          sort_by: query.sortBy ?? "nama_barang",
        },
        signal
      )

      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed to get warehouse inventory", {
          code: response.code,
        })
      }

      return {
        items: response.data.data.map((item) => this.transformStockItem(item)),
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalRecords: response.data.total_records,
      }
    } catch (error) {
      throw new ApiError(error)
    }
  }

  async getWarehouseInventorySummary(signal?: AbortSignal): Promise<IWarehouseInventorySummary> {
    try {
      const response = await this.repository.getWarehouseInventorySummary(signal)
      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed to get warehouse inventory summary", {
          code: response.code,
        })
      }
      return {
        totalItems: response.data.total_items,
        safe: response.data.safe,
        warning: response.data.warning,
        critical: response.data.critical,
      }
    } catch (error) {
      throw new ApiError(error)
    }
  }

  async getTotalAssetValue(signal?: AbortSignal): Promise<number> {
    try {
      const response = await this.repository.getInventorySummary(signal)
      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed to get inventory summary", {
          code: response.code,
        })
      }
      const totalAssetValue = Number(response.data.total_asset_value)
      return Number.isFinite(totalAssetValue) ? totalAssetValue : 0
    } catch (error) {
      throw new ApiError(error)
    }
  }

  async getWarehouses(signal?: AbortSignal): Promise<IWarehouse[]> {
    try {
      const response = await this.repository.getWarehouses({ page: 1, limit: WAREHOUSE_LIST_LIMIT }, signal)
      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed to get warehouses", {
          code: response.code,
        })
      }
      return response.data.data.map((item) => this.transformWarehouse(item))
    } catch (error) {
      throw new ApiError(error)
    }
  }

  async getStockOpnameHistory(
    page: number,
    limit: number,
    signal?: AbortSignal
  ): Promise<IStockOpnamePage> {
    try {
      const response = await this.repository.getStockOpnameHistory({ page, limit }, signal)
      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed to get stock opname history", {
          code: response.code,
        })
      }
      if (!isStockOpnameListResponse(response.data)) {
        throw new ApiError("Request failed")
      }
      return {
        items: response.data.data.map((record) => this.transformStockOpname(record)),
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalRecords: response.data.total_records,
      }
    } catch (error) {
      throw new ApiError(error)
    }
  }

  async createStockOpname(submission: IStockOpnameSubmission): Promise<number> {
    try {
      const response = await this.repository.createStockOpname(this.transformStockOpnameSubmission(submission))
      if (!response.success || !response.data || !isFiniteNumber(response.data.id)) {
        throw new ApiError(response.message || "Failed to create stock opname", {
          code: response.code,
        })
      }
      return response.data.id
    } catch (error) {
      throw new ApiError(error)
    }
  }

  private transformStockOpnameSubmission(submission: IStockOpnameSubmission): ICreateStockOpnameRequestBody {
    return {
      period: submission.period.trim(),
      remark: submission.remark.trim(),
      data: submission.items.map((item) => ({
        condition: item.condition === "Poor" ? "POOR" : "GOOD",
        id: item.warehouseItemId,
        notes: item.note.trim(),
        stok: item.actualStock,
      })),
    }
  }

  private transformStockItem(item: IWarehouseInventoryItemResponse): IWarehouseStockItem {
    const valuation = Number.parseFloat(item.valuation)
    return {
      id: item.barang_gudang_id,
      itemId: item.barang_id,
      name: item.nama_barang,
      code: item.kode_barang ?? item.kode ?? item.kode_gudang,
      warehouseId: item.gudang_id,
      warehouseName: item.gudang_name || item.gudang.gudang_name,
      warehouseStock: item.stok_gudang,
      itemStock: item.stok_barang,
      minimumStock: item.stok_minimum,
      usedStock: item.stock_used,
      unit: item.nama_satuan,
      valuation: Number.isFinite(valuation) ? valuation : 0,
      status: this.transformStatus(item.status),
    }
  }

  private transformWarehouse(item: IWarehouseResponse): IWarehouse {
    return {
      id: item.id,
      name: item.nama,
      ...(item.lokasi !== null && item.lokasi !== undefined ? { location: item.lokasi } : {}),
      totalItems: Math.max(0, item.total_items ?? 0),
    }
  }

  private transformStockOpname(record: IStockOpnameListResponse["data"][number]): IStockOpname {
    const flag = record.flag.trim().toLowerCase()
    if (flag !== "draft" && flag !== "done") {
      throw new ApiError("Request failed", { details: { flag: record.flag } })
    }
    const items = record.data.map((item) => {
      const condition = item.condition.trim().toUpperCase()
      if (condition !== "GOOD" && condition !== "POOR") {
        throw new ApiError("Request failed", { details: { condition: item.condition } })
      }
      return {
        rowId: item.id,
        name: item.barang.nama,
        before: item.stock_old,
        after: item.stock_new,
        diff: item.stock_new - item.stock_old,
        condition: condition === "POOR" ? "Poor" as const : "Good" as const,
        note: item.notes,
      }
    })
    const warehouse = record.data.find((item) => item.barang.gudang_name)?.barang.gudang_name
    return {
      id: record.id,
      period: record.period,
      appliedAt: record.created_at,
      appliedBy: String(record.userId),
      warehouse,
      countedCount: items.length,
      amount: record.valuation ?? 0,
      status: flag === "draft" ? "Pending" : "Approved",
      items,
    }
  }

  private transformStatus(value: string): WarehouseInventoryStatus {
    const status = value.trim().toUpperCase()
    if (status === "SAFE" || status === "WARNING" || status === "CRITICAL") {
      return status
    }
    return "NOT_SET"
  }
}

function isStockOpnameListResponse(value: unknown): value is IStockOpnameListResponse {
  return (
    isObject(value) &&
    isFiniteNumber(value.page) &&
    isFiniteNumber(value.total_pages) &&
    isFiniteNumber(value.total_records) &&
    isFiniteNumber(value.record_per_page) &&
    Array.isArray(value.data) &&
    value.data.every(isStockOpnameResponse)
  )
}

function isStockOpnameResponse(value: unknown): value is IStockOpnameListResponse["data"][number] {
  return (
    isObject(value) &&
    isFiniteNumber(value.id) &&
    isString(value.period) &&
    isString(value.remark) &&
    isString(value.flag) &&
    isString(value.created_at) &&
    isFiniteNumber(value.userId) &&
    (value.valuation === undefined || isFiniteNumber(value.valuation)) &&
    Array.isArray(value.data) &&
    value.data.every(isStockOpnameItemResponse)
  )
}

function isStockOpnameItemResponse(value: unknown): boolean {
  return (
    isObject(value) &&
    isFiniteNumber(value.id) &&
    isFiniteNumber(value.stock_new) &&
    isFiniteNumber(value.stock_old) &&
    isString(value.comparison) &&
    isString(value.condition) &&
    isString(value.notes) &&
    isObject(value.barang) &&
    isString(value.barang.nama) &&
    isFiniteNumber(value.barang.gudang_id) &&
    isString(value.barang.gudang_name) &&
    isString(value.barang.photo)
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

export default new StockServices()
