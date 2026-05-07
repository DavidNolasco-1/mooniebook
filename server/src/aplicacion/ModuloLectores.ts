import type { IRepositorioLectores } from '../dominio/interfaces/IRepositorioLectores.js'
import { Lector } from '../dominio/entidades/Lector.js'
import { EstadoLector } from '../dominio/enums/EstadoLector.js'

export class ModuloLectores {
  constructor(private repoLectores: IRepositorioLectores) {}

  async registrarLector(correo: string): Promise<string> {
    const total = await this.repoLectores.contarTotal()
    const id    = `L-${String(total + 1).padStart(3, '0')}`
    const lector = new Lector(id, correo, EstadoLector.Habilitado, null)
    await this.repoLectores.guardar(lector)
    return id
  }

  async modificarLector(id: string, nuevo_correo: string): Promise<void> {
    const lector = await this.repoLectores.buscarPorId(id)
    if (!lector) throw new Error('LECTOR_NO_ENCONTRADO')
    lector.setCorreo(nuevo_correo)
    await this.repoLectores.guardar(lector)
  }
}
