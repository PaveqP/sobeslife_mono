import { describe, it, expect, vi } from 'vitest'

vi.mock('@/shared/lib/storage', () => ({
  tokenStorage: {
    getAccessToken: vi.fn(() => null),
    setToken: vi.fn(),
    clear: vi.fn(),
  },
}))

import { authReducer, setCredentials, clearCredentials } from '../auth-slice'

describe('authSlice', () => {
  it('has null accessToken as initial state', () => {
    const state = authReducer(undefined, { type: '@@INIT' })
    expect(state.accessToken).toBeNull()
  })

  it('sets accessToken on setCredentials', () => {
    const state = authReducer(undefined, setCredentials({ accessToken: 'tok-abc' }))
    expect(state.accessToken).toBe('tok-abc')
  })

  it('clears accessToken on clearCredentials', () => {
    const populated = authReducer(undefined, setCredentials({ accessToken: 'tok-abc' }))
    const cleared = authReducer(populated, clearCredentials())
    expect(cleared.accessToken).toBeNull()
  })
})
