import * as React from "react"

import type { ClosingTab } from "../../../core/rules"
import { useEventLifecycleCounts } from "../../../hooks/api/useEventLifecycleCounts"
import { useEventStatuses } from "../../../hooks/api/useEventStatuses"
import { useInfiniteEvents } from "../../../hooks/api/useInfiniteEvents"
import { useNav } from "../../../navigation"
import { useAppSelector } from "../../../redux/hooks"
import { EVENT_TABS } from "../constants/eventTabs"
import type { IEventsViewProps } from "../interfaces/IEventsViewProps"
import { toEventListItem } from "../presenters/toEventListItem"

const EVENT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 350

export function useEventsController(): IEventsViewProps {
  const navigation = useNav()
  const profile = useAppSelector((state) => state.profile)
  const [selectedTab, setSelectedTab] = React.useState<ClosingTab>("on-going")
  const [query, setQuery] = React.useState("")
  const deferredQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS)

  const eventsQuery = useInfiniteEvents({
    lifecycleStatus: selectedTab,
    search: deferredQuery || undefined,
    sortBy: "date_event",
    sort: "ASC",
    limit: EVENT_PAGE_SIZE,
  })
  const statusesQuery = useEventStatuses()
  const countsQuery = useEventLifecycleCounts(deferredQuery)

  const statusMap = React.useMemo(
    () =>
      new Map(
        (statusesQuery.data ?? []).map((status) => [status.id, status] as const)
      ),
    [statusesQuery.data]
  )

  const events = React.useMemo(() => {
    const uniqueEvents = new Map<number, ReturnType<typeof toEventListItem>>()
    for (const page of eventsQuery.data?.pages ?? []) {
      for (const event of page.items) {
        uniqueEvents.set(event.id, toEventListItem(event, selectedTab, statusMap))
      }
    }
    return [...uniqueEvents.values()]
  }, [eventsQuery.data?.pages, selectedTab, statusMap])

  const onEventPress = React.useCallback(
    (eventId: number) =>
      navigation.navigate("EventDetail", { eventKey: String(eventId) }),
    [navigation]
  )

  const onEndReached = React.useCallback(() => {
    if (eventsQuery.hasNextPage && !eventsQuery.isFetchingNextPage) {
      eventsQuery.fetchNextPage().catch(() => undefined)
    }
  }, [eventsQuery])

  const onRefresh = React.useCallback(() => {
    Promise.all([
      eventsQuery.refetch(),
      statusesQuery.refetch(),
      countsQuery.refetch(),
    ]).catch(() => undefined)
  }, [countsQuery, eventsQuery, statusesQuery])

  const onRetry = React.useCallback(() => {
    Promise.all([eventsQuery.refetch(), statusesQuery.refetch()]).catch(
      () => undefined
    )
  }, [eventsQuery, statusesQuery])

  const error = eventsQuery.error ?? statusesQuery.error

  return {
    greetingName: profile.fullname.split(" ").filter(Boolean)[0] ?? "",
    query,
    selectedTab,
    tabs: EVENT_TABS,
    tabCounts: countsQuery.counts,
    events,
    isInitialLoading:
      (eventsQuery.isPending || statusesQuery.isPending) && events.length === 0,
    isRefreshing:
      (eventsQuery.isRefetching || statusesQuery.isRefetching) &&
      !eventsQuery.isFetchingNextPage,
    isFetchingNextPage: eventsQuery.isFetchingNextPage,
    errorMessage: error?.message,
    onQueryChange: setQuery,
    onTabChange: setSelectedTab,
    onEventPress,
    onRefresh,
    onRetry,
    onEndReached,
  }
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timeout)
  }, [delay, value])

  return debouncedValue
}
