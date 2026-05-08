import type { IRepositorioLectores } from '../dominio/interfaces/IRepositorioLectores.js'

const MULTA_POR_DIA  = 50
const DIAS_SUSPENSION = 30

export class ModuloPenalizaciones {
  constructor(private repoLectores: IRepositorioLectores) {}

  async procesarRetraso(id_lector: string, dias_retraso: number): Promise<{ multa: number }> {
    const lector = await this.repoLectores.buscarPorId(id_lector)
    if (!lector) throw new Error('LECTOR_NO_ENCONTRADO')
    lector.suspender(DIAS_SUSPENSION)
    await this.repoLectores.guardar(lector)
    return { multa: dias_retraso * MULTA_POR_DIA }
  }
}
