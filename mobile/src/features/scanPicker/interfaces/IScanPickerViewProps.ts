import type { IEventListItemView } from "../../events/interfaces/IEventListItemView"

export interface IScanPickerViewProps {
  events: IEventListItemView[]
  totalEvents: number
  isLoading: boolean
  isRefreshing: boolean
  isFetchingNextPage: boolean
  errorMessage?: string
  hasScanStatuses: boolean
  onEventPress: (eventId: number) => void
  onRefresh: () => void
  onRetry: () => void
  onEndReached: () => void
}
