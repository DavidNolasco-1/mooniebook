import type { IRepositorioLibros } from '../dominio/interfaces/IRepositorioLibros.js'
import { Libro } from '../dominio/entidades/Libro.js'

export class ModuloCatalogo {
  constructor(private repoLibros: IRepositorioLibros) {}

  async registrarLibro(libro: Libro): Promise<void> {
    const existente = await this.repoLibros.buscarPorIsbn(libro.isbn)
    if (existente) throw new Error('ISBN_DUPLICADO')
    await this.repoLibros.guardar(libro)
  }

  async modificarLibro(isbn: string, datos: Partial<Libro>): Promise<void> {
    const libro = await this.repoLibros.buscarPorIsbn(isbn)
    if (!libro) throw new Error('LIBRO_NO_ENCONTRADO')
    if (datos.titulo            !== undefined) libro.titulo            = datos.titulo
    if (datos.autor             !== undefined) libro.autor             = datos.autor
    if (datos.editorial         !== undefined) libro.editorial         = datos.editorial
    if (datos.categoria         !== undefined) libro.categoria         = datos.categoria
    if (datos.fecha_publicacion !== undefined) libro.fecha_publicacion = datos.fecha_publicacion
    if (datos.cantidad_total    !== undefined) libro.cantidad_total    = datos.cantidad_total
    if (datos.cantidad_disponible !== undefined) libro.cantidad_disponible = datos.cantidad_disponible
    await this.repoLibros.guardar(libro)
  }

  async actualizarDisponibilidad(isbn: string, operacion: 'disminuir' | 'aumentar'): Promise<void> {
    const libro = await this.repoLibros.buscarPorIsbn(isbn)
    if (!libro) throw new Error('LIBRO_NO_ENCONTRADO')
    operacion === 'disminuir' ? libro.disminuirDisponibilidad() : libro.aumentarDisponibilidad()
    await this.repoLibros.guardar(libro)
  }

  async consultarLibro(isbn: string): Promise<Libro | null> {
    return this.repoLibros.buscarPorIsbn(isbn)
  }
}
