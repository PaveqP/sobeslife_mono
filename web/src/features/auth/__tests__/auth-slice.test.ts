import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { authReducer, setCredentials, clearCredentials } from '../auth-slice'

// Mock storage module
vi.mock('@/shared/lib/storage', () => ({
  tokenStorage: {
    getAccessToken: () => null,
    getRefreshToken: () => null,
    setTokens: vi.fn(),
    clear: vi.fn(),
  },
}))

const makeStore = () =>
  configureStore({ reducer: { auth: authReducer } })

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has null tokens in initial state', () => {
    const store = makeStore()
    expect(store.getState().auth.accessToken).toBeNull()
    expect(store.getState().auth.refreshToken).toBeNull()
  })

  it('setCredentials stores tokens in state', () => {
    const store = makeStore()
    store.dispatch(setCredentials({ accessToken: 'access123', refreshToken: 'refresh456' }))
    expect(store.getState().auth.accessToken).toBe('access123')
    expect(store.getState().auth.refreshToken).toBe('refresh456')
  })

  it('clearCredentials nullifies tokens', () => {
    const store = makeStore()
    store.dispatch(setCredentials({ accessToken: 'a', refreshToken: 'b' }))
    store.dispatch(clearCredentials())
    expect(store.getState().auth.accessToken).toBeNull()
    expect(store.getState().auth.refreshToken).toBeNull()
  })
})
