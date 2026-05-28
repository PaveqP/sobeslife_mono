import * as Crypto from 'expo-crypto'
import { oauthSessionStorage } from './storage'

const generateState = async () => {
  const bytes = await Crypto.getRandomBytesAsync(16)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export const prepareGithubOauthSession = async () => {
  const state = await generateState()
  await oauthSessionStorage.setGithubState(state)
  return state
}

export const getStoredGithubOauthState = () => oauthSessionStorage.getGithubState()

export const clearGithubOauthSession = () => oauthSessionStorage.clearGithubState()
