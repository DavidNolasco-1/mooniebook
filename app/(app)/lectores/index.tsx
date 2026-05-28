import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { theme } from '@/styles/theme'
import { obtenerLectoresRecientes } from '@/services/LectoresService'

type MovimientoLector = { id: string; accion: string; responsable: string }

const COLS: { key: keyof MovimientoLector; header: string; flex: number }[] = [
  { key: 'id',          header: 'ID_LECTOR',  flex: 2 },
  { key: 'accion',      header: 'Acción',      flex: 3 },
  { key: 'responsable', header: 'Responsable', flex: 4 },
]

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

// ─── Componente ──────────────────────────────────────────────────────────────

export default function LectoresIndex() {
  const router  = useRouter()
  const [lectores, setLectores] = useState<any[]>([])

  useFocusEffect(
    useCallback(() => {
      obtenerLectoresRecientes()
        .then(setLectores)
        .catch((e) => console.error('LectoresIndex:', e))
    }, [])
  )

  return (
    <View style={styles.container}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back-ios-new" size={17} color={theme.colors.textEditable} />
          </TouchableOpacity>
          <View style={styles.titlePill}>
            <MaterialIcons name="people" size={18} color={theme.colors.titleText} />
            <Text style={styles.titleText}>Gestión de Lectores</Text>
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

      {/* ── Botones de acción ───────────────────────────────────────────── */}
      <View style={styles.actionRow}>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => router.push('/(app)/lectores/registrar' as any)}
          activeOpacity={0.82}
        >
          <View style={styles.tileIconWrap}>
            <MaterialIcons name="person-add" size={40} color={theme.colors.textEditable} />
          </View>
          <Text style={styles.tileText}>Registrar{'\n'}Nuevo Lector</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => router.push('/(app)/lectores/modificar' as any)}
          activeOpacity={0.82}
        >
          <View style={styles.tileIconWrap}>
            <MaterialIcons name="manage-accounts" size={40} color={theme.colors.textEditable} />
          </View>
          <Text style={styles.tileText}>Actualizar Datos{'\n'}de Lector</Text>
        </TouchableOpacity>

      </View>

      {/* ── Tabla de movimientos ─────────────────────────────────────────── */}
      <View style={styles.tablePanel}>

        {/* Título */}
        <View style={styles.tableTitlePill}>
          <MaterialIcons name="history" size={14} color={theme.colors.titleText} />
          <Text style={styles.tableTitleText}>Resumen de los Últimos Movimientos</Text>
        </View>

        {/* Encabezados */}
        <View style={styles.tableRow}>
          {COLS.map((col) => (
            <View key={String(col.key)} style={[styles.cellBox, styles.headerBox, { flex: col.flex }]}>
              <Text style={styles.headerBoxText}>{col.header}</Text>
            </View>
          ))}
        </View>

        {/* Filas de datos — Firestore (filtra IDs legacy que no son L-XXX) */}
        {lectores.filter(l => /^L-\d+$/.test(l.id)).map((lector, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={[styles.cellBox, { flex: COLS[0].flex }]}>
              <Text style={styles.cellBoxText} numberOfLines={1}>{lector.id}</Text>
            </View>
            <View style={[styles.cellBox, { flex: COLS[1].flex }]}>
              <Text style={styles.cellBoxText}>Nuevo Registro</Text>
            </View>
            <View style={[styles.cellBox, { flex: COLS[2].flex }]}>
              <Text style={styles.cellBoxText} numberOfLines={1}>{lector.responsable ?? lector.correo_electronico ?? '—'}</Text>
            </View>
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
    gap: 20,
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
    paddingVertical: 11,
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

  /* ── Botones de acción ──────────────────────────────────────────────── */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  actionTile: {
    backgroundColor: 'rgba(74,127,184,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 26,
    width: 220,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 14,
  },
  tileIconWrap: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    padding: 14,
  },
  tileText: {
    color: theme.colors.textEditable,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },

  /* ── Tabla ──────────────────────────────────────────────────────────── */
  tablePanel: {
    flex: 1,
    ...GLASS,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  tableTitlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'center',
    backgroundColor: theme.colors.titleBackground,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
    marginBottom: 4,
  },
  tableTitleText: {
    color: theme.colors.titleText,
    fontSize: 13,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cellBox: {
    borderRadius: 100,
    paddingVertical: 9,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(45,83,134,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerBox: {
    backgroundColor: 'rgba(59,105,158,0.85)',
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
