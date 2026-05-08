const BASE = process.env.EXPO_PUBLIC_SERVER_URL

export const registrarLibro = async (datos: any) => {
  const res = await fetch(`${BASE}/libros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return res.json()
}

export const consultarLibro = async (isbn: string) => {
  const res = await fetch(`${BASE}/libros/${isbn}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error((await res.json()).error)
  return res.json()
}

export const actualizarLibro = async (isbn: string, datos: any) => {
  const res = await fetch(`${BASE}/libros/${isbn}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return res.json()
}

export const obtenerLibrosRecientes = async () => {
  const res = await fetch(`${BASE}/libros`)
  if (!res.ok) return []
  return res.json()
}
