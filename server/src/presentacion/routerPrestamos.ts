import { Router } from 'express'
import type { Request, Response } from 'express'
import type { ModuloPrestamos } from '../aplicacion/ModuloPrestamos.js'

function handleError(res: Response, err: unknown): void {
  if (err instanceof Error) {
    res.status(400).json({ error: err.message })
  } else {
    res.status(500).json({ error: 'ERROR_INTERNO' })
  }
}

export function routerPrestamos(modPrestamos: ModuloPrestamos): Router {
  const router = Router()

  // POST /prestamos — registrar nuevo préstamo
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { id_lector, isbn } = req.body as { id_lector: string; isbn: string }
      const identificador = await modPrestamos.registrarPrestamo(id_lector, isbn)
      res.status(201).json({ identificador })
    } catch (err) {
      handleError(res, err)
    }
  })

  // GET /prestamos — historial completo
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const prestamos = await modPrestamos.obtenerTodos()
      res.json(prestamos)
    } catch (err) {
      handleError(res, err)
    }
  })

  // GET /prestamos/:id — consultar préstamo por ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const prestamo = await modPrestamos.buscarPorId(req.params['id'] as string)
      if (!prestamo) {
        res.status(404).json({ error: 'PRESTAMO_NO_ENCONTRADO' })
        return
      }
      res.json(prestamo)
    } catch (err) {
      handleError(res, err)
    }
  })

  // POST /prestamos/:id/devolucion — registrar devolución
  router.post('/:id/devolucion', async (req: Request, res: Response) => {
    try {
      const resultado = await modPrestamos.registrarDevolucion(req.params['id'] as string, new Date())
      res.json(resultado)
    } catch (err) {
      handleError(res, err)
    }
  })

  return router
}
