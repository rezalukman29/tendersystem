import type { RentalKind } from "../../../entities/interfaces/rentals/IRentalRecord"

export const rentalsKeys = {
  all: ["rentals"] as const,
  list: (kind: RentalKind, limit: number) => [...rentalsKeys.all, "list", kind, limit] as const,
}
