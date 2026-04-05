import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppDispatch } from '../../app/store'
import { tokenStorage } from '../../shared/lib/storage'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  hydrated: boolean
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  hydrated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateSession: (state, action: PayloadAction<{ accessToken: string | null; refreshToken: string | null }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.hydrated = true
    },
    setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    clearCredentials: (state) => {
      state.accessToken = null
      state.refreshToken = null
      state.hydrated = true
    },
  },
})

export const { hydrateSession, setCredentials, clearCredentials } = authSlice.actions
export const authReducer = authSlice.reducer

export const bootstrapSession = () => async (dispatch: AppDispatch) => {
  const tokens = await tokenStorage.getTokens()
  dispatch(hydrateSession(tokens))
}

export const persistCredentials =
  (tokens: { accessToken: string; refreshToken: string }) => async (dispatch: AppDispatch) => {
    await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken)
    dispatch(setCredentials(tokens))
  }

export const signOut = () => async (dispatch: AppDispatch) => {
  await tokenStorage.clear()
  dispatch(clearCredentials())
}
