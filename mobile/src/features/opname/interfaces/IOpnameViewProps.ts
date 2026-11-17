import type { IStockOpname } from "../../../entities/interfaces/stock/IStockOpname"
import type { IWarehouse } from "../../../entities/interfaces/stock/IWarehouse"

export interface IOpnameViewProps {
  warehouses: IWarehouse[]
  history: IStockOpname[]
  totalHistoryCount: number
  isWarehousesLoading: boolean
  isHistoryLoading: boolean
  isFetchingNextPage: boolean
  isRefreshing: boolean
  warehousesError?: string
  historyError?: string
  onWarehousePress: (warehouse: IWarehouse) => void
  onHistoryPress: (record: IStockOpname) => void
  onRefresh: () => void
  onRetry: () => void
  onEndReached: () => void
}
