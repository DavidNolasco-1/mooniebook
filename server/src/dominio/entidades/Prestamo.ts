import { EstadoPrestamo } from '../enums/EstadoPrestamo.js'

export class Prestamo {
  identificador: string
  id_lector: string
  isbn_libro: string
  fecha_prestamo: string
  fecha_devolucion_esperada: string
  estado: EstadoPrestamo

  constructor(
    identificador: string,
    id_lector: string,
    isbn_libro: string,
    fecha_prestamo: string,
    fecha_devolucion_esperada: string,
    estado: EstadoPrestamo,
  ) {
    this.identificador           = identificador
    this.id_lector               = id_lector
    this.isbn_libro              = isbn_libro
    this.fecha_prestamo          = fecha_prestamo
    this.fecha_devolucion_esperada = fecha_devolucion_esperada
    this.estado                  = estado
  }

  finalizar(): void {
    this.estado = EstadoPrestamo.Finalizado
  }

  calcularDiasRetraso(fecha_actual: Date): number {
    const esperada = new Date(this.fecha_devolucion_esperada)
    const diff     = fecha_actual.getTime() - esperada.getTime()
    if (diff <= 0) return 0
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  marcarComoAtrasado(): void {
    this.estado = EstadoPrestamo.Atrasado
  }
}
