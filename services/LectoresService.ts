import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EstadoLector } from '@/domain/enums/EstadoLector'
import { docToLector } from '@/services/converters'

export const registrarLector = async (datos: {
  correo: string; responsable?: string
}): Promise<string> => {
  const snap = await getDocs(collection(db, 'lectores'))
  const total = snap.size
  const id    = `L-${String(total + 1).padStart(3, '0')}`
  const hoy = new Date()
  const fecha_registro = `${String(hoy.getDate()).padStart(2,'0')}/${String(hoy.getMonth()+1).padStart(2,'0')}/${hoy.getFullYear()}`
  await setDoc(doc(db, 'lectores', id), {
    id,
    correo_electronico:   datos.correo,
    estado:               EstadoLector.Habilitado,
    fecha_fin_suspension: null,
    responsable:          datos.responsable ?? '',
    fecha_registro,
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
    const raw    = d.data()
    const lector = docToLector(d.id, raw)
    return {
      id:                   lector.id,
      correo_electronico:   lector.correo_electronico,
      estado:               lector.estado,
      fecha_fin_suspension: lector.fecha_fin_suspension,
      fecha_registro:       raw['fecha_registro'] ?? '—',
      responsable:          raw['responsable']    ?? '—',
    }
  })
}
