import { configureStore } from "@reduxjs/toolkit"

import profileReducer from "./profileSlice"
import sessionReducer from "./sessionSlice"
import userPlanReducer from "./userPlanSlice"

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    session: sessionReducer,
    userPlan: userPlanReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
