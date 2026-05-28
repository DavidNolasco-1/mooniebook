import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { auth } from '@/lib/firebase'
import { theme } from '@/styles/theme'
import { GlassInput } from '@/components/GlassInput'
import { registrarLibro } from '@/services/CatalogoService'

// ─── Helper ──────────────────────────────────────────────────────────────────

function fechaHoy(): string {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

// ─── Componente ──────────────────────────────────────────────────────────────

export default function CatalogoRegistrar() {
  const router = useRouter()

  // Campos izquierda
  const [isbn,             setIsbn]             = useState('')
  const [titulo,           setTitulo]           = useState('')
  const [autor,            setAutor]            = useState('')
  const [editorial,        setEditorial]        = useState('')
  const [fechaPublicacion, setFechaPublicacion] = useState('')
  const [ejemplares,       setEjemplares]       = useState('')

  // Campos derecha
  const [categoria, setCategoria] = useState('')

  // Solo lectura (auto)
  const fechaRegistro = fechaHoy()
  const personaCargo  = auth.currentUser?.displayName ?? auth.currentUser?.email?.split('@')[0] ?? 'Bibliotecario'

  // Imágenes (base64 para persistir en Firestore)
  const [portadaFrente,  setPortadaFrente]  = useState<string | null>(null)
  const [portadaReverso, setPortadaReverso] = useState<string | null>(null)

  // Validación
  const [error, setError] = useState('')

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

  const handleRegistrar = async () => {
    if (!titulo.trim() || !autor.trim() || !ejemplares.trim()) {
      setError('Título, Autor y Número de ejemplares son obligatorios.')
      return
    }
    setError('')
    try {
      const datos = {
        isbn, titulo, autor, editorial, fechaPublicacion, ejemplares, categoria,
        portada_frente:  portadaFrente  ?? undefined,
        portada_reverso: portadaReverso ?? undefined,
        responsable:     personaCargo,
      }
      await registrarLibro(datos)
      setIsbn(''); setTitulo(''); setAutor('')
      setEditorial(''); setFechaPublicacion(''); setEjemplares(''); setCategoria('')
      Alert.alert('Éxito', 'Libro registrado en el catálogo')
    } catch {
      Alert.alert('Error', 'No se pudo registrar el libro')
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
            <MaterialIcons name="add-circle-outline" size={17} color={theme.colors.titleText} />
            <Text style={styles.titleText}>Dar de alta un ejemplar</Text>
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

        {/* ── Columna izquierda ── */}
        <ScrollView
          style={styles.column}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.leftContent}
        >
          <GlassInput
            label="ISBN"
            value={isbn}
            onChangeText={setIsbn}
            placeholder="978-000-00-0000-0"
            hint="El sistema validará automáticamente si el libro ya existe."
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
        </ScrollView>

        {/* Divisor */}
        <View style={styles.divider} />

        {/* ── Columna derecha ── */}
        <View style={styles.column}>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.rightContent}>
            <GlassInput
              label="Fecha de registro"
              value={fechaRegistro}
              editable={false}
            />
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
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.footerBtns}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleRegistrar}
                activeOpacity={0.85}
              >
                <MaterialIcons name="check" size={18} color="#fff" />
                <Text style={styles.btnPrimaryText}>Registrar</Text>
              </TouchableOpacity>
            </View>
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
    flexDirection: 'row',
  },

  column: {
    flex: 1,
  },
  leftContent: {
    gap: 14,
    paddingRight: 14,
  },
  rightContent: {
    gap: 14,
    paddingLeft: 14,
  },

  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    gap: 8,
    paddingLeft: 14,
    paddingTop: 12,
  },
  errorText: {
    color: theme.colors.statusAtrasado,
    fontSize: 12,
    textAlign: 'center',
  },
  footerBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    flex: 2,
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: 14,
    paddingVertical: 13,
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
})
