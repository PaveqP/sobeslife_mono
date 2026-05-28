import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const fetchError = error as FetchBaseQueryError
  if ('data' in fetchError && fetchError.data) {
    const data = fetchError.data
    if (typeof data === 'string' && data.trim()) {
      return data
    }
    if (typeof data === 'object' && data !== null) {
      const record = data as Record<string, unknown>
      if (typeof record.error === 'string' && record.error.trim()) {
        return record.error
      }
      if (typeof record.message === 'string' && record.message.trim()) {
        return record.message
      }
    }
  }

  if ('error' in fetchError && typeof fetchError.error === 'string' && fetchError.error.trim()) {
    return fetchError.error
  }

  return fallback
}
