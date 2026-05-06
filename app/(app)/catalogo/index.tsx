import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { theme } from '@/styles/theme'

// ─── Datos estáticos ─────────────────────────────────────────────────────────

const ACCIONES = [
  {
    label: 'Dar de alta un ejemplar',
    icon: 'add-circle-outline' as const,
    route: '/(app)/catalogo/registrar',
  },
  {
    label: 'Búsqueda por ISBN',
    icon: 'search' as const,
    route: '/(app)/catalogo/consultar',
  },
  {
    label: 'Actualizar información existente',
    icon: 'edit' as const,
    route: '/(app)/catalogo/modificar',
  },
]

// TODO: conectar a servidor
const CATEGORIAS = [
  { label: 'Ficción',       color: theme.colors.cardBackground   },
  { label: 'Matemáticas',   color: theme.colors.titleBackground  },
  { label: 'Ciencias',      color: theme.colors.statusFinalizado },
  { label: 'Historia',      color: theme.colors.statusActivo     },
  { label: 'Literatura',    color: theme.colors.buttonSecondary  },
  { label: 'Filosofía',     color: theme.colors.statusAtrasado   },
  { label: 'Física',        color: theme.colors.searchBackground },
]

type Movimiento = { isbn: string; accion: string; fecha: string; usuario: string }

// TODO: conectar a servidor
const MOVIMIENTOS: Movimiento[] = [
  { isbn: '978-607-32-1234-5', accion: 'Alta',      fecha: '05/05/2026', usuario: 'Admin' },
  { isbn: '978-607-18-9876-3', accion: 'Préstamo',  fecha: '05/05/2026', usuario: 'Admin' },
  { isbn: '978-607-07-3456-7', accion: 'Alta',      fecha: '04/05/2026', usuario: 'Admin' },
  { isbn: '978-607-43-5678-9', accion: 'Consulta',  fecha: '04/05/2026', usuario: 'Admin' },
]

const COLS: { key: keyof Movimiento; header: string; flex: number }[] = [
  { key: 'isbn',    header: 'ISBN',    flex: 3 },
  { key: 'accion',  header: 'Acción',  flex: 2 },
  { key: 'fecha',   header: 'Fecha',   flex: 2 },
  { key: 'usuario', header: 'Usuario', flex: 2 },
]

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.18)',
} as const

// ─── Componente ──────────────────────────────────────────────────────────────

export default function CatalogoIndex() {
  const router = useRouter()

  return (
    <View style={styles.container}>

      {/* ── Fila 1: Header ────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>

        {/* Izquierda: flecha + píldora título */}
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back-ios-new" size={17} color={theme.colors.textEditable} />
          </TouchableOpacity>

          <View style={styles.titlePill}>
            <MaterialIcons name="menu-book" size={17} color={theme.colors.titleText} />
            <Text style={styles.titleText}>Catálogo de Libros</Text>
          </View>
        </View>

        {/* Derecha: búsqueda falsa + iconos */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.fakeSearch}
            onPress={() => router.push('/(app)/catalogo/consultar' as any)}
            activeOpacity={0.85}
          >
            <MaterialIcons name="search" size={16} color="rgba(255,255,255,0.42)" />
            <Text style={styles.fakeSearchText}>Buscar por ISBN o título...</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="notifications-none" size={20} color="rgba(255,255,255,0.72)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="menu" size={20} color="rgba(255,255,255,0.72)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Fila 2: Recuadros de acción ───────────────────────────────────── */}
      <View style={styles.actionRow}>
        {ACCIONES.map((btn) => (
          <TouchableOpacity
            key={btn.route}
            style={styles.actionCard}
            onPress={() => router.push(btn.route as any)}
            activeOpacity={0.82}
          >
            <View style={styles.actionIconWrap}>
              <MaterialIcons name={btn.icon} size={28} color={theme.colors.textEditable} />
            </View>
            <Text style={styles.actionCardText}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Fila 3: Carrusel de categorías ───────────────────────────────── */}
      <View style={styles.carouselSection}>
        <Text style={styles.sectionLabel}>EXPLORAR POR CATEGORÍA</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {/* TODO: conectar a servidor */}
          {CATEGORIAS.map((cat, i) => (
            <TouchableOpacity key={i} style={styles.catCard} activeOpacity={0.82}>
              <View style={styles.catPill}>
                <Text style={styles.catPillText}>{cat.label}</Text>
              </View>
              <View style={[styles.catCover, { backgroundColor: cat.color }]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Fila 4: Tabla de movimientos ──────────────────────────────────── */}
      <View style={styles.tableContainer}>

        {/* Píldora de título */}
        <View style={styles.tableTitlePill}>
          <MaterialIcons name="history" size={15} color={theme.colors.titleText} />
          <Text style={styles.tableTitleText}>Resumen de los Últimos Movimientos</Text>
        </View>

        {/* Cabeceras */}
        <View style={styles.tableRow}>
          {COLS.map((col) => (
            <View key={col.key} style={[styles.cellBox, styles.headerBox, { flex: col.flex }]}>
              <Text style={styles.headerBoxText}>{col.header}</Text>
            </View>
          ))}
        </View>

        {/* Filas de datos */}
        {/* TODO: conectar a servidor */}
        {MOVIMIENTOS.map((row, i) => (
          <View key={i} style={styles.tableRow}>
            {COLS.map((col) => (
              <View key={col.key} style={[styles.cellBox, { flex: col.flex }]}>
                <Text style={styles.cellBoxText} numberOfLines={1}>{row[col.key]}</Text>
              </View>
            ))}
          </View>
        ))}

      </View>

    </View>
  )
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },

  /* ── Fila 1 ─────────────────────────────────────────────────────────── */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    ...GLASS,
    borderRadius: 12,
    padding: 9,
  },
  titlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.titleBackground,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
  },
  titleText: {
    color: theme.colors.titleText,
    fontSize: theme.fontSize.title,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fakeSearch: {
    ...GLASS,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 9,
    width: 240,
  },
  fakeSearchText: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 13,
    flex: 1,
  },
  iconBtn: {
    ...GLASS,
    borderRadius: 12,
    padding: 9,
  },

  /* ── Fila 2 ─────────────────────────────────────────────────────────── */
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    ...GLASS,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  actionIconWrap: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 12,
  },
  actionCardText: {
    color: theme.colors.textEditable,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* ── Fila 3 ─────────────────────────────────────────────────────────── */
  carouselSection: {
    gap: 8,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  carouselContent: {
    gap: 10,
    paddingRight: 4,
  },
  catCard: {
    ...GLASS,
    borderRadius: 16,
    width: 110,
    height: 130,
    padding: 10,
    gap: 8,
    overflow: 'hidden',
  },
  catPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catPillText: {
    color: theme.colors.textEditable,
    fontSize: 10,
    fontWeight: '700',
  },
  catCover: {
    flex: 1,
    borderRadius: 8,
    opacity: 0.88,
  },

  /* ── Fila 4 ─────────────────────────────────────────────────────────── */
  tableContainer: {
    flex: 1,
    ...GLASS,
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  tableTitlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.titleBackground,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    marginBottom: 2,
  },
  tableTitleText: {
    color: theme.colors.titleText,
    fontSize: 13,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    gap: 6,
  },
  cellBox: {
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 83, 134, 0.65)',  // theme.colors.buttonSecondary
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerBox: {
    backgroundColor: 'rgba(59, 105, 158, 0.85)',  // theme.colors.titleBackground
  },
  headerBoxText: {
    color: theme.colors.titleText,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cellBoxText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
  },
})
