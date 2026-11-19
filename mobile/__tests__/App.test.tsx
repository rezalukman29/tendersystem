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
import { appearanceLoaded } from "../src/redux/appearanceSlice"
import { store } from "../src/redux/store"
import { APPEARANCE_STORAGE_KEY } from "../src/data/appearance/appearanceStore"
import { color } from "../src/theme"
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
  jest.spyOn(apiClient, "get").mockImplementation((url, config) => {
    if (url === "/v1/user/plan") {
      return Promise.resolve({ data: USER_PLAN_RESPONSE } as never)
    }

    if (url === "/v1/event-status/get-all") {
      return Promise.resolve({
        data: {
          success: true,
          message: "event statuses",
          data: {
            page: 1,
            total_pages: 1,
            total_records: 1,
            prev: 1,
            next: 1,
            record_per_page: 1,
            data: [
              {
                id: 2,
                name: "Finish setup",
                action: "",
                order_data: 2,
                active_event: 1,
              },
            ],
          },
        },
      } as never)
    }

    if (url === "/v1/event/4") {
      return Promise.resolve({
        data: {
          success: true,
          message: "event detail",
          data: {
            id: 4,
            description: "Garden reception",
            name: "Engagement Rina & Bayu",
            event_start: "2026-05-17",
            event_end: "2026-05-18",
            PIC: "Anto",
            event_code: "ERB",
            is_complete: 0,
            is_finished: 0,
            status: 2,
            images: "",
            address: "Surabaya",
            type: "Wedding",
            notes: "Handle with care",
            date_event: "2026-05-17",
          },
        },
      } as never)
    }

    if (url === "/v1/gudang") {
      return Promise.resolve({
        data: {
          success: true,
          message: "get all gudang",
          data: {
            page: 1,
            total_pages: 1,
            total_records: 1,
            record_per_page: 1000,
            data: [{ id: 2, nama: "Warehouse 70", lokasi: "Bali" }],
          },
        },
      } as never)
    }

    if (url === "/v1/barang-gudang/detail") {
      return Promise.resolve({
        data: {
          success: true,
          message: "get warehouse inventory",
          data: {
            page: 1,
            total_pages: 1,
            total_records: 2,
            record_per_page: 99999,
            data: [
              {
                barang_gudang_id: 68,
                gudang_id: 2,
                barang_id: 12,
                stok_gudang: 20,
                kode_gudang: "WH-68",
                stok_minimum: 1,
                nama_barang: "Table candle holder",
                stok_barang: 20,
                nama_satuan: "pcs",
                gudang_name: "Warehouse 70",
                stock_used: 0,
                valuation: "10000",
                status: "SAFE",
                kode_barang: "ITEM-68",
                gudang: { gudang_id: 2, gudang_name: "Warehouse 70" },
              },
              {
                barang_gudang_id: 69,
                gudang_id: 2,
                barang_id: 13,
                stok_gudang: 5,
                kode_gudang: "WH-69",
                stok_minimum: 1,
                nama_barang: "Napkin ring",
                stok_barang: 5,
                nama_satuan: "pcs",
                gudang_name: "Warehouse 70",
                stock_used: 0,
                valuation: "5000",
                status: "SAFE",
                kode_barang: "ITEM-69",
                gudang: { gudang_id: 2, gudang_name: "Warehouse 70" },
              },
            ],
          },
        },
      } as never)
    }

    if (url === "/v1/stock-opname") {
      return Promise.resolve({
        data: {
          success: true,
          message: "get stock opname",
          data: {
            page: 1,
            total_pages: 1,
            total_records: 1,
            record_per_page: 20,
            data: [
              {
                id: 25,
                period: "Nov 2026",
                remark: "Monthly check",
                flag: "done",
                created_at: "2026-11-17 11:16:41",
                userId: 8,
                data: [
                  {
                    id: 68,
                    stock_new: 19,
                    stock_old: 20,
                    comparison: "95%",
                    condition: "POOR",
                    notes: "",
                    barang: {
                      nama: "Table candle holder",
                      gudang_id: 2,
                      gudang_name: "Warehouse 70",
                      photo: "",
                    },
                  },
                ],
              },
            ],
          },
        },
      } as never)
    }

    if (url === "/v3/fix-list-item-event") {
      return Promise.resolve({
        data: {
          success: true,
          message: "list item event",
          data: [
            {
              id: 401,
              scan_out: 0,
              scan_in: 0,
              qty: 2,
              notes: "",
              event_id: 4,
              barang_id: 2201,
              nama_barang: "Tiffany Chair",
              code: "TC01",
              satuan: "pcs",
              area_name: "CEREMONY",
              event_status_id: 2,
              sub_list_name: "AISLE",
              pic: "Anto",
              ownerships: { ihc: true, ihp: false, outsource: false },
              package: null,
              is_new_production_item: false,
              is_converted: false,
              converted_qty: 0,
              broken_item: null,
            },
          ],
        },
      } as never)
    }

    const params = config?.params as { status?: string; limit?: number } | undefined
    const status = params?.status
    const events =
      status === "on-going"
        ? [
            {
              id: 4,
              name: "Engagement Rina & Bayu",
              event_code: "ERB",
              event_start: "2026-05-17",
              event_end: "2026-05-17",
              date_event: "2026-05-17",
              address: "Surabaya",
              status: 2,
              lifecycle_status: "on-going",
              total_items: 9,
            },
          ]
        : []

    return Promise.resolve({
      data: {
        success: true,
        message: "events",
        data: {
          page: 1,
          total_pages: 1,
          total_records: events.length,
          prev: 1,
          next: 1,
          record_per_page: params?.limit ?? 20,
          data: events,
        },
      },
    } as never)
  })
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

async function flushAsyncWork(cycles = 1) {
  for (let cycle = 0; cycle < cycles; cycle += 1) {
    await ReactTestRenderer.act(async () => {
      jest.runOnlyPendingTimers()
      await Promise.resolve()
      await Promise.resolve()
    })
  }
}

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
    jest.runOnlyPendingTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })
  await flushAsyncWork(5)

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
  expect(await AsyncStorage.getItem(AUTH_STORAGE_KEY)).toBe(JSON.stringify(STORED_SESSION))
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
  ["EventDetail", { eventKey: "4" }, "Engagement Rina & Bayu"],
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
  await flushAsyncWork(3)
  expect(text()).toContain(expected)
})

test("loads event detail and event items from the backend", async () => {
  await renderApp()
  await ReactTestRenderer.act(async () => {
    navigationRef.navigate("EventDetail", { eventKey: "4" })
    jest.runOnlyPendingTimers()
  })
  await flushAsyncWork(3)

  expect(text()).toContain("Tiffany Chair")
  expect(text()).toContain("CEREMONY")
  expect(apiClient.get).toHaveBeenCalledWith("/v1/event/4", expect.objectContaining({ signal: expect.anything() }))
  expect(apiClient.get).toHaveBeenCalledWith(
    "/v3/fix-list-item-event",
    expect.objectContaining({
      params: { event_id: 4, order: "asc" },
      signal: expect.anything(),
    })
  )
})

const tabs = [
  ["ScanPicker", "At a scan stage"],
  ["Stock", "Total items"],
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

test("loads warehouse options and opname history from the API", async () => {
  await renderApp()
  await ReactTestRenderer.act(async () => {
    navigationRef.navigate("Tabs", { screen: "Opname" })
    jest.runOnlyPendingTimers()
  })
  await flushAsyncWork(4)

  expect(text()).toContain("Warehouse 70")
  expect(text()).toContain("Bali")
  expect(text()).toContain("0 rows")
  expect(text()).toContain("#25")
  expect(text()).toContain("Approved")
  expect(text()).toContain("Rp0")
  expect(apiClient.get).toHaveBeenCalledWith(
    "/v1/gudang",
    expect.objectContaining({ params: { page: 1, limit: 1000 }, signal: expect.anything() })
  )
  expect(apiClient.get).toHaveBeenCalledWith(
    "/v1/stock-opname",
    expect.objectContaining({ params: { page: 1, limit: 20 }, signal: expect.anything() })
  )
})

test("counts warehouse inventory and submits only the changed rows", async () => {
  await renderApp()
  await ReactTestRenderer.act(async () => {
    navigationRef.navigate("Tabs", { screen: "Opname" })
    jest.runOnlyPendingTimers()
  })
  await flushAsyncWork(4)

  await ReactTestRenderer.act(async () => {
    const warehouse = tree.root.find(
      (node) => node.props.accessibilityLabel === "Count items in Warehouse 70"
    )
    warehouse.props.onPress()
    jest.runOnlyPendingTimers()
  })
  await flushAsyncWork(4)

  expect(text()).toContain("Table candle holder")
  expect(text()).toContain("System")
  expect(apiClient.get).toHaveBeenCalledWith(
    "/v1/barang-gudang/detail",
    expect.objectContaining({
      params: {
        page: 1,
        limit: 99999,
        gudang_id: 2,
        sort: "ASC",
        sort_by: "name",
      },
      signal: expect.anything(),
    })
  )

  const post = jest.spyOn(apiClient, "post").mockResolvedValueOnce({
    data: { success: true, message: "created stock opname", data: { id: 76 } },
  } as never)

  await ReactTestRenderer.act(async () => {
    const increment = tree.root.find(
      (node) => node.props.accessibilityLabel === "More Actual Table candle holder"
    )
    increment.props.onPress()
  })
  await ReactTestRenderer.act(async () => {
    const submit = tree.root.find(
      (node) => node.props.accessibilityLabel === "Submit" && node.props.onPress
    )
    submit.props.onPress()
  })
  await ReactTestRenderer.act(async () => {
    tree.root.find((node) => node.props.accessibilityLabel === "Period").props.onChangeText("Nov 2026")
    tree.root.find((node) => node.props.accessibilityLabel === "Remark").props.onChangeText("Monthly count")
  })
  await ReactTestRenderer.act(async () => {
    tree.root.find((node) => node.props.accessibilityLabel === "Submit for approval").props.onPress()
    jest.runOnlyPendingTimers()
  })
  await flushAsyncWork(8)

  expect(post).toHaveBeenCalledWith("/v1/stock-opname", {
    period: "Nov 2026",
    remark: "Monthly count",
    data: [{ condition: "GOOD", id: 68, notes: "", stok: 21 }],
  })
  expect(text()).toContain("History · 1")
  expect(
    (apiClient.get as jest.Mock).mock.calls.filter(
      ([url, config]) => url === "/v1/stock-opname" && config?.params?.limit === 20
    ).length
  ).toBeGreaterThan(1)
})

/** The segment of a Segmented control whose label is `label`. */
const segment = (label: string) =>
  tree.root.findAll(
    (n) =>
      n.props.accessibilityRole === "radio" &&
      typeof n.props.onPress === "function" &&
      n.findAll((c) => c.children.includes(label)).length > 0
  )[0]

test("switches between light and dark from Profile and stays on Profile", async () => {
  await renderApp()
  await ReactTestRenderer.act(async () => {
    navigationRef.navigate("Tabs", { screen: "Profile" })
    jest.runOnlyPendingTimers()
  })
  expect(text()).toContain("Appearance")
  expect(color.ground).toBe("#f6f8fb")

  try {
    await ReactTestRenderer.act(async () => {
      segment("Dark").props.onPress()
      jest.runOnlyPendingTimers()
    })
    await flushAsyncWork(2)

    expect(store.getState().appearance.preference).toBe("dark")
    expect(color.ground).toBe("#0b0d12")
    expect(await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe("dark")
    // The screens were redrawn, but the user is still on Profile.
    expect(text()).toContain("Appearance")
    expect(navigationRef.getCurrentRoute()?.name).toBe("Profile")

    await ReactTestRenderer.act(async () => {
      segment("Light").props.onPress()
      jest.runOnlyPendingTimers()
    })
    await flushAsyncWork(2)
    expect(color.ground).toBe("#f6f8fb")
    expect(await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe("light")
  } finally {
    ReactTestRenderer.act(() => {
      store.dispatch(appearanceLoaded("light"))
    })
  }
})
