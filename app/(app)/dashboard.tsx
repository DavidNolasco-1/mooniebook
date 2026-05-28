import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { theme } from '@/styles/theme'
import { auth, db } from '@/lib/firebase'
import { getCountFromServer, collection, query, where } from 'firebase/firestore'

// ─── Datos estáticos ────────────────────────────────────────────────────────

type Module = {
  num: string
  title: string
  desc: string
  icon: keyof typeof MaterialIcons.glyphMap
  route: string
  cardColor: string
}

const MODULES: Module[] = [
  {
    num: '01',
    title: 'Catálogo de Libros',
    desc: 'Registra, consulta y modifica el inventario completo de títulos.',
    icon: 'menu-book',
    route: '/(app)/catalogo',
    cardColor: 'rgba(74, 127, 184, 0.42)',  // theme.colors.cardBackground — más opaco
  },
  {
    num: '02',
    title: 'Gestión de Lectores',
    desc: 'Administra los lectores registrados y controla su estado.',
    icon: 'people',
    route: '/(app)/lectores',
    cardColor: 'rgba(59, 105, 158, 0.26)',  // theme.colors.titleBackground — opacidad media
  },
  {
    num: '03',
    title: 'Préstamos y Devoluciones',
    desc: 'Registra préstamos activos y gestiona las devoluciones.',
    icon: 'swap-horiz',
    route: '/(app)/prestamos',
    cardColor: 'rgba(45, 83, 134, 0.13)',   // theme.colors.buttonSecondary — más translúcido
  },
]

// Calendario — Mayo 2026 (día 1 cae en viernes, índice 4 en L-D)
const CAL_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const CAL_WEEKS = [
  [null, null, null, null, 1,  2,  3],
  [4,   5,    6,    7,    8,  9,  10],
  [11,  12,   13,   14,   15, 16, 17],
  [18,  19,   20,   21,   22, 23, 24],
  [25,  26,   27,   28,   29, 30, 31],
]
const TODAY = 6

// Alertas de devolución (TODO: conectar a servidor)
const ALERTAS = [
  { id: 'P-043', lector: 'García López, M.', libro: 'Álgebra Lineal',   pill: 'Vence hoy', hot: true  },
  { id: 'P-051', lector: 'Torres Ruiz, A.',  libro: 'Física Cuántica',  pill: 'Vence hoy', hot: true  },
  { id: 'P-038', lector: 'Rodríguez, P.',    libro: 'Química Orgánica', pill: '1 día',     hot: false },
  { id: 'P-027', lector: 'López Medina, E.', libro: 'Cálculo III',      pill: '2 días',    hot: false },
  { id: 'P-019', lector: 'Martínez, C.',     libro: 'Estadística Inf.', pill: '3 días',    hot: false },
]

// Barras de la gráfica (TODO: conectar a servidor)
const CHART_H = 88
const BARS = [
  { label: 'L', ratio: 0.45 },
  { label: 'M', ratio: 0.72 },
  { label: 'M', ratio: 0.55 },
  { label: 'J', ratio: 0.90 },
  { label: 'V', ratio: 0.63 },
  { label: 'S', ratio: 0.30 },
  { label: 'D', ratio: 0.18 },
]

// ─── Componente ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter()
  const displayName = auth.currentUser?.displayName ?? auth.currentUser?.email?.split('@')[0] ?? 'Bibliotecario'

  const [totalLibros,       setTotalLibros]       = useState<number | null>(null)
  const [totalLectores,     setTotalLectores]     = useState<number | null>(null)
  const [prestamosActivos,  setPrestamosActivos]  = useState<number | null>(null)

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        getCountFromServer(collection(db, 'libros')),
        getCountFromServer(collection(db, 'lectores')),
        getCountFromServer(query(collection(db, 'prestamos'), where('estado', '==', 'Activo'))),
      ])
        .then(([librosSnap, lectoresSnap, prestamosSnap]) => {
          setTotalLibros(librosSnap.data().count)
          setTotalLectores(lectoresSnap.data().count)
          setPrestamosActivos(prestamosSnap.data().count)
        })
        .catch((e) => console.error('Dashboard metrics:', e))
    }, [])
  )

  // Métricas en el mismo orden que MODULES
  const METRICAS: (number | null)[] = [totalLibros, totalLectores, prestamosActivos]

  return (
    <View style={styles.container}>

      {/* ── Encabezado ────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          HOLA, {displayName.toUpperCase()}!!
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="notifications-none" size={22} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="settings" size={22} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Grid principal ────────────────────────────── */}
      <View style={styles.grid}>

        {/* Fila superior: 3 tarjetas de módulo */}
        <View style={styles.topRow}>
          {MODULES.map((mod, idx) => (
            <TouchableOpacity
              key={mod.route}
              style={[styles.moduleCard, { backgroundColor: mod.cardColor }]}
              onPress={() => router.push(mod.route as any)}
              activeOpacity={0.82}
            >
              {METRICAS[idx] === null ? (
                <ActivityIndicator size="small" color="rgba(255,255,255,0.35)" style={{ alignSelf: 'flex-start' }} />
              ) : (
                <Text style={styles.moduleNum}>{METRICAS[idx]}</Text>
              )}
              <View style={styles.moduleIconWrap}>
                <MaterialIcons name={mod.icon} size={34} color="rgba(255,255,255,0.88)" />
              </View>
              <Text style={styles.moduleTitle}>{mod.title}</Text>
              <Text style={styles.moduleDesc}>{mod.desc}</Text>
              <View style={styles.moduleFooter}>
                <Text style={styles.moduleAction}>Abrir</Text>
                <MaterialIcons name="arrow-outward" size={15} color="rgba(255,255,255,0.6)" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fila inferior: calendario · alertas · gráfica */}
        <View style={styles.bottomRow}>

          {/* Widget: Calendario */}
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <MaterialIcons name="calendar-today" size={14} color="rgba(255,255,255,0.65)" />
              <Text style={styles.widgetTitle}>Mayo 2026</Text>
            </View>
            <View style={styles.calGrid}>
              {CAL_HEADERS.map((h, i) => (
                <Text key={`h${i}`} style={styles.calHeader}>{h}</Text>
              ))}
              {CAL_WEEKS.map((week, wi) =>
                week.map((day, di) => (
                  <View
                    key={`${wi}-${di}`}
                    style={[styles.calCell, day === TODAY && styles.calCellToday]}
                  >
                    {day !== null && (
                      <Text style={[styles.calDay, day === TODAY && styles.calDayToday]}>
                        {day}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Widget: Alertas de devolución */}
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <MaterialIcons name="warning-amber" size={14} color={theme.colors.statusActivo} />
              <Text style={styles.widgetTitle}>Alertas de Devolución</Text>
            </View>
            {/* TODO: conectar a servidor */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={styles.alertasList}>
                {ALERTAS.map((a) => (
                  <View key={a.id} style={styles.alertaRow}>
                    <View style={styles.alertaInfo}>
                      <Text style={styles.alertaLector} numberOfLines={1}>{a.lector}</Text>
                      <Text style={styles.alertaLibro} numberOfLines={1}>{a.libro}</Text>
                    </View>
                    <View style={[styles.pill, a.hot && styles.pillHot]}>
                      <Text style={[styles.pillText, a.hot && styles.pillTextHot]}>
                        {a.pill}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Widget: Gráfica de barras */}
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <MaterialIcons name="bar-chart" size={14} color="rgba(255,255,255,0.65)" />
              <Text style={styles.widgetTitle}>Préstamos semanales</Text>
            </View>
            {/* TODO: conectar a servidor */}
            <View style={[styles.chartArea, { height: CHART_H }]}>
              {BARS.map((bar, i) => (
                <View key={i} style={styles.barCol}>
                  <View
                    style={[
                      styles.bar,
                      { height: Math.round(bar.ratio * CHART_H) },
                    ]}
                  />
                  <Text style={styles.barLabel}>{bar.label}</Text>
                </View>
              ))}
            </View>
          </View>

        </View>
      </View>
    </View>
  )
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 22,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.18)',
} as const

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Encabezado */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  greeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    ...GLASS,
    padding: 8,
    borderRadius: 12,
  },

  /* Grid */
  grid: {
    flex: 1,
    gap: 16,
  },

  /* Fila superior — tarjetas de módulo */
  topRow: {
    flex: 3,
    flexDirection: 'row',
    gap: 16,
  },
  moduleCard: {
    flex: 1,
    ...GLASS,
    padding: 22,
    justifyContent: 'space-between',
  },
  moduleNum: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 38,
  },
  moduleIconWrap: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
  },
  moduleTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
    lineHeight: 20,
  },
  moduleDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    marginTop: 6,
  },
  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  moduleAction: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Fila inferior — widgets */
  bottomRow: {
    flex: 2,
    flexDirection: 'row',
    gap: 16,
  },
  widget: {
    flex: 1,
    ...GLASS,
    padding: 16,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  widgetTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  /* Calendario */
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calHeader: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    paddingBottom: 4,
  },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  calCellToday: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  calDay: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  calDayToday: {
    color: '#fff',
    fontWeight: '800',
  },

  /* Alertas */
  alertasList: {
    gap: 7,
  },
  alertaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertaInfo: {
    flex: 1,
  },
  alertaLector: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  alertaLibro: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  pillHot: {
    backgroundColor: 'rgba(239,68,68,0.25)',
  },
  pillText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '600',
  },
  pillTextHot: {
    color: theme.colors.statusAtrasado,
  },

  /* Gráfica de barras */
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: '100%',
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  barLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
  },
})
