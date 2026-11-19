import { useInfiniteQuery } from "@tanstack/react-query"

import { ApiError } from "../../data/ApiError"
import eventsServices from "../../data/services/events.services"
import type { IEventPage } from "../../entities/interfaces/events/IEventPage"
import type { IEventQuery } from "../../entities/interfaces/events/IEventQuery"
import { eventsKeys } from "../../features/events/queries/eventsKeys"

export function useInfiniteEvents(
  query: Omit<IEventQuery, "page">,
  options: { enabled?: boolean } = {}
) {
  return useInfiniteQuery<IEventPage, ApiError>({
    queryKey: eventsKeys.list({ ...query, page: 1 }),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      eventsServices.getEvents(
        { ...query, page: Number(pageParam) },
        signal
      ),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: options.enabled,
  })
}
