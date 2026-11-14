import { queryClient } from "../../api/queryClient"
import { setActiveCredential } from "../../data/auth/activeCredential"
import { credentialStore } from "../../data/auth/credentialStore"
import userPlanServices from "../../data/services/userPlan.services"
import type { IAuthenticatedSession } from "../../entities/interfaces/auth/IAuthenticatedSession"
import { userPlanKeys } from "../../features/userPlan/queries/userPlanKeys"
import { clearProfile, setProfile } from "../../redux/profileSlice"
import {
  authenticationSucceeded,
  bootstrapAuthenticated,
  bootstrapUnauthenticated,
  signedOut,
  signOutStarted,
} from "../../redux/sessionSlice"
import type { AppDispatch } from "../../redux/store"
import {
  clearUserPlan,
  setUserPlan,
  setUserPlanError,
  setUserPlanLoading,
} from "../../redux/userPlanSlice"

let signOutTask: Promise<void> | undefined

async function clearIdentity(dispatch: AppDispatch) {
  setActiveCredential(undefined)
  queryClient.clear()
  dispatch(clearProfile())
  dispatch(clearUserPlan())
}

async function loadUserPlan(userId: number, dispatch: AppDispatch) {
  dispatch(setUserPlanLoading(true))

  try {
    const userPlan = await queryClient.fetchQuery({
      queryKey: userPlanKeys.detail(userId),
      queryFn: () => userPlanServices.getUserPlan(),
      retry: 0,
      staleTime: 0,
    })
    dispatch(setUserPlan(userPlan))
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get user plan"
    dispatch(setUserPlanError(message))
  }
}

export const sessionCoordinator = {
  async restore(dispatch: AppDispatch) {
    try {
      const session = await credentialStore.read()
      if (!session) {
        await clearIdentity(dispatch)
        dispatch(bootstrapUnauthenticated("missingCredential"))
        return
      }

      setActiveCredential(session.credential)
      dispatch(setProfile(session.profile))
      await loadUserPlan(session.profile.id, dispatch)
      dispatch(bootstrapAuthenticated(String(session.profile.id)))
    } catch {
      await clearIdentity(dispatch)
      dispatch(bootstrapUnauthenticated("invalidCredential"))
    }
  },

  async establish(session: IAuthenticatedSession, dispatch: AppDispatch) {
    await queryClient.cancelQueries()
    queryClient.removeQueries()
    dispatch(clearUserPlan())

    try {
      await credentialStore.write(session)
      setActiveCredential(session.credential)
      dispatch(setProfile(session.profile))
      await loadUserPlan(session.profile.id, dispatch)
      dispatch(authenticationSucceeded(String(session.profile.id)))
    } catch (error) {
      await credentialStore.clear().catch(() => undefined)
      await clearIdentity(dispatch)
      throw error
    }
  },

  signOut(dispatch: AppDispatch) {
    if (signOutTask) return signOutTask

    signOutTask = (async () => {
      dispatch(signOutStarted())
      setActiveCredential(undefined)

      try {
        await queryClient.cancelQueries()
        // Local termination must still complete if the device storage adapter
        // cannot remove its record. The in-memory credential is already blocked.
        await credentialStore.clear().catch(() => undefined)
      } finally {
        await clearIdentity(dispatch)
        dispatch(signedOut())
        signOutTask = undefined
      }
    })()

    return signOutTask
  },
}
