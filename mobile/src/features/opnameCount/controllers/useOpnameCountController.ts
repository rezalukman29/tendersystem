import * as React from "react"

import { ApiError } from "../../../data/ApiError"
import type { IWarehouseInventoryPage } from "../../../entities/interfaces/stock/IWarehouseInventoryPage"
import type { IStockOpnameSubmission } from "../../../entities/interfaces/stock/IStockOpnameSubmission"
import type { IWarehouseStockItem } from "../../../entities/interfaces/stock/IWarehouseStockItem"
import { useCreateStockOpname } from "../../../hooks/api/stock/useCreateStockOpname"
import { useInfiniteStockOpnameHistory } from "../../../hooks/api/stock/useInfiniteStockOpnameHistory"
import { useInfiniteWarehouseInventory } from "../../../hooks/api/useInfiniteWarehouseInventory"
import type { RootStackParamList } from "../../../navigation"
import { useNav } from "../../../navigation"
import { useToast } from "../../../ui/toast"
import type { IOpnameCountViewProps } from "../interfaces/IOpnameCountViewProps"

const INVENTORY_LIMIT = 99999
const PENDING_CHECK_LIMIT = 99999

type CountState = { actual: number; condition: "Good" | "Poor"; note: string }

export function useOpnameCountController({
  warehouse,
  warehouseId,
}: RootStackParamList["OpnameCount"]): IOpnameCountViewProps {
  const navigation = useNav()
  const toast = useToast()
  const inventoryQuery = useInfiniteWarehouseInventory(
    { warehouseId, limit: INVENTORY_LIMIT, sort: "ASC", sortBy: "name" },
    { enabled: warehouseId > 0 }
  )
  const pendingQuery = useInfiniteStockOpnameHistory(PENDING_CHECK_LIMIT)
  const createMutation = useCreateStockOpname()
  const inventoryPages = React.useMemo(() => inventoryQuery.data?.pages ?? [], [inventoryQuery.data?.pages])
  const fetchNextInventoryPage = inventoryQuery.fetchNextPage
  const hasNextInventoryPage = inventoryQuery.hasNextPage
  const isFetchingNextInventoryPage = inventoryQuery.isFetchingNextPage
  const refetchInventory = inventoryQuery.refetch
  const refetchPending = pendingQuery.refetch
  const [counts, setCounts] = React.useState<Record<number, CountState>>({})
  const [search, setSearch] = React.useState("")
  const [period, setPeriod] = React.useState("")
  const [remark, setRemark] = React.useState("")
  const [periodError, setPeriodError] = React.useState<string>()
  const [remarkError, setRemarkError] = React.useState<string>()
  const [submitModalVisible, setSubmitModalVisible] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const rows = React.useMemo(() => uniqueItems(inventoryPages), [inventoryPages])
  const totalRows = inventoryQuery.data?.pages[0]?.totalRecords ?? 0
  const changedRows = React.useMemo(
    () =>
      rows.filter((item) => {
        const count = counts[item.id] ?? defaultCount(item)
        return count.actual !== item.warehouseStock || count.condition === "Poor"
      }),
    [counts, rows]
  )
  const pendingOpname = (pendingQuery.data?.pages ?? []).some((page) =>
    page.items.some((record) => record.status === "Pending")
  )
  const pendingCheckReady = !pendingQuery.isFetching && !pendingQuery.error

  const onCountChange = React.useCallback(
    (item: IWarehouseStockItem, patch: Partial<CountState>) => {
      setCounts((current) => ({
        ...current,
        [item.id]: { ...(current[item.id] ?? defaultCount(item)), ...patch },
      }))
    },
    []
  )

  const loadAllInventoryItems = React.useCallback(async () => {
    let pages: IWarehouseInventoryPage[] = inventoryPages
    let lastPage = pages[pages.length - 1]
    while (lastPage && lastPage.page < lastPage.totalPages) {
      const result = await fetchNextInventoryPage({ throwOnError: true })
      pages = result.data?.pages ?? pages
      lastPage = pages[pages.length - 1]
    }
    return uniqueItems(pages)
  }, [fetchNextInventoryPage, inventoryPages])

  const onConfirmSubmit = React.useCallback(async () => {
    const trimmedPeriod = period.trim()
    const trimmedRemark = remark.trim()
    const nextPeriodError = trimmedPeriod ? undefined : "Required"
    const nextRemarkError = trimmedRemark ? undefined : "Required"
    setPeriodError(nextPeriodError)
    setRemarkError(nextRemarkError)
    if (nextPeriodError || nextRemarkError || !pendingCheckReady || pendingOpname) return

    try {
      const allItems = await loadAllInventoryItems()
      const submission: IStockOpnameSubmission = {
        period: trimmedPeriod,
        remark: trimmedRemark,
        items: allItems
          .filter((item) => {
            const count = counts[item.id] ?? defaultCount(item)
            return count.actual !== item.warehouseStock || count.condition === "Poor"
          })
          .map((item) => {
            const count = counts[item.id] ?? defaultCount(item)
            return {
              warehouseItemId: item.id,
              actualStock: count.actual,
              condition: count.condition,
              note: count.note,
            }
          }),
      }

      if (submission.items.length === 0) {
        throw new ApiError("No changed items to submit")
      }

      const id = await createMutation.mutateAsync(submission)
      setSubmitModalVisible(false)
      setIsSubmitted(true)
      toast.show(`Opname #${id} sent for approval`, "success")
      requestAnimationFrame(() => navigation.goBack())
    } catch (error) {
      toast.show(error instanceof Error ? error.message : "Failed to submit stock opname", "error")
    }
  }, [
    counts,
    createMutation,
    loadAllInventoryItems,
    navigation,
    pendingCheckReady,
    pendingOpname,
    period,
    remark,
    toast,
  ])

  const onRefresh = React.useCallback(async () => {
    await Promise.all([refetchInventory(), refetchPending()])
  }, [refetchInventory, refetchPending])

  const onRetry = React.useCallback(() => {
    onRefresh()
  }, [onRefresh])

  const onEndReached = React.useCallback(async () => {
    if (hasNextInventoryPage && !isFetchingNextInventoryPage) {
      await fetchNextInventoryPage()
    }
  }, [fetchNextInventoryPage, hasNextInventoryPage, isFetchingNextInventoryPage])

  const varianceValue = changedRows.reduce((total, item) => {
    const count = counts[item.id] ?? defaultCount(item)
    return total + (count.actual - item.warehouseStock) * item.valuation
  }, 0)
  const normalizedSearch = search.trim().toLowerCase()
  const visibleRows = rows.filter(
    (item) => !normalizedSearch || `${item.name} ${item.code}`.toLowerCase().includes(normalizedSearch)
  )

  return {
    warehouse,
    rows: visibleRows,
    totalRows,
    counts,
    search,
    period,
    remark,
    periodError,
    remarkError,
    inventoryError: inventoryQuery.error?.message,
    pendingCheckError: pendingQuery.error?.message,
    isInventoryLoading: inventoryQuery.isPending,
    isPendingCheckLoading: pendingQuery.isFetching,
    isFetchingNextPage: inventoryQuery.isFetchingNextPage,
    isRefreshing: inventoryQuery.isRefetching || pendingQuery.isRefetching,
    isSubmitting: createMutation.isPending,
    isDirty: changedRows.length > 0,
    isSubmitted,
    pendingOpname,
    submitModalVisible,
    changedCount: changedRows.length,
    varianceValue,
    onBack: () => navigation.goBack(),
    onSearchChange: setSearch,
    onCountChange,
    onPeriodChange: (value) => {
      setPeriod(value)
      setPeriodError(undefined)
    },
    onRemarkChange: (value) => {
      setRemark(value)
      setRemarkError(undefined)
    },
    onOpenSubmit: () => setSubmitModalVisible(true),
    onCloseSubmit: () => {
      if (!createMutation.isPending) setSubmitModalVisible(false)
    },
    onConfirmSubmit,
    onRefresh,
    onRetry,
    onEndReached,
  }
}

function defaultCount(item: IWarehouseStockItem): CountState {
  return { actual: item.warehouseStock, condition: "Good", note: "" }
}

function uniqueItems(pages: IWarehouseInventoryPage[]): IWarehouseStockItem[] {
  const items = new Map<number, IWarehouseStockItem>()
  for (const page of pages) {
    for (const item of page.items) items.set(item.id, item)
  }
  return [...items.values()]
}
