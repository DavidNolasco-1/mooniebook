import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Libro } from '@/domain/entities/Libro'

function docToLibro(isbn: string, d: Record<string, any>): Libro {
  return new Libro(
    d['isbn']                ?? isbn,
    d['titulo']              ?? '',
    d['autor']               ?? '',
    d['editorial']           ?? '',
    d['categoria']           ?? '',
    d['fecha_publicacion']   ?? '',
    Number(d['cantidad_total'])      || 0,
    Number(d['cantidad_disponible'] ?? d['ejemplares']) || 0,
  )
}

export const registrarLibro = async (datos: {
  isbn: string; titulo: string; autor: string; editorial: string
  fechaPublicacion: string; ejemplares: string; categoria: string
}): Promise<void> => {
  const existente = await consultarLibro(datos.isbn)
  if (existente) throw new Error('ISBN_DUPLICADO')

  const cantidad = parseInt(datos.ejemplares ?? '0', 10)
  await setDoc(doc(db, 'libros', datos.isbn), {
    isbn:                datos.isbn,
    titulo:              datos.titulo,
    autor:               datos.autor,
    editorial:           datos.editorial,
    categoria:           datos.categoria,
    fecha_publicacion:   datos.fechaPublicacion,
    cantidad_total:      cantidad,
    cantidad_disponible: cantidad,
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
  }
}

export const buscarLibroPorIsbn = consultarLibro

export const actualizarLibro = async (isbn: string, datos: Partial<{
  titulo: string; autor: string; editorial: string
  categoria: string; fechaPublicacion: string; cantidad_total: number; ejemplares: number
}>): Promise<void> => {
  const snap = await getDoc(doc(db, 'libros', isbn))
  if (!snap.exists()) throw new Error('LIBRO_NO_ENCONTRADO')
  const libro = docToLibro(isbn, snap.data())
  if (datos.titulo           !== undefined) libro.titulo            = datos.titulo
  if (datos.autor            !== undefined) libro.autor             = datos.autor
  if (datos.editorial        !== undefined) libro.editorial         = datos.editorial
  if (datos.categoria        !== undefined) libro.categoria         = datos.categoria
  if (datos.fechaPublicacion !== undefined) libro.fecha_publicacion = datos.fechaPublicacion
  if (datos.cantidad_total   !== undefined) libro.cantidad_total    = datos.cantidad_total
  if (datos.ejemplares       !== undefined) libro.cantidad_total    = datos.ejemplares
  await setDoc(doc(db, 'libros', isbn), {
    isbn:                libro.isbn,
    titulo:              libro.titulo,
    autor:               libro.autor,
    editorial:           libro.editorial,
    categoria:           libro.categoria,
    fecha_publicacion:   libro.fecha_publicacion,
    cantidad_total:      libro.cantidad_total,
    cantidad_disponible: libro.cantidad_disponible,
  })
}

export const obtenerLibrosRecientes = async (): Promise<Record<string, any>[]> => {
  const snap = await getDocs(collection(db, 'libros'))
  return snap.docs.map((d) => {
    const libro = docToLibro(d.id, d.data())
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
    }
  })
}
