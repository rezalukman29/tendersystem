import { useInfiniteQuery } from "@tanstack/react-query"

import { ApiError } from "../../../data/ApiError"
import rentalsServices from "../../../data/services/rentals.services"
import type { IRentalPage } from "../../../entities/interfaces/rentals/IRentalPage"
import type { RentalKind } from "../../../entities/interfaces/rentals/IRentalRecord"
import { rentalsKeys } from "../../../features/rentals/queries/rentalsKeys"

export function useInfiniteRentalItems(kind: RentalKind, limit: number, enabled: boolean) {
  return useInfiniteQuery<IRentalPage, ApiError>({
    queryKey: rentalsKeys.list(kind, limit),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      rentalsServices.getRentalItems(kind, { page: Number(pageParam), limit }, signal),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled,
  })
}
