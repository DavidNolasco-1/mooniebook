import { useState } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { CustomInput } from '@/components/form'
import { theme } from '@/styles/theme'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      router.replace('/(app)/dashboard')
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={theme.gradient.colors}
      start={theme.gradient.start}
      end={theme.gradient.end}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>MoonieBook</Text>
          <Text style={styles.subtitle}>Biblioteca Académica UACM</Text>

          <View style={styles.form}>
            <CustomInput
              label="Correo electrónico"
              iconName="email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="correo@ejemplo.com"
            />

            <CustomInput
              label="Contraseña"
              iconName="lock"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textEditable} />
              ) : (
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    color: theme.colors.textEditable,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.labelText,
    fontSize: theme.fontSize.label,
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  error: {
    color: theme.colors.statusAtrasado,
    fontSize: theme.fontSize.label,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: -4,
  },
  button: {
    backgroundColor: theme.colors.buttonSecondary,
    borderRadius: theme.borderRadius.small,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.textEditable,
    fontSize: theme.fontSize.button,
    fontWeight: 'bold',
  },
})
