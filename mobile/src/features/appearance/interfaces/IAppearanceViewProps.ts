import type { ThemePreference } from "../../../theme"

export interface IAppearanceViewProps {
  preference: ThemePreference
  options: { value: ThemePreference; label: string }[]
  hint: string
  onPreferenceChange: (preference: ThemePreference) => void
}
