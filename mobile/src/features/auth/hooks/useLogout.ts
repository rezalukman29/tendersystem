import * as React from "react"

import { sessionCoordinator } from "../../../app/session/sessionCoordinator"
import { useAppDispatch } from "../../../redux/hooks"

export function useLogout() {
  const dispatch = useAppDispatch()

  return React.useCallback(async () => {
    await sessionCoordinator.signOut(dispatch)
  }, [dispatch])
}
