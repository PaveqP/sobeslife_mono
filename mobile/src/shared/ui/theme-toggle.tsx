import { Ionicons } from '@expo/vector-icons'
import { Pressable, Text, StyleSheet } from 'react-native'
import { useTheme } from '../theme/theme-provider'

export const ThemeToggle = () => {
  const { mode, theme, toggleTheme } = useTheme()

  return (
    <Pressable
      onPress={toggleTheme}
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.surfaceSubtle,
          borderColor: theme.colors.borderSubtle,
        },
      ]}
    >
      <Ionicons
        name={mode === 'light' ? 'moon-outline' : 'sunny-outline'}
        size={16}
        color={theme.colors.textPrimary}
      />
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        {mode === 'light' ? 'Dark' : 'Light'}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
})
