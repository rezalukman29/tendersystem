import * as React from "react"

import { useGetUserPlan } from "../../../hooks/api/useGetUserPlan"
import { useAppDispatch } from "../../../redux/hooks"
import {
  clearUserPlan,
  setUserPlan,
  setUserPlanError,
  setUserPlanLoading,
} from "../../../redux/userPlanSlice"

export function useUserPlanController(userId?: number) {
  const dispatch = useAppDispatch()
  const query = useGetUserPlan({
    userId,
    options: { enabled: Boolean(userId) },
  })

  React.useEffect(() => {
    if (!userId) {
      dispatch(clearUserPlan())
      return
    }

    dispatch(setUserPlanLoading(query.isFetching))
  }, [dispatch, query.isFetching, userId])

  React.useEffect(() => {
    if (query.data) dispatch(setUserPlan(query.data))
  }, [dispatch, query.data])

  React.useEffect(() => {
    if (query.error) dispatch(setUserPlanError(query.error.message))
  }, [dispatch, query.error])

  return query
}
