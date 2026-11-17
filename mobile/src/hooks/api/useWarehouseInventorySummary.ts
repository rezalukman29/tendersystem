import { useQuery } from "@tanstack/react-query"

import { ApiError } from "../../data/ApiError"
import stockServices from "../../data/services/stock.services"
import type { IWarehouseInventorySummary } from "../../entities/interfaces/stock/IWarehouseInventorySummary"
import { stockKeys } from "../../features/stock/queries/stockKeys"

export function useWarehouseInventorySummary() {
  return useQuery<IWarehouseInventorySummary, ApiError>({
    queryKey: stockKeys.warehouseSummary(),
    queryFn: ({ signal }) => stockServices.getWarehouseInventorySummary(signal),
  })
}
