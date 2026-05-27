import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Lector } from '@/domain/entities/Lector'
import { EstadoLector } from '@/domain/enums/EstadoLector'

function docToLector(id: string, d: Record<string, any>): Lector {
  return new Lector(
    d['id'] ?? d['idLector'] ?? id,
    d['correo_electronico'] ?? d['correo'] ?? '',
    (d['estado'] as EstadoLector) ?? EstadoLector.Habilitado,
    d['fecha_fin_suspension'] ?? null,
  )
}

export const registrarLector = async (datos: {
  correo: string; responsable?: string
}): Promise<string> => {
  const snap = await getDocs(collection(db, 'lectores'))
  const total = snap.size
  const id    = `L-${String(total + 1).padStart(3, '0')}`
  await setDoc(doc(db, 'lectores', id), {
    id,
    correo_electronico:   datos.correo,
    estado:               EstadoLector.Habilitado,
    fecha_fin_suspension: null,
    responsable:          datos.responsable ?? '',
  })
  return id
}

export const buscarLectorPorId = async (id: string): Promise<Record<string, any> | null> => {
  const snap = await getDoc(doc(db, 'lectores', id))
  if (!snap.exists()) return null
  const lector = docToLector(id, snap.data())
  return {
    id:                   lector.id,
    correo_electronico:   lector.correo_electronico,
    estado:               lector.estado,
    fecha_fin_suspension: lector.fecha_fin_suspension,
  }
}

export const actualizarLector = async (id: string, datos: { correo: string; estado?: string }): Promise<void> => {
  const snap = await getDoc(doc(db, 'lectores', id))
  if (!snap.exists()) throw new Error('LECTOR_NO_ENCONTRADO')
  const lector = docToLector(id, snap.data())
  lector.setCorreo(datos.correo)
  const updates: Record<string, unknown> = {
    ...snap.data(),
    correo_electronico: lector.correo_electronico,
  }
  if (datos.estado !== undefined) updates['estado'] = datos.estado
  await setDoc(doc(db, 'lectores', id), updates)
}

export const obtenerLectoresRecientes = async (): Promise<Record<string, any>[]> => {
  const snap = await getDocs(collection(db, 'lectores'))
  return snap.docs.map((d) => {
    const lector = docToLector(d.id, d.data())
    return {
      id:                   lector.id,
      correo_electronico:   lector.correo_electronico,
      estado:               lector.estado,
      fecha_fin_suspension: lector.fecha_fin_suspension,
    }
  })
}
