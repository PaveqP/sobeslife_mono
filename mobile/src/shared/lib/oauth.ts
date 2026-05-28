import * as Crypto from 'expo-crypto'
import { oauthSessionStorage } from './storage'

const toBase64Url = (bytes: Uint8Array) => {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const generateRandomString = async (byteLength: number) => {
  const bytes = await Crypto.getRandomBytesAsync(byteLength)
  return toBase64Url(bytes)
}

const createCodeChallenge = async (codeVerifier: string) => {
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, codeVerifier, {
    encoding: Crypto.CryptoEncoding.BASE64,
  })
  return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export const prepareGoogleOauthSession = async () => {
  const state = await generateRandomString(24)
  const codeVerifier = await generateRandomString(64)
  const codeChallenge = await createCodeChallenge(codeVerifier)

  await oauthSessionStorage.setGoogleSession(state, codeVerifier)

  return { state, codeChallenge }
}

export const getStoredGoogleOauthState = () => oauthSessionStorage.getGoogleState()

export const getStoredGoogleCodeVerifier = () => oauthSessionStorage.getGoogleCodeVerifier()

export const clearGoogleOauthSession = () => oauthSessionStorage.clearGoogleSession()
