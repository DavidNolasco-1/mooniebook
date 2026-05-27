import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Libro } from '@/domain/entities/Libro'
import { Lector } from '@/domain/entities/Lector'
import { Prestamo } from '@/domain/entities/Prestamo'
import { EstadoPrestamo } from '@/domain/enums/EstadoPrestamo'
import { EstadoLector } from '@/domain/enums/EstadoLector'

const MULTA_POR_DIA   = 50
const DIAS_SUSPENSION = 30

function calcularFechaDevolucion(inicio: Date, diasHabiles: number): string {
  const fecha = new Date(inicio.getTime())
  let contados = 0
  while (contados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1)
    const dia = fecha.getDay()
    if (dia !== 0 && dia !== 6) contados++
  }
  return fecha.toISOString().split('T')[0]!
}

function docToLector(id: string, d: Record<string, any>): Lector {
  return new Lector(
    d['id'] ?? d['idLector'] ?? id,
    d['correo_electronico'] ?? d['correo'] ?? '',
    (d['estado'] as EstadoLector) ?? EstadoLector.Habilitado,
    d['fecha_fin_suspension'] ?? null,
  )
}

function docToLibro(isbn: string, d: Record<string, any>): Libro {
  return new Libro(
    d['isbn'] ?? isbn,
    d['titulo'] ?? '',
    d['autor']  ?? '',
    d['editorial'] ?? '',
    d['categoria'] ?? '',
    d['fecha_publicacion'] ?? '',
    Number(d['cantidad_total']) || 0,
    Number(d['cantidad_disponible'] ?? d['ejemplares']) || 0,
  )
}

function docToPrestamo(id: string, d: Record<string, any>): Prestamo {
  return new Prestamo(
    d['identificador'] ?? id,
    d['id_lector']     ?? d['idLector']  ?? '',
    d['isbn_libro']    ?? d['isbn']       ?? '',
    d['fecha_prestamo'] ?? d['fechaSalida'] ?? '',
    d['fecha_devolucion_esperada'] ?? '',
    (d['estado'] as EstadoPrestamo) ?? EstadoPrestamo.Activo,
  )
}

export const registrarPrestamo = async (datos: {
  idLector: string; isbn: string; responsable?: string
}): Promise<string> => {
  const { idLector, isbn } = datos

  // 1. Lector existe y tiene derecho
  const lectorSnap = await getDoc(doc(db, 'lectores', idLector))
  if (!lectorSnap.exists()) throw new Error('LECTOR_SIN_DERECHO')
  const lector = docToLector(idLector, lectorSnap.data())
  if (!lector.tieneDerecho()) throw new Error('LECTOR_SIN_DERECHO')

  // 2. Libro existe
  const libroSnap = await getDoc(doc(db, 'libros', isbn))
  if (!libroSnap.exists()) throw new Error('LIBRO_NO_ENCONTRADO')
  const libro = docToLibro(isbn, libroSnap.data())

  // 3. Hay ejemplares disponibles
  if (!libro.estaDisponible()) throw new Error('SIN_EJEMPLARES')

  // 4. Sin préstamo activo para este lector
  const prestamosSnap = await getDocs(collection(db, 'prestamos'))
  const tieneActivo = prestamosSnap.docs.some((d) => {
    const pd = d.data()
    return (pd['id_lector'] ?? pd['idLector']) === idLector
      && pd['estado'] === EstadoPrestamo.Activo
  })
  if (tieneActivo) throw new Error('PRESTAMO_ACTIVO_EXISTENTE')

  // 5. Generar ID y crear préstamo
  const total        = prestamosSnap.size
  const identificador = `P-${String(total + 1).padStart(3, '0')}`
  const hoy           = new Date()
  await setDoc(doc(db, 'prestamos', identificador), {
    identificador,
    id_lector:                 idLector,
    isbn_libro:                isbn,
    fecha_prestamo:            hoy.toISOString().split('T')[0],
    fecha_devolucion_esperada: calcularFechaDevolucion(hoy, 7),
    estado:                    EstadoPrestamo.Activo,
    responsable:               datos.responsable ?? '',
  })

  // 6. Decrementar disponibilidad
  libro.disminuirDisponibilidad()
  await setDoc(doc(db, 'libros', isbn), {
    ...libroSnap.data(),
    cantidad_disponible: libro.cantidad_disponible,
  })

  return identificador
}

export const procesarDevolucion = async (
  idPrestamo: string,
): Promise<{ multa: number; diasRetraso: number }> => {
  const prestamoSnap = await getDoc(doc(db, 'prestamos', idPrestamo))
  if (!prestamoSnap.exists()) throw new Error('PRESTAMO_NO_ENCONTRADO')

  const prestamo    = docToPrestamo(idPrestamo, prestamoSnap.data())
  const hoy         = new Date()
  const diasRetraso = prestamo.calcularDiasRetraso(hoy)
  let multa         = 0

  if (diasRetraso > 0) {
    prestamo.marcarComoAtrasado()
    const lectorRef  = doc(db, 'lectores', prestamo.id_lector)
    const lectorSnap = await getDoc(lectorRef)
    if (lectorSnap.exists()) {
      const lector = docToLector(prestamo.id_lector, lectorSnap.data())
      lector.suspender(DIAS_SUSPENSION)
      await setDoc(lectorRef, {
        ...lectorSnap.data(),
        estado:               lector.estado,
        fecha_fin_suspension: lector.fecha_fin_suspension,
      })
    }
    multa = diasRetraso * MULTA_POR_DIA
  }

  prestamo.finalizar()
  await setDoc(doc(db, 'prestamos', idPrestamo), {
    ...prestamoSnap.data(),
    estado: prestamo.estado,
  })

  // Incrementar disponibilidad
  const libroRef  = doc(db, 'libros', prestamo.isbn_libro)
  const libroSnap = await getDoc(libroRef)
  if (libroSnap.exists()) {
    const libro = docToLibro(prestamo.isbn_libro, libroSnap.data())
    libro.aumentarDisponibilidad()
    await setDoc(libroRef, {
      ...libroSnap.data(),
      cantidad_disponible: libro.cantidad_disponible,
    })
  }

  return { multa, diasRetraso }
}

export const obtenerPrestamosRecientes = async (): Promise<Record<string, any>[]> => {
  const snap = await getDocs(collection(db, 'prestamos'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
