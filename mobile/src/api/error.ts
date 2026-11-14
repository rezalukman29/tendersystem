import axios from "axios"

export class ApiError extends Error {
  readonly status?: number
  readonly code?: number | string
  readonly details?: unknown

  constructor(
    error: unknown,
    options: { status?: number; code?: number | string; details?: unknown } = {}
  ) {
    const normalized = error instanceof ApiError ? error : normalizeUnknownApiError(error)

    super(normalized.message)
    this.name = "ApiError"
    this.status = options.status ?? normalized.status
    this.code = options.code ?? normalized.code
    this.details = options.details ?? normalized.details
  }
}

type NormalizedApiError = {
  message: string
  status?: number
  code?: number | string
  details?: unknown
}

function normalizeUnknownApiError(error: unknown): NormalizedApiError {
  if (typeof error === "string") return { message: error }

  if (axios.isAxiosError(error)) {
    const body = error.response?.data as
      | { message?: string; code?: number | string }
      | undefined

    return {
      message: body?.message ?? error.message ?? "Request failed",
      status: error.response?.status,
      code: body?.code ?? error.code,
      details: body,
    }
  }

  return {
    message: error instanceof Error ? error.message : "Something went wrong",
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  return new ApiError(error)
}
