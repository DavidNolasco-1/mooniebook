import { View } from 'react-native'
import { Slot } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Sidebar } from '@/components/Sidebar'
import { theme } from '@/styles/theme'

export default function AppLayout() {
  return (
    <LinearGradient
      colors={theme.gradient.colors}
      start={theme.gradient.start}
      end={theme.gradient.end}
      style={{ flex: 1 }}
    >
      <View style={{ flexDirection: 'row', flex: 1, padding: 20, gap: 20 }}>
        <Sidebar />
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
    </LinearGradient>
  )
}
