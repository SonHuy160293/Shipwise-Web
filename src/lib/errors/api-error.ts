export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message = 'The request could not be completed.') {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError)
    return error.status === 401
      ? 'Please sign in to continue.'
      : error.status === 403
        ? 'You do not have access to this resource.'
        : error.status === 404
          ? 'The requested resource was not found.'
          : 'The service is unavailable. Please try again.'
  return 'Something went wrong. Please try again.'
}
