import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { MoonStar, SunMedium } from 'lucide-react'
import { themeStorage, type PersistedTheme } from '@/shared/lib/storage'
import { cn } from '@/shared/lib/cn'

type ThemeContextValue = {
  theme: PersistedTheme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const getInitialTheme = (): PersistedTheme => {
  const persisted = themeStorage.getTheme()
  if (persisted) return persisted
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<PersistedTheme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    themeStorage.setTheme(theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-xl border border-border-subtle bg-surface-subtle px-3 text-sm font-medium text-text-primary transition hover:bg-surface-hover',
        className,
      )}
    >
      {theme === 'light' ? <MoonStar className="size-4" /> : <SunMedium className="size-4" />}
      <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
