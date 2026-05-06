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
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>MoonieBook</Text>
          <Text style={styles.subtitle}>Biblioteca Académica UACM</Text>

        <View style={{ width: '100%' }}></View>
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
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, 
  },
  card: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.large,
    padding: 40,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
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
    marginBottom: 32,
  },
  error: {
    color: theme.colors.statusAtrasado,
    fontSize: theme.fontSize.label,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: -4,
    alignSelf: 'stretch',
  },
  button: {
    width: '100%',
    backgroundColor: theme.colors.buttonSecondary,
    borderRadius: theme.borderRadius.small,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    alignSelf: 'stretch',
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