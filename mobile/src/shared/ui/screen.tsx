import type { ReactNode } from 'react'
import { ScrollView, View, StyleSheet, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../theme/theme-provider'

export const Screen = ({
  children,
  scroll = true,
  contentContainerStyle,
  ...props
}: ScrollViewProps & {
  children: ReactNode
  scroll?: boolean
  contentContainerStyle?: StyleProp<ViewStyle>
}) => {
  const { theme } = useTheme()

  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.page }]}>
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.page }]}>
      <ScrollView
        {...props}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    flexGrow: 1,
  },
})
