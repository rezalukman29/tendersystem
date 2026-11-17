import { useQuery } from "@tanstack/react-query"

import { ApiError } from "../../data/ApiError"
import stockServices from "../../data/services/stock.services"
import { stockKeys } from "../../features/stock/queries/stockKeys"

export function useInventoryAssetSummary() {
  return useQuery<number, ApiError>({
    queryKey: stockKeys.assetSummary(),
    queryFn: ({ signal }) => stockServices.getTotalAssetValue(signal),
  })
}
