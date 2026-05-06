import { useEffect } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { theme } from '@/styles/theme'

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    let resolveAuth!: (user: User | null) => void
    const authPromise = new Promise<User | null>((res) => {
      resolveAuth = res
    })

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      resolveAuth(user)
      unsubscribe()
    })

    Promise.all([
      authPromise,
      new Promise<void>((res) => setTimeout(res, 2000)),
    ]).then(([user]) => {
      router.replace(user ? '/(app)/dashboard' : '/login')
    })

    return () => unsubscribe()
  }, [])

  return (
    <LinearGradient
      colors={theme.gradient.colors}
      start={theme.gradient.start}
      end={theme.gradient.end}
      style={styles.container}
    >
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
})
