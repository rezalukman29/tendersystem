import { useQuery } from "@tanstack/react-query"

import { ApiError } from "../../data/ApiError"
import eventsServices from "../../data/services/events.services"
import type { IEventItem } from "../../entities/interfaces/events/IEventItem"
import { eventsKeys } from "../../features/events/queries/eventsKeys"

export function useEventItems(eventId: number) {
  return useQuery<IEventItem[], ApiError>({
    queryKey: eventsKeys.items(eventId),
    queryFn: ({ signal }) => eventsServices.getEventItems(eventId, signal),
    enabled: eventId > 0,
  })
}
