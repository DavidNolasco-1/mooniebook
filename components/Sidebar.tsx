import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
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
  { label: 'Dashboard',  icon: 'dashboard',  route: '/(app)/dashboard', match: '/dashboard' },
  { label: 'Catálogo',   icon: 'menu-book',  route: '/(app)/catalogo',  match: '/catalogo'  },
  { label: 'Lectores',   icon: 'people',     route: '/(app)/lectores',  match: '/lectores'  },
  { label: 'Préstamos',  icon: 'swap-horiz', route: '/(app)/prestamos', match: '/prestamos' },
]

export function Sidebar() {
  const router   = useRouter()
  const pathname = usePathname()
  const displayName = auth.currentUser?.displayName ?? 'Emily Dannae'

  const handleLogout = async () => {
    await signOut(auth)
    router.replace('/login')
  }

  return (
    <View style={styles.container}>

      {/* Logo */}
      <View style={styles.logoRow}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>MoonieBook</Text>
      </View>

      <View style={styles.divider} />

      {/* Avatar + nombre */}
      <View style={styles.userBlock}>
        <MaterialIcons name="account-circle" size={70} color="rgba(255,255,255,0.88)" />
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userRole}>Encargada de Biblioteca</Text>
      </View>

      <View style={styles.divider} />

      {/* Navegación */}
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.match || pathname.startsWith(item.match + '/')
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <MaterialIcons
                name={item.icon}
                size={19}
                color={active ? '#fff' : 'rgba(255,255,255,0.55)'}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
              {active && <View style={styles.activeDot} />}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <MaterialIcons name="logout" size={17} color={theme.colors.statusAtrasado} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },

  /* Logo */
  logoRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logo: {
    width: 58,
    height: 58,
  },
  appName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 16,
  },

  /* Usuario */
  userBlock: {
    alignItems: 'center',
    gap: 5,
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  userRole: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'center',
  },

  /* Nav */
  nav: {
    flex: 1,
    gap: 3,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  navLabel: {
    flex: 1,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.38)',
    marginTop: 6,
  },
  logoutText: {
    color: theme.colors.statusAtrasado,
    fontSize: 13,
    fontWeight: '600',
  },
})
