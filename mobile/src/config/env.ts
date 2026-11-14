import Config from "react-native-config"

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

export const env = {
  apiBaseUrl: trimTrailingSlash(Config.API_BASE_URL?.trim() || "https://booqable-staging.emi.web.id"),
  requestTimeoutMs: Number(Config.API_TIMEOUT_MS ?? 30_000),
}
