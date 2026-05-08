import express from 'express'
import cors from 'cors'
import { RepositorioLibrosFirebase } from './src/datos/RepositorioLibrosFirebase.js'
import { RepositorioLectoresFirebase } from './src/datos/RepositorioLectoresFirebase.js'
import { RepositorioPrestamosFirebase } from './src/datos/RepositorioPrestamosFirebase.js'
import { ModuloPenalizaciones } from './src/aplicacion/ModuloPenalizaciones.js'
import { ModuloCatalogo } from './src/aplicacion/ModuloCatalogo.js'
import { ModuloLectores } from './src/aplicacion/ModuloLectores.js'
import { ModuloPrestamos } from './src/aplicacion/ModuloPrestamos.js'
import { routerCatalogo } from './src/presentacion/routerCatalogo.js'
import { routerLectores } from './src/presentacion/routerLectores.js'
import { routerPrestamos } from './src/presentacion/routerPrestamos.js'

const repoLibros        = new RepositorioLibrosFirebase()
const repoLectores      = new RepositorioLectoresFirebase()
const repoPrestamos     = new RepositorioPrestamosFirebase()
const modPenalizaciones = new ModuloPenalizaciones(repoLectores)
const modCatalogo       = new ModuloCatalogo(repoLibros)
const modLectores       = new ModuloLectores(repoLectores)
const modPrestamos      = new ModuloPrestamos(repoPrestamos, repoLectores, modCatalogo, modPenalizaciones)

const app = express()
app.use(cors())
app.use(express.json())

app.use('/libros',    routerCatalogo(modCatalogo))
app.use('/lectores',  routerLectores(modLectores))
app.use('/prestamos', routerPrestamos(modPrestamos))

app.get('/', (_req, res) => {
  res.json({
    mensaje: 'Bienvenido al sistema MoonieBook - UACM',
    documentacion: '/docs no disponible en Express, usa los endpoints directamente',
    estado: 'Capa de presentación activa',
    endpoints: ['/libros', '/lectores', '/prestamos'],
  })
})

app.listen(3000, () => console.log('Servidor MoonieBook corriendo en puerto 3000'))
