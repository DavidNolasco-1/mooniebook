import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Image } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { theme } from '@/styles/theme'
import { GlassInput } from '@/components/GlassInput'
import { consultarLibro } from '@/services/CatalogoService'

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

// ─── Componente ──────────────────────────────────────────────────────────────

export default function CatalogoConsultar() {
  const router  = useRouter()
  const params  = useLocalSearchParams<{ isbn?: string }>()

  const [isbnQuery,    setIsbnQuery]    = useState(params.isbn ?? '')
  const [libro,        setLibro]        = useState<Record<string, any> | null>(null)
  const [noEncontrado, setNoEncontrado] = useState(false)

  const buscar = async (query: string) => {
    if (!query.trim()) return
    setLibro(null)
    setNoEncontrado(false)
    const result = await consultarLibro(query.trim())
    if (result) { setLibro(result) } else { setNoEncontrado(true) }
  }

  const handleBuscar = () => buscar(isbnQuery)

  // Auto-buscar cuando llega el ISBN por param de navegación
  useEffect(() => {
    if (params.isbn) buscar(params.isbn)
  }, [params.isbn])

  return (
    <View style={styles.container}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back-ios-new" size={17} color={theme.colors.textEditable} />
          </TouchableOpacity>
          <View style={styles.titlePill}>
            <MaterialIcons name="search" size={17} color={theme.colors.titleText} />
            <Text style={styles.titleText}>Búsqueda por ISBN</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="notifications-none" size={20} color="rgba(255,255,255,0.72)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="menu" size={20} color="rgba(255,255,255,0.72)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Barra de búsqueda ───────────────────────────────────────────── */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Escribe el ISBN para buscar..."
          placeholderTextColor="rgba(255,255,255,0.38)"
          value={isbnQuery}
          onChangeText={setIsbnQuery}
          keyboardType="numeric"
          onSubmitEditing={handleBuscar}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleBuscar} activeOpacity={0.8}>
          <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>
      </View>

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      {libro ? (

        /* ── Ficha técnica del libro ── */
        <View style={[styles.mainPanel, styles.foundPanel]}>

          {/* Columna izquierda */}
          <View style={styles.leftColumn}>

            {/* Imágenes */}
            <View style={styles.imagesRow}>
              {libro.portada_frente ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${libro.portada_frente}` }}
                  style={styles.imageReal}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.buttonSecondary }]}>
                  <MaterialIcons name="image" size={34} color="rgba(255,255,255,0.35)" />
                  <Text style={styles.imagePlaceholderLabel}>Portada</Text>
                </View>
              )}
              {libro.portada_reverso ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${libro.portada_reverso}` }}
                  style={styles.imageReal}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.titleBackground }]}>
                  <MaterialIcons name="auto-stories" size={34} color="rgba(255,255,255,0.35)" />
                  <Text style={styles.imagePlaceholderLabel}>Interior</Text>
                </View>
              )}
            </View>

            {/* Píldoras indicadores */}
            <View style={styles.pillsRow}>
              <View style={styles.pill}>
                <MaterialIcons name="library-books" size={12} color="rgba(255,255,255,0.55)" />
                <Text style={styles.pillText}>Total: {libro.cantidad_total}</Text>
              </View>
              <View style={[styles.pill, styles.pillAvailable]}>
                <MaterialIcons name="bookmark" size={12} color={theme.colors.statusFinalizado} />
                <Text style={[styles.pillText, { color: theme.colors.statusFinalizado }]}>
                  Disponibles: {libro.cantidad_disponible}
                </Text>
              </View>
            </View>

          </View>

          {/* Divisor */}
          <View style={styles.divider} />

          {/* Columna derecha */}
          <View style={styles.rightColumn}>

            {/* Fila de estado */}
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Estado</Text>
              <View style={[styles.statusBadge, libro.cantidad_disponible === 0 && styles.statusBadgeUnavailable]}>
                <View style={[styles.statusDot, libro.cantidad_disponible === 0 && styles.statusDotUnavailable]} />
                <Text style={[styles.statusBadgeText, libro.cantidad_disponible === 0 && styles.statusBadgeTextUnavailable]}>
                  {libro.cantidad_disponible > 0 ? 'Disponible' : 'Sin ejemplares'}
                </Text>
              </View>
            </View>

            {/* Campos de información */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.fieldsContent}>
              <GlassInput label="ISBN"              value={libro.isbn}              editable={false} />
              <GlassInput label="Título"            value={libro.titulo}            editable={false} />
              <GlassInput label="Autor"             value={libro.autor}             editable={false} />
              <GlassInput label="Editorial"         value={libro.editorial}         editable={false} />
              <GlassInput label="Fecha publicación" value={libro.fecha_publicacion} editable={false} />
              <GlassInput label="Categoría"         value={libro.categoria}         editable={false} />
            </ScrollView>

            {/* Botón realizar préstamo */}
            <TouchableOpacity
              style={styles.btnPrestamo}
              onPress={() =>
                router.push({
                  pathname: '/(app)/prestamos/registrar' as any,
                  params: { isbn: libro.isbn },
                })
              }
              activeOpacity={0.85}
            >
              <MaterialIcons name="swap-horiz" size={20} color="#fff" />
              <Text style={styles.btnPrestamoText}>Realizar Préstamo</Text>
            </TouchableOpacity>

          </View>
        </View>

      ) : (

        /* ── Estado vacío / no encontrado ── */
        <View style={[styles.mainPanel, styles.emptyState]}>
          <MaterialIcons name="menu-book" size={52} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyTitle}>
            {noEncontrado ? 'ISBN no encontrado' : 'Busca un libro por ISBN'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {noEncontrado
              ? 'No existe ningún libro registrado con ese ISBN.'
              : 'Ingresa el código ISBN y presiona el ícono de búsqueda para ver la ficha técnica del libro.'}
          </Text>
        </View>

      )}
    </View>
  )
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },

  /* Header */
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
    gap: 8,
  },
  iconBtn: {
    ...GLASS,
    borderRadius: 12,
    padding: 9,
  },

  /* Barra de búsqueda */
  searchBar: {
    ...GLASS,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textEditable,
    fontSize: 15,
    padding: 0,
  },
  searchBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 8,
  },

  /* Panel principal */
  mainPanel: {
    flex: 1,
    ...GLASS,
    borderRadius: 24,
    padding: 20,
  },
  foundPanel: {
    flexDirection: 'row',
  },

  /* Columna izquierda */
  leftColumn: {
    flex: 1,
    gap: 14,
  },

  imagesRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  imagePlaceholder: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.85,
  },
  imagePlaceholderLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '600',
  },
  imageReal: {
    flex: 1,
    borderRadius: 16,
  },

  statsPanel: {
    ...GLASS,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statsText: {
    flex: 1,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  statsHighlight: {
    color: theme.colors.textEditable,
    fontWeight: '800',
    fontStyle: 'italic',
  },

  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    ...GLASS,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillAvailable: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderColor: 'rgba(34,197,94,0.3)',
  },
  pillText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },

  /* Divisor */
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 16,
  },

  /* Columna derecha */
  rightColumn: {
    flex: 1,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  statusLabel: {
    color: theme.colors.textReadOnly,
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusBadgeUnavailable: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.statusHabilitado,
  },
  statusDotUnavailable: {
    backgroundColor: theme.colors.statusAtrasado,
  },
  statusBadgeText: {
    color: theme.colors.statusHabilitado,
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadgeTextUnavailable: {
    color: theme.colors.statusAtrasado,
  },

  fieldsContent: {
    gap: 12,
  },

  btnPrestamo: {
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    alignSelf: 'flex-end',
    paddingHorizontal: 28,
  },
  btnPrestamoText: {
    color: theme.colors.textEditable,
    fontSize: 14,
    fontWeight: '700',
  },

  /* Estado vacío */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 20,
  },
})
