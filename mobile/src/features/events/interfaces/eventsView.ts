import type { ClosingTab } from "../../../core/rules"
import type { EventView } from "../../../selectors"

export interface EventsViewProps {
  greetingName: string
  query: string
  selectedTab: ClosingTab
  tabs: readonly ClosingTab[]
  tabCounts: Record<ClosingTab, number>
  events: EventView[]
  onQueryChange: (value: string) => void
  onTabChange: (tab: ClosingTab) => void
  onEventPress: (eventKey: string) => void
}
