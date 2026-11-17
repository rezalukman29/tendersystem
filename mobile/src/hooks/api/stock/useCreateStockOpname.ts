import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "../../../data/ApiError"
import stockServices from "../../../data/services/stock.services"
import type { IStockOpnameSubmission } from "../../../entities/interfaces/stock/IStockOpnameSubmission"
import { stockKeys } from "../../../features/stock/queries/stockKeys"

export function useCreateStockOpname() {
  const queryClient = useQueryClient()

  return useMutation<number, ApiError, IStockOpnameSubmission>({
    mutationFn: (submission) => stockServices.createStockOpname(submission),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: stockKeys.opnameHistories(),
        refetchType: "all",
      }),
  })
}
