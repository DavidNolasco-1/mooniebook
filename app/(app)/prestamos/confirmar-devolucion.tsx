import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { theme } from '@/styles/theme'
import { GlassInput } from '@/components/GlassInput'

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ConfirmarDevolucion() {
  const router = useRouter()

  const handleConfirmar = () => {
    console.log('Ejemplar devuelto')
    router.back()
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
            <Text style={styles.titleText}>Devolución de Ejemplar</Text>
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

          {/* ── Sección superior: avatar + ID ── */}
          <View style={styles.topSection}>
            <MaterialIcons name="account-circle" size={90} color="rgba(255,255,255,0.55)" />
            <View style={styles.idRow}>
              <Text style={styles.idLabel}>ID Lector</Text>
              <MaterialIcons name="search" size={18} color="rgba(255,255,255,0.45)" />
            </View>
            <View style={styles.idPill}>
              <Text style={styles.idPillText}>L-055</Text>
            </View>
          </View>

          {/* ── Formulario en dos columnas ── */}
          <View style={styles.formRow}>

            {/* Columna izquierda */}
            <View style={styles.formColumn}>
              <GlassInput
                label="ISBN"
                value="978-3-16-148410-0"
                editable={false}
              />
              <GlassInput
                label="Fecha devolución"
                value="05/05/26"
                editable={false}
              />
            </View>

            {/* Columna derecha */}
            <View style={styles.formColumn}>
              {/* Campo con estilo local naranja/dorado */}
              <View style={styles.warningWrapper}>
                <Text style={styles.warningLabel}>ESTADO</Text>
                <View style={styles.warningInput}>
                  <Text style={styles.warningText}>Habilitado</Text>
                </View>
              </View>
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
              style={styles.btnPrimary}
              onPress={handleConfirmar}
              activeOpacity={0.85}
            >
              <MaterialIcons name="check" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Confirmar</Text>
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
    width: '68%',
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
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  idLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontWeight: '700',
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

  /* Campo estado (naranja) */
  warningWrapper: {
    gap: 4,
  },
  warningLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  warningInput: {
    backgroundColor: 'rgba(245,158,11,0.82)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.95)',
    justifyContent: 'center',
  },
  warningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
})
