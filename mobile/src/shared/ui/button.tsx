import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, Text, type StyleProp, StyleSheet, type ViewStyle } from 'react-native'
import { useTheme } from '../theme/theme-provider'

type ButtonProps = {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
  style?: StyleProp<ViewStyle>
}

export const AppButton = ({
  title,
  onPress,
  variant = 'secondary',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) => {
  const { theme } = useTheme()
  const isDisabled = disabled || loading

  const variantStyle = {
    primary: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
      textColor: theme.colors.white,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.borderSubtle,
      textColor: theme.colors.textPrimary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.borderSubtle,
      textColor: theme.colors.textSecondary,
    },
  }[variant]

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed && !isDisabled ? theme.colors.surfaceHover : variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {!loading && icon}
      {loading ? <ActivityIndicator color={variantStyle.textColor} /> : null}
      <Text style={[styles.label, { color: variantStyle.textColor }]}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
})
