const BASE = process.env.EXPO_PUBLIC_SERVER_URL

export const registrarPrestamo = async (datos: any) => {
  const res = await fetch(`${BASE}/prestamos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return res.json()
}

export const procesarDevolucion = async (idPrestamo: string) => {
  const res = await fetch(`${BASE}/prestamos/${idPrestamo}/devolucion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return res.json()
}

export const obtenerPrestamosRecientes = async () => {
  const res = await fetch(`${BASE}/prestamos`)
  if (!res.ok) return []
  return res.json()
}
