import type { AxiosRequestConfig } from "axios"

import { apiClient } from "../../api/client"
import type { IGetWarehouseInventoryRequestParams } from "../../entities/api/params/IGetWarehouseInventoryRequestParams"
import type { IGetWarehousesRequestParams } from "../../entities/api/params/IGetWarehousesRequestParams"
import type { IGetStockOpnameRequestParams } from "../../entities/api/params/IGetStockOpnameRequestParams"
import type { ICreateStockOpnameRequestBody } from "../../entities/api/request/ICreateStockOpnameRequestBody"
import type { IInventorySummaryResponse } from "../../entities/api/response/IInventorySummaryResponse"
import type { ICreatedStockOpnameResponse } from "../../entities/api/response/ICreatedStockOpnameResponse"
import type { IStockOpnameListResponse } from "../../entities/api/response/IStockOpnameListResponse"
import type { IWarehouseInventoryItemResponse } from "../../entities/api/response/IWarehouseInventoryItemResponse"
import type { IWarehouseInventorySummaryResponse } from "../../entities/api/response/IWarehouseInventorySummaryResponse"
import type { IWarehouseResponse } from "../../entities/api/response/IWarehouseResponse"
import type { ApiResponse, PaginatedData } from "../../interfaces/api"

export class StockRepositories {
  async getWarehouseInventory(
    params: IGetWarehouseInventoryRequestParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<PaginatedData<IWarehouseInventoryItemResponse>>> {
    const config: AxiosRequestConfig = { params, signal }
    const response = await apiClient.get<ApiResponse<PaginatedData<IWarehouseInventoryItemResponse>>>("/v1/barang-gudang/detail", config)
    return response.data
  }

  async getWarehouseInventorySummary(signal?: AbortSignal): Promise<ApiResponse<IWarehouseInventorySummaryResponse>> {
    const response = await apiClient.get<ApiResponse<IWarehouseInventorySummaryResponse>>("/v1/warehouse-inventory-summary", { signal })
    return response.data
  }

  async getInventorySummary(signal?: AbortSignal): Promise<ApiResponse<IInventorySummaryResponse>> {
    const response = await apiClient.get<ApiResponse<IInventorySummaryResponse>>("/v1/inventory-summary", { signal })
    return response.data
  }

  async getWarehouses(params: IGetWarehousesRequestParams, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<IWarehouseResponse>>> {
    const config: AxiosRequestConfig = { params, signal }
    const response = await apiClient.get<ApiResponse<PaginatedData<IWarehouseResponse>>>("/v1/gudang", config)
    return response.data
  }

  async getStockOpnameHistory(
    params: IGetStockOpnameRequestParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<IStockOpnameListResponse>> {
    const config: AxiosRequestConfig = { params, signal }
    const response = await apiClient.get<ApiResponse<IStockOpnameListResponse>>("/v1/stock-opname", config)
    return response.data
  }

  async createStockOpname(
    payload: ICreateStockOpnameRequestBody
  ): Promise<ApiResponse<ICreatedStockOpnameResponse>> {
    const response = await apiClient.post<ApiResponse<ICreatedStockOpnameResponse>>("/v1/stock-opname", payload)
    return response.data
  }
}

export default new StockRepositories()
