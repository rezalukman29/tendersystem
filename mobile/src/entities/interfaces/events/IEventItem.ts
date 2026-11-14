export interface IEventItem {
  id: number
  name: string
  code: string
  qty: number
  unit: string
  notes: string
  areaName: string
  subAreaName: string
  pic: string
  photoUrl: string
  warehouseName: string
  statusId: number
  scanIn: boolean
  scanOut: boolean
  ownerships: string[]
  packageId: number | null
  packageName: string
  isNewProductionItem: boolean
  isConverted: boolean
  convertedQty: number
  brokenQty: number
  brokenNotes: string
}
