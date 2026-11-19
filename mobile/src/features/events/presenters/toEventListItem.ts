import type { ClosingTab, ScanMode } from "../../../core/rules"
import type { IEvent } from "../../../entities/interfaces/events/IEvent"
import type { IEventStatus } from "../../../entities/interfaces/events/IEventStatus"
import type { IEventListItemView } from "../interfaces/IEventListItemView"

export function toEventListItem(
  event: IEvent,
  tab: ClosingTab,
  statuses: ReadonlyMap<number, IEventStatus>
): IEventListItemView {
  const status = statuses.get(event.statusId)
  const scanMode = scanModeFromAction(status?.action)

  return {
    id: event.id,
    code: event.code,
    name: event.name,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location,
    tab,
    stageName: status?.name || "Status unavailable",
    scanMode,
    scannedItems: scanMode === "in" ? event.scanInTotal : scanMode === "out" ? event.scanOutTotal : 0,
    totalItems: event.totalItems,
  }
}

function scanModeFromAction(action?: string): ScanMode | null {
  if (action === "SCAN_IN") return "in"
  if (action === "SCAN_OUT") return "out"
  return null
}
