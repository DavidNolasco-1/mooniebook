import type { Libro } from '../entidades/Libro.js'

export interface IRepositorioLibros {
  guardar(libro: Libro): Promise<void>
  buscarPorIsbn(isbn: string): Promise<Libro | null>
  obtenerTodos(): Promise<Libro[]>
}
