# MoonieBook — Guía para Claude Code

## ROL
Eres un Desarrollador Full-Stack Senior especializado en React Native (Expo) y Node.js trabajando en "MoonieBook", sistema de gestión para una biblioteca académica de la UACM.

---

## ESTADO ACTUAL DEL ENTORNO

**Todo lo siguiente YA ESTÁ CONFIGURADO. No lo toques salvo que el usuario lo pida explícitamente:**
- `tsconfig.json`, `app.json`, `package.json` en cliente y servidor
- Conexión a Firebase (cliente y Admin SDK en servidor)
- Estructura de carpetas completa
- Ramas Git: `dev`, `feature/dominio`, `feature/datos`, `feature/aplicacion`, `feature/servidor`, `feature/ui-base`, `feature/ui-catalogo`, `feature/ui-lectores`, `feature/ui-prestamos`, `feature/ui-auth`

**Rama actual:** Siempre trabajas en `dev` o una rama `feature/*`. Nunca hagas commit directo a `main`.

**Instalar librerías en el cliente:** Siempre usa `--legacy-peer-deps` para evitar conflictos con React 19:
```bash
npm install nombre-libreria --legacy-peer-deps
```

---

## ARQUITECTURA

```
Cliente (React Native)  →  fetch() HTTP/JSON  →  Servidor Express
                                                  ├── presentacion/  routers HTTP
                                                  ├── aplicacion/    módulos de negocio
                                                  ├── dominio/       entidades + interfaces
                                                  └── datos/         repositorios Firebase
```

**Regla absoluta:** El cliente SOLO toca Firebase para Authentication (`signIn`, `signOut`, `onAuthStateChanged`). Todo lo demás (libros, lectores, préstamos) va por fetch() al servidor. Nunca accedas a Realtime Database directamente desde el cliente.

---

## ESTRUCTURA DE CARPETAS

```
mooniebook/
├── server/src/
│   ├── dominio/entidades/   Libro.ts  Lector.ts  Prestamo.ts
│   ├── dominio/enums/       EstadoPrestamo.ts  EstadoLector.ts
│   ├── dominio/interfaces/  IRepositorioLibros.ts  IRepositorioLectores.ts  IRepositorioPrestamos.ts
│   ├── datos/               firebase.ts  RepositorioLibrosFirebase.ts  RepositorioLectoresFirebase.ts  RepositorioPrestamosFirebase.ts
│   ├── aplicacion/          ModuloCatalogo.ts  ModuloLectores.ts  ModuloPrestamos.ts  ModuloPenalizaciones.ts
│   ├── presentacion/        routerCatalogo.ts  routerLectores.ts  routerPrestamos.ts
│   └── main.ts
├── app/
│   ├── index.tsx            P00 splash
│   ├── login.tsx            P01
│   └── (app)/
│       ├── dashboard.tsx    P02
│       ├── catalogo/        index.tsx  consultar.tsx  registrar.tsx  modificar.tsx
│       ├── lectores/        index.tsx  registrar.tsx  modificar.tsx
│       └── prestamos/       index.tsx  registrar.tsx  historial.tsx  devolucion.tsx
├── components/              header.tsx  form.tsx  botones_gestion.tsx  DrawerContent.tsx  MovimientosTable.tsx  StatusBadge.tsx
├── services/                catalogoService.ts  lectoresService.ts  prestamosService.ts
├── assets/logo.png
└── styles/theme.ts
```

---

## DOMINIO — ENTIDADES

### Enums
```typescript
export enum EstadoPrestamo { Activo='Activo', Finalizado='Finalizado', Atrasado='Atrasado' }
export enum EstadoLector { Habilitado='Habilitado', Suspendido='Suspendido' }
```

### Libro
Atributos: `isbn`, `titulo`, `autor`, `editorial`, `categoria`, `fecha_publicacion`, `cantidad_total`, `cantidad_disponible`
Métodos:
- `disminuirDisponibilidad()` — resta 1, lanza error si ya es 0
- `aumentarDisponibilidad()` — suma 1, no supera cantidad_total
- `estaDisponible(): boolean` — retorna `cantidad_disponible > 0`

### Lector
Atributos: `id`, `correo_electronico`, `estado: EstadoLector`, `fecha_fin_suspension: string | null`
Métodos:
- `suspender(dias: number)` — estado=Suspendido, calcula fecha_fin_suspension sumando días naturales
- `habilitar()` — estado=Habilitado, fecha_fin_suspension=null
- `tieneDerecho(): boolean` — retorna `estado === EstadoLector.Habilitado`
- `setCorreo(nuevo_correo: string)`

### Prestamo
Atributos: `identificador`, `id_lector`, `isbn_libro`, `fecha_prestamo`, `fecha_devolucion_esperada`, `estado: EstadoPrestamo`
Métodos:
- `finalizar()`
- `calcularDiasRetraso(fecha_actual: Date): number` — retorna 0 si no hay retraso
- `marcarComoAtrasado()`

---

## DOMINIO — INTERFACES

```typescript
interface IRepositorioLibros {
  guardar(libro: Libro): Promise<void>
  buscarPorIsbn(isbn: string): Promise<Libro | null>
}
interface IRepositorioLectores {
  guardar(lector: Lector): Promise<void>
  buscarPorId(id: string): Promise<Lector | null>
  contarTotal(): Promise<number>
}
interface IRepositorioPrestamos {
  guardar(prestamo: Prestamo): Promise<void>
  buscarPorId(id: string): Promise<Prestamo | null>
  obtenerTodos(): Promise<Prestamo[]>
  contarTotal(): Promise<number>
}
```

---

## FIREBASE — NODOS

```json
{
  "libros": { "isbn": { "isbn":"", "titulo":"", "autor":"", "editorial":"", "categoria":"", "fecha_publicacion":"", "cantidad_total":0, "cantidad_disponible":0 } },
  "lectores": { "L-001": { "id":"L-001", "correo_electronico":"", "estado":"Habilitado", "fecha_fin_suspension":null } },
  "prestamos": { "P-001": { "identificador":"P-001", "id_lector":"L-001", "isbn_libro":"", "fecha_prestamo":"", "fecha_devolucion_esperada":"", "estado":"Activo" } }
}
```

---

## MÓDULOS DE APLICACIÓN

### ModuloLectores(repoLectores)
- `registrarLector(correo)` → genera ID `L-001` con contarTotal(), crea Lector Habilitado, guarda
- `modificarLector(id, nuevo_correo)` → busca, setCorreo(), guarda

### ModuloCatalogo(repoLibros)
- `registrarLibro(libro)` → verifica ISBN no duplicado, guarda
- `modificarLibro(isbn, libro)` → verifica existe, guarda
- `actualizarDisponibilidad(isbn, 'disminuir'|'aumentar')` → busca, llama método, guarda
- `consultarLibro(isbn)` → retorna Libro | null

### ModuloPenalizaciones(repoLectores)
- Constantes: `MULTA_POR_DIA=50`, `DIAS_SUSPENSION=30`
- `procesarRetraso(id_lector, dias_retraso)` → busca, suspender(30), guarda, retorna `{ multa: dias*50 }`

### ModuloPrestamos(repoPrestamos, repoLectores, modCatalogo, modPenalizaciones)
- `registrarPrestamo(id_lector, isbn)`:
  1. lector existe y tieneDerecho() → lanza `'LECTOR_SIN_DERECHO'`
  2. libro existe → lanza `'LIBRO_NO_ENCONTRADO'`
  3. estaDisponible() → lanza `'SIN_EJEMPLARES'`
  4. sin préstamo Activo → lanza `'PRESTAMO_ACTIVO_EXISTENTE'`
  5. genera ID `P-001` con contarTotal()
  6. fecha_devolucion_esperada = hoy + 7 días hábiles (excluye sáb/dom)
  7. crea Prestamo Activo, guarda, actualizarDisponibilidad('disminuir')
- `registrarDevolucion(id_prestamo, fecha_actual)`:
  1. busca préstamo
  2. diasRetraso = calcularDiasRetraso(fecha_actual)
  3. si diasRetraso > 0 → marcarComoAtrasado(), procesarRetraso()
  4. finalizar(), guarda, actualizarDisponibilidad('aumentar')
  5. retorna `{ multa, diasRetraso }`

---

## SERVIDOR — ENDPOINTS

Instanciación en `main.ts`: repoLibros → repoPrestamos → repoLectores → modPenalizaciones → modCatalogo → modLectores → modPrestamos → montar routers → `app.listen(3000)`

| Método | Ruta | Acción |
|--------|------|--------|
| POST | /libros | registrarLibro |
| GET | /libros/:isbn | consultarLibro |
| PUT | /libros/:isbn | modificarLibro |
| POST | /lectores | registrarLector |
| PUT | /lectores/:id | modificarLector |
| GET | /lectores/:id | buscarPorId |
| POST | /prestamos | registrarPrestamo |
| GET | /prestamos | obtenerTodos |
| GET | /prestamos/:id | buscarPorId |
| POST | /prestamos/:id/devolucion | registrarDevolucion |

Errores de negocio → HTTP 400 con `{ error: 'CODIGO_ERROR' }`.
Éxito → HTTP 200 con los datos o `{ ok: true }`.

---

## CLIENTE — SERVICES

`EXPO_PUBLIC_SERVER_URL` del `.env` es la IP local del servidor.

```typescript
const BASE = process.env.EXPO_PUBLIC_SERVER_URL
// Cada service exporta funciones async que hacen fetch y retornan datos o el código de error
```

---

## AUTENTICACIÓN (solo en cliente)

```typescript
// Login
signInWithEmailAndPassword(auth, email, password)
// Display name del usuario = "Persona encargada del registro"
auth.currentUser?.displayName
// Auth guard
onAuthStateChanged(auth, user => { if (!user) router.replace('/login') })
// Logout en DrawerContent
await signOut(auth)
router.replace('/login')
```

---

## PANTALLAS

| Pantalla | Archivo | Descripción |
|----------|---------|-------------|
| P00 | app/index.tsx | Splash: logo centrado, 2s, verifica sesión, navega |
| P01 | app/login.tsx | Email + password → signInWithEmailAndPassword |
| P02 | app/(app)/dashboard.tsx | 3 cards de módulos + elementos decorativos estáticos |
| P03 | app/(app)/catalogo/index.tsx | 3 ButtonGestion + tabla estática |
| P03b | app/(app)/catalogo/consultar.tsx | Buscar ISBN → mostrar datos → botón a P10 con isbn |
| P04 | app/(app)/catalogo/registrar.tsx | Formulario libro completo |
| P05 | app/(app)/catalogo/modificar.tsx | Buscar ISBN → editar campos |
| P06 | app/(app)/lectores/index.tsx | 2 ButtonGestion + tabla estática |
| P07 | app/(app)/lectores/registrar.tsx | ID auto + correo editable + estado Habilitado |
| P08 | app/(app)/lectores/modificar.tsx | Buscar ID → editar correo |
| P09 | app/(app)/prestamos/index.tsx | 2 ButtonGestion + tabla préstamos Activos (datos reales) |
| P10 | app/(app)/prestamos/registrar.tsx | ID lector + ISBN prellenable + campos auto |
| P11a | app/(app)/prestamos/historial.tsx | Tabla todos los préstamos + búsqueda por ID lector |
| P11 | app/(app)/prestamos/devolucion.tsx | Datos precargados + confirmar + modal resultado |

**Navegación con parámetros:**
- P03b → P10: `router.push({ pathname:'/(app)/prestamos/registrar', params:{ isbn } })`
- P11a → P11: `router.push({ pathname:'/(app)/prestamos/devolucion', params:{ id_prestamo } })`
- P11a: filas con estado `Finalizado` → `opacity: 0.5`, sin `onPress`

---

## COMPONENTES

| Componente | Descripción |
|------------|-------------|
| `HeaderBar` | header.tsx — ya implementado |
| `CustomInput` | form.tsx — ya implementado. `editable={false}` + color `theme.colors.textReadOnly` para solo lectura |
| `ButtonGestion` | botones_gestion.tsx — ya implementado |
| `DrawerContent` | Drawer lateral: logo, nombre usuario Auth, menú, cerrar sesión |
| `MovimientosTable` | Tabla genérica con columnas configurables y filas seleccionables opcionales |
| `StatusBadge` | Badge de color según estado (ver colores en theme.ts) |

---

## THEME (styles/theme.ts)

```typescript
export const theme = {
  gradient: { colors: ['#4c669f', '#3b5998', '#192f6a'] as const },
  colors: {
    textEditable: '#FFFFFF', textReadOnly: '#6a87af',
    inputBackground: '#2d5386', cardBackground: '#4a7fb8',
    titleBackground: '#3b699e', titleText: '#e0f2fe',
    searchBackground: '#86a8cf', buttonPrimary: '#4a7fb8',
    buttonSecondary: '#2d5386', labelText: '#d8e0ea',
    statusActivo: '#f59e0b', statusFinalizado: '#22c55e',
    statusAtrasado: '#ef4444', statusHabilitado: '#22c55e',
    statusSuspendido: '#ef4444', statusDisponible: '#22c55e',
    statusNoDisponible: '#ef4444',
  },
  borderRadius: { small: 16, medium: 24, large: 30 },
  fontSize: { label: 14, input: 16, title: 18, button: 20 },
}
```

---

## REGLAS

1. Un archivo por clase del dominio. Nunca combinar entidades.
2. Las pantallas solo importan de `services/` — nunca de módulos ni Realtime Database.
3. El servidor es la única capa que toca Realtime Database.
4. Todos los métodos de repositorio y módulo son `async/await`.
5. Errores: el módulo lanza `throw new Error('CODIGO')`, el router retorna HTTP 400 `{ error:'CODIGO' }`, el service lo retorna a la pantalla, la pantalla muestra el mensaje correspondiente.
6. Colores siempre desde `theme.ts`.
7. `LinearGradient` de `expo-linear-gradient` envuelve toda pantalla como fondo.
8. Elementos decorativos del MVP marcados con `// TODO: conectar a servidor`.
9. Instalar librerías en cliente: siempre con `--legacy-peer-deps`.
10. Nunca commit a `main`. Siempre trabajar en `feature/*` derivada de `dev`.
