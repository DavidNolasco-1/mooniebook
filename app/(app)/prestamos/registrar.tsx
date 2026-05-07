import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { auth, db } from '@/lib/firebase'
import { getDoc, doc } from 'firebase/firestore'
import { theme } from '@/styles/theme'
import { GlassInput } from '@/components/GlassInput'
import { registrarPrestamo } from '@/services/PrestamosService'

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

// ─── Componente ──────────────────────────────────────────────────────────────

export default function PrestamosRegistrar() {
  const router = useRouter()

  const [estadoLector,  setEstadoLector] = useState('')
  const [estadoLibro,   setEstadoLibro]  = useState('')
  const [isbn,          setIsbn]         = useState('')
  const [idLector,      setIdLector]     = useState('')

  const personaCargo = auth.currentUser?.displayName ?? 'Emily Dannae'
  const isDisabled   = estadoLibro !== 'Disponible' || estadoLector !== 'Habilitado'

  useEffect(() => {
    if (!idLector.trim()) { setEstadoLector(''); return }
    setEstadoLector('Buscando...')
    getDoc(doc(db, 'lectores', idLector.trim()))
      .then((snap) => setEstadoLector(snap.exists() ? snap.data().estado : 'No encontrado'))
      .catch(() => setEstadoLector('Error'))
  }, [idLector])

  useEffect(() => {
    if (!isbn.trim()) { setEstadoLibro(''); return }
    setEstadoLibro('Buscando...')
    getDoc(doc(db, 'libros', isbn.trim()))
      .then((snap) => {
        if (!snap.exists()) { setEstadoLibro('No encontrado'); return }
        setEstadoLibro(Number(snap.data().ejemplares) > 0 ? 'Disponible' : 'No Disponible')
      })
      .catch(() => setEstadoLibro('Error'))
  }, [isbn])

  const hoy          = new Date()
  const entrega      = new Date(hoy.getTime())
  entrega.setDate(entrega.getDate() + 7)
  const fmt          = (d: Date) => d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const fechaSalidaDisplay  = fmt(hoy)
  const fechaEntregaDisplay = fmt(entrega)

  const handleConfirmar = async () => {
    if (!idLector.trim() || !isbn.trim()) {
      Alert.alert('Campos requeridos', 'El ID de lector y el ISBN no pueden estar vacíos.')
      return
    }

    try {
      const nuevoPrestamo = {
        idLector,
        isbn,
        estado: 'Activo',
        fechaSalida: new Date().toISOString(),
        responsable: personaCargo,
      }
      await registrarPrestamo(nuevoPrestamo)
      setIdLector('')
      setIsbn('')
      Alert.alert('Éxito', 'Préstamo autorizado y registrado')
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo registrar el préstamo. Intenta de nuevo.')
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
            <MaterialIcons name="menu-book" size={17} color={theme.colors.titleText} />
            <Text style={styles.titleText}>Nuevo Préstamo</Text>
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

      {/* ── Panel centrado ──────────────────────────────────────────────── */}
      <View style={styles.contentArea}>
        <View style={styles.mainPanel}>

          {/* ── Sección superior: avatar con indicador + ID ── */}
          <View style={styles.topSection}>
            <View style={styles.avatarWrap}>
              <MaterialIcons name="account-circle" size={90} color="rgba(255,255,255,0.55)" />
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: estadoLector === 'Habilitado'
                      ? theme.colors.statusHabilitado
                      : theme.colors.statusAtrasado },
                ]}
              />
            </View>
            <Text style={styles.idLabel}>ID Lector</Text>
            <View style={styles.idPill}>
              <Text style={styles.idPillText}>{idLector || '—'}</Text>
            </View>
          </View>

          {/* ── Grid de 3 columnas ── */}
          <View style={styles.formRow}>

            {/* Columna 1: datos del lector */}
            <View style={styles.formColumn}>
              <GlassInput
                label="ID Lector"
                value={idLector}
                onChangeText={setIdLector}
                placeholder="Ej. L-001"
              />
              <GlassInput
                label="Estado del Lector"
                value={estadoLector}
                editable={false}
              />
              <GlassInput
                label="Persona encargada del registro"
                value={personaCargo}
                editable={false}
              />
            </View>

            {/* Columna 2: datos del libro */}
            <View style={styles.formColumn}>
              <GlassInput
                label="ISBN"
                value={isbn}
                onChangeText={setIsbn}
                placeholder="978-000-00-0000-0"
              />
              <GlassInput
                label="Estado del Libro"
                value={estadoLibro}
                editable={false}
                alert={estadoLibro === 'No Disponible'}
              />
            </View>

            {/* Columna 3: fechas */}
            <View style={styles.formColumn}>
              <GlassInput
                label="Fecha de Salida"
                value={fechaSalidaDisplay}
                editable={false}
              />
              <GlassInput
                label="Fecha de Entrega"
                value={fechaEntregaDisplay}
                editable={false}
              />
            </View>

          </View>

          {/* ── Footer ── */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, isDisabled && styles.btnDisabled]}
              disabled={isDisabled}
              onPress={handleConfirmar}
              activeOpacity={0.85}
            >
              <MaterialIcons name="check" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Confirmar Préstamo</Text>
            </TouchableOpacity>
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

  /* ── Header ─────────────────────────────────────────────────────────── */
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
    paddingHorizontal: 20,
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

  /* ── Panel centrado ──────────────────────────────────────────────────── */
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPanel: {
    width: '88%',
    ...GLASS,
    borderRadius: 28,
    padding: 32,
    gap: 28,
  },

  /* ── Sección superior ────────────────────────────────────────────────── */
  topSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatarWrap: {
    position: 'relative',
    width: 90,
    height: 90,
  },
  statusDot: {
    position: 'absolute',
    top: 4,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(15,30,60,0.9)',
  },
  idLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  idPill: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  idPillText: {
    color: theme.colors.textEditable,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* ── Grid 3 columnas ─────────────────────────────────────────────────── */
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  formColumn: {
    width: '30%',
    gap: 16,
  },

  /* ── Footer ──────────────────────────────────────────────────────────── */
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  btnCancel: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 32,
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
    opacity: 0.5,
  },
})
