import type { IWarehouseStockItem } from "../../../entities/interfaces/stock/IWarehouseStockItem"

export interface IOpnameCountViewProps {
  warehouse: string
  rows: IWarehouseStockItem[]
  totalRows: number
  counts: Record<number, { actual: number; condition: "Good" | "Poor"; note: string }>
  search: string
  period: string
  remark: string
  periodError?: string
  remarkError?: string
  inventoryError?: string
  pendingCheckError?: string
  isInventoryLoading: boolean
  isPendingCheckLoading: boolean
  isFetchingNextPage: boolean
  isRefreshing: boolean
  isSubmitting: boolean
  isDirty: boolean
  isSubmitted: boolean
  pendingOpname: boolean
  submitModalVisible: boolean
  changedCount: number
  varianceValue: number
  onBack: () => void
  onSearchChange: (value: string) => void
  onCountChange: (
    item: IWarehouseStockItem,
    patch: Partial<{ actual: number; condition: "Good" | "Poor"; note: string }>
  ) => void
  onPeriodChange: (value: string) => void
  onRemarkChange: (value: string) => void
  onOpenSubmit: () => void
  onCloseSubmit: () => void
  onConfirmSubmit: () => void
  onRefresh: () => void
  onRetry: () => void
  onEndReached: () => void
}
