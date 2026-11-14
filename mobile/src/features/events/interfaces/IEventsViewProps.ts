import type { ClosingTab } from "../../../core/rules"
import type { IEventListItemView } from "./IEventListItemView"

export interface IEventsViewProps {
  greetingName: string
  query: string
  selectedTab: ClosingTab
  tabs: readonly ClosingTab[]
  tabCounts: Record<ClosingTab, number>
  events: IEventListItemView[]
  isInitialLoading: boolean
  isRefreshing: boolean
  isFetchingNextPage: boolean
  errorMessage?: string
  onQueryChange: (value: string) => void
  onTabChange: (tab: ClosingTab) => void
  onEventPress: (eventId: number) => void
  onRefresh: () => void
  onRetry: () => void
  onEndReached: () => void
}
