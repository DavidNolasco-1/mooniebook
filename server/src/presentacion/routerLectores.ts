import { Router } from 'express'
import type { Request, Response } from 'express'
import type { ModuloLectores } from '../aplicacion/ModuloLectores.js'

function handleError(res: Response, err: unknown): void {
  if (err instanceof Error) {
    res.status(400).json({ error: err.message })
  } else {
    res.status(500).json({ error: 'ERROR_INTERNO' })
  }
}

export function routerLectores(modLectores: ModuloLectores): Router {
  const router = Router()

  // POST /lectores — registrar nuevo lector
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { correo } = req.body as { correo: string }
      const id = await modLectores.registrarLector(correo)
      res.status(201).json({ id })
    } catch (err) {
      handleError(res, err)
    }
  })

  // PUT /lectores/:id — modificar correo
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { nuevo_correo } = req.body as { nuevo_correo: string }
      await modLectores.modificarLector(req.params['id'] as string, nuevo_correo)
      res.json({ ok: true })
    } catch (err) {
      handleError(res, err)
    }
  })

  return router
}
