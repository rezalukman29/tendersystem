import { useQueries } from "@tanstack/react-query"

import eventsServices from "../../data/services/events.services"
import type { ClosingTab } from "../../core/rules"
import {
  EMPTY_EVENT_TAB_COUNTS,
  EVENT_TABS,
} from "../../features/events/constants/eventTabs"
import { eventsKeys } from "../../features/events/queries/eventsKeys"

export function useEventLifecycleCounts(search: string) {
  const results = useQueries({
    queries: EVENT_TABS.map((lifecycleStatus) => {
      const query = {
        lifecycleStatus,
        search: search || undefined,
        sortBy: "date_event",
        sort: "ASC" as const,
        page: 1,
        limit: 1,
      }

      return {
        queryKey: eventsKeys.list(query),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          eventsServices.getEvents(query, signal),
      }
    }),
  })

  const counts = EVENT_TABS.reduce<Record<ClosingTab, number>>(
    (value, tab, index) => {
      value[tab] = results[index].data?.totalRecords ?? 0
      return value
    },
    { ...EMPTY_EVENT_TAB_COUNTS }
  )

  return {
    counts,
    isFetching: results.some((result) => result.isFetching),
    refetch: () => Promise.all(results.map((result) => result.refetch())),
  }
}
