import * as React from "react"

import { useInfiniteWarehouseInventory } from "../../../hooks/api/useInfiniteWarehouseInventory"
import { useInfiniteRentalItems } from "../../../hooks/api/rentals/useInfiniteRentalItems"
import { useWarehouseInventorySummary } from "../../../hooks/api/useWarehouseInventorySummary"
import { useWarehouses } from "../../../hooks/api/useWarehouses"
import { useNav } from "../../../navigation"
import type { IStockListItemView } from "../interfaces/IStockListItemView"
import type { IStockViewProps } from "../interfaces/IStockViewProps"

const STOCK_PAGE_SIZE = 20
const RENTAL_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 350

export function useStockController(): IStockViewProps {
  const navigation = useNav()
  const [query, setQuery] = React.useState("")
  const [onlyLow, setOnlyLow] = React.useState(false)
  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState<number | undefined>()
  const deferredQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS)
  const rentalItemsQuery = useInfiniteRentalItems("loan", RENTAL_PAGE_SIZE, true)

  const commonQuery = React.useMemo(
    () => ({
      limit: STOCK_PAGE_SIZE,
      search: deferredQuery || undefined,
      warehouseId: selectedWarehouseId,
      sort: "ASC" as const,
      sortBy: "nama_barang",
    }),
    [deferredQuery, selectedWarehouseId]
  )

  const allQuery = useInfiniteWarehouseInventory(commonQuery, { enabled: !onlyLow })
  const warningQuery = useInfiniteWarehouseInventory({ ...commonQuery, status: "WARNING" }, { enabled: onlyLow })
  const criticalQuery = useInfiniteWarehouseInventory({ ...commonQuery, status: "CRITICAL" }, { enabled: onlyLow })
  const summaryQuery = useWarehouseInventorySummary()
  const warehousesQuery = useWarehouses()

  const items = React.useMemo(() => {
    const uniqueItems = new Map<number, IStockListItemView>()
    const pages = onlyLow ? [...(criticalQuery.data?.pages ?? []), ...(warningQuery.data?.pages ?? [])] : allQuery.data?.pages ?? []

    for (const page of pages) {
      for (const item of page.items) {
        uniqueItems.set(item.id, {
          id: item.id,
          name: item.name,
          code: item.code,
          warehouseName: item.warehouseName,
          stock: item.itemStock,
          unit: item.unit,
          status: item.status,
        })
      }
    }
    return [...uniqueItems.values()].sort(compareStockItems)
  }, [allQuery.data?.pages, criticalQuery.data?.pages, onlyLow, warningQuery.data?.pages])

  const warehouses = React.useMemo(
    () =>
      (warehousesQuery.data ?? []).map((warehouse) => ({
        id: warehouse.id,
        label: warehouse.name.replace(/^Gudang\s+/i, ""),
      })),
    [warehousesQuery.data]
  )
  const overdueRentalCount = rentalItemsQuery.data?.pages[0]?.summary.overdue ?? 0

  const isInitialLoading = onlyLow
    ? (criticalQuery.isPending || warningQuery.isPending) && items.length === 0
    : allQuery.isPending && items.length === 0
  const isRefreshing = onlyLow
    ? (criticalQuery.isRefetching || warningQuery.isRefetching) && !criticalQuery.isFetchingNextPage && !warningQuery.isFetchingNextPage
    : allQuery.isRefetching && !allQuery.isFetchingNextPage
  const isFetchingNextPage = onlyLow ? criticalQuery.isFetchingNextPage || warningQuery.isFetchingNextPage : allQuery.isFetchingNextPage
  const listError = onlyLow ? criticalQuery.error ?? warningQuery.error : allQuery.error

  const onEndReached = React.useCallback(() => {
    if (onlyLow) {
      if (criticalQuery.hasNextPage && !criticalQuery.isFetchingNextPage) {
        criticalQuery.fetchNextPage().catch(() => undefined)
      }
      if (warningQuery.hasNextPage && !warningQuery.isFetchingNextPage) {
        warningQuery.fetchNextPage().catch(() => undefined)
      }
      return
    }
    if (allQuery.hasNextPage && !allQuery.isFetchingNextPage) {
      allQuery.fetchNextPage().catch(() => undefined)
    }
  }, [allQuery, criticalQuery, onlyLow, warningQuery])

  const refetchActiveList = React.useCallback(() => {
    if (onlyLow) {
      return Promise.all([criticalQuery.refetch(), warningQuery.refetch()])
    }
    return Promise.all([allQuery.refetch()])
  }, [allQuery, criticalQuery, onlyLow, warningQuery])

  const onRefresh = React.useCallback(() => {
    Promise.all([refetchActiveList(), summaryQuery.refetch(), warehousesQuery.refetch()]).catch(() => undefined)
  }, [refetchActiveList, summaryQuery, warehousesQuery])

  const onRetry = React.useCallback(() => {
    Promise.all([refetchActiveList(), summaryQuery.refetch()]).catch(() => undefined)
  }, [refetchActiveList, summaryQuery])

  const onItemPress = React.useCallback((itemName: string) => navigation.navigate("ItemDetail", { name: itemName }), [navigation])

  const onRentalsPress = React.useCallback(() => navigation.navigate("Rentals"), [navigation])

  return {
    totalItems: summaryQuery.data?.totalItems ?? 0,
    safeCount: summaryQuery.data?.safe ?? 0,
    criticalCount: summaryQuery.data?.critical ?? 0,
    warningCount: summaryQuery.data?.warning ?? 0,
    overdueRentalCount,
    query,
    onlyLow,
    selectedWarehouseId,
    warehouses,
    items,
    isInitialLoading,
    isRefreshing,
    isFetchingNextPage,
    errorMessage: listError?.message,
    onQueryChange: setQuery,
    onOnlyLowToggle: () => setOnlyLow((current) => !current),
    onWarehouseChange: setSelectedWarehouseId,
    onItemPress,
    onRentalsPress,
    onRefresh,
    onRetry,
    onEndReached,
  }
}

function compareStockItems(a: IStockListItemView, b: IStockListItemView): number {
  const rank = { CRITICAL: 0, WARNING: 1, SAFE: 2, NOT_SET: 3 }
  return rank[a.status] - rank[b.status] || a.name.localeCompare(b.name)
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timeout)
  }, [delay, value])

  return debouncedValue
}
