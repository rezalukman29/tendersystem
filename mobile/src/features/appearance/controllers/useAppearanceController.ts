import * as React from "react"
import { useColorScheme } from "react-native"

import { appearanceStore } from "../../../data/appearance/appearanceStore"
import { themePreferenceChanged } from "../../../redux/appearanceSlice"
import { useAppDispatch, useAppSelector } from "../../../redux/hooks"
import type { ThemePreference } from "../../../theme"
import { useToast } from "../../../ui/toast"
import type { IAppearanceViewProps } from "../interfaces/IAppearanceViewProps"

const OPTIONS: IAppearanceViewProps["options"] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

export function useAppearanceController(): IAppearanceViewProps {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const preference = useAppSelector((state) => state.appearance.preference)
  const system = useColorScheme() === "dark" ? "dark" : "light"

  const onPreferenceChange = React.useCallback(
    (next: ThemePreference) => {
      if (next === preference) return
      dispatch(themePreferenceChanged(next))
      appearanceStore.write(next).catch(() => toast.show("Couldn't save the theme on this phone.", "error"))
    },
    [dispatch, preference, toast]
  )

  return {
    preference,
    options: OPTIONS,
    hint: preference === "system" ? `Follows your phone (now ${system}).` : "Applies to this phone only.",
    onPreferenceChange,
  }
}
