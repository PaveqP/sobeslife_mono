import { Picker } from '@react-native-picker/picker'
import { Text, TextInput, View, StyleSheet, type TextInputProps, type ViewStyle, type StyleProp } from 'react-native'
import { useTheme } from '../theme/theme-provider'

type FieldBaseProps = {
  label: string
  hint?: string
  error?: string
  containerStyle?: StyleProp<ViewStyle>
}

export const AppTextInput = ({
  label,
  hint,
  error,
  containerStyle,
  ...props
}: FieldBaseProps & TextInputProps) => {
  const { theme } = useTheme()

  return (
    <View style={containerStyle}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.textTertiary}
        style={[
          styles.input,
          {
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.borderSubtle,
          },
        ]}
        {...props}
      />
      {error ? <Text style={[styles.caption, { color: theme.colors.danger }]}>{error}</Text> : null}
      {!error && hint ? <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>{hint}</Text> : null}
    </View>
  )
}

type SelectOption = {
  label: string
  value: string
}

type AppSelectProps = FieldBaseProps & {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  enabled?: boolean
}

export const AppSelect = ({
  label,
  hint,
  error,
  value,
  onValueChange,
  options,
  enabled = true,
  containerStyle,
}: AppSelectProps) => {
  const { theme } = useTheme()

  return (
    <View style={containerStyle}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text>
      <View
        style={[
          styles.selectWrapper,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.borderSubtle,
            opacity: enabled ? 1 : 0.5,
          },
        ]}
      >
        <Picker selectedValue={value} onValueChange={onValueChange} enabled={enabled} style={{ color: theme.colors.textPrimary }}>
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
      {error ? <Text style={[styles.caption, { color: theme.colors.danger }]}>{error}</Text> : null}
      {!error && hint ? <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>{hint}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  caption: {
    fontSize: 12,
    marginTop: 6,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  selectWrapper: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
})
