import { QueryClientProvider } from "@tanstack/react-query"
import * as React from "react"
import { Provider as ReduxProvider } from "react-redux"

import { queryClient } from "../api/queryClient"
import { AuthBootstrap } from "../features/auth/AuthBootstrap"
import { store } from "../redux/store"
import { ThemeGate } from "./theme/ThemeGate"

export function AppProviders({ children }: React.PropsWithChildren) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeGate>
          <AuthBootstrap>{children}</AuthBootstrap>
        </ThemeGate>
      </QueryClientProvider>
    </ReduxProvider>
  )
}
