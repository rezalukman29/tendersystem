import type { IEventQuery } from "../../../entities/interfaces/events/IEventQuery"

export const eventsKeys = {
  all: ["events"] as const,
  list: (query: IEventQuery) => [...eventsKeys.all, "list", query] as const,
  statuses: () => [...eventsKeys.all, "statuses"] as const,
  detail: (eventId: number) => [...eventsKeys.all, "detail", eventId] as const,
  items: (eventId: number) => [...eventsKeys.all, "items", eventId] as const,
}
