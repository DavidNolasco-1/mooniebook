import { Router } from 'express'
import type { Request, Response } from 'express'
import type { ModuloCatalogo } from '../aplicacion/ModuloCatalogo.js'
import { Libro } from '../dominio/entidades/Libro.js'

function handleError(res: Response, err: unknown): void {
  if (err instanceof Error) {
    res.status(400).json({ error: err.message })
  } else {
    res.status(500).json({ error: 'ERROR_INTERNO' })
  }
}

export function routerCatalogo(modCatalogo: ModuloCatalogo): Router {
  const router = Router()

  // POST /libros — registrar libro
  router.post('/', async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        isbn: string; titulo: string; autor: string; editorial: string
        categoria: string; fecha_publicacion: string
        cantidad_total: string; cantidad_disponible: string
      }
      const libro = new Libro(
        body.isbn, body.titulo, body.autor, body.editorial,
        body.categoria, body.fecha_publicacion,
        Number(body.cantidad_total), Number(body.cantidad_disponible),
      )
      await modCatalogo.registrarLibro(libro)
      res.status(201).json({ isbn: body.isbn })
    } catch (err) {
      handleError(res, err)
    }
  })

  // GET /libros/:isbn — consultar libro
  router.get('/:isbn', async (req: Request, res: Response) => {
    try {
      const libro = await modCatalogo.consultarLibro(req.params['isbn'] as string)
      if (!libro) {
        res.status(404).json({ error: 'LIBRO_NO_ENCONTRADO' })
        return
      }
      res.json(libro)
    } catch (err) {
      handleError(res, err)
    }
  })

  // PUT /libros/:isbn — modificar libro
  router.put('/:isbn', async (req: Request, res: Response) => {
    try {
      await modCatalogo.modificarLibro(req.params['isbn'] as string, req.body as Partial<Libro>)
      res.json({ ok: true })
    } catch (err) {
      handleError(res, err)
    }
  })

  return router
}
