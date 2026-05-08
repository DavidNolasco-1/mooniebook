import { db } from './firebase.js'
import type { IRepositorioLectores } from '../dominio/interfaces/IRepositorioLectores.js'
import { Lector } from '../dominio/entidades/Lector.js'
import { EstadoLector } from '../dominio/enums/EstadoLector.js'

export class RepositorioLectoresFirebase implements IRepositorioLectores {
  async guardar(lector: Lector): Promise<void> {
    await db.collection('lectores').doc(lector.id).set({
      id:                   lector.id,
      correo_electronico:   lector.correo_electronico,
      estado:               lector.estado,
      fecha_fin_suspension: lector.fecha_fin_suspension,
    })
  }

  async buscarPorId(id: string): Promise<Lector | null> {
    const snap = await db.collection('lectores').doc(id).get()
    if (!snap.exists) return null
    const d = snap.data()!
    return new Lector(
      d['id']                   ?? id,
      d['correo_electronico']   ?? d['correo'] ?? '',
      d['estado']               as EstadoLector,
      d['fecha_fin_suspension'] ?? null,
    )
  }

  async contarTotal(): Promise<number> {
    const snap = await db.collection('lectores').count().get()
    return snap.data().count
  }
}
