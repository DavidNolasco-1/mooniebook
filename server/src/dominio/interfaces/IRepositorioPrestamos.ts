import type { Prestamo } from '../entidades/Prestamo.js'

export interface IRepositorioPrestamos {
  guardar(prestamo: Prestamo): Promise<void>
  buscarPorId(id: string): Promise<Prestamo | null>
  obtenerTodos(): Promise<Prestamo[]>
  contarTotal(): Promise<number>
}
