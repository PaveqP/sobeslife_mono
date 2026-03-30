import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { tokenStorage } from '@/shared/lib/storage'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
}

const initialState: AuthState = {
  accessToken: tokenStorage.getAccessToken(),
  refreshToken: tokenStorage.getRefreshToken(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      tokenStorage.setTokens(action.payload.accessToken, action.payload.refreshToken)
    },
    clearCredentials: (state) => {
      state.accessToken = null
      state.refreshToken = null
      tokenStorage.clear()
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export const authReducer = authSlice.reducer
