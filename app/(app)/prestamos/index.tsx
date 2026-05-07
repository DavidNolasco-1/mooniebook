import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { theme } from '@/styles/theme'
import { obtenerPrestamosRecientes } from '@/services/PrestamosService'

// ─── Columnas de la tabla ─────────────────────────────────────────────────────

type FilaPrestamo = { isbn: string; idLector: string; fecha: string; estado: string }

const COLS: { key: keyof FilaPrestamo; header: string; flex: number }[] = [
  { key: 'isbn',     header: 'ISBN',      flex: 4 },
  { key: 'idLector', header: 'ID Lector', flex: 2 },
  { key: 'fecha',    header: 'Fecha',     flex: 2 },
  { key: 'estado',   header: 'Estado',    flex: 2 },
]

const formatFecha = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

// ─── Componente ──────────────────────────────────────────────────────────────

export default function PrestamosIndex() {
  const router = useRouter()
  const [prestamosActivos, setPrestamosActivos] = useState<FilaPrestamo[]>([])

  useFocusEffect(
    useCallback(() => {
      obtenerPrestamosRecientes()
        .then((data) =>
          setPrestamosActivos(
            data.map((p) => ({
              isbn:      p.isbn      ?? '—',
              idLector:  p.idLector  ?? '—',
              fecha:     p.fechaSalida ? formatFecha(p.fechaSalida) : '—',
              estado:    p.estado    ?? '—',
            }))
          )
        )
        .catch((e) => console.error('PrestamosIndex:', e))
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
            <MaterialIcons name="library-books" size={18} color={theme.colors.titleText} />
            <Text style={styles.titleText}>Préstamos y Devoluciones</Text>
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
          onPress={() => router.push('/(app)/prestamos/registrar' as any)}
          activeOpacity={0.82}
        >
          <View style={styles.tileIconWrap}>
            <MaterialIcons name="menu-book" size={40} color={theme.colors.textEditable} />
          </View>
          <Text style={styles.tileText}>Nuevo{'\n'}Préstamo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => router.push('/(app)/prestamos/devolver' as any)}
          activeOpacity={0.82}
        >
          <View style={styles.tileIconWrap}>
            <MaterialIcons name="assignment-return" size={40} color={theme.colors.textEditable} />
          </View>
          <Text style={styles.tileText}>Recibir{'\n'}Devolución</Text>
        </TouchableOpacity>

      </View>

      {/* ── Tabla de préstamos activos ───────────────────────────────────── */}
      <View style={styles.tablePanel}>

        {/* Título */}
        <View style={styles.tableTitlePill}>
          <MaterialIcons name="pending-actions" size={14} color={theme.colors.titleText} />
          <Text style={styles.tableTitleText}>Resumen de Préstamos Activos</Text>
        </View>

        {/* Encabezados */}
        <View style={styles.tableRow}>
          {COLS.map((col) => (
            <View key={col.key} style={[styles.cellBox, styles.headerBox, { flex: col.flex }]}>
              <Text style={styles.headerBoxText}>{col.header}</Text>
            </View>
          ))}
        </View>

        {/* Filas de datos */}
        {prestamosActivos.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialIcons name="inbox" size={28} color={theme.colors.textReadOnly} />
            <Text style={styles.emptyText}>Sin préstamos activos</Text>
          </View>
        ) : (
          prestamosActivos.map((row, i) => (
            <View key={i} style={styles.tableRow}>
              {COLS.map((col) => (
                <View key={col.key} style={[styles.cellBox, { flex: col.flex }]}>
                  <Text style={styles.cellBoxText} numberOfLines={1}>{row[col.key]}</Text>
                </View>
              ))}
            </View>
          ))
        )}

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
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    color: theme.colors.textReadOnly,
    fontSize: 13,
  },
})
