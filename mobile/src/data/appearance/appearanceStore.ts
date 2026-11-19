import AsyncStorage from "@react-native-async-storage/async-storage"

import { DEFAULT_THEME_PREFERENCE } from "../../redux/appearanceSlice"
import type { ThemePreference } from "../../theme"

export const APPEARANCE_STORAGE_KEY = "emi:appearance:v1"

const PREFERENCES: readonly ThemePreference[] = ["system", "light", "dark"]

const isPreference = (value: unknown): value is ThemePreference =>
  typeof value === "string" && (PREFERENCES as readonly string[]).includes(value)

/** The theme choice is kept on the phone, per device, and survives sign out. */
export const appearanceStore = {
  async read(): Promise<ThemePreference> {
    try {
      const raw = await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY)
      return isPreference(raw) ? raw : DEFAULT_THEME_PREFERENCE
    } catch {
      return DEFAULT_THEME_PREFERENCE
    }
  },

  write(preference: ThemePreference) {
    return AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, preference)
  },
}
