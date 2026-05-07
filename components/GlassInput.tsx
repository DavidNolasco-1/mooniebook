import { View, Text, TextInput, StyleSheet } from 'react-native'
import { theme } from '@/styles/theme'

export type GlassInputProps = {
  label: string
  value: string
  onChangeText?: (t: string) => void
  placeholder?: string
  editable?: boolean
  hint?: string
  keyboardType?: 'default' | 'numeric'
  alert?: boolean
}

export function GlassInput({
  label, value, onChangeText, placeholder,
  editable = true, hint, keyboardType = 'default', alert = false,
}: GlassInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.readOnly, alert && styles.alertInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="rgba(255,255,255,0.28)"
        editable={editable}
        keyboardType={keyboardType}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  label: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.colors.textEditable,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  readOnly: {
    color: theme.colors.textReadOnly,
  },
  alertInput: {
    backgroundColor: 'rgba(239,68,68,0.22)',
    borderColor: 'rgba(239,68,68,0.55)',
    color: theme.colors.textEditable,
  },
  hint: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    paddingHorizontal: 2,
    lineHeight: 14,
  },
})
