import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { ApiError } from "../../data/ApiError"
import userPlanServices from "../../data/services/userPlan.services"
import type { IUserPlan } from "../../entities/interfaces/userPlan/IUserPlan"
import { userPlanKeys } from "../../features/userPlan/queries/userPlanKeys"

type UserPlanQueryOptions = Omit<
  UseQueryOptions<IUserPlan, ApiError>,
  "queryKey" | "queryFn"
>

export function useGetUserPlan({
  userId,
  options,
}: {
  userId?: number
  options?: UserPlanQueryOptions
} = {}) {
  return useQuery<IUserPlan, ApiError>({
    queryKey: userPlanKeys.detail(userId ?? 0),
    queryFn: () => userPlanServices.getUserPlan(),
    enabled: Boolean(userId),
    ...options,
  })
}
