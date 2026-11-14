import axios from "axios"

import { env } from "../config/env"
import { getActiveCredential } from "../data/auth/activeCredential"
import { normalizeApiError } from "./error"

const PUBLIC_ENDPOINTS = new Set(["POST /v1/login-emi"])

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.requestTimeoutMs,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase() ?? "GET"
  const path = config.url?.split("?")[0] ?? ""
  const isPublic = PUBLIC_ENDPOINTS.has(`${method} ${path}`)
  const credential = getActiveCredential()

  if (!isPublic && credential) {
    config.headers = config.headers ?? {}
    config.headers["User-Id"] = String(credential.userId)
    config.headers["User-Token"] = credential.token
  } else {
    delete config.headers?.["User-Id"]
    delete config.headers?.["User-Token"]
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error))
)
