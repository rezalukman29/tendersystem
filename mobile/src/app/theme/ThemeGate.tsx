import * as React from "react"
import { StatusBar } from "react-native"

import { appearanceStore } from "../../data/appearance/appearanceStore"
import { appearanceLoaded } from "../../redux/appearanceSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { color } from "../../theme"
import { useResolvedColorScheme } from "./useColorSchemeState"

/** Reads the saved theme before the first screen draws, so there is no light flash in dark mode. */
export function ThemeGate({ children }: React.PropsWithChildren) {
  const dispatch = useAppDispatch()
  const loaded = useAppSelector((state) => state.appearance.loaded)
  const scheme = useResolvedColorScheme()

  React.useEffect(() => {
    if (loaded) return
    let cancelled = false
    appearanceStore.read().then((preference) => {
      if (!cancelled) dispatch(appearanceLoaded(preference))
    })
    return () => {
      cancelled = true
    }
  }, [dispatch, loaded])

  if (!loaded) return null

  return (
    <>
      <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} backgroundColor={color.ground} />
      {children}
    </>
  )
}
