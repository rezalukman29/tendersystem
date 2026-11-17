import type { IRentalListItemView } from "./IRentalListItemView"
import type { IRentalRecord, RentalKind } from "../../../entities/interfaces/rentals/IRentalRecord"

export type RentalFilter = "all" | "open" | "Requested" | "Received" | "Overdue" | "Done"

export interface IRentalsViewProps {
  kind: RentalKind
  filter: RentalFilter
  counts: Record<RentalFilter, number>
  items: IRentalListItemView[]
  totalCount: number
  openCost?: number
  isInitialLoading: boolean
  isRefreshing: boolean
  isFetchingNextPage: boolean
  isActing: boolean
  errorMessage?: string
  onBack: () => void
  onKindChange: (kind: RentalKind) => void
  onFilterChange: (filter: RentalFilter) => void
  onRefresh: () => void
  onRetry: () => void
  onEndReached: () => void
  onMarkReceived: (record: IRentalRecord) => void
  onMarkDone: (record: IRentalRecord) => void
}
