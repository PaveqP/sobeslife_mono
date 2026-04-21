import { describe, it, expect, beforeEach } from 'vitest'
import { tokenStorage, themeStorage } from '../storage'

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no access token is stored', () => {
    expect(tokenStorage.getAccessToken()).toBeNull()
  })

  it('returns null when no refresh token is stored', () => {
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it('stores and retrieves access token', () => {
    tokenStorage.setTokens('access-abc', 'refresh-xyz')
    expect(tokenStorage.getAccessToken()).toBe('access-abc')
  })

  it('stores and retrieves refresh token', () => {
    tokenStorage.setTokens('access-abc', 'refresh-xyz')
    expect(tokenStorage.getRefreshToken()).toBe('refresh-xyz')
  })

  it('clears both tokens', () => {
    tokenStorage.setTokens('access-abc', 'refresh-xyz')
    tokenStorage.clear()
    expect(tokenStorage.getAccessToken()).toBeNull()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it('overwrites existing tokens on setTokens', () => {
    tokenStorage.setTokens('old-access', 'old-refresh')
    tokenStorage.setTokens('new-access', 'new-refresh')
    expect(tokenStorage.getAccessToken()).toBe('new-access')
    expect(tokenStorage.getRefreshToken()).toBe('new-refresh')
  })
})

describe('themeStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no theme is stored', () => {
    expect(themeStorage.getTheme()).toBeNull()
  })

  it('stores and retrieves light theme', () => {
    themeStorage.setTheme('light')
    expect(themeStorage.getTheme()).toBe('light')
  })

  it('stores and retrieves dark theme', () => {
    themeStorage.setTheme('dark')
    expect(themeStorage.getTheme()).toBe('dark')
  })

  it('returns null for unknown theme value', () => {
    localStorage.setItem('sobeslife.theme', 'blue')
    expect(themeStorage.getTheme()).toBeNull()
  })
})
