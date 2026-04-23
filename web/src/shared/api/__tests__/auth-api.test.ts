import { describe, it, expect } from 'vitest'
import { authApi, useStartGoogleAuthMutation, useGoogleCallbackMutation, useSendOTPMutation, useVerifyOTPMutation, useStartGithubAuthMutation, useGithubCallbackMutation } from '../auth-api'

describe('authApi endpoints', () => {
  it('authApi has sendOTP endpoint', () => {
    expect(authApi.endpoints).toHaveProperty('sendOTP')
  })

  it('authApi has verifyOTP endpoint', () => {
    expect(authApi.endpoints).toHaveProperty('verifyOTP')
  })

  it('authApi has startGoogleAuth endpoint', () => {
    expect(authApi.endpoints).toHaveProperty('startGoogleAuth')
  })

  it('authApi has googleCallback endpoint', () => {
    expect(authApi.endpoints).toHaveProperty('googleCallback')
  })

  it('authApi has startGithubAuth endpoint', () => {
    expect(authApi.endpoints).toHaveProperty('startGithubAuth')
  })

  it('authApi has githubCallback endpoint', () => {
    expect(authApi.endpoints).toHaveProperty('githubCallback')
  })
})

describe('authApi exported hooks', () => {
  it('exports useSendOTPMutation', () => {
    expect(typeof useSendOTPMutation).toBe('function')
  })

  it('exports useVerifyOTPMutation', () => {
    expect(typeof useVerifyOTPMutation).toBe('function')
  })

  it('exports useStartGoogleAuthMutation', () => {
    expect(typeof useStartGoogleAuthMutation).toBe('function')
  })

  it('exports useGoogleCallbackMutation', () => {
    expect(typeof useGoogleCallbackMutation).toBe('function')
  })

  it('exports useStartGithubAuthMutation', () => {
    expect(typeof useStartGithubAuthMutation).toBe('function')
  })

  it('exports useGithubCallbackMutation', () => {
    expect(typeof useGithubCallbackMutation).toBe('function')
  })
})

describe('authApi query structure', () => {
  it('sendOTP endpoint initiate returns a thunk function', () => {
    const thunk = authApi.endpoints.sendOTP.initiate({ email: 'test@example.com' })
    expect(typeof thunk).toBe('function')
  })

  it('startGoogleAuth endpoint initiate returns a thunk function', () => {
    const thunk = authApi.endpoints.startGoogleAuth.initiate({ state: 's', codeChallenge: 'c' })
    expect(typeof thunk).toBe('function')
  })
})
