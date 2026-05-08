import { EstadoLector } from '../enums/EstadoLector.js'

export class Lector {
  id: string
  correo_electronico: string
  estado: EstadoLector
  fecha_fin_suspension: string | null

  constructor(
    id: string,
    correo_electronico: string,
    estado: EstadoLector,
    fecha_fin_suspension: string | null,
  ) {
    this.id                   = id
    this.correo_electronico   = correo_electronico
    this.estado               = estado
    this.fecha_fin_suspension = fecha_fin_suspension
  }

  suspender(dias: number): void {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + dias)
    this.estado               = EstadoLector.Suspendido
    this.fecha_fin_suspension = fecha.toISOString().split('T')[0] ?? null
  }

  habilitar(): void {
    this.estado               = EstadoLector.Habilitado
    this.fecha_fin_suspension = null
  }

  tieneDerecho(): boolean {
    return this.estado === EstadoLector.Habilitado
  }

  setCorreo(nuevo_correo: string): void {
    this.correo_electronico = nuevo_correo
  }
}
