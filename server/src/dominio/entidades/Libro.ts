export class Libro {
  isbn: string
  titulo: string
  autor: string
  editorial: string
  categoria: string
  fecha_publicacion: string
  cantidad_total: number
  cantidad_disponible: number

  constructor(
    isbn: string,
    titulo: string,
    autor: string,
    editorial: string,
    categoria: string,
    fecha_publicacion: string,
    cantidad_total: number,
    cantidad_disponible: number,
  ) {
    this.isbn               = isbn
    this.titulo             = titulo
    this.autor              = autor
    this.editorial          = editorial
    this.categoria          = categoria
    this.fecha_publicacion  = fecha_publicacion
    this.cantidad_total     = cantidad_total
    this.cantidad_disponible = cantidad_disponible
  }

  disminuirDisponibilidad(): void {
    if (this.cantidad_disponible === 0) throw new Error('SIN_EJEMPLARES')
    this.cantidad_disponible -= 1
  }

  aumentarDisponibilidad(): void {
    if (this.cantidad_disponible < this.cantidad_total) {
      this.cantidad_disponible += 1
    }
  }

  estaDisponible(): boolean {
    return this.cantidad_disponible > 0
  }
}
