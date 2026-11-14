import { useQuery } from "@tanstack/react-query"

import { ApiError } from "../../data/ApiError"
import eventsServices from "../../data/services/events.services"
import type { IEventStatus } from "../../entities/interfaces/events/IEventStatus"
import { eventsKeys } from "../../features/events/queries/eventsKeys"

export function useEventStatuses() {
  return useQuery<IEventStatus[], ApiError>({
    queryKey: eventsKeys.statuses(),
    queryFn: ({ signal }) => eventsServices.getEventStatuses(signal),
    staleTime: 5 * 60 * 1000,
  })
}
