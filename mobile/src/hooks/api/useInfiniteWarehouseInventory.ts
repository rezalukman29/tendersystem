import { useInfiniteQuery } from "@tanstack/react-query"

import { ApiError } from "../../data/ApiError"
import stockServices from "../../data/services/stock.services"
import type { IWarehouseInventoryPage } from "../../entities/interfaces/stock/IWarehouseInventoryPage"
import type { IWarehouseInventoryQuery } from "../../entities/interfaces/stock/IWarehouseInventoryQuery"
import type { IStockQueryOptions } from "../../features/stock/interfaces/IStockQueryOptions"
import { stockKeys } from "../../features/stock/queries/stockKeys"

export function useInfiniteWarehouseInventory(query: Omit<IWarehouseInventoryQuery, "page">, options: IStockQueryOptions = {}) {
  return useInfiniteQuery<IWarehouseInventoryPage, ApiError>({
    queryKey: stockKeys.list(query),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => stockServices.getWarehouseInventory({ ...query, page: Number(pageParam) }, signal),
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled: options.enabled,
  })
}
