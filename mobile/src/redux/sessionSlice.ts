import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type SessionEndReason =
  | "missingCredential"
  | "invalidCredential"
  | "authenticationFailed"
  | "logout"

export type SessionState =
  | { status: "bootstrapping" }
  | { status: "unauthenticated"; reason?: SessionEndReason }
  | { status: "authenticating"; method: "password" }
  | { status: "authenticated"; subjectId: string }
  | { status: "refreshing"; subjectId: string }
  | { status: "expired"; reason: SessionEndReason }
  | { status: "signingOut"; subjectId?: string }

const initialState: SessionState = { status: "bootstrapping" }

const sessionSlice = createSlice({
  name: "session",
  initialState: initialState as SessionState,
  reducers: {
    authenticationStarted() {
      return { status: "authenticating", method: "password" } as const
    },
    authenticationSucceeded(_, action: PayloadAction<string>) {
      return { status: "authenticated", subjectId: action.payload } as const
    },
    authenticationFailed() {
      return {
        status: "unauthenticated",
        reason: "authenticationFailed",
      } as const
    },
    bootstrapAuthenticated(_, action: PayloadAction<string>) {
      return { status: "authenticated", subjectId: action.payload } as const
    },
    bootstrapUnauthenticated(_, action: PayloadAction<SessionEndReason>) {
      return { status: "unauthenticated", reason: action.payload } as const
    },
    signOutStarted(state) {
      return {
        status: "signingOut",
        subjectId:
          state.status === "authenticated" || state.status === "refreshing"
            ? state.subjectId
            : undefined,
      } as const
    },
    signedOut() {
      return { status: "unauthenticated", reason: "logout" } as const
    },
  },
})

export const {
  authenticationFailed,
  authenticationStarted,
  authenticationSucceeded,
  bootstrapAuthenticated,
  bootstrapUnauthenticated,
  signOutStarted,
  signedOut,
} = sessionSlice.actions

export default sessionSlice.reducer
