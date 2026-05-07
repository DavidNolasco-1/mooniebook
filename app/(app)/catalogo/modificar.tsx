import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { auth } from '@/lib/firebase'
import { theme } from '@/styles/theme'
import { GlassInput } from '@/components/GlassInput'
import { buscarLibroPorIsbn, actualizarLibro } from '@/services/CatalogoService'

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

// ─── Componente ──────────────────────────────────────────────────────────────

export default function CatalogoModificar() {
  const router = useRouter()

  const [isbn,             setIsbn]            = useState('')
  const [titulo,           setTitulo]          = useState('')
  const [autor,            setAutor]           = useState('')
  const [editorial,        setEditorial]       = useState('')
  const [fechaPublicacion, setFechaPublicacion] = useState('')
  const [ejemplares,       setEjemplares]      = useState('')
  const [categoria,        setCategoria]       = useState('')
  const [encontrado,       setEncontrado]      = useState(false)
  const [portadaFrente,    setPortadaFrente]   = useState<string | null>(null)
  const [portadaReverso,   setPortadaReverso]  = useState<string | null>(null)

  const personaCargo = auth.currentUser?.displayName ?? 'Emily Dannae'

  useEffect(() => {
    if (!isbn.trim()) {
      setTitulo(''); setAutor(''); setEditorial('')
      setFechaPublicacion(''); setEjemplares(''); setCategoria('')
      setEncontrado(false)
      return
    }
    buscarLibroPorIsbn(isbn.trim())
      .then((libro) => {
        if (!libro) { setEncontrado(false); return }
        setTitulo(libro.titulo           ?? '')
        setAutor(libro.autor             ?? '')
        setEditorial(libro.editorial     ?? '')
        setFechaPublicacion(libro.fechaPublicacion ?? '')
        setEjemplares(String(libro.ejemplares ?? ''))
        setCategoria(libro.categoria     ?? '')
        setEncontrado(true)
      })
      .catch(() => setEncontrado(false))
  }, [isbn])

  const abrirGaleria = async (lado: 'frente' | 'reverso') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    })
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri
      lado === 'frente' ? setPortadaFrente(uri) : setPortadaReverso(uri)
    }
  }

  const handleActualizar = async () => {
    if (!isbn.trim()) {
      Alert.alert('Campo requerido', 'Ingresa un ISBN para buscar el libro.')
      return
    }
    try {
      await actualizarLibro(isbn.trim(), {
        titulo, autor, editorial,
        fechaPublicacion, categoria,
        ejemplares: Number(ejemplares),
      })
      Alert.alert('Éxito', 'Libro actualizado correctamente.')
      setIsbn(''); setTitulo(''); setAutor(''); setEditorial('')
      setFechaPublicacion(''); setEjemplares(''); setCategoria('')
      setEncontrado(false)
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo actualizar el libro.')
    }
  }

  return (
    <View style={styles.container}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back-ios-new" size={17} color={theme.colors.textEditable} />
          </TouchableOpacity>
          <View style={styles.titlePill}>
            <MaterialIcons name="edit" size={17} color={theme.colors.titleText} />
            <Text style={styles.titleText}>Actualizar información existente</Text>
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

      {/* ── Panel principal ─────────────────────────────────────────────── */}
      <View style={styles.mainPanel}>

        {/* Contenido en dos columnas (scrollable) */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.twoColumns}>

            {/* ── Columna izquierda ── */}
            <View style={styles.leftColumn}>
              <GlassInput
                label="ISBN"
                value={isbn}
                onChangeText={setIsbn}
                placeholder="Ej. 978-0-000-00000-0"
                hint="El sistema buscará automáticamente si el libro existe."
              />
              <GlassInput
                label="Título"
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Título del libro"
              />
              <GlassInput
                label="Autor"
                value={autor}
                onChangeText={setAutor}
                placeholder="Nombre del autor"
              />
              <GlassInput
                label="Editorial"
                value={editorial}
                onChangeText={setEditorial}
                placeholder="Nombre de la editorial"
              />
              <GlassInput
                label="Fecha de publicación"
                value={fechaPublicacion}
                onChangeText={setFechaPublicacion}
                placeholder="DD/MM/AAAA"
              />
              <GlassInput
                label="Número de ejemplares"
                value={ejemplares}
                onChangeText={setEjemplares}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            {/* ── Columna derecha ── */}
            <View style={styles.rightColumn}>
              <GlassInput
                label="Persona a cargo"
                value={personaCargo}
                editable={false}
              />
              <GlassInput
                label="Categoría"
                value={categoria}
                onChangeText={setCategoria}
                placeholder="Ej: Ciencias, Literatura..."
              />

              {/* Imágenes del ejemplar */}
              <View style={styles.imagesSection}>
                <Text style={styles.imagesLabel}>IMÁGENES DEL EJEMPLAR</Text>
                <View style={styles.imagesRow}>
                  {(['frente', 'reverso'] as const).map((lado) => {
                    const uri = lado === 'frente' ? portadaFrente : portadaReverso
                    return (
                      <TouchableOpacity
                        key={lado}
                        style={styles.imageBox}
                        onPress={() => abrirGaleria(lado)}
                        activeOpacity={0.8}
                      >
                        {uri ? (
                          <Image source={{ uri }} style={styles.imagePreview} resizeMode="cover" />
                        ) : (
                          <>
                            <MaterialIcons name="add-photo-alternate" size={30} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.imageBoxLabel}>
                              {lado === 'frente' ? 'Frente' : 'Reverso'}
                            </Text>
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

        {/* ── Footer fijo (derecha) ─────────────────────────────────────── */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnSave} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.btnSaveText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnPrimary, !encontrado && styles.btnDisabled]}
            disabled={!encontrado}
            onPress={handleActualizar}
            activeOpacity={0.85}
          >
            <MaterialIcons name="check" size={18} color="#fff" />
            <Text style={styles.btnPrimaryText}>Actualizar</Text>
          </TouchableOpacity>
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

  /* Panel */
  mainPanel: {
    flex: 1,
    ...GLASS,
    borderRadius: 24,
    padding: 20,
  },

  /* Dos columnas */
  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  leftColumn: {
    width: '48%',
    gap: 14,
  },
  rightColumn: {
    width: '48%',
    gap: 14,
  },

  /* Imágenes */
  imagesSection: {
    gap: 10,
  },
  imagesLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageBox: {
    flex: 1,
    aspectRatio: 1,
    ...GLASS,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageBoxLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 16,
  },
  btnSave: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSaveText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    color: theme.colors.textEditable,
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.45,
  },
})
