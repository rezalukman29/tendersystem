import { useInfiniteQuery } from "@tanstack/react-query"

import { ApiError } from "../../../data/ApiError"
import stockServices from "../../../data/services/stock.services"
import type { IStockOpnamePage } from "../../../entities/interfaces/stock/IStockOpnamePage"
import { stockKeys } from "../../../features/stock/queries/stockKeys"

export function useInfiniteStockOpnameHistory(limit: number) {
  return useInfiniteQuery<IStockOpnamePage, ApiError>({
    queryKey: stockKeys.opnameHistory(limit),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      stockServices.getStockOpnameHistory(Number(pageParam), limit, signal),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })
}
