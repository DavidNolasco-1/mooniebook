import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { auth } from '@/lib/firebase'
import { theme } from '@/styles/theme'
import { GlassInput } from '@/components/GlassInput'
import { registrarLector } from '@/services/LectoresService'

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

// ─── Componente ──────────────────────────────────────────────────────────────

export default function LectoresRegistrar() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [error,  setError]  = useState('')

  const personaCargo = auth.currentUser?.displayName ?? auth.currentUser?.email?.split('@')[0] ?? 'Bibliotecario'

  const handleRegistrar = async () => {
    if (!correo.trim()) {
      setError('El correo del lector es obligatorio.')
      return
    }
    setError('')
    try {
      const nuevoLector = { correo, estado: 'Habilitado', responsable: personaCargo }
      const idGenerado = await registrarLector(nuevoLector)
      setCorreo('')
      Alert.alert('Éxito', 'Lector registrado con ID: ' + idGenerado)
    } catch {
      Alert.alert('Error', 'No se pudo registrar el lector')
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
            <MaterialIcons name="person-add" size={17} color={theme.colors.titleText} />
            <Text style={styles.titleText}>Registrar Nuevo Lector</Text>
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

      {/* ── Área de contenido centrada ──────────────────────────────────── */}
      <View style={styles.contentArea}>
        <View style={styles.mainPanel}>

          {/* ── Sección superior: avatar ── */}
          <View style={styles.topSection}>
            <MaterialIcons name="account-circle" size={100} color="rgba(255,255,255,0.55)" />
            <View style={styles.idPill}>
              <MaterialIcons name="auto-awesome" size={13} color={theme.colors.titleText} />
              <Text style={styles.idPillText}>El ID se asigna automáticamente</Text>
            </View>
          </View>

          {/* ── Formulario en dos columnas ── */}
          <View style={styles.formRow}>

            {/* Columna izquierda */}
            <View style={styles.formColumn}>
              <GlassInput
                label="Persona encargada del registro"
                value={personaCargo}
                editable={false}
              />
              <GlassInput
                label="Correo"
                value={correo}
                onChangeText={setCorreo}
                placeholder="Correo del Lector"
              />
            </View>

            {/* Columna derecha */}
            <View style={styles.formColumn}>
              <GlassInput
                label="Estado del Lector"
                value="Habilitado"
                editable={false}
              />
            </View>

          </View>

          {/* ── Footer con botones ── */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.footerRow}>
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

  /* ── Área centrada ───────────────────────────────────────────────────── */
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPanel: {
    width: '72%',
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
  idLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  idPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  idPillText: {
    color: theme.colors.titleText,
    fontSize: 12,
    fontWeight: '600',
  },

  /* ── Formulario ──────────────────────────────────────────────────────── */
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  formColumn: {
    width: '45%',
    gap: 16,
  },

  /* ── Footer ──────────────────────────────────────────────────────────── */
  errorText: {
    color: theme.colors.statusAtrasado,
    fontSize: 12,
    textAlign: 'center',
    marginTop: -12,
  },
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
})
