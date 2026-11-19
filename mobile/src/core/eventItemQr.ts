export type EventItemScanType = "IN" | "OUT"

export interface EventItemQrPayload {
  itemId: number
  type: EventItemScanType
}

export function parseEventItemQr(value: string): EventItemQrPayload | null {
  const [prefix, rawId, rawType, ...extra] = value.trim().split("/")
  const itemId = Number(rawId)
  const type = rawType?.toUpperCase()

  if (
    prefix !== "event_item" ||
    extra.length > 0 ||
    !rawId ||
    !Number.isInteger(itemId) ||
    itemId <= 0 ||
    (type !== "IN" && type !== "OUT")
  ) {
    return null
  }

  return { itemId, type }
}
