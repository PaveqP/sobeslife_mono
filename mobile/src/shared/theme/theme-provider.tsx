import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { Appearance, type ColorSchemeName } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { darkTheme, lightTheme, type AppTheme } from './tokens'
import { themeStorage, type PersistedTheme } from '../lib/storage'

type ThemeContextValue = {
  theme: AppTheme
  mode: PersistedTheme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const getInitialMode = (colorScheme: ColorSchemeName): PersistedTheme =>
  colorScheme === 'dark' ? 'dark' : 'light'

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [mode, setMode] = useState<PersistedTheme>(getInitialMode(Appearance.getColorScheme()))

  useEffect(() => {
    let isMounted = true

    themeStorage.getTheme().then((storedTheme) => {
      if (storedTheme && isMounted) {
        setMode(storedTheme)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const currentTheme = mode === 'dark' ? darkTheme : lightTheme
    void SystemUI.setBackgroundColorAsync(currentTheme.colors.page)
    void themeStorage.setTheme(mode)
  }, [mode])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: mode === 'dark' ? darkTheme : lightTheme,
      mode,
      toggleTheme: () => setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  )

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
