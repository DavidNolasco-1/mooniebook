import { db } from './firebase.js'
import type { IRepositorioLibros } from '../dominio/interfaces/IRepositorioLibros.js'
import { Libro } from '../dominio/entidades/Libro.js'

export class RepositorioLibrosFirebase implements IRepositorioLibros {
  async guardar(libro: Libro): Promise<void> {
    await db.collection('libros').doc(libro.isbn).set({
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

  async buscarPorIsbn(isbn: string): Promise<Libro | null> {
    const snap = await db.collection('libros').doc(isbn).get()
    if (!snap.exists) return null
    const d = snap.data()!
    return new Libro(
      d['isbn'],
      d['titulo'],
      d['autor'],
      d['editorial'],
      d['categoria'],
      d['fecha_publicacion'],
      d['cantidad_total'],
      d['cantidad_disponible'],
    )
  }
}
