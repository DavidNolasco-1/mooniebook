import { db } from '@/lib/firebase'
import { collection, getDocs, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore'

/**
 * Guarda un libro en Firestore usando el ISBN como ID de documento.
 */
export const registrarLibro = async (datos: any, isbn: string): Promise<void> => {
  try {
    await setDoc(doc(db, 'libros', isbn), { ...datos, isbn, ejemplares: Number(datos.ejemplares) })
  } catch (error) {
    console.error('registrarLibro:', error)
    throw error
  }
}

/**
 * Retorna todos los libros de la colección 'libros'.
 */
export const obtenerCatalogo = async (): Promise<any[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'libros'))
    return snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }))
  } catch (error) {
    console.error('obtenerCatalogo:', error)
    throw error
  }
}

/**
 * Busca un libro por ISBN (ID de documento). Retorna null si no existe.
 */
export const actualizarLibro = async (isbn: string, datos: any): Promise<void> => {
  try {
    await updateDoc(doc(db, 'libros', isbn), { ...datos, ejemplares: Number(datos.ejemplares) })
  } catch (error) {
    console.error('actualizarLibro:', error)
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
