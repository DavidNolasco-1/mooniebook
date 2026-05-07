import { db } from '@/lib/firebase'
import {
  collection, addDoc, getDocs,
  query, orderBy, limit,
  doc, getDoc,
} from 'firebase/firestore'

/**
 * Añade un nuevo lector a Firestore y retorna el ID de documento generado.
 */
export const registrarLector = async (datos: any): Promise<string> => {
  try {
    const ref = await addDoc(collection(db, 'lectores'), datos)
    return ref.id
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
