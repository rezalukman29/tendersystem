import { useMutation } from "@tanstack/react-query"
import * as React from "react"

import { ApiError } from "../../../data/ApiError"
import authServices from "../../../data/services/auth.services"
import type { IAuthenticatedSession } from "../../../entities/interfaces/auth/IAuthenticatedSession"
import type { ILoginCredentials } from "../../../entities/interfaces/auth/ILoginCredentials"
import type { IProfile } from "../../../entities/interfaces/auth/IProfile"

export function useLogin(
  onAuthenticated: (session: IAuthenticatedSession) => Promise<void>
) {
  const credentialsRef = React.useRef<ILoginCredentials>()
  const mutation = useMutation<IProfile, ApiError, void>({
    gcTime: 0,
    mutationFn: async () => {
      const credentials = credentialsRef.current
      if (!credentials) throw new ApiError("Login credentials are unavailable")

      const session = await authServices.login(credentials)
      await onAuthenticated(session)
      return session.profile
    },
  })

  const mutateAsync = React.useCallback(
    async (credentials: ILoginCredentials) => {
      if (credentialsRef.current) {
        throw new ApiError("Login is already in progress")
      }

      credentialsRef.current = credentials
      try {
        return await mutation.mutateAsync()
      } finally {
        credentialsRef.current = undefined
      }
    },
    [mutation]
  )

  return { ...mutation, mutateAsync }
}
