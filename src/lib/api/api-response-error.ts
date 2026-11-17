import { ApiError } from '@/lib/errors/api-error'

type ApiErrorDetails = {
  code?: string | undefined
  errors?: Record<string, string[]> | undefined
  retryAfterSeconds?: number | undefined
}

// Preserve instanceof ApiError for existing retry and safe-message handling.
export class ApiResponseError extends ApiError {
  readonly code: string | undefined
  readonly errors: Record<string, string[]> | undefined
  readonly retryAfterSeconds: number | undefined

  constructor(status: number, details: ApiErrorDetails = {}) {
    super(status)
    this.code = details.code
    this.errors = details.errors
    this.retryAfterSeconds = details.retryAfterSeconds
  }
}
