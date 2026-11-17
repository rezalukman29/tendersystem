import * as React from "react"
import { Alert } from "react-native"

import { fmtNum } from "../../../core/format"
import { KIND_TEXT } from "../../../core/rules"
import type { IRentalPage } from "../../../entities/interfaces/rentals/IRentalPage"
import type { IRentalRecord, RentalKind, RentalNextStatus } from "../../../entities/interfaces/rentals/IRentalRecord"
import { useInfiniteRentalItems } from "../../../hooks/api/rentals/useInfiniteRentalItems"
import { useUpdateRentalStatus } from "../../../hooks/api/rentals/useUpdateRentalStatus"
import { useNav } from "../../../navigation"
import { useAppStore } from "../../../store"
import { useToast } from "../../../ui/toast"
import type { IRentalListItemView, RentalDisplay } from "../interfaces/IRentalListItemView"
import type { IRentalsViewProps, RentalFilter } from "../interfaces/IRentalsViewProps"

const RENTAL_PAGE_SIZE = 20
const DISPLAY_ORDER: Record<RentalDisplay, number> = {
  Overdue: 0,
  Requested: 1,
  Received: 2,
  Done: 3,
}

export function useRentalsController(): IRentalsViewProps {
  const navigation = useNav()
  const { writable } = useAppStore()
  const toast = useToast()
  const [kind, setKind] = React.useState<RentalKind>("loan")
  const [filter, setFilter] = React.useState<RentalFilter>("all")
  const updateMutation = useUpdateRentalStatus()
  const actionInProgress = React.useRef(false)
  const query = useInfiniteRentalItems(kind, RENTAL_PAGE_SIZE, true)

  const records = React.useMemo(() => {
    const uniqueRecords = new Map<number, IRentalRecord>()
    for (const page of query.data?.pages ?? []) {
      for (const record of page.items) {
        uniqueRecords.set(record.id, record)
      }
    }
    return [...uniqueRecords.values()]
  }, [query.data?.pages])

  const today = getLocalDate()
  const items = React.useMemo(() => {
    return records
      .map((record) => toRentalListItem(record, today))
      .filter((item) =>
        filter === "all" ? true : filter === "open" ? item.display !== "Done" : item.display === filter
      )
      .sort((a, b) =>
        DISPLAY_ORDER[a.display] - DISPLAY_ORDER[b.display] ||
        a.record.dueDate.localeCompare(b.record.dueDate)
      )
  }, [filter, records, today])

  const firstPage: IRentalPage | undefined = query.data?.pages[0]
  const counts = React.useMemo(() => getFilterCounts(firstPage, records, today), [firstPage, records, today])
  const openCost = query.hasNextPage
    ? undefined
    : records
        .filter((record) => toRentalDisplay(record, today) !== "Done")
        .reduce((sum, record) => sum + record.totalCost, 0)

  const performStatusUpdate = React.useCallback(
    async (record: IRentalRecord, status: RentalNextStatus, successMessage?: string) => {
      if (actionInProgress.current || !writable) return
      actionInProgress.current = true
      try {
        await updateMutation.mutateAsync({ record, status })
        if (successMessage) toast.show(successMessage, "success")
      } catch (error) {
        toast.show(error instanceof Error ? error.message : String(error), "error")
      } finally {
        actionInProgress.current = false
      }
    },
    [toast, updateMutation, writable]
  )

  const onMarkReceived = React.useCallback(
    (record: IRentalRecord) => {
      const status: RentalNextStatus = record.kind === "loan" ? "BORROWED" : "RECEIVED"
      const successMessage = record.eventId
        ? `${record.itemName} received · added to the event`
        : `${record.itemName} received`
      performStatusUpdate(record, status, successMessage)
    },
    [performStatusUpdate]
  )

  const onMarkDone = React.useCallback(
    (record: IRentalRecord) => {
      const text = KIND_TEXT[record.kind]
      const status: RentalNextStatus = record.kind === "loan" ? "RETURNED" : "COMPLETED"
      Alert.alert(
        `${text.markDone}?`,
        `${fmtNum(record.qty)} ${record.unit} ${record.itemName} ${record.kind === "loan" ? "go back to" : "are completed by"} ${record.vendorName ?? "—"}. Always the full quantity.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: text.markDone,
            onPress: () => performStatusUpdate(record, status),
          },
        ]
      )
    },
    [performStatusUpdate]
  )

  const onKindChange = React.useCallback((nextKind: RentalKind) => {
    setKind(nextKind)
    setFilter("all")
  }, [])

  const onEndReached = React.useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage().catch(() => undefined)
    }
  }, [query])

  const onRefresh = React.useCallback(() => {
    query.refetch().catch(() => undefined)
  }, [query])

  const onRetry = React.useCallback(() => {
    query.refetch().catch(() => undefined)
  }, [query])

  return {
    kind,
    filter,
    counts,
    items,
    totalCount: counts[filter],
    openCost,
    isInitialLoading: query.isPending && records.length === 0,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isActing: updateMutation.isPending,
    errorMessage: query.error?.message,
    onBack: navigation.goBack,
    onKindChange,
    onFilterChange: setFilter,
    onRefresh,
    onRetry,
    onEndReached,
    onMarkReceived,
    onMarkDone,
  }
}

function toRentalListItem(record: IRentalRecord, today: string): IRentalListItemView {
  return {
    record,
    display: toRentalDisplay(record, today),
    canMarkReceived: record.status === "REQUESTED",
    canMarkDone:
      record.kind === "loan"
        ? record.status === "BORROWED" || record.status === "OVERDUE"
        : record.status === "RECEIVED",
  }
}

function toRentalDisplay(record: IRentalRecord, today: string): RentalDisplay {
  if (record.status === "RETURNED" || record.status === "COMPLETED") return "Done"
  if (record.status === "REQUESTED") return "Requested"
  if (record.status === "OVERDUE" || record.dueDate < today) return "Overdue"
  return "Received"
}

function getFilterCounts(
  firstPage: IRentalPage | undefined,
  records: IRentalRecord[],
  today: string
): Record<RentalFilter, number> {
  const displayCounts = records.reduce<Record<RentalDisplay, number>>(
    (counts, record) => {
      counts[toRentalDisplay(record, today)] += 1
      return counts
    },
    { Requested: 0, Received: 0, Overdue: 0, Done: 0 }
  )
  const totalRecords = firstPage?.totalRecords ?? records.length
  const done = firstPage?.summary.done ?? displayCounts.Done
  return {
    all: totalRecords,
    open: Math.max(0, totalRecords - done),
    Requested: firstPage?.summary.requested ?? displayCounts.Requested,
    Received: firstPage?.summary.received ?? displayCounts.Received,
    Overdue: firstPage?.summary.overdue ?? displayCounts.Overdue,
    Done: done,
  }
}

function getLocalDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}
