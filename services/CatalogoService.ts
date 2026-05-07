import { db } from '@/lib/firebase'
import { collection, getDocs, setDoc, doc, getDoc, updateDoc, query, orderBy, limit } from 'firebase/firestore'

export const registrarLibro = async (datos: any): Promise<void> => {
  try {
    await setDoc(doc(db, 'libros', datos.isbn), {
      ...datos,
      ejemplares: Number(datos.ejemplares),
    })
  } catch (error) {
    console.error('registrarLibro:', error)
    throw error
  }
}

export const obtenerLibrosRecientes = async (): Promise<any[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'libros'))
    return snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }))
  } catch (error) {
    console.error('obtenerLibrosRecientes:', error)
    throw error
  }
}

export const buscarLibroPorIsbn = async (isbn: string): Promise<any | null> => {
  try {
    const snapshot = await getDoc(doc(db, 'libros', isbn))
    if (!snapshot.exists()) return null
    return { id: snapshot.id, ...snapshot.data() }
  } catch (error) {
    console.error('buscarLibroPorIsbn:', error)
    throw error
  }
}

export const actualizarLibro = async (isbn: string, datos: any): Promise<void> => {
  try {
    await updateDoc(doc(db, 'libros', isbn), {
      ...datos,
      ejemplares: Number(datos.ejemplares),
    })
  } catch (error) {
    console.error('actualizarLibro:', error)
    throw error
  }
}
