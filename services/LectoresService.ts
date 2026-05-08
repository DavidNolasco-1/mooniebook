const BASE = process.env.EXPO_PUBLIC_SERVER_URL

export const registrarLector = async (datos: any) => {
  const res = await fetch(`${BASE}/lectores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return res.json()
}

export const buscarLectorPorId = async (id: string) => {
  const res = await fetch(`${BASE}/lectores/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error((await res.json()).error)
  return res.json()
}

export const actualizarLector = async (id: string, datos: any) => {
  const res = await fetch(`${BASE}/lectores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return res.json()
}

export const obtenerLectoresRecientes = async () => {
  const res = await fetch(`${BASE}/lectores`)
  if (!res.ok) return []
  return res.json()
}
