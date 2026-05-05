# CLAUDE.md — MoonieBook

## STACK
- **Cliente:** React Native + Expo + TypeScript + Expo Router
- **Servidor:** Node.js + Express + TypeScript
- **DB:** Firebase Realtime Database
- **Auth:** Firebase Authentication (sistema externo)
- **Entorno:** WSL Ubuntu 24.04 + VSCode + Expo Go

---

## ARQUITECTURA CLIENTE/SERVIDOR

```
React Native (cliente)
    ↓ fetch() HTTP/JSON a IP local
Servidor Express (TypeScript)
├── presentacion/  → routers HTTP
├── aplicacion/    → módulos de negocio
├── dominio/       → entidades + interfaces
└── datos/         → repositorios Firebase
```

---

## ESTRUCTURA DE CARPETAS

```
mooniebook/
├── server/
│   ├── src/
│   │   ├── dominio/
│   │   │   ├── entidades/
│   │   │   │   ├── Libro.ts
│   │   │   │   ├── Lector.ts
│   │   │   │   └── Prestamo.ts
│   │   │   ├── enums/
│   │   │   │   ├── EstadoPrestamo.ts
│   │   │   │   └── EstadoLector.ts
│   │   │   └── interfaces/
│   │   │       ├── IRepositorioLibros.ts
│   │   │       ├── IRepositorioLectores.ts
│   │   │       └── IRepositorioPrestamos.ts
│   │   ├── datos/
│   │   │   ├── firebase.ts
│   │   │   ├── RepositorioLibrosFirebase.ts
│   │   │   ├── RepositorioLectoresFirebase.ts
│   │   │   └── RepositorioPrestamosFirebase.ts
│   │   ├── aplicacion/
│   │   │   ├── ModuloCatalogo.ts
│   │   │   ├── ModuloLectores.ts
│   │   │   ├── ModuloPrestamos.ts
│   │   │   └── ModuloPenalizaciones.ts
│   │   └── presentacion/
│   │       ├── routerCatalogo.ts
│   │       ├── routerLectores.ts
│   │       └── routerPrestamos.ts
│   ├── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── app/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── (app)/
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── catalogo/
│   │   │   ├── index.tsx
│   │   │   ├── registrar.tsx
│   │   │   ├── modificar.tsx
│   │   │   └── consultar.tsx
│   │   ├── lectores/
│   │   │   ├── index.tsx
│   │   │   ├── registrar.tsx
│   │   │   └── modificar.tsx
│   │   └── prestamos/
│   │       ├── index.tsx
│   │       ├── registrar.tsx
│   │       ├── historial.tsx
│   │       └── devolucion.tsx
│   └── services/
│       ├── catalogoService.ts
│       ├── lectoresService.ts
│       └── prestamosService.ts
│
├── components/
│   ├── header.tsx
│   ├── form.tsx
│   ├── botones_gestion.tsx
│   ├── DrawerContent.tsx
│   ├── MovimientosTable.tsx
│   └── StatusBadge.tsx
│
└── CLAUDE.md
```

---

## DOMINIO

### Enums
```typescript
// EstadoPrestamo.ts
export enum EstadoPrestamo { Activo='Activo', Finalizado='Finalizado', Atrasado='Atrasado' }

// EstadoLector.ts
export enum EstadoLector { Habilitado='Habilitado', Suspendido='Suspendido' }
```

### Libro.ts
```typescript
class Libro {
  isbn: string; titulo: string; autor: string; editorial: string
  categoria: string; fecha_publicacion: string
  cantidad_total: number; cantidad_disponible: number

  disminuirDisponibilidad(): void  // resta 1, lanza error si ya es 0
  aumentarDisponibilidad(): void   // suma 1, no supera cantidad_total
  estaDisponible(): boolean        // retorna cantidad_disponible > 0
}
```

### Lector.ts
```typescript
class Lector {
  id: string; correo_electronico: string
  estado: EstadoLector; fecha_fin_suspension: string | null

  suspender(dias: number): void    // estado=Suspendido, calcula fecha_fin_suspension
  habilitar(): void                // estado=Habilitado, fecha_fin_suspension=null
  tieneDerecho(): boolean          // retorna estado === Habilitado
  setCorreo(nuevo_correo: string): void
}
```

### Prestamo.ts
```typescript
class Prestamo {
  identificador: string; id_lector: string; isbn_libro: string
  fecha_prestamo: string; fecha_devolucion_esperada: string
  estado: EstadoPrestamo

  finalizar(): void
  calcularDiasRetraso(fecha_actual: Date): number  // retorna 0 si no hay retraso
  marcarComoAtrasado(): void
}
```

---

## INTERFACES

```typescript
// IRepositorioLibros.ts
export interface IRepositorioLibros {
  guardar(libro: Libro): Promise<void>
  buscarPorIsbn(isbn: string): Promise<Libro | null>
}

// IRepositorioLectores.ts
export interface IRepositorioLectores {
  guardar(lector: Lector): Promise<void>
  buscarPorId(id: string): Promise<Lector | null>
  contarTotal(): Promise<number>
}

// IRepositorioPrestamos.ts
export interface IRepositorioPrestamos {
  guardar(prestamo: Prestamo): Promise<void>
  buscarPorId(id: string): Promise<Prestamo | null>
  obtenerTodos(): Promise<Prestamo[]>
  contarTotal(): Promise<number>
}
```

---

## FIREBASE — ESTRUCTURA DE NODOS

```json
{
  "libros": {
    "978-3-16-148410-0": { "isbn":"...", "titulo":"...", "autor":"...",
      "editorial":"...", "categoria":"...", "fecha_publicacion":"...",
      "cantidad_total":10, "cantidad_disponible":8 }
  },
  "lectores": {
    "L-001": { "id":"L-001", "correo_electronico":"...",
      "estado":"Habilitado", "fecha_fin_suspension":null }
  },
  "prestamos": {
    "P-001": { "identificador":"P-001", "id_lector":"L-001",
      "isbn_libro":"...", "fecha_prestamo":"2026-04-30",
      "fecha_devolucion_esperada":"2026-05-09", "estado":"Activo" }
  }
}
```

Variables de entorno en `.env` (nunca al repo):
```
FIREBASE_API_KEY=
FIREBASE_DATABASE_URL=
FIREBASE_PROJECT_ID=
```

---

## MÓDULOS DE APLICACIÓN

### ModuloLectores(repoLectores)
- `registrarLector(correo)` — genera ID formato `L-001` con contarTotal(), crea Lector con estado Habilitado, guarda
- `modificarLector(id, nuevo_correo)` — busca, setCorreo(), guarda

### ModuloCatalogo(repoLibros)
- `registrarLibro(libro)` — verifica ISBN no duplicado, guarda
- `modificarLibro(isbn, libro)` — verifica existe, guarda
- `actualizarDisponibilidad(isbn, 'disminuir'|'aumentar')` — busca, llama método, guarda
- `consultarLibro(isbn)` — retorna Libro | null

### ModuloPenalizaciones(repoLectores)
- Constantes: `MULTA_POR_DIA=50`, `DIAS_SUSPENSION=30`
- `procesarRetraso(id_lector, dias_retraso)` — busca lector, suspender(30), guarda, retorna `{ multa: dias * 50 }`

### ModuloPrestamos(repoPrestamos, repoLectores, modCatalogo, modPenalizaciones)
- `registrarPrestamo(id_lector, isbn)`:
  1. Verifica lector existe y tieneDerecho() → error `'LECTOR_SIN_DERECHO'`
  2. Verifica libro existe → error `'LIBRO_NO_ENCONTRADO'`
  3. Verifica estaDisponible() → error `'SIN_EJEMPLARES'`
  4. Verifica no tiene préstamo Activo → error `'PRESTAMO_ACTIVO_EXISTENTE'`
  5. Genera ID `P-001` con contarTotal()
  6. fecha_devolucion_esperada = fecha_actual + 7 días hábiles (excluye sáb/dom)
  7. Crea Prestamo estado Activo, guarda
  8. actualizarDisponibilidad(isbn, 'disminuir')
- `registrarDevolucion(id_prestamo, fecha_actual)`:
  1. Busca préstamo
  2. diasRetraso = calcularDiasRetraso(fecha_actual)
  3. Si diasRetraso > 0: marcarComoAtrasado(), procesarRetraso()
  4. finalizar(), guarda préstamo
  5. actualizarDisponibilidad(isbn, 'aumentar')
  6. Retorna `{ multa, diasRetraso }`

---

## SERVIDOR — ROUTERS HTTP

El servidor corre en Express. Cada router recibe las instancias de módulos inyectadas desde `main.ts`.

### main.ts — instanciación y arranque
```typescript
const repoLibros = new RepositorioLibrosFirebase()
const repoLectores = new RepositorioLectoresFirebase()
const repoPrestamos = new RepositorioPrestamosFirebase()
const modPenalizaciones = new ModuloPenalizaciones(repoLectores)
const modCatalogo = new ModuloCatalogo(repoLibros)
const modLectores = new ModuloLectores(repoLectores)
const modPrestamos = new ModuloPrestamos(repoPrestamos, repoLectores, modCatalogo, modPenalizaciones)

app.use('/libros', routerCatalogo(modCatalogo))
app.use('/lectores', routerLectores(modLectores))
app.use('/prestamos', routerPrestamos(modPrestamos))
app.listen(3000)
```

### Endpoints

| Método | Ruta | Módulo | Descripción |
|--------|------|--------|-------------|
| POST | /libros | registrarLibro | Registrar libro |
| GET | /libros/:isbn | consultarLibro | Consultar por ISBN |
| PUT | /libros/:isbn | modificarLibro | Modificar libro |
| POST | /lectores | registrarLector | Registrar lector |
| PUT | /lectores/:id | modificarLector | Modificar correo |
| POST | /prestamos | registrarPrestamo | Nuevo préstamo |
| GET | /prestamos | obtenerTodos | Historial completo |
| POST | /prestamos/:id/devolucion | registrarDevolucion | Registrar devolución |

Todos los errores de negocio retornan HTTP 400 con `{ error: 'CODIGO_ERROR' }`.

---

## CLIENTE — SERVICES

Cada service hace fetch a `http://{IP_LOCAL}:3000`. La IP se define en `.env` del cliente como `EXPO_PUBLIC_SERVER_URL`.

```typescript
// Ejemplo catalogoService.ts
const BASE = process.env.EXPO_PUBLIC_SERVER_URL

export const consultarLibro = async (isbn: string) => {
  const res = await fetch(`${BASE}/libros/${isbn}`)
  if (res.status === 404) return null
  return res.json()
}
```

Las pantallas importan de `services/` — nunca acceden a Firebase directamente.

---

## AUTENTICACIÓN

Firebase Auth actúa como sistema externo. El cliente (React Native) maneja Auth directamente con el SDK de Firebase — no pasa por el servidor Express.

- Login: `signInWithEmailAndPassword(auth, email, password)`
- `displayName` del usuario = "Persona encargada del registro" en formularios
- Auth guard en `app/_layout.tsx` con `onAuthStateChanged`
- Los usuarios bibliotecarios se crean en Firebase Console
- `signOut(auth)` en el botón "Cerrar Sesión" del Drawer

---

## THEME (src/presentacion/styles/theme.ts)

```typescript
export const theme = {
  gradient: { colors: ['#4c669f', '#3b5998', '#192f6a'] as const },
  colors: {
    textEditable: '#FFFFFF', textReadOnly: '#6a87af',
    inputBackground: '#2d5386', cardBackground: '#4a7fb8',
    titleBackground: '#3b699e', titleText: '#e0f2fe',
    buttonPrimary: '#4a7fb8',
    statusActivo: '#f59e0b', statusFinalizado: '#22c55e',
    statusAtrasado: '#ef4444', statusHabilitado: '#22c55e',
    statusSuspendido: '#ef4444',
  },
}
```

---

## COMPONENTES EXISTENTES

- `header.tsx` → `HeaderBar` — barra superior con título y búsqueda expandible
- `form.tsx` → `CustomInput` — campo con label, editable/solo lectura
- `botones_gestion.tsx` → `ButtonGestion` — botón grande con icono

---

## PANTALLAS Y NAVEGACIÓN

```
app/_layout.tsx       → Stack raíz + auth guard Firebase
app/login.tsx         → P01: email + password → signInWithEmailAndPassword
app/(app)/_layout.tsx → Drawer navigator con DrawerContent
  dashboard.tsx       → P02: 3 cards + elementos decorativos estáticos
  catalogo/
    index.tsx         → P03: 3 ButtonGestion + tabla estática
    consultar.tsx     → P03b: buscar ISBN → muestra datos + botón a P10
    registrar.tsx     → P04: formulario libro completo
    modificar.tsx     → P05: buscar ISBN → editar campos
  lectores/
    index.tsx         → P06: 2 ButtonGestion + tabla estática
    registrar.tsx     → P07: ID automático + correo + estado Habilitado
    modificar.tsx     → P08: buscar ID lector → editar correo
  prestamos/
    index.tsx         → P09: 2 ButtonGestion + tabla préstamos Activos (datos reales)
    registrar.tsx     → P10: ID lector + ISBN (prellenable) + campos auto
    historial.tsx     → P11a: tabla todos los préstamos + búsqueda por ID lector
    devolucion.tsx    → P11: datos precargados + confirmar + modal resultado
```

### Parámetros de ruta
- P03b → P10: `router.push('/(app)/prestamos/registrar', { isbn })`
- P11a → P11: `router.push('/(app)/prestamos/devolucion', { id_prestamo })`
- P11a: filas con estado `Finalizado` tienen `opacity: 0.5` y no tienen `onPress`

---

## REGLAS PARA CLAUDE CODE

1. Un archivo por clase. Nunca combinar entidades.
2. Las pantallas solo importan de `services/` — nunca de módulos ni Firebase.
3. El servidor es la única capa que toca Firebase.
4. Todos los métodos de repositorio y módulo son `async/await`.
5. Errores de negocio: el módulo lanza `throw new Error('CODIGO')`, el router retorna `{ error: 'CODIGO' }` con HTTP 400, el service retorna el código, la pantalla muestra el mensaje.
6. Colores siempre desde `theme.ts` — nunca hardcodeados.
7. `LinearGradient` envuelve toda pantalla como fondo.
8. `CustomInput` con `editable={false}` y color `theme.colors.textReadOnly` para campos de solo lectura.
9. Elementos decorativos del MVP marcados con `// TODO: conectar a servidor`.
10. `.env` y `google-services.json` nunca al repo — están en `.gitignore`.

---

## GIT

Ramas: `main` → `dev` → `feature/dominio` | `feature/datos` | `feature/aplicacion` | `feature/servidor` | `feature/ui-base` | `feature/ui-catalogo` | `feature/ui-lectores` | `feature/ui-prestamos` | `feature/ui-auth`

Prefijos de commit: `feat:` `fix:` `chore:` `docs:`

---

## SPLASH SCREEN — P00

Archivo: `app/index.tsx` (pantalla raíz antes del auth guard)

Comportamiento:
- Fondo degradado `theme.gradient.colors`
- Logo `assets/logo.png` centrado — usar `<Image>` con `resizeMode="contain"` y tamaño 200x200
- Después de 2 segundos navega automáticamente con `router.replace('/login')`
- Si Firebase Auth ya tiene sesión activa, navega a `/(app)/dashboard` en lugar de login

### Dónde colocar el logo
```
mooniebook/
└── assets/
    └── logo.png   ← colocar aquí la imagen del logo MoonieBook
```

En el código se importa como:
```typescript
import { Image } from 'react-native'
const logo = require('../assets/logo.png')
// <Image source={logo} style={{ width: 200, height: 200 }} resizeMode="contain" />
```

---

## CERRAR SESIÓN

El botón "Cerrar Sesión" vive en `DrawerContent.tsx`.

```typescript
import { signOut } from 'firebase/auth'
import { auth } from '../server/src/datos/firebase' // Auth se maneja en cliente
import { router } from 'expo-router'

const handleSignOut = async () => {
  await signOut(auth)
  router.replace('/login')  // navega a P01
}
```

El auth guard en `app/_layout.tsx` con `onAuthStateChanged` detecta el cambio de sesión y también redirige a `/login` automáticamente — el `router.replace` en el botón es redundante pero garantiza la navegación inmediata.

---

## CORRECCIÓN DE ESTRUCTURA — CLIENTE

El cliente NO tiene carpeta `src/`. La estructura correcta del cliente es:

```
mooniebook/                 ← raíz del monorepo
├── server/                 ← servidor Node.js (tiene src/)
├── app/                    ← pantallas Expo Router
├── components/             ← componentes reutilizables
├── services/               ← fetch al servidor (NO importa Firebase)
├── assets/
│   └── logo.png            ← logo MoonieBook aquí
└── CLAUDE.md
```

El `theme.ts` vive en:
```
mooniebook/
└── styles/
    └── theme.ts
```

Las pantallas lo importan como `import { theme } from '../../styles/theme'`.

Los comandos `mkdir` correctos para el cliente desde la raíz del proyecto:
```bash
mkdir -p server/src/dominio/entidades
mkdir -p server/src/dominio/enums
mkdir -p server/src/dominio/interfaces
mkdir -p server/src/datos
mkdir -p server/src/aplicacion
mkdir -p server/src/presentacion
mkdir -p app/\(app\)/catalogo
mkdir -p app/\(app\)/lectores
mkdir -p app/\(app\)/prestamos
mkdir -p components
mkdir -p services
mkdir -p assets
mkdir -p styles
```
