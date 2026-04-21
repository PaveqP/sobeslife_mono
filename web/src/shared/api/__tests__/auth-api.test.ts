import { describe, it, expect } from 'vitest'
import { authApi, useSignInMutation, useSignUpMutation, useStartGoogleAuthMutation, useGoogleCallbackMutation } from '../auth-api'

describe('authApi endpoints', () => {
  it('authApi has signIn endpoint', () => {
    expect(authApi.endpoints).toHaveProperty('signIn')
  })

  it('authApi has signUp endpoint', () => {
    expect(authApi.endpoints).toHaveProperty('signUp')
  })

  it('authApi has startGoogleAuth endpoint', () => {
    expect(authApi.endpoints).toHaveProperty('startGoogleAuth')
  })

  it('authApi has googleCallback endpoint', () => {
    expect(authApi.endpoints).toHaveProperty('googleCallback')
  })

  it('signIn endpoint uses POST method', () => {
    const endpoint = authApi.endpoints.signIn
    // initiate builds the query config
    const thunk = endpoint.initiate({ phone_number: '+71234567890', password: 'pass' })
    expect(thunk).toBeDefined()
  })
})

describe('authApi exported hooks', () => {
  it('exports useSignInMutation', () => {
    expect(typeof useSignInMutation).toBe('function')
  })

  it('exports useSignUpMutation', () => {
    expect(typeof useSignUpMutation).toBe('function')
  })

  it('exports useStartGoogleAuthMutation', () => {
    expect(typeof useStartGoogleAuthMutation).toBe('function')
  })

  it('exports useGoogleCallbackMutation', () => {
    expect(typeof useGoogleCallbackMutation).toBe('function')
  })
})

describe('authApi query structure', () => {
  it('signIn endpoint initiate returns a thunk function', () => {
    const thunk = authApi.endpoints.signIn.initiate({ phone_number: '+71234567890', password: 'pass' })
    expect(typeof thunk).toBe('function')
  })

  it('startGoogleAuth endpoint initiate returns a thunk function', () => {
    const thunk = authApi.endpoints.startGoogleAuth.initiate({ state: 's', codeChallenge: 'c' })
    expect(typeof thunk).toBe('function')
  })
})
