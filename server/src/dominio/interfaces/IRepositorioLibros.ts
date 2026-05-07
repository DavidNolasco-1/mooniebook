import { Libro } from '../entidades/Libro'

export interface IRepositorioLibros {
  guardar(libro: Libro): Promise<void>
  buscarPorIsbn(isbn: string): Promise<Libro | null>
}
