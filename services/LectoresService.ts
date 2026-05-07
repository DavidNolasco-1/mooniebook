import { db } from '@/lib/firebase'
import {
  collection, getDocs, setDoc,
  query, orderBy, limit,
  doc, getDoc,
} from 'firebase/firestore'

/**
 * Registra un lector con ID secuencial L-001, L-002, etc.
 * Cuenta los documentos existentes para calcular el siguiente número.
 */
export const registrarLector = async (datos: any): Promise<string> => {
  try {
    const snapshot = await getDocs(collection(db, 'lectores'))
    const nuevoId = `L-${String(snapshot.size + 1).padStart(3, '0')}`
    await setDoc(doc(db, 'lectores', nuevoId), { ...datos, idLector: nuevoId })
    return nuevoId
  } catch (error) {
    console.error('registrarLector:', error)
    throw error
  }
}

/**
 * Retorna los últimos 5 lectores ordenados por ID descendente.
 * Requiere un índice compuesto si se añade un campo timestamp en el futuro.
 */
export const obtenerLectoresRecientes = async (): Promise<any[]> => {
  try {
    // TODO: cambiar a orderBy('creadoEn', 'desc') cuando se añada timestamp al schema
    const q = query(collection(db, 'lectores'), orderBy('id', 'desc'), limit(5))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }))
  } catch (error) {
    console.error('obtenerLectoresRecientes:', error)
    throw error
  }
}

/**
 * Busca un lector por su ID de documento en Firestore.
 * Retorna null si no existe.
 */
export const buscarLectorPorId = async (id: string): Promise<any | null> => {
  try {
    const ref = doc(db, 'lectores', id)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) return null
    return { id: snapshot.id, ...snapshot.data() }
  } catch (error) {
    console.error('buscarLectorPorId:', error)
    throw error
  }
}
