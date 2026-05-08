import { db } from './firebase.js'
import type { IRepositorioPrestamos } from '../dominio/interfaces/IRepositorioPrestamos.js'
import { Prestamo } from '../dominio/entidades/Prestamo.js'
import { EstadoPrestamo } from '../dominio/enums/EstadoPrestamo.js'

export class RepositorioPrestamosFirebase implements IRepositorioPrestamos {
  async guardar(prestamo: Prestamo): Promise<void> {
    await db.collection('prestamos').doc(prestamo.identificador).set({
      identificador:             prestamo.identificador,
      id_lector:                 prestamo.id_lector,
      isbn_libro:                prestamo.isbn_libro,
      fecha_prestamo:            prestamo.fecha_prestamo,
      fecha_devolucion_esperada: prestamo.fecha_devolucion_esperada,
      estado:                    prestamo.estado,
    })
  }

  async buscarPorId(id: string): Promise<Prestamo | null> {
    const snap = await db.collection('prestamos').doc(id).get()
    if (!snap.exists) return null
    const d = snap.data()!
    return new Prestamo(
      d['identificador'],
      d['id_lector'],
      d['isbn_libro'],
      d['fecha_prestamo'],
      d['fecha_devolucion_esperada'],
      d['estado'] as EstadoPrestamo,
    )
  }

  async obtenerTodos(): Promise<Prestamo[]> {
    const snap = await db.collection('prestamos')
      .orderBy('fecha_prestamo', 'desc')
      .get()
    return snap.docs.map((doc) => {
      const d = doc.data()
      return new Prestamo(
        d['identificador'],
        d['id_lector'],
        d['isbn_libro'],
        d['fecha_prestamo'],
        d['fecha_devolucion_esperada'],
        d['estado'] as EstadoPrestamo,
      )
    })
  }

  async contarTotal(): Promise<number> {
    const snap = await db.collection('prestamos').count().get()
    return snap.data().count
  }
}
