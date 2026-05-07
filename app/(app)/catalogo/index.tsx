import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { theme } from '@/styles/theme'
import { obtenerCatalogo } from '@/services/CatalogoService'

// ─── Datos estáticos ─────────────────────────────────────────────────────────

const ACCIONES = [
  { label: 'Dar de alta un ejemplar',          icon: 'add-circle-outline' as const, route: '/(app)/catalogo/registrar' },
  { label: 'Búsqueda por ISBN',                icon: 'search'             as const, route: '/(app)/catalogo/consultar' },
  { label: 'Actualizar información existente', icon: 'edit'               as const, route: '/(app)/catalogo/modificar' },
]

const CATEGORIAS = ['Ficción', 'Drama', 'Ciencia', 'Historia', 'Literatura', 'Filosofía', 'Arte', 'Tecnología']

// Paleta de colores cíclica para portadas (los docs de Firestore no tienen color)
const COVER_COLORS = [
  theme.colors.cardBackground,
  theme.colors.buttonSecondary,
  theme.colors.statusActivo,
  theme.colors.titleBackground,
  theme.colors.statusFinalizado,
  theme.colors.searchBackground,
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
  const [query,  setQuery]  = useState('')
  const [libros, setLibros] = useState<any[]>([])

  useFocusEffect(
    useCallback(() => {
      obtenerCatalogo()
        .then(setLibros)
        .catch((e) => console.error('CatalogoIndex:', e))
    }, [])
  )

  const librosFiltrados = libros.filter((l) =>
    (l.titulo ?? '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <View style={styles.container}>

      {/* ── Fila 1: Header ───────────────────────────────────────────────── */}
      <View style={styles.headerRow}>

        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back-ios-new" size={17} color={theme.colors.textEditable} />
          </TouchableOpacity>
          <View style={styles.titlePill}>
            <MaterialIcons name="menu-book" size={17} color={theme.colors.titleText} />
            <Text style={styles.titleText}>Catálogo de Libros</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={16} color="rgba(255,255,255,0.42)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar título..."
              placeholderTextColor="rgba(255,255,255,0.38)"
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <MaterialIcons name="close" size={15} color="rgba(255,255,255,0.42)" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="notifications-none" size={20} color="rgba(255,255,255,0.72)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="menu" size={20} color="rgba(255,255,255,0.72)" />
          </TouchableOpacity>
        </View>

      </View>

      {/* ── Fila 2: Recuadros de acción ──────────────────────────────────── */}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity key={cat} style={styles.catPill} activeOpacity={0.8}>
              <Text style={styles.catPillText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Fila 4: Grid de libros + Tabla de movimientos ────────────────── */}
      <View style={styles.bottomRow}>

        {/* Grid de libros */}
        {/* TODO: conectar a servidor */}
        <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.bookGrid}>
            {librosFiltrados.length === 0 ? (
              <View style={styles.gridEmpty}>
                <MaterialIcons name="search-off" size={28} color={theme.colors.textReadOnly} />
                <Text style={styles.gridEmptyText}>Sin resultados para "{query}"</Text>
              </View>
            ) : (
              librosFiltrados.map((libro, i) => {
                const disponible = parseInt(libro.ejemplares ?? '0') > 0
                return (
                  <View key={libro.id ?? i} style={styles.bookCard}>
                    <View style={[styles.bookCover, { backgroundColor: COVER_COLORS[i % COVER_COLORS.length] }]}>
                      <View style={[styles.disponibleDot, { backgroundColor: disponible ? theme.colors.statusFinalizado : theme.colors.statusAtrasado }]} />
                    </View>
                    <Text style={styles.bookTitle} numberOfLines={2}>{libro.titulo}</Text>
                    <Text style={styles.bookAutor} numberOfLines={1}>{libro.autor}</Text>
                  </View>
                )
              })
            )}
          </View>
        </ScrollView>

        {/* Tabla de movimientos */}
        <View style={styles.tableContainer}>
          <View style={styles.tableTitlePill}>
            <MaterialIcons name="history" size={15} color={theme.colors.titleText} />
            <Text style={styles.tableTitleText}>Resumen de los Últimos Movimientos</Text>
          </View>
          {/* TODO: conectar a servidor */}
          <View style={styles.tableEmpty}>
            <MaterialIcons name="inbox" size={34} color={theme.colors.textReadOnly} />
            <Text style={styles.tableEmptyText}>Aún no hay movimientos registrados</Text>
          </View>
        </View>

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
  searchBox: {
    ...GLASS,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
    width: 240,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textEditable,
    fontSize: 13,
    padding: 0,
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
    gap: 8,
    paddingRight: 4,
  },
  catPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  catPillText: {
    color: theme.colors.textEditable,
    fontSize: 12,
    fontWeight: '600',
  },

  /* ── Fila 4 ─────────────────────────────────────────────────────────── */
  bottomRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },

  /* Grid */
  gridScroll: {
    flex: 1,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bookCard: {
    ...GLASS,
    borderRadius: 14,
    width: 88,
    overflow: 'hidden',
    padding: 8,
    gap: 6,
    alignItems: 'center',
  },
  bookCover: {
    width: '100%',
    height: 68,
    borderRadius: 8,
    opacity: 0.9,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 4,
  },
  disponibleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  bookTitle: {
    color: theme.colors.textEditable,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  bookAutor: {
    color: theme.colors.textReadOnly,
    fontSize: 9,
    textAlign: 'center',
  },
  gridEmpty: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 24,
    paddingHorizontal: 12,
  },
  gridEmptyText: {
    color: theme.colors.textReadOnly,
    fontSize: 13,
    textAlign: 'center',
  },

  /* Tabla */
  tableContainer: {
    width: 310,
    ...GLASS,
    borderRadius: 20,
    padding: 16,
    gap: 10,
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
    marginBottom: 4,
  },
  tableTitleText: {
    color: theme.colors.titleText,
    fontSize: 12,
    fontWeight: '700',
  },
  tableEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  tableEmptyText: {
    color: theme.colors.textReadOnly,
    fontSize: 13,
    textAlign: 'center',
  },
})
