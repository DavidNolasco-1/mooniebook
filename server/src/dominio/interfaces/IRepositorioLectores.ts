import type { Lector } from '../entidades/Lector.js'

export interface IRepositorioLectores {
  guardar(lector: Lector): Promise<void>
  buscarPorId(id: string): Promise<Lector | null>
  contarTotal(): Promise<number>
  obtenerTodos(): Promise<Lector[]>
}
