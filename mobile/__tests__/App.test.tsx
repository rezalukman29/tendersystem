import AsyncStorage from "@react-native-async-storage/async-storage"
import * as React from "react"
import ReactTestRenderer from "react-test-renderer"

import App from "../App"
import { apiClient } from "../src/api/client"
import { queryClient } from "../src/api/queryClient"
import { EVENTS, keyOf } from "../src/core/seed"
import { AUTH_STORAGE_KEY } from "../src/data/auth/credentialStore"
import { getActiveCredential, setActiveCredential } from "../src/data/auth/activeCredential"
import { navigationRef, type RootStackParamList } from "../src/navigation"
import { clearProfile } from "../src/redux/profileSlice"
import { bootstrapUnauthenticated } from "../src/redux/sessionSlice"
import { store } from "../src/redux/store"
import { clearUserPlan } from "../src/redux/userPlanSlice"

jest.useFakeTimers()

let tree: ReactTestRenderer.ReactTestRenderer

const PROFILE = {
  id: 2,
  fullname: "Anto",
  email: "anto@emi.id",
  userType: "STAFF",
}

const CREDENTIAL = { userId: PROFILE.id, token: "test-token" }
const STORED_SESSION = {
  version: 2,
  environment: "https://booqable-staging.emi.web.id",
  credential: CREDENTIAL,
  profile: PROFILE,
}

const USER_PLAN_RESPONSE = {
  success: true,
  message: "get user plan",
  data: {
    plan_id: 1,
    plan_name: "Starter",
    storage_limit: 1_000,
    storage_limit_readable: "1 KB",
    price: 0,
    currency: "IDR",
    billing_cycle: "monthly",
    status: "ACTIVE",
    started_at: "2026-01-01",
    expires_at: null,
    storage_used: 100,
    storage_used_readable: "100 B",
    storage_remaining: 900,
    storage_remaining_readable: "900 B",
    usage_percentage: 10,
    event_management_price: 1,
    inventory_management_price: 1,
    warehouse_management_price: 1,
    qr_scanning_price: 1,
    reports_dashboard_price: 1,
    item_loan_price: 1,
    ai_analyzer_price: 1,
  },
}

beforeEach(() => {
  jest.restoreAllMocks()
  queryClient.clear()
  store.dispatch(clearProfile())
  store.dispatch(clearUserPlan())
  store.dispatch(bootstrapUnauthenticated("missingCredential"))
  setActiveCredential(undefined)
  jest.spyOn(apiClient, "get").mockResolvedValue({
    data: USER_PLAN_RESPONSE,
  } as never)
})

afterEach(() => {
  ReactTestRenderer.act(() => {
    tree?.unmount()
  })
})

/** All rendered strings, joined; avoids serialising host props. */
const text = () =>
  tree.root
    .findAll((n) => (n.type as unknown) === "Text")
    .flatMap((n) => n.children.filter((c): c is string => typeof c === "string"))
    .join(" ")

async function renderApp(signIn = true) {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
  if (signIn) {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(STORED_SESSION))
  }

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />)
  })
  await ReactTestRenderer.act(async () => {
    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })
}

const key = (code: string) => keyOf(EVENTS.find((e) => e.code === code)!)

test("starts at sign in, then lands on events", async () => {
  await renderApp(false)
  expect(text()).toContain("Sign in")

  jest.spyOn(apiClient, "post").mockResolvedValueOnce({
    data: {
      success: true,
      message: "login success",
      data: {
        id: PROFILE.id,
        fullname: PROFILE.fullname,
        email: PROFILE.email,
        user_type: PROFILE.userType,
        token: CREDENTIAL.token,
      },
    },
  } as never)

  const email = tree.root.findAll((n) => n.props.accessibilityLabel === "Email" && n.props.onChangeText)[0]
  const password = tree.root.findAll((n) => n.props.accessibilityLabel === "Password" && n.props.onChangeText)[0]
  await ReactTestRenderer.act(async () => {
    email.props.onChangeText(PROFILE.email)
    password.props.onChangeText("Staff@123")
  })

  const signIn = tree.root.findAll((n) => n.props.accessibilityLabel === "Sign in" && n.props.onPress)[0]
  await ReactTestRenderer.act(async () => {
    signIn.props.onPress()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })

  expect(text()).toContain("Events")
  expect(text()).toContain("Engagement Rina & Bayu")
  expect(apiClient.post).toHaveBeenCalledWith("/v1/login-emi", {
    email: PROFILE.email,
    password: "Staff@123",
  })
  expect(apiClient.get).toHaveBeenCalledWith("/v1/user/plan")
  expect(store.getState().userPlan.data).toMatchObject({
    planId: USER_PLAN_RESPONSE.data.plan_id,
    planName: USER_PLAN_RESPONSE.data.plan_name,
  })
  expect(await AsyncStorage.getItem(AUTH_STORAGE_KEY)).toBe(
    JSON.stringify(STORED_SESSION)
  )
  expect(getActiveCredential()).toEqual(CREDENTIAL)
})

test("restores the saved session and removes it on sign out", async () => {
  await renderApp()
  expect(text()).toContain("Events")
  expect(apiClient.get).toHaveBeenCalledWith("/v1/user/plan")
  expect(store.getState().userPlan.data).toMatchObject({
    planId: USER_PLAN_RESPONSE.data.plan_id,
    planName: USER_PLAN_RESPONSE.data.plan_name,
  })

  await ReactTestRenderer.act(async () => {
    navigationRef.navigate("Tabs", { screen: "Profile" })
    jest.runOnlyPendingTimers()
  })

  const signOut = tree.root.findAll((n) => n.props.accessibilityLabel === "Sign out" && n.props.onPress)[0]
  await ReactTestRenderer.act(async () => {
    signOut.props.onPress()
    await Promise.resolve()
    await Promise.resolve()
    jest.runOnlyPendingTimers()
  })

  expect(text()).toContain("Sign in")
  expect(await AsyncStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  expect(store.getState().profile.id).toBe(0)
  expect(store.getState().userPlan.data).toBeNull()
  expect(store.getState().session.status).toBe("unauthenticated")
  expect(getActiveCredential()).toBeUndefined()
})

const routes: [keyof RootStackParamList, object | undefined, string][] = [
  ["EventDetail", { eventKey: key("PPK") }, "Waiting scan in"],
  ["EventDetail", { eventKey: key("HFB") }, "Finalize"],
  ["EventDetail", { eventKey: key("BSA") }, "View only"],
  ["EventDetail", { eventKey: "nope" }, "Not found"],
  ["Scanner", { eventKey: key("PPK") }, "SCAN IN"],
  ["Scanner", { eventKey: key("RSM") }, "SCAN OUT"],
  ["Scanner", { eventKey: key("ERB") }, "doesn't need scanning"],
  ["ItemDetail", { name: "Tiffany Chair" }, "On events"],
  ["ItemDetail", { name: "nope" }, "Not found"],
  ["Rentals", undefined, "Overdue"],
  ["OpnameCount", { warehouse: "Warehouse C9" }, "to report"],
  ["OpnameDetail", { id: 1 }, "Approved"],
]

test.each(routes)("opens %s %j", async (name, params, expected) => {
  await renderApp()
  await ReactTestRenderer.act(async () => {
    navigationRef.navigate(name as never, params as never)
    jest.runOnlyPendingTimers()
  })
  expect(text()).toContain(expected)
})

const tabs = [
  ["ScanPicker", "At a scan stage"],
  ["Stock", "Asset value"],
  ["Opname", "Count a warehouse"],
  ["Profile", "Offline test mode"],
] as const

test.each(tabs)("opens the %s tab", async (tab, expected) => {
  await renderApp()
  await ReactTestRenderer.act(async () => {
    navigationRef.navigate("Tabs", { screen: tab })
    jest.runOnlyPendingTimers()
  })
  expect(text()).toContain(expected)
})
