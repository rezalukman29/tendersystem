import type { IEventDetail } from "../../../entities/interfaces/events/IEventDetail"
import type { IEventStatus } from "../../../entities/interfaces/events/IEventStatus"
import type { EventDetailTab } from "./EventDetailTab"
import type { IEventDetailTabView } from "./IEventDetailTabView"
import type { IEventItemSectionView } from "./IEventItemSectionView"

export interface IEventDetailViewProps {
  event?: IEventDetail
  currentStatus?: IEventStatus
  statuses: IEventStatus[]
  selectedTab: EventDetailTab
  tabs: IEventDetailTabView[]
  sections: IEventItemSectionView[]
  totalItems: number
  scannedItems: number
  scanMode: "in" | "out" | null
  isLoading: boolean
  isRefreshing: boolean
  errorMessage?: string
  onBack: () => void
  onRefresh: () => void
  onRetry: () => void
  onTabChange: (tab: EventDetailTab) => void
}
