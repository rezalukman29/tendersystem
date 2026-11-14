import type { ClosingTab, ScanMode } from "../../../core/rules"

export interface IEventListItemView {
  id: number
  code: string
  name: string
  startDate: string
  endDate: string
  location: string
  tab: ClosingTab
  stageName: string
  scanMode: ScanMode | null
  scannedItems: number
  totalItems: number
}
