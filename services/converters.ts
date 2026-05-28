import { Libro } from '@/domain/entities/Libro'
import { Lector } from '@/domain/entities/Lector'
import { EstadoLector } from '@/domain/enums/EstadoLector'

export function docToLibro(isbn: string, d: Record<string, any>): Libro {
  return new Libro(
    d['isbn']              ?? isbn,
    d['titulo']            ?? '',
    d['autor']             ?? '',
    d['editorial']         ?? '',
    d['categoria']         ?? '',
    d['fecha_publicacion'] ?? '',
    Number(d['cantidad_total']) || 0,
    Number(d['cantidad_disponible'] ?? d['ejemplares']) || 0,
  )
}

export function docToLector(id: string, d: Record<string, any>): Lector {
  return new Lector(
    d['id']          ?? d['idLector'] ?? id,
    d['correo_electronico'] ?? d['correo'] ?? '',
    (d['estado'] as EstadoLector) ?? EstadoLector.Habilitado,
    d['fecha_fin_suspension'] ?? null,
  )
}
