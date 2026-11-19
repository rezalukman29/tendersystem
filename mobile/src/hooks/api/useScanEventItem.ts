import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "../../data/ApiError"
import eventsServices from "../../data/services/events.services"
import type { IScanEventItemRequest } from "../../entities/api/request/IScanEventItemRequest"
import { eventsKeys } from "../../features/events/queries/eventsKeys"

export function useScanEventItem(eventId: number) {
  const queryClient = useQueryClient()

  return useMutation<string, ApiError, IScanEventItemRequest>({
    mutationFn: (payload) => eventsServices.scanEventItem(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: eventsKeys.items(eventId),
      }),
  })
}
