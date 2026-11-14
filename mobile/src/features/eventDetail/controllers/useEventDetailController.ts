import * as React from "react"

import { useEventDetail } from "../../../hooks/api/useEventDetail"
import { useEventItems } from "../../../hooks/api/useEventItems"
import { useEventStatuses } from "../../../hooks/api/useEventStatuses"
import { useNav } from "../../../navigation"
import type { EventDetailTab } from "../interfaces/EventDetailTab"
import type { IEventDetailTabView } from "../interfaces/IEventDetailTabView"
import type { IEventDetailViewProps } from "../interfaces/IEventDetailViewProps"
import type { IEventItemSectionView } from "../interfaces/IEventItemSectionView"

export function useEventDetailController(eventId: number): IEventDetailViewProps {
  const navigation = useNav()
  const [selectedTab, setSelectedTab] = React.useState<EventDetailTab>("all")
  const detailQuery = useEventDetail(eventId)
  const itemsQuery = useEventItems(eventId)
  const statusesQuery = useEventStatuses()
  const items = React.useMemo(() => itemsQuery.data ?? [], [itemsQuery.data])
  const statuses = React.useMemo(
    () => [...(statusesQuery.data ?? [])].sort((left, right) => left.order - right.order),
    [statusesQuery.data]
  )
  const currentStatus = statuses.find((status) => status.id === detailQuery.data?.statusId)

  const itemFilters = React.useMemo(
    () => ({
      all: items,
      added: currentStatus ? items.filter((item) => item.statusId === currentStatus.id) : [],
      grouped: items.filter((item) => item.packageId !== null),
      production: items.filter((item) => item.isNewProductionItem),
      broken: items.filter((item) => item.brokenQty > 0),
    }),
    [currentStatus, items]
  )

  const tabs = React.useMemo<IEventDetailTabView[]>(() => {
    const options: IEventDetailTabView[] = [
      { key: "all", label: "All", count: itemFilters.all.length },
      { key: "added", label: "Added New", count: itemFilters.added.length },
      { key: "grouped", label: "Grouped", count: itemFilters.grouped.length },
      {
        key: "production",
        label: "Production",
        count: itemFilters.production.length,
      },
      { key: "broken", label: "Broken", count: itemFilters.broken.length },
    ]
    return options.filter((tab) => tab.key === "all" || tab.count > 0 || tab.key === selectedTab)
  }, [itemFilters, selectedTab])

  const sections = React.useMemo<IEventItemSectionView[]>(() => {
    const grouped = new Map<string, typeof items>()
    for (const item of itemFilters[selectedTab]) {
      grouped.set(item.areaName, [...(grouped.get(item.areaName) ?? []), item])
    }
    return [...grouped.entries()].map(([areaName, sectionItems]) => ({
      areaName,
      items: sectionItems,
      totalQty: sectionItems.reduce((total, item) => total + item.qty, 0),
    }))
  }, [itemFilters, selectedTab])

  const scanMode = resolveScanMode(currentStatus?.action)
  const scannedItems = scanMode ? items.filter((item) => (scanMode === "in" ? item.scanIn : item.scanOut)).length : 0

  const refresh = React.useCallback(() => {
    Promise.all([detailQuery.refetch(), itemsQuery.refetch(), statusesQuery.refetch()]).catch(() => undefined)
  }, [detailQuery, itemsQuery, statusesQuery])

  return {
    event: detailQuery.data,
    currentStatus,
    statuses,
    selectedTab,
    tabs,
    sections,
    totalItems: items.length,
    scannedItems,
    scanMode,
    isLoading: detailQuery.isPending || itemsQuery.isPending || statusesQuery.isPending,
    isRefreshing: detailQuery.isRefetching || itemsQuery.isRefetching || statusesQuery.isRefetching,
    errorMessage: detailQuery.error?.message || itemsQuery.error?.message || statusesQuery.error?.message,
    onBack: navigation.goBack,
    onRefresh: refresh,
    onRetry: refresh,
    onTabChange: setSelectedTab,
  }
}

function resolveScanMode(action?: string): "in" | "out" | null {
  const normalized = action?.trim().toUpperCase().replace(/\s+/g, "_")
  if (normalized === "SCAN_IN") return "in"
  if (normalized === "SCAN_OUT") return "out"
  return null
}
