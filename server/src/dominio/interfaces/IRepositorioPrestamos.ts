import { Prestamo } from '../entidades/Prestamo'

export interface IRepositorioPrestamos {
  guardar(prestamo: Prestamo): Promise<void>
  buscarPorId(id: string): Promise<Prestamo | null>
  obtenerTodos(): Promise<Prestamo[]>
  contarTotal(): Promise<number>
}
