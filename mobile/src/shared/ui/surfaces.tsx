import type { ReactNode } from 'react'
import { ActivityIndicator, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '../theme/theme-provider'

export const Card = ({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}) => {
  const { theme } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSubtle,
          shadowColor: theme.colors.overlay,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export const Badge = ({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: 'neutral' | 'accent' | 'success' | 'danger'
}) => {
  const { theme } = useTheme()
  const palette = {
    neutral: { backgroundColor: theme.colors.surfaceSubtle, color: theme.colors.textSecondary },
    accent: { backgroundColor: theme.colors.accentSoft, color: theme.colors.accent },
    success: { backgroundColor: theme.colors.successSoft, color: theme.colors.success },
    danger: { backgroundColor: theme.colors.dangerSoft, color: theme.colors.danger },
  }[tone]

  return (
    <View style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.badgeLabel, { color: palette.color }]}>{label}</Text>
    </View>
  )
}

export const EmptyState = ({ title, description }: { title: string; description: string }) => {
  const { theme } = useTheme()

  return (
    <Card style={styles.empty}>
      <Badge label="Sobeslife" tone="accent" />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>{description}</Text>
    </Card>
  )
}

export const Skeleton = ({ height = 18 }: { height?: number }) => {
  const { theme } = useTheme()

  return <View style={[styles.skeleton, { height, backgroundColor: theme.colors.surfaceSubtle }]} />
}

export const FullScreenLoader = () => {
  const { theme } = useTheme()

  return (
    <View style={styles.loader}>
      <ActivityIndicator color={theme.colors.accent} size="large" />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  skeleton: {
    width: '100%',
    borderRadius: 12,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
