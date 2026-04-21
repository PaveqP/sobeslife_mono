import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { tokenStorage } from '@/shared/lib/storage'

type AuthState = {
  accessToken: string | null
}

const initialState: AuthState = {
  accessToken: tokenStorage.getAccessToken(),
}

const authSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken
      tokenStorage.setToken(action.payload.accessToken)
    },
    clearCredentials: (state) => {
      state.accessToken = null
      tokenStorage.clear()
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export const authReducer = authSlice.reducer
