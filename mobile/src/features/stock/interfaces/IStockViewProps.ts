import type { IStockListItemView } from "./IStockListItemView"
import type { IStockWarehouseOptionView } from "./IStockWarehouseOptionView"

export interface IStockViewProps {
  totalItems: number
  safeCount: number
  criticalCount: number
  warningCount: number
  overdueRentalCount: number
  query: string
  onlyLow: boolean
  selectedWarehouseId?: number
  warehouses: IStockWarehouseOptionView[]
  items: IStockListItemView[]
  isInitialLoading: boolean
  isRefreshing: boolean
  isFetchingNextPage: boolean
  errorMessage?: string
  onQueryChange: (value: string) => void
  onOnlyLowToggle: () => void
  onWarehouseChange: (warehouseId?: number) => void
  onItemPress: (itemName: string) => void
  onRentalsPress: () => void
  onRefresh: () => void
  onRetry: () => void
  onEndReached: () => void
}
