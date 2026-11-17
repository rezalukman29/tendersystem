import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "../../../data/ApiError"
import rentalsServices from "../../../data/services/rentals.services"
import type { IUpdateRentalStatusParams } from "../../../entities/interfaces/rentals/IUpdateRentalStatusParams"
import { eventsKeys } from "../../../features/events/queries/eventsKeys"
import { rentalsKeys } from "../../../features/rentals/queries/rentalsKeys"

export function useUpdateRentalStatus() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, IUpdateRentalStatusParams>({
    mutationFn: (params) => rentalsServices.updateRentalStatus(params),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: rentalsKeys.all }),
        queryClient.invalidateQueries({ queryKey: eventsKeys.all }),
      ]),
  })
}
