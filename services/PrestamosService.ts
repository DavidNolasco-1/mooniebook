import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

export const registrarPrestamo = async (datos: any): Promise<string> => {
  try {
    const ref = await addDoc(collection(db, 'prestamos'), datos)
    return ref.id
  } catch (error) {
    console.error('registrarPrestamo:', error)
    throw error
  }
}

export const obtenerPrestamosRecientes = async (): Promise<any[]> => {
  try {
    const q = query(collection(db, 'prestamos'), orderBy('fechaSalida', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }))
  } catch (error) {
    console.error('obtenerPrestamosRecientes:', error)
    throw error
  }
}
