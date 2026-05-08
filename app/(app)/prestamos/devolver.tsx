import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { theme } from '@/styles/theme'
import { procesarDevolucion, obtenerPrestamosRecientes } from '@/services/PrestamosService'

// ─── Tipos y columnas ─────────────────────────────────────────────────────────

type FilaDevolucion = {
  idDoc: string; idPrestamo: string; idLector: string; isbn: string
  estado: string; fecha: string; responsable: string
}

const COLS: { key: keyof FilaDevolucion; header: string; flex: number }[] = [
  { key: 'idPrestamo',  header: 'ID Prestamo',  flex: 2 },
  { key: 'idLector',   header: 'ID Lector',    flex: 2 },
  { key: 'isbn',       header: 'ISBN',         flex: 4 },
  { key: 'estado',     header: 'Estado',       flex: 2 },
  { key: 'fecha',      header: 'Fecha',        flex: 2 },
  { key: 'responsable', header: 'Responsable', flex: 3 },
]

const formatFecha = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return iso }
}

// ─── Helper de colores por estado ────────────────────────────────────────────

function estadoStyle(estado: string) {
  switch (estado) {
    case 'Activo':     return { bg: 'rgba(245,158,11,0.22)', border: 'rgba(245,158,11,0.5)', text: theme.colors.statusActivo    }
    case 'Atrasado':   return { bg: 'rgba(239,68,68,0.22)',  border: 'rgba(239,68,68,0.5)',  text: theme.colors.statusAtrasado  }
    case 'Devuelto':
    case 'Finalizado': return { bg: 'rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.4)',  text: theme.colors.statusFinalizado }
    default:           return { bg: 'rgba(45,83,134,0.65)',  border: 'rgba(255,255,255,0.1)', text: theme.colors.textEditable  }
  }
}

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

// ─── Componente ──────────────────────────────────────────────────────────────

export default function PrestamosDevolver() {
  const router = useRouter()
  const [busqueda,  setBusqueda]  = useState('')
  const [prestamos, setPrestamos] = useState<FilaDevolucion[]>([])

  useFocusEffect(
    useCallback(() => {
      obtenerPrestamosRecientes()
        .then((data) =>
          setPrestamos(
            data
              .map((p) => {
                const docId = p.identificador ?? p.id ?? ''
                return {
                  idDoc:       docId,
                  idPrestamo:  docId.substring(0, 6),
                  idLector:    p.id_lector   ?? p.idLector  ?? '—',
                  isbn:        p.isbn_libro  ?? p.isbn      ?? '—',
                  estado:      p.estado      ?? '—',
                  fecha:       p.fecha_prestamo
                                 ? formatFecha(p.fecha_prestamo)
                                 : p.fechaSalida ? formatFecha(p.fechaSalida) : '—',
                  responsable: p.responsable ?? '—',
                }
              })
          )
        )
        .catch((e) => console.error('PrestamosDevolver:', e))
    }, [])
  )

  const prestamosFiltrados = prestamos.filter((p) => {
    const q = busqueda.toLowerCase().trim()
    if (!q) return true
    return p.idLector.toLowerCase().includes(q) || p.isbn.toLowerCase().includes(q)
  })

  return (
    <View style={styles.container}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>

        {/* Izquierda */}
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back-ios-new" size={17} color={theme.colors.textEditable} />
          </TouchableOpacity>
          <View style={styles.titlePill}>
            <MaterialIcons name="assignment-return" size={17} color={theme.colors.titleText} />
            <Text style={styles.titleText}>Recibir Devolución</Text>
          </View>
        </View>

        {/* Derecha */}
        <View style={styles.headerRight}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={16} color="rgba(255,255,255,0.42)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por ID Lector o ID Préstamo..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')}>
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

      {/* ── Panel de tabla ──────────────────────────────────────────────── */}
      <View style={styles.tablePanel}>

        {/* Encabezados */}
        <View style={styles.tableRow}>
          {COLS.map((col) => (
            <View key={col.key} style={[styles.cellBox, styles.headerBox, { flex: col.flex }]}>
              <Text style={styles.headerBoxText}>{col.header}</Text>
            </View>
          ))}
        </View>

        {/* Filas de datos */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {prestamosFiltrados.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>Sin resultados para "{busqueda}"</Text>
            </View>
          ) : (
            prestamosFiltrados.map((row, i) => {
              const bloqueado = row.estado !== 'Activo'
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.tableRow, bloqueado && styles.rowFinalizado]}
                  disabled={bloqueado}
                  onPress={row.estado === 'Activo' ? () => {
                    Alert.alert(
                      'Confirmar Devolución',
                      `¿Registrar la devolución del préstamo ${row.idPrestamo}?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Confirmar',
                          onPress: async () => {
                            try {
                              await procesarDevolucion(row.idDoc)
                              Alert.alert('Éxito', 'Devolución registrada correctamente.', [
                                { text: 'OK', onPress: () => router.back() },
                              ])
                            } catch (error: any) {
                              Alert.alert('Error', error?.message ?? 'No se pudo procesar la devolución.')
                            }
                          },
                        },
                      ]
                    )
                  } : undefined}
                  activeOpacity={0.75}
                >
                  {COLS.map((col) => {
                    const value = row[col.key] as string
                    if (col.key === 'estado') {
                      const { bg, border, text } = estadoStyle(value)
                      return (
                        <View
                          key={col.key}
                          style={[styles.cellBox, { flex: col.flex, backgroundColor: bg, borderColor: border }]}
                        >
                          <Text style={[styles.cellBoxText, { color: text, fontWeight: '700' }]} numberOfLines={1}>
                            {value}
                          </Text>
                        </View>
                      )
                    }
                    return (
                      <View key={col.key} style={[styles.cellBox, { flex: col.flex }]}>
                        <Text style={styles.cellBoxText} numberOfLines={1}>{value}</Text>
                      </View>
                    )
                  })}
                </TouchableOpacity>
              )
            })
          )}
        </ScrollView>

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
    paddingVertical: 7,
    width: 320,
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

  /* ── Panel de tabla ──────────────────────────────────────────────────── */
  tablePanel: {
    flex: 1,
    ...GLASS,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  tableRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 7,
  },
  rowFinalizado: {
    opacity: 0.5,
  },
  cellBox: {
    borderRadius: 100,
    paddingVertical: 9,
    paddingHorizontal: 12,
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

  /* Empty state */
  emptyRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textReadOnly,
    fontSize: 13,
  },
})
