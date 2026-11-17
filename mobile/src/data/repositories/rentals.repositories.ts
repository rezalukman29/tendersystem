import type { AxiosRequestConfig } from "axios"

import { apiClient } from "../../api/client"
import type { IGetRentalItemsRequestParams } from "../../entities/api/params/IGetRentalItemsRequestParams"
import type { IUpdateLoanItemRequestBody } from "../../entities/api/request/IUpdateLoanItemRequestBody"
import type { IUpdateOutsourceItemRequestBody } from "../../entities/api/request/IUpdateOutsourceItemRequestBody"
import type { ILoanItemListResponse } from "../../entities/api/response/ILoanItemListResponse"
import type { ILoanItemResponse } from "../../entities/api/response/ILoanItemResponse"
import type { IOutsourceItemListResponse } from "../../entities/api/response/IOutsourceItemListResponse"
import type { IOutsourceItemResponse } from "../../entities/api/response/IOutsourceItemResponse"
import type { ApiResponse } from "../../interfaces/api"

export class RentalsRepositories {
  async getLoanItems(
    params: IGetRentalItemsRequestParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<ILoanItemListResponse>> {
    const config: AxiosRequestConfig = { params, signal }
    const response = await apiClient.get<ApiResponse<ILoanItemListResponse>>("/v1/loan-items", config)
    return response.data
  }

  async getLoanItem(id: number): Promise<ApiResponse<ILoanItemResponse>> {
    const response = await apiClient.get<ApiResponse<ILoanItemResponse>>(`/v1/loan-items/${id}`)
    return response.data
  }

  async updateLoanItem(
    id: number,
    payload: IUpdateLoanItemRequestBody
  ): Promise<ApiResponse<ILoanItemResponse>> {
    const response = await apiClient.put<ApiResponse<ILoanItemResponse>>(`/v1/loan-items/${id}`, payload)
    return response.data
  }

  async getOutsourceItems(
    params: IGetRentalItemsRequestParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<IOutsourceItemListResponse>> {
    const config: AxiosRequestConfig = { params, signal }
    const response = await apiClient.get<ApiResponse<IOutsourceItemListResponse>>("/v1/outsource-items", config)
    return response.data
  }

  async updateOutsourceItem(
    id: number,
    payload: IUpdateOutsourceItemRequestBody
  ): Promise<ApiResponse<IOutsourceItemResponse>> {
    const response = await apiClient.put<ApiResponse<IOutsourceItemResponse>>(
      `/v1/outsource-items/${id}`,
      payload
    )
    return response.data
  }
}

export default new RentalsRepositories()
