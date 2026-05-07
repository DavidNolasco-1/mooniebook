import type { IRepositorioPrestamos } from '../dominio/interfaces/IRepositorioPrestamos.js'
import type { IRepositorioLectores } from '../dominio/interfaces/IRepositorioLectores.js'
import { Prestamo } from '../dominio/entidades/Prestamo.js'
import { EstadoPrestamo } from '../dominio/enums/EstadoPrestamo.js'
import type { ModuloCatalogo } from './ModuloCatalogo.js'
import type { ModuloPenalizaciones } from './ModuloPenalizaciones.js'

function calcularFechaDevolucion(inicio: Date, diasHabiles: number): string {
  const fecha = new Date(inicio.getTime())
  let contados = 0
  while (contados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1)
    const dia = fecha.getDay() // 0=Dom, 6=Sab
    if (dia !== 0 && dia !== 6) contados++
  }
  return fecha.toISOString().split('T')[0]!
}

export class ModuloPrestamos {
  constructor(
    private repoPrestamos:    IRepositorioPrestamos,
    private repoLectores:     IRepositorioLectores,
    private modCatalogo:      ModuloCatalogo,
    private modPenalizaciones: ModuloPenalizaciones,
  ) {}

  async obtenerTodos(): Promise<Prestamo[]> {
    return this.repoPrestamos.obtenerTodos()
  }

  async registrarPrestamo(id_lector: string, isbn: string): Promise<string> {
    // 1. Lector existe y tiene derecho
    const lector = await this.repoLectores.buscarPorId(id_lector)
    if (!lector || !lector.tieneDerecho()) throw new Error('LECTOR_SIN_DERECHO')

    // 2. Libro existe
    const libro = await this.modCatalogo.consultarLibro(isbn)
    if (!libro) throw new Error('LIBRO_NO_ENCONTRADO')

    // 3. Hay ejemplares disponibles
    if (!libro.estaDisponible()) throw new Error('SIN_EJEMPLARES')

    // 4. Sin préstamo activo para este lector
    const todos = await this.repoPrestamos.obtenerTodos()
    const tieneActivo = todos.some(
      (p) => p.id_lector === id_lector && p.estado === EstadoPrestamo.Activo,
    )
    if (tieneActivo) throw new Error('PRESTAMO_ACTIVO_EXISTENTE')

    // 5–7. Crear y guardar préstamo
    const total         = await this.repoPrestamos.contarTotal()
    const identificador = `P-${String(total + 1).padStart(3, '0')}`
    const hoy           = new Date()
    const prestamo = new Prestamo(
      identificador,
      id_lector,
      isbn,
      hoy.toISOString().split('T')[0]!,
      calcularFechaDevolucion(hoy, 7),
      EstadoPrestamo.Activo,
    )
    await this.repoPrestamos.guardar(prestamo)

    // 8. Descontar disponibilidad
    await this.modCatalogo.actualizarDisponibilidad(isbn, 'disminuir')

    return identificador
  }

  async registrarDevolucion(
    id_prestamo: string,
    fecha_actual: Date,
  ): Promise<{ multa: number; diasRetraso: number }> {
    const prestamo = await this.repoPrestamos.buscarPorId(id_prestamo)
    if (!prestamo) throw new Error('PRESTAMO_NO_ENCONTRADO')

    const diasRetraso = prestamo.calcularDiasRetraso(fecha_actual)

    let multa = 0
    if (diasRetraso > 0) {
      prestamo.marcarComoAtrasado()
      const resultado = await this.modPenalizaciones.procesarRetraso(prestamo.id_lector, diasRetraso)
      multa = resultado.multa
    }

    prestamo.finalizar()
    await this.repoPrestamos.guardar(prestamo)
    await this.modCatalogo.actualizarDisponibilidad(prestamo.isbn_libro, 'aumentar')

    return { multa, diasRetraso }
  }
}
