import type { AxiosRequestConfig } from "axios"

import { apiClient } from "../../api/client"
import type { IGetEventsRequestParams } from "../../entities/api/params/IGetEventsRequestParams"
import type { IGetEventStatusesRequestParams } from "../../entities/api/params/IGetEventStatusesRequestParams"
import type { IGetEventItemsRequestParams } from "../../entities/api/params/IGetEventItemsRequestParams"
import type { IScanEventItemRequest } from "../../entities/api/request/IScanEventItemRequest"
import type { IEventDetailResponse } from "../../entities/api/response/IEventDetailResponse"
import type { IEventItemResponse } from "../../entities/api/response/IEventItemResponse"
import type { IEventResponse } from "../../entities/api/response/IEventResponse"
import type { IEventStatusResponse } from "../../entities/api/response/IEventStatusResponse"
import type { ApiResponse, PaginatedData } from "../../interfaces/api"

export class EventsRepositories {
  async scanEventItem(payload: IScanEventItemRequest): Promise<ApiResponse<unknown>> {
    const response = await apiClient.put<ApiResponse<unknown>>("/v1/fix-list-item/scan", payload)
    return response.data
  }

  async getEventDetail(eventId: number, signal?: AbortSignal): Promise<ApiResponse<IEventDetailResponse>> {
    const response = await apiClient.get<ApiResponse<IEventDetailResponse>>(`/v1/event/${eventId}`, { signal })
    return response.data
  }

  async getEventItems(params: IGetEventItemsRequestParams, signal?: AbortSignal): Promise<ApiResponse<IEventItemResponse[]>> {
    const config: AxiosRequestConfig = { params, signal }
    const response = await apiClient.get<ApiResponse<IEventItemResponse[]>>("/v3/fix-list-item-event", config)
    return response.data
  }

  async getEvents(params: IGetEventsRequestParams, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<IEventResponse>>> {
    const config: AxiosRequestConfig = { params, signal }
    const response = await apiClient.get<ApiResponse<PaginatedData<IEventResponse>>>("/v2/event-filter", config)
    return response.data
  }

  async getEventStatuses(
    params: IGetEventStatusesRequestParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<PaginatedData<IEventStatusResponse>>> {
    const config: AxiosRequestConfig = { params, signal }
    const response = await apiClient.get<ApiResponse<PaginatedData<IEventStatusResponse>>>("/v1/event-status/get-all", config)
    return response.data
  }
}

export default new EventsRepositories()
