import * as React from "react"

import type { IEventListItemView } from "../../events/interfaces/IEventListItemView"
import { toEventListItem } from "../../events/presenters/toEventListItem"
import { useEventStatuses } from "../../../hooks/api/useEventStatuses"
import { useInfiniteEvents } from "../../../hooks/api/useInfiniteEvents"
import { useNav } from "../../../navigation"
import type { IScanPickerViewProps } from "../interfaces/IScanPickerViewProps"

const SCAN_EVENT_PAGE_SIZE = 10

export function useScanPickerController(): IScanPickerViewProps {
  const navigation = useNav()
  const statusesQuery = useEventStatuses()
  const scanStatusIds = React.useMemo(
    () =>
      (statusesQuery.data ?? [])
        .filter((status) => status.action === "SCAN_IN" || status.action === "SCAN_OUT")
        .map((status) => status.id),
    [statusesQuery.data]
  )
  const eventsQuery = useInfiniteEvents(
    {
      statusIds: scanStatusIds,
      sortBy: "date_event",
      sort: "DESC",
      limit: SCAN_EVENT_PAGE_SIZE,
    },
    { enabled: scanStatusIds.length > 0 && !statusesQuery.isPending && !statusesQuery.error }
  )
  const refetchStatuses = statusesQuery.refetch
  const refetchEvents = eventsQuery.refetch
  const fetchNextEvents = eventsQuery.fetchNextPage
  const hasNextEvents = eventsQuery.hasNextPage
  const isFetchingNextEvents = eventsQuery.isFetchingNextPage
  const statusMap = React.useMemo(
    () => new Map((statusesQuery.data ?? []).map((status) => [status.id, status] as const)),
    [statusesQuery.data]
  )
  const events = React.useMemo(() => {
    const records = new Map<number, IEventListItemView>()
    for (const page of eventsQuery.data?.pages ?? []) {
      for (const event of page.items) {
        records.set(event.id, toEventListItem(event, "upcoming", statusMap))
      }
    }
    return [...records.values()]
  }, [eventsQuery.data?.pages, statusMap])

  const onEventPress = React.useCallback(
    (eventId: number) => navigation.navigate("Scanner", { eventKey: String(eventId) }),
    [navigation]
  )
  const onRefresh = React.useCallback(() => {
    Promise.all([refetchStatuses(), refetchEvents()]).catch(() => undefined)
  }, [refetchEvents, refetchStatuses])
  const onRetry = React.useCallback(() => {
    Promise.all([refetchStatuses(), refetchEvents()]).catch(() => undefined)
  }, [refetchEvents, refetchStatuses])
  const onEndReached = React.useCallback(() => {
    if (hasNextEvents && !isFetchingNextEvents) {
      fetchNextEvents().catch(() => undefined)
    }
  }, [fetchNextEvents, hasNextEvents, isFetchingNextEvents])

  return {
    events,
    totalEvents: eventsQuery.data?.pages[0]?.totalRecords ?? 0,
    isLoading: statusesQuery.isPending || (scanStatusIds.length > 0 && eventsQuery.isPending),
    isRefreshing: statusesQuery.isRefetching || eventsQuery.isRefetching,
    isFetchingNextPage: eventsQuery.isFetchingNextPage,
    errorMessage: statusesQuery.error?.message ?? eventsQuery.error?.message,
    hasScanStatuses: scanStatusIds.length > 0,
    onEventPress,
    onRefresh,
    onRetry,
    onEndReached,
  }
}
