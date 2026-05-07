import { Lector } from '../entidades/Lector'

export interface IRepositorioLectores {
  guardar(lector: Lector): Promise<void>
  buscarPorId(id: string): Promise<Lector | null>
  contarTotal(): Promise<number>
}
