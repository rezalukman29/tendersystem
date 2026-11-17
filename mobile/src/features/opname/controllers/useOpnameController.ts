import * as React from "react"

import type { IStockOpname } from "../../../entities/interfaces/stock/IStockOpname"
import type { IWarehouse } from "../../../entities/interfaces/stock/IWarehouse"
import { useInfiniteStockOpnameHistory } from "../../../hooks/api/stock/useInfiniteStockOpnameHistory"
import { useWarehouses } from "../../../hooks/api/useWarehouses"
import { useNav } from "../../../navigation"
import type { IOpnameViewProps } from "../interfaces/IOpnameViewProps"

const OPNAME_PAGE_SIZE = 20

export function useOpnameController(): IOpnameViewProps {
  const navigation = useNav()
  const warehousesQuery = useWarehouses()
  const historyQuery = useInfiniteStockOpnameHistory(OPNAME_PAGE_SIZE)
  const history = React.useMemo(() => {
    const records = new Map<number, IStockOpname>()
    for (const page of historyQuery.data?.pages ?? []) {
      for (const record of page.items) records.set(record.id, record)
    }
    return [...records.values()]
  }, [historyQuery.data?.pages])

  const onWarehousePress = React.useCallback(
    (warehouse: IWarehouse) =>
      navigation.navigate("OpnameCount", { warehouse: warehouse.name, warehouseId: warehouse.id }),
    [navigation]
  )
  const onHistoryPress = React.useCallback(
    (record: IStockOpname) => navigation.navigate("OpnameDetail", { id: record.id, opname: record }),
    [navigation]
  )
  const onRefresh = React.useCallback(() => {
    Promise.all([warehousesQuery.refetch(), historyQuery.refetch()]).catch(() => undefined)
  }, [historyQuery, warehousesQuery])
  const onRetry = React.useCallback(() => {
    Promise.all([warehousesQuery.refetch(), historyQuery.refetch()]).catch(() => undefined)
  }, [historyQuery, warehousesQuery])
  const onEndReached = React.useCallback(() => {
    if (historyQuery.hasNextPage && !historyQuery.isFetchingNextPage) {
      historyQuery.fetchNextPage().catch(() => undefined)
    }
  }, [historyQuery])

  return {
    warehouses: warehousesQuery.data ?? [],
    history,
    totalHistoryCount: historyQuery.data?.pages[0]?.totalRecords ?? 0,
    isWarehousesLoading: warehousesQuery.isPending,
    isHistoryLoading: historyQuery.isPending,
    isFetchingNextPage: historyQuery.isFetchingNextPage,
    isRefreshing: (warehousesQuery.isRefetching || historyQuery.isRefetching) && !historyQuery.isFetchingNextPage,
    warehousesError: warehousesQuery.error?.message,
    historyError: historyQuery.error?.message,
    onWarehousePress,
    onHistoryPress,
    onRefresh,
    onRetry,
    onEndReached,
  }
}
