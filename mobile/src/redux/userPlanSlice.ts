import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { IUserPlan } from "../entities/interfaces/userPlan/IUserPlan"

export interface UserPlanState {
  data: IUserPlan | null
  isLoading: boolean
  error: string | null
}

const initialState: UserPlanState = {
  data: null,
  isLoading: false,
  error: null,
}

const userPlanSlice = createSlice({
  name: "userPlan",
  initialState,
  reducers: {
    setUserPlan(state, action: PayloadAction<IUserPlan>) {
      state.data = action.payload
      state.isLoading = false
      state.error = null
    },
    setUserPlanLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
      if (action.payload) state.error = null
    },
    setUserPlanError(state, action: PayloadAction<string>) {
      state.isLoading = false
      state.error = action.payload
    },
    clearUserPlan() {
      return initialState
    },
  },
})

export const {
  clearUserPlan,
  setUserPlan,
  setUserPlanError,
  setUserPlanLoading,
} = userPlanSlice.actions

export default userPlanSlice.reducer
