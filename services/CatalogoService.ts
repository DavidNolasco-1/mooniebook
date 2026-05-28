import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { docToLibro } from '@/services/converters'
import { EstadoPrestamo } from '@/domain/enums/EstadoPrestamo'

export type TipoMovimiento = 'Registro' | 'Préstamo' | 'Devolución'

export interface Movimiento {
  id: string
  accion: TipoMovimiento
  responsable: string
  fecha: string
}

export const registrarLibro = async (datos: {
  isbn: string; titulo: string; autor: string; editorial: string
  fechaPublicacion: string; ejemplares: string; categoria: string
  portada_frente?: string; portada_reverso?: string; responsable?: string
}): Promise<void> => {
  const existente = await consultarLibro(datos.isbn)
  if (existente) throw new Error('ISBN_DUPLICADO')

  const cantidad = parseInt(datos.ejemplares ?? '0', 10)
  const hoy = new Date()
  const fecha_registro = `${String(hoy.getDate()).padStart(2,'0')}/${String(hoy.getMonth()+1).padStart(2,'0')}/${hoy.getFullYear()}`
  await setDoc(doc(db, 'libros', datos.isbn), {
    isbn:                datos.isbn,
    titulo:              datos.titulo,
    autor:               datos.autor,
    editorial:           datos.editorial,
    categoria:           datos.categoria,
    fecha_publicacion:   datos.fechaPublicacion,
    cantidad_total:      cantidad,
    cantidad_disponible: cantidad,
    portada_frente:      datos.portada_frente  ?? null,
    portada_reverso:     datos.portada_reverso ?? null,
    fecha_registro,
    responsable:         datos.responsable     ?? '',
  })
}

export const consultarLibro = async (isbn: string): Promise<Record<string, any> | null> => {
  const snap = await getDoc(doc(db, 'libros', isbn))
  if (!snap.exists()) return null
  const d = snap.data()
  const libro = docToLibro(isbn, d)
  return {
    isbn:                libro.isbn,
    titulo:              libro.titulo,
    autor:               libro.autor,
    editorial:           libro.editorial,
    categoria:           libro.categoria,
    fecha_publicacion:   libro.fecha_publicacion,
    cantidad_total:      libro.cantidad_total,
    cantidad_disponible: libro.cantidad_disponible,
    portada_frente:      d['portada_frente']  ?? null,
    portada_reverso:     d['portada_reverso'] ?? null,
  }
}

export const buscarLibroPorIsbn = consultarLibro

export const actualizarLibro = async (isbn: string, datos: Partial<{
  titulo: string; autor: string; editorial: string
  categoria: string; fechaPublicacion: string; cantidad_total: number; ejemplares: number
  portada_frente: string; portada_reverso: string
}>): Promise<void> => {
  const snap = await getDoc(doc(db, 'libros', isbn))
  if (!snap.exists()) throw new Error('LIBRO_NO_ENCONTRADO')
  const libro = docToLibro(isbn, snap.data())
  if (datos.titulo           !== undefined) libro.titulo            = datos.titulo
  if (datos.autor            !== undefined) libro.autor             = datos.autor
  if (datos.editorial        !== undefined) libro.editorial         = datos.editorial
  if (datos.categoria        !== undefined) libro.categoria         = datos.categoria
  if (datos.fechaPublicacion !== undefined) libro.fecha_publicacion = datos.fechaPublicacion
  if (datos.cantidad_total   !== undefined) {
    const delta = datos.cantidad_total - libro.cantidad_total
    libro.cantidad_total     = datos.cantidad_total
    libro.cantidad_disponible = Math.max(0, libro.cantidad_disponible + delta)
  }
  if (datos.ejemplares !== undefined) {
    const delta = datos.ejemplares - libro.cantidad_total
    libro.cantidad_total      = datos.ejemplares
    libro.cantidad_disponible = Math.max(0, libro.cantidad_disponible + delta)
  }
  const existing = snap.data()
  await setDoc(doc(db, 'libros', isbn), {
    isbn:                libro.isbn,
    titulo:              libro.titulo,
    autor:               libro.autor,
    editorial:           libro.editorial,
    categoria:           libro.categoria,
    fecha_publicacion:   libro.fecha_publicacion,
    cantidad_total:      libro.cantidad_total,
    cantidad_disponible: libro.cantidad_disponible,
    portada_frente:      datos.portada_frente  ?? existing['portada_frente']  ?? null,
    portada_reverso:     datos.portada_reverso ?? existing['portada_reverso'] ?? null,
    fecha_registro:      existing['fecha_registro'] ?? null,
    responsable:         existing['responsable']    ?? null,
  })
}

function parseMovFecha(s: string): number {
  if (!s || s === '—') return 0
  if (s.includes('/')) {
    const [d, m, y] = s.split('/')
    return new Date(`${y}-${m}-${d}`).getTime()
  }
  return new Date(s).getTime() || 0
}

export const obtenerMovimientosRecientes = async (): Promise<Movimiento[]> => {
  const [librosSnap, prestamosSnap] = await Promise.all([
    getDocs(collection(db, 'libros')),
    getDocs(collection(db, 'prestamos')),
  ])

  const movs: Movimiento[] = []

  librosSnap.docs.forEach((d) => {
    const raw = d.data()
    movs.push({
      id:          raw['isbn'] ?? d.id,
      accion:      'Registro',
      responsable: raw['responsable'] || '—',
      fecha:       raw['fecha_registro'] || '',
    })
  })

  prestamosSnap.docs.forEach((d) => {
    const raw    = d.data()
    const estado = raw['estado'] as EstadoPrestamo
    movs.push({
      id:          raw['isbn_libro'] ?? raw['isbn'] ?? d.id,
      accion:      estado === EstadoPrestamo.Activo ? 'Préstamo' : 'Devolución',
      responsable: raw['responsable'] || raw['id_lector'] || '—',
      fecha:       raw['fecha_prestamo'] ?? '',
    })
  })

  movs.sort((a, b) => parseMovFecha(b.fecha) - parseMovFecha(a.fecha))
  return movs.slice(0, 10)
}

export const obtenerLibrosRecientes = async (): Promise<Record<string, any>[]> => {
  const snap = await getDocs(collection(db, 'libros'))
  return snap.docs.map((d) => {
    const libro = docToLibro(d.id, d.data())
    const raw   = d.data()
    return {
      id:                  d.id,
      isbn:                libro.isbn,
      titulo:              libro.titulo,
      autor:               libro.autor,
      editorial:           libro.editorial,
      categoria:           libro.categoria,
      fecha_publicacion:   libro.fecha_publicacion,
      cantidad_total:      libro.cantidad_total,
      cantidad_disponible: libro.cantidad_disponible,
      portada_frente:      raw['portada_frente']  ?? null,
      portada_reverso:     raw['portada_reverso'] ?? null,
      fecha_registro:      raw['fecha_registro']  || '—',
      responsable:         raw['responsable']     || '—',
    }
  })
}
