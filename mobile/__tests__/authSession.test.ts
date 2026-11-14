import AsyncStorage from "@react-native-async-storage/async-storage"
import type { AxiosAdapter, AxiosResponse } from "axios"

import { apiClient } from "../src/api/client"
import { env } from "../src/config/env"
import {
  getActiveCredential,
  setActiveCredential,
} from "../src/data/auth/activeCredential"
import {
  AUTH_STORAGE_KEY,
  credentialStore,
} from "../src/data/auth/credentialStore"

const PROFILE = {
  id: 17,
  fullname: "Mobile Test User",
  email: "mobile.test@example.invalid",
  userType: "STAFF",
}

const CREDENTIAL = { userId: PROFILE.id, token: "fixture-access-token" }

beforeEach(async () => {
  setActiveCredential(undefined)
  await AsyncStorage.clear()
})

afterEach(() => {
  setActiveCredential(undefined)
})

test("restores a valid environment-scoped session", async () => {
  await credentialStore.write({ credential: CREDENTIAL, profile: PROFILE })

  await expect(credentialStore.read()).resolves.toEqual({
    credential: CREDENTIAL,
    profile: PROFILE,
  })
})

test("migrates the previous login record into the versioned session", async () => {
  await AsyncStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      id: PROFILE.id,
      fullname: PROFILE.fullname,
      email: PROFILE.email,
      user_type: PROFILE.userType,
      token: CREDENTIAL.token,
    })
  )

  await expect(credentialStore.read()).resolves.toEqual({
    credential: CREDENTIAL,
    profile: PROFILE,
  })
  await expect(AsyncStorage.getItem(AUTH_STORAGE_KEY)).resolves.toBe(
    JSON.stringify({
      version: 2,
      environment: env.apiBaseUrl,
      credential: CREDENTIAL,
      profile: PROFILE,
    })
  )
})

test("removes corrupt or environment-mismatched credentials", async () => {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, "not-json")
  await expect(credentialStore.read()).resolves.toBeUndefined()
  await expect(AsyncStorage.getItem(AUTH_STORAGE_KEY)).resolves.toBeNull()

  await AsyncStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      version: 2,
      environment: "https://different-environment.invalid",
      credential: CREDENTIAL,
      profile: PROFILE,
    })
  )
  await expect(credentialStore.read()).resolves.toBeUndefined()
  await expect(AsyncStorage.getItem(AUTH_STORAGE_KEY)).resolves.toBeNull()
})

test("adds credentials only to protected API requests", async () => {
  setActiveCredential(CREDENTIAL)
  const seenHeaders: Array<Record<string, unknown>> = []
  const adapter: AxiosAdapter = async (config) => {
    seenHeaders.push(config.headers?.toJSON() ?? {})
    return {
      config,
      data: {},
      headers: {},
      status: 200,
      statusText: "OK",
    } as AxiosResponse
  }

  await apiClient.get("/v1/events", { adapter })
  await apiClient.post("/v1/login-emi", {}, { adapter })

  expect(seenHeaders[0]).toMatchObject({
    "User-Id": String(CREDENTIAL.userId),
    "User-Token": CREDENTIAL.token,
  })
  expect(seenHeaders[1]).not.toHaveProperty("User-Id")
  expect(seenHeaders[1]).not.toHaveProperty("User-Token")
  expect(getActiveCredential()).toEqual(CREDENTIAL)
})
