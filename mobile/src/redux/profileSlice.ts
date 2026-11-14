import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { IProfile } from "../entities/interfaces/auth/IProfile"

const initialState: IProfile = {
  id: 0,
  fullname: "",
  email: "",
  userType: "",
}

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<IProfile>) {
      return { ...state, ...action.payload }
    },
    clearProfile() {
      return initialState
    },
  },
})

export const { clearProfile, setProfile } = profileSlice.actions

export default profileSlice.reducer
