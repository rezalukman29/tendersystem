import type { IEventItem } from "../../../entities/interfaces/events/IEventItem"

export interface IEventItemSectionView {
  areaName: string
  totalQty: number
  items: IEventItem[]
}
