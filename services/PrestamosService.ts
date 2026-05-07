import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, getDoc, doc, updateDoc } from 'firebase/firestore'

export const registrarPrestamo = async (datos: any): Promise<string> => {
  const { idLector, isbn } = datos

  const lectorSnap = await getDoc(doc(db, 'lectores', idLector))
  if (!lectorSnap.exists())
    throw new Error('El lector no está registrado.')
  if (lectorSnap.data().estado !== 'Habilitado')
    throw new Error('El lector no está habilitado para pedir libros.')

  const libroSnap = await getDoc(doc(db, 'libros', isbn))
  if (!libroSnap.exists())
    throw new Error('El libro no existe en el catálogo.')
  if ((libroSnap.data().ejemplares ?? 0) <= 0)
    throw new Error('El libro no se encuentra disponible en este momento.')

  const ref = await addDoc(collection(db, 'prestamos'), { ...datos, estado: 'Activo' })

  await updateDoc(doc(db, 'libros', isbn), {
    ejemplares: libroSnap.data().ejemplares - 1,
  })

  return ref.id
}

export const procesarDevolucion = async (idPrestamo: string, isbn: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'prestamos', idPrestamo), { estado: 'Devuelto' })

    const libroSnap = await getDoc(doc(db, 'libros', isbn))
    if (libroSnap.exists()) {
      await updateDoc(doc(db, 'libros', isbn), {
        ejemplares: (libroSnap.data().ejemplares ?? 0) + 1,
      })
    }
  } catch (error) {
    console.error('procesarDevolucion:', error)
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
