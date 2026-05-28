import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { initializeApp, deleteApp } from 'firebase/app'
import { initializeAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CustomInput } from '@/components/form'
import { theme } from '@/styles/theme'

const ADMIN_TOKEN = process.env.EXPO_PUBLIC_ADMIN_TOKEN ?? ''

const FIREBASE_CONFIG = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL:       process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

export default function AdminScreen() {
  const router = useRouter()

  const [fase, setFase] = useState<'token' | 'form'>('token')
  const [token,    setToken]    = useState('')
  const [nombre,   setNombre]   = useState('')
  const [correo,   setCorreo]   = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const verificarToken = () => {
    if (token.trim() !== ADMIN_TOKEN) {
      setError('Token incorrecto.')
      return
    }
    setError('')
    setFase('form')
  }

  const crearBibliotecario = async () => {
    if (!nombre.trim() || !correo.trim() || !password) {
      setError('Todos los campos son obligatorios.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setError('')
    setLoading(true)

    const appSecundaria = initializeApp(FIREBASE_CONFIG, `admin-${Date.now()}`)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getReactNativePersistence } = require('firebase/auth')
    const authSecundario = initializeAuth(appSecundaria, {
      persistence: getReactNativePersistence(AsyncStorage),
    })

    try {
      const { user } = await createUserWithEmailAndPassword(authSecundario, correo.trim(), password)
      await updateProfile(user, { displayName: nombre.trim() })
      await authSecundario.signOut()

      Alert.alert(
        'Bibliotecario registrado',
        `${nombre.trim()} (${correo.trim()}) puede iniciar sesión ahora.`,
        [{ text: 'Aceptar', onPress: () => router.replace('/login') }],
      )
    } catch (e: any) {
      const msg = e?.code === 'auth/email-already-in-use'
        ? 'Ese correo ya está registrado.'
        : e?.code === 'auth/invalid-email'
        ? 'El correo no es válido.'
        : 'No se pudo crear el usuario. Intenta de nuevo.'
      setError(msg)
    } finally {
      await deleteApp(appSecundaria).catch(() => null)
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

          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75}>
              <MaterialIcons name="arrow-back-ios-new" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <View style={styles.titlePill}>
              <MaterialIcons name="admin-panel-settings" size={16} color={theme.colors.titleText} />
              <Text style={styles.titleText}>Panel de Administración</Text>
            </View>
            <View style={{ width: 20 }} />
          </View>

          {fase === 'token' ? (
            <>
              <Text style={styles.label}>
                Ingresa el token de administrador para continuar.
              </Text>

              <CustomInput
                label="Token de acceso"
                iconName="vpn-key"
                value={token}
                onChangeText={setToken}
                secureTextEntry
                placeholder="••••••••••••"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.button}
                onPress={verificarToken}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Verificar token</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>
                Registra un nuevo bibliotecario. Podrá iniciar sesión inmediatamente.
              </Text>

              <CustomInput
                label="Nombre completo"
                iconName="person"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre Apellido"
                autoCapitalize="words"
                autoCorrect={false}
              />

              <CustomInput
                label="Correo electrónico"
                iconName="email"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                placeholder="correo@ejemplo.com"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <CustomInput
                label="Contraseña temporal"
                iconName="lock"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Mínimo 6 caracteres"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={crearBibliotecario}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textEditable} />
                ) : (
                  <>
                    <MaterialIcons name="person-add" size={18} color={theme.colors.textEditable} />
                    <Text style={styles.buttonText}>  Registrar bibliotecario</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.large,
    padding: 36,
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: theme.colors.titleBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  titleText: {
    color: theme.colors.titleText,
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  error: {
    color: theme.colors.statusAtrasado,
    fontSize: 13,
    textAlign: 'center',
    marginTop: -6,
  },
  button: {
    width: '100%',
    backgroundColor: theme.colors.buttonSecondary ?? theme.colors.buttonPrimary,
    borderRadius: theme.borderRadius.small,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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
