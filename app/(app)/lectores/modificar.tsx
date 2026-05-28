import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { auth } from '@/lib/firebase'
import { theme } from '@/styles/theme'
import { GlassInput } from '@/components/GlassInput'
import { obtenerLectoresRecientes, actualizarLector } from '@/services/LectoresService'

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

export default function LectoresModificar() {
  const router = useRouter()

  const [lista,          setLista]         = useState<any[]>([])
  const [seleccionado,   setSeleccionado]  = useState<any | null>(null)

  const [correo,         setCorreo]        = useState('')
  const [estadoLector,   setEstadoLector]  = useState('')

  const personaCargo = auth.currentUser?.displayName ?? auth.currentUser?.email?.split('@')[0] ?? 'Bibliotecario'

  useFocusEffect(
    useCallback(() => {
      obtenerLectoresRecientes()
        .then(setLista)
        .catch((e) => console.error('LectoresModificar:', e))
      setSeleccionado(null)
    }, [])
  )

  const seleccionar = (lector: any) => {
    setSeleccionado(lector)
    setCorreo(lector.correo_electronico ?? '')
    setEstadoLector(lector.estado ?? '')
  }

  const volver = () => setSeleccionado(null)

  const handleActualizar = async () => {
    try {
      await actualizarLector(seleccionado.id, { correo, estado: estadoLector })
      Alert.alert('Éxito', 'Datos del lector actualizados correctamente.')
      setSeleccionado(null)
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo actualizar el lector.')
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
            <MaterialIcons name="manage-accounts" size={17} color={theme.colors.titleText} />
            <Text style={styles.titleText}>
              {seleccionado ? 'Editando: ' + seleccionado.id : 'Actualizar Datos de Lector'}
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
        <View style={styles.contentArea}>
          <View style={styles.mainPanel}>

            <View style={styles.topSection}>
              <MaterialIcons
                name="account-circle"
                size={100}
                color={theme.colors.statusHabilitado}
              />
              <Text style={styles.lectorId}>{seleccionado.id}</Text>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <GlassInput label="Persona encargada del registro" value={personaCargo} editable={false} />
                <GlassInput
                  label="Correo"
                  value={correo}
                  onChangeText={setCorreo}
                  placeholder="Correo del Lector"
                />
              </View>
              <View style={styles.formColumn}>
                <GlassInput
                  label="Estado"
                  value={estadoLector}
                  onChangeText={setEstadoLector}
                  placeholder="Habilitado / Suspendido"
                />
              </View>
            </View>

            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={volver} activeOpacity={0.8}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleActualizar} activeOpacity={0.85}>
                <MaterialIcons name="check" size={18} color="#fff" />
                <Text style={styles.btnPrimaryText}>Actualizar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

      ) : (

        /* ── Vista: lista de lectores para seleccionar ──────────────────── */
        <View style={styles.listPanel}>
          <Text style={styles.listHint}>Selecciona el lector que deseas editar</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {lista.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="people" size={40} color="rgba(255,255,255,0.18)" />
                <Text style={styles.emptyText}>No hay lectores registrados</Text>
              </View>
            ) : (
              lista.map((lector) => (
                <TouchableOpacity
                  key={lector.id}
                  style={styles.listRow}
                  onPress={() => seleccionar(lector)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="account-circle"
                    size={42}
                    color={lector.estado === 'Habilitado' ? theme.colors.statusHabilitado : theme.colors.statusSuspendido}
                  />
                  <View style={styles.listInfo}>
                    <Text style={styles.listId}>{lector.id}</Text>
                    <Text style={styles.listCorreo}>{lector.correo_electronico}</Text>
                  </View>
                  <View style={[styles.estadoBadge, lector.estado === 'Habilitado' ? styles.badgeHabilitado : styles.badgeSuspendido]}>
                    <Text style={[styles.estadoText, lector.estado === 'Habilitado' ? styles.textHabilitado : styles.textSuspendido]}>
                      {lector.estado}
                    </Text>
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
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100, flexShrink: 1,
  },
  titleText: { color: theme.colors.titleText, fontSize: theme.fontSize.title, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { ...GLASS, borderRadius: 12, padding: 9 },

  /* Lista */
  listPanel: { flex: 1, ...GLASS, borderRadius: 24, padding: 20 },
  listHint: { color: 'rgba(255,255,255,0.42)', fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 12 },
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  listInfo: { flex: 1 },
  listId: { color: theme.colors.textEditable, fontSize: 14, fontWeight: '700' },
  listCorreo: { color: theme.colors.textReadOnly, fontSize: 11, marginTop: 2 },
  estadoBadge: {
    borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1,
  },
  badgeHabilitado: { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.3)' },
  badgeSuspendido: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)' },
  estadoText: { fontSize: 11, fontWeight: '700' },
  textHabilitado: { color: theme.colors.statusHabilitado },
  textSuspendido: { color: theme.colors.statusSuspendido },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 14 },

  /* Formulario */
  contentArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mainPanel: { width: '72%', ...GLASS, borderRadius: 28, padding: 32, gap: 28 },
  topSection: { alignItems: 'center', gap: 8 },
  lectorId: { color: theme.colors.titleText, fontSize: 18, fontWeight: '800' },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  formColumn: { width: '45%', gap: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  btnCancel: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 32,
  },
  btnCancelText: { color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: theme.colors.buttonPrimary, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 32,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  btnPrimaryText: { color: theme.colors.textEditable, fontSize: 14, fontWeight: '700' },
})
