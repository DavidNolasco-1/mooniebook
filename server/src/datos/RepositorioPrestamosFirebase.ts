import { db } from './firebase.js'
import type { IRepositorioPrestamos } from '../dominio/interfaces/IRepositorioPrestamos.js'
import { Prestamo } from '../dominio/entidades/Prestamo.js'
import { EstadoPrestamo } from '../dominio/enums/EstadoPrestamo.js'

function docToPrestamo(id: string, d: FirebaseFirestore.DocumentData): Prestamo {
  const estadoRaw = (d['estado'] as string) === 'Devuelto'
    ? EstadoPrestamo.Finalizado
    : d['estado'] as EstadoPrestamo

  return new Prestamo(
    d['identificador']             ?? id,
    d['id_lector']                 ?? d['idLector']   ?? '',
    d['isbn_libro']                ?? d['isbn']        ?? '',
    d['fecha_prestamo']            ?? d['fechaSalida'] ?? '',
    d['fecha_devolucion_esperada'] ?? d['fechaEntrega'] ?? '',
    estadoRaw,
  )
}

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
    return docToPrestamo(snap.id, snap.data()!)
  }

  async obtenerTodos(): Promise<Prestamo[]> {
    const snap = await db.collection('prestamos').get()
    return snap.docs.map((doc) => docToPrestamo(doc.id, doc.data()))
  }

  async contarTotal(): Promise<number> {
    const snap = await db.collection('prestamos').count().get()
    return snap.data().count
  }
}
