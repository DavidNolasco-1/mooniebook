import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { theme } from '@/styles/theme'

type NavItem = {
  label: string
  icon: keyof typeof MaterialIcons.glyphMap
  route: string
  match: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  icon: 'dashboard',       route: '/(app)/dashboard', match: '/dashboard' },
  { label: 'Catálogo',   icon: 'menu-book',        route: '/(app)/catalogo',  match: '/catalogo'  },
  { label: 'Lectores',   icon: 'people',           route: '/(app)/lectores',  match: '/lectores'  },
  { label: 'Préstamos',  icon: 'swap-horiz',       route: '/(app)/prestamos', match: '/prestamos' },
]

export function DrawerContent() {
  const router = useRouter()
  const pathname = usePathname()
  const displayName = auth.currentUser?.displayName ?? 'Encargado'

  const handleLogout = async () => {
    await signOut(auth)
    router.replace('/login')
  }

  return (
    <LinearGradient
      colors={['#192f6a', '#192f6a']}
      style={styles.container}
    >
      {/* Branding */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>MoonieBook</Text>
        <View style={styles.divider} />
        <Text style={styles.userLabel}>ENCARGADO</Text>
        <Text style={styles.userName} numberOfLines={2}>{displayName}</Text>
      </View>

      {/* Navigation */}
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.match || pathname.startsWith(item.match + '/')
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <MaterialIcons
                name={item.icon}
                size={20}
                color={isActive ? '#fff' : theme.colors.labelText}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <MaterialIcons name="logout" size={18} color={theme.colors.statusAtrasado} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 14,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  logo: {
    width: 68,
    height: 68,
    marginBottom: 8,
  },
  appName: {
    color: theme.colors.textEditable,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  divider: {
    width: '85%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 14,
  },
  userLabel: {
    color: theme.colors.labelText,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  userName: {
    color: theme.colors.textEditable,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  nav: {
    flex: 1,
    marginTop: 8,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  navLabel: {
    color: theme.colors.labelText,
    fontSize: 14,
    fontWeight: '500',
  },
  navLabelActive: {
    color: theme.colors.textEditable,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    marginTop: 8,
  },
  logoutText: {
    color: theme.colors.statusAtrasado,
    fontSize: 13,
    fontWeight: '600',
  },
})
