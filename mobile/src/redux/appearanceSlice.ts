import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { ThemePreference } from "../theme"

export interface AppearanceState {
  preference: ThemePreference
  /** False until the saved choice has been read from the phone. */
  loaded: boolean
}

/** Light is the default, so nothing changes for anyone who never opens the setting. */
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "light"

const initialState: AppearanceState = { preference: DEFAULT_THEME_PREFERENCE, loaded: false }

const appearanceSlice = createSlice({
  name: "appearance",
  initialState,
  reducers: {
    appearanceLoaded(_, action: PayloadAction<ThemePreference>) {
      return { preference: action.payload, loaded: true }
    },
    themePreferenceChanged(state, action: PayloadAction<ThemePreference>) {
      state.preference = action.payload
    },
  },
})

export const { appearanceLoaded, themePreferenceChanged } = appearanceSlice.actions

export default appearanceSlice.reducer
