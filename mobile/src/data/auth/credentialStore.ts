import AsyncStorage from "@react-native-async-storage/async-storage"

import { env } from "../../config/env"
import type { IAuthenticatedSession } from "../../entities/interfaces/auth/IAuthenticatedSession"
import type { IPersistedSession } from "../../entities/interfaces/auth/IPersistedSession"

export const AUTH_STORAGE_KEY = "emi:auth:v1"

function parseCurrentSession(value: unknown): IAuthenticatedSession | undefined {
  if (!value || typeof value !== "object") return undefined

  const stored = value as Partial<IPersistedSession>
  const credential = stored.credential
  const profile = stored.profile

  if (
    stored.version !== 2 ||
    stored.environment !== env.apiBaseUrl ||
    !credential ||
    credential.userId <= 0 ||
    typeof credential.token !== "string" ||
    !credential.token ||
    !profile ||
    profile.id !== credential.userId ||
    typeof profile.fullname !== "string" ||
    typeof profile.email !== "string" ||
    typeof profile.userType !== "string"
  ) {
    return undefined
  }

  return { credential, profile }
}

function parseLegacySession(value: unknown): IAuthenticatedSession | undefined {
  if (!value || typeof value !== "object") return undefined

  const legacy = value as Record<string, unknown>
  if (
    typeof legacy.id !== "number" ||
    legacy.id <= 0 ||
    typeof legacy.token !== "string" ||
    !legacy.token ||
    typeof legacy.fullname !== "string" ||
    typeof legacy.email !== "string" ||
    typeof legacy.user_type !== "string"
  ) {
    return undefined
  }

  return {
    credential: { userId: legacy.id, token: legacy.token },
    profile: {
      id: legacy.id,
      fullname: legacy.fullname,
      email: legacy.email,
      userType: legacy.user_type,
    },
  }
}

function toPersistedSession(session: IAuthenticatedSession): IPersistedSession {
  return {
    version: 2,
    environment: env.apiBaseUrl,
    credential: session.credential,
    profile: session.profile,
  }
}

export const credentialStore = {
  async read(): Promise<IAuthenticatedSession | undefined> {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return undefined

    try {
      const value: unknown = JSON.parse(raw)
      const current = parseCurrentSession(value)
      if (current) return current

      const legacy = parseLegacySession(value)
      if (legacy) {
        await this.write(legacy)
        return legacy
      }
    } catch {
      // Corrupt and obsolete credentials are removed below.
    }

    await this.clear()
    return undefined
  },

  write(session: IAuthenticatedSession) {
    return AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toPersistedSession(session)))
  },

  clear() {
    return AsyncStorage.removeItem(AUTH_STORAGE_KEY)
  },
}
