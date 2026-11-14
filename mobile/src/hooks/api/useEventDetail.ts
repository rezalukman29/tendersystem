import { useQuery } from "@tanstack/react-query"

import { ApiError } from "../../data/ApiError"
import eventsServices from "../../data/services/events.services"
import type { IEventDetail } from "../../entities/interfaces/events/IEventDetail"
import { eventsKeys } from "../../features/events/queries/eventsKeys"

export function useEventDetail(eventId: number) {
  return useQuery<IEventDetail, ApiError>({
    queryKey: eventsKeys.detail(eventId),
    queryFn: ({ signal }) => eventsServices.getEventDetail(eventId, signal),
    enabled: eventId > 0,
  })
}
