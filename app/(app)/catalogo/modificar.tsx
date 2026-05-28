import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { auth } from '@/lib/firebase'
import { theme } from '@/styles/theme'
import { GlassInput } from '@/components/GlassInput'
import { obtenerLibrosRecientes, actualizarLibro } from '@/services/CatalogoService'

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

export default function CatalogoModificar() {
  const router = useRouter()

  const [lista,            setLista]           = useState<any[]>([])
  const [seleccionado,     setSeleccionado]     = useState<any | null>(null)

  // Campos del formulario
  const [titulo,           setTitulo]          = useState('')
  const [autor,            setAutor]           = useState('')
  const [editorial,        setEditorial]       = useState('')
  const [fechaPublicacion, setFechaPublicacion] = useState('')
  const [ejemplares,       setEjemplares]      = useState('')
  const [categoria,        setCategoria]       = useState('')
  const [portadaFrente,    setPortadaFrente]   = useState<string | null>(null)
  const [portadaReverso,   setPortadaReverso]  = useState<string | null>(null)

  const personaCargo = auth.currentUser?.displayName ?? auth.currentUser?.email?.split('@')[0] ?? 'Bibliotecario'

  useFocusEffect(
    useCallback(() => {
      obtenerLibrosRecientes()
        .then(setLista)
        .catch((e) => console.error('CatalogoModificar:', e))
      // Al volver a la pantalla, limpiar selección
      setSeleccionado(null)
    }, [])
  )

  const seleccionar = (libro: any) => {
    setSeleccionado(libro)
    setTitulo(libro.titulo           ?? '')
    setAutor(libro.autor             ?? '')
    setEditorial(libro.editorial     ?? '')
    setFechaPublicacion(libro.fecha_publicacion ?? '')
    setEjemplares(String(libro.cantidad_total   ?? ''))
    setCategoria(libro.categoria     ?? '')
    setPortadaFrente(libro.portada_frente  ?? null)
    setPortadaReverso(libro.portada_reverso ?? null)
  }

  const volver = () => setSeleccionado(null)

  const capturarImagen = async (lado: 'frente' | 'reverso') => {
    const guardar = (b64: string) =>
      lado === 'frente' ? setPortadaFrente(b64) : setPortadaReverso(b64)

    const opciones = {
      base64: true,
      allowsEditing: true,
      aspect: [3, 4] as [number, number],
      quality: 0.35 as const,
    }

    Alert.alert('Portada del libro', '¿Cómo quieres agregar la imagen?', [
      {
        text: 'Cámara',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync()
          if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.')
            return
          }
          const result = await ImagePicker.launchCameraAsync(opciones)
          if (!result.canceled && result.assets[0].base64) guardar(result.assets[0].base64)
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ ...opciones, mediaTypes: 'images' })
          if (!result.canceled && result.assets[0].base64) guardar(result.assets[0].base64)
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  const handleActualizar = async () => {
    try {
      await actualizarLibro(seleccionado.isbn, {
        titulo, autor, editorial,
        fechaPublicacion, categoria,
        ejemplares: Number(ejemplares),
        portada_frente:  portadaFrente  ?? undefined,
        portada_reverso: portadaReverso ?? undefined,
      })
      Alert.alert('Éxito', 'Libro actualizado correctamente.')
      setSeleccionado(null)
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo actualizar el libro.')
    }
  }

  return (
    <View style={styles.container}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={seleccionado ? volver : () => router.back()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back-ios-new" size={17} color={theme.colors.textEditable} />
          </TouchableOpacity>
          <View style={styles.titlePill}>
            <MaterialIcons name="edit" size={17} color={theme.colors.titleText} />
            <Text style={styles.titleText}>
              {seleccionado ? 'Editando: ' + seleccionado.titulo : 'Actualizar información existente'}
            </Text>
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

      {seleccionado ? (

        /* ── Vista: formulario de edición ───────────────────────────────── */
        <View style={styles.mainPanel}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={styles.twoColumns}>

              {/* Columna izquierda */}
              <View style={styles.leftColumn}>
                <GlassInput label="ISBN" value={seleccionado.isbn} editable={false} />
                <GlassInput label="Título"            value={titulo}           onChangeText={setTitulo}           placeholder="Título del libro" />
                <GlassInput label="Autor"             value={autor}            onChangeText={setAutor}            placeholder="Nombre del autor" />
                <GlassInput label="Editorial"         value={editorial}        onChangeText={setEditorial}        placeholder="Editorial" />
                <GlassInput label="Fecha publicación" value={fechaPublicacion} onChangeText={setFechaPublicacion} placeholder="DD/MM/AAAA" />
                <GlassInput label="Ejemplares"        value={ejemplares}       onChangeText={setEjemplares}       placeholder="0" keyboardType="numeric" />
              </View>

              {/* Columna derecha */}
              <View style={styles.rightColumn}>
                <GlassInput label="Persona a cargo" value={personaCargo} editable={false} />
                <GlassInput label="Categoría" value={categoria} onChangeText={setCategoria} placeholder="Ej: Ciencias, Literatura..." />

                <View style={styles.imagesSection}>
                  <Text style={styles.imagesLabel}>IMÁGENES DEL EJEMPLAR</Text>
                  <View style={styles.imagesRow}>
                    {(['frente', 'reverso'] as const).map((lado) => {
                      const b64 = lado === 'frente' ? portadaFrente : portadaReverso
                      return (
                        <TouchableOpacity
                          key={lado}
                          style={styles.imageBox}
                          onPress={() => capturarImagen(lado)}
                          activeOpacity={0.8}
                        >
                          {b64 ? (
                            <Image source={{ uri: `data:image/jpeg;base64,${b64}` }} style={styles.imagePreview} resizeMode="cover" />
                          ) : (
                            <>
                              <MaterialIcons name="add-photo-alternate" size={30} color="rgba(255,255,255,0.4)" />
                              <Text style={styles.imageBoxLabel}>{lado === 'frente' ? 'Frente' : 'Reverso'}</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>
              </View>

            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnSecondary} onPress={volver} activeOpacity={0.8}>
              <Text style={styles.btnSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleActualizar} activeOpacity={0.85}>
              <MaterialIcons name="check" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        </View>

      ) : (

        /* ── Vista: lista de libros para seleccionar ────────────────────── */
        <View style={styles.mainPanel}>
          <Text style={styles.listHint}>Selecciona el libro que deseas editar</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {lista.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="menu-book" size={40} color="rgba(255,255,255,0.18)" />
                <Text style={styles.emptyText}>No hay libros registrados</Text>
              </View>
            ) : (
              lista.map((libro) => (
                <TouchableOpacity
                  key={libro.isbn}
                  style={styles.listRow}
                  onPress={() => seleccionar(libro)}
                  activeOpacity={0.8}
                >
                  {/* Miniatura portada */}
                  <View style={styles.listThumb}>
                    {libro.portada_frente ? (
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${libro.portada_frente}` }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                      />
                    ) : (
                      <MaterialIcons name="menu-book" size={22} color="rgba(255,255,255,0.4)" />
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.listInfo}>
                    <Text style={styles.listTitle} numberOfLines={1}>{libro.titulo}</Text>
                    <Text style={styles.listSub}>{libro.isbn} · {libro.autor}</Text>
                  </View>

                  {/* Disponibles */}
                  <View style={styles.listBadge}>
                    <Text style={styles.listBadgeText}>{libro.cantidad_disponible}/{libro.cantidad_total}</Text>
                    <Text style={styles.listBadgeLabel}>disp.</Text>
                  </View>

                  <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 14 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 12 },
  backBtn: { ...GLASS, borderRadius: 12, padding: 9 },
  titlePill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.colors.titleBackground,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 100, flexShrink: 1,
  },
  titleText: { color: theme.colors.titleText, fontSize: theme.fontSize.title, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { ...GLASS, borderRadius: 12, padding: 9 },

  mainPanel: { flex: 1, ...GLASS, borderRadius: 24, padding: 20 },

  /* Lista */
  listHint: { color: 'rgba(255,255,255,0.42)', fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 12 },
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  listThumb: {
    width: 44, height: 58, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  listInfo: { flex: 1 },
  listTitle: { color: theme.colors.textEditable, fontSize: 14, fontWeight: '700' },
  listSub: { color: theme.colors.textReadOnly, fontSize: 11, marginTop: 2 },
  listBadge: { alignItems: 'center' },
  listBadgeText: { color: theme.colors.textEditable, fontSize: 13, fontWeight: '700' },
  listBadgeLabel: { color: theme.colors.textReadOnly, fontSize: 9 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 14 },

  /* Formulario */
  twoColumns: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  leftColumn: { width: '48%', gap: 14 },
  rightColumn: { width: '48%', gap: 14 },

  imagesSection: { gap: 10 },
  imagesLabel: { color: 'rgba(255,255,255,0.42)', fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  imagesRow: { flexDirection: 'row', gap: 12 },
  imageBox: {
    flex: 1, aspectRatio: 1, ...GLASS, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  imageBoxLabel: { color: 'rgba(255,255,255,0.42)', fontSize: 12, fontWeight: '600' },

  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingTop: 16 },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
    paddingVertical: 13, paddingHorizontal: 28,
  },
  btnSecondaryText: { color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: theme.colors.buttonPrimary, borderRadius: 14,
    paddingVertical: 13, paddingHorizontal: 28,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  btnPrimaryText: { color: theme.colors.textEditable, fontSize: 14, fontWeight: '700' },
})
