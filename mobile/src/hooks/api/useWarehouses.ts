import { useQuery } from "@tanstack/react-query"

import { ApiError } from "../../data/ApiError"
import stockServices from "../../data/services/stock.services"
import type { IWarehouse } from "../../entities/interfaces/stock/IWarehouse"
import { stockKeys } from "../../features/stock/queries/stockKeys"

export function useWarehouses() {
  return useQuery<IWarehouse[], ApiError>({
    queryKey: stockKeys.warehouses(),
    queryFn: ({ signal }) => stockServices.getWarehouses(signal),
  })
}
