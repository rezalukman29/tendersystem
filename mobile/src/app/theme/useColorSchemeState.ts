import { useColorScheme } from "react-native"

import { useAppSelector } from "../../redux/hooks"
import { applyColorScheme, type ColorScheme } from "../../theme"

/**
 * The mode the app shows now: the user's choice, or the phone's when the
 * choice is "system". Reading it also switches the live palette, so any
 * component that calls this renders with the right colours.
 */
export function useResolvedColorScheme(): ColorScheme {
  const preference = useAppSelector((state) => state.appearance.preference)
  const system = useColorScheme()
  const scheme: ColorScheme = preference === "system" ? (system === "dark" ? "dark" : "light") : preference
  applyColorScheme(scheme)
  return scheme
}
