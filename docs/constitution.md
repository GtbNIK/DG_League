# Constitución de DG League

Principios innegociables del proyecto. Toda spec, plan, tarea o código debe cumplirlos; si un cambio los contradice, primero se enmienda esta constitución con aprobación de Neil.

## 1. Producto

- DG League es una app **frontend-only** para administrar la liga de fútbol virtual del grupo: no hay backend ni base de datos; todo el estado vive en `localStorage` del dispositivo.
- **Un dispositivo compartido**: la app se usa en el móvil/PC de Neil pasado entre amigos. No hay cuentas, sesiones ni red.
- Verdad de producto: `PRODUCT.md`. Verdad visual: `DESIGN.md` ("La Arena Nocturna"). Nada se implementa que los contradiga sin aprobación explícita.

## 2. Reglas de negocio innegociables

- **Nocaut 3-0**: todo partido (grupos y eliminatorias) con marcador 3-0 se cierra (`closed: true`); un partido cerrado no admite cambios de marcador ni pronósticos.
- **Un pick por partido**: cada amigo tiene un único pronóstico por partido; volver a pronosticar sobrescribe el anterior.
- **Quien juega, no vota**: los dos participantes de un partido no pueden pronosticar ese partido.
- **Draft**: máximo 10 jugadores con nombres únicos; si el nombre es "neil" (case-insensitive) siempre elige de último.
- Tabla de posiciones ordena por puntos → diferencia de goles → goles a favor.
- Los nombres de jugador son la clave de identidad en todo el sistema: no se renombran sin migrar referencias.

## 3. Arquitectura y estado

- Stack fijo: React 19 + Vite + Tailwind CSS 4, JavaScript con JSX **sin TypeScript**, `lucide-react`, `uuid`, `motion/react`.
- El estado global es un único objeto persistido bajo `dg_league_state`, gestionado por `useTournament()`; las vistas **nunca** mutan estado: solo llaman acciones del hook.
- **Migración de esquema**: todo campo nuevo se agrega también a `initialState` (la unión `{...initialState, ...storedData}` hereda a estados viejos).
- **Lógica pura en `src/utils/`**: todo cálculo derivable (tablas, estadísticas, bracket, quiniela) vive como funciones puras testeables, no dentro del hook ni de las vistas. Lo que la vista deriva localmente se considera deuda.
- IDs con `uuid` v4; los cruces de eliminatorias usan claves fijas (`semi1`, `semi2`, `third`, `final`) e ids sintéticos para pronósticos (`ko-semi1`, etc.).

## 4. Calidad y estilo de código

- Comentarios, UI y dominio **en español**; JSDoc en funciones y bloques lógicos importantes.
- Indentación 4 espacios en código nuevo; el legado mezcla 2 y 4: **no reformatear archivos completos**, solo cambios quirúrgicos.
- Cambios quirúrgicos: únicamente lo que la tarea pide, sin tocar lógica circundante.
- Cada tarea termina con `npm run lint` y `npm run build` en verde desde `dg_league/`.
- La lógica pura de `src/utils/` se prueba con `node --test` (tests primero en rojo, luego código, luego verde).
- La UI cumple `DESIGN.md`; el detector de `impeccable` corre sobre los archivos tocados. Un hallazgo del detector se corrige salvo que el brief del usuario fije lo contrario (y se documenta en la spec).

## 5. Diseño

- Mundo visual único: "La Arena Nocturna" (fondo vivo, superficies sólidas, Space Grotesk + Montserrat, el glow responde, el oro solo celebra).
- La única isla fuera del sistema es el Onboarding (imagen de Photoshop de Neil, intocable) y los colores propios de las cartas de castigo.
- Mobile-first con `max-w` progresivo; sin layouts distintos para desktop.

## 6. Proceso (SDD)

- Flujo: constitución → spec → plan → tareas → implementación → validación; **nunca** se avanza de fase sin aprobación explícita de Neil.
- La spec describe el QUÉ y el POR QUÉ (nada de stack ni archivos); los RF en formato EARS verificable.
- Cada spec vive en `specs/NNN-nombre/` con `spec.md`, `plan.md` y `tasks.md`.
- Si algo no está en la spec, no se implementa. Un cambio de requisitos se aplica primero a la spec, luego al plan y las tareas, y al final al código.
- Implementación: una tarea a la vez, tests primero, `node --test` en verde, marcar y parar.
- Validación final RF por RF contra la spec aprobada.

## 7. Git

- Conventional commits en español, sin acentos en el asunto.
- Commit al cierre de cada spec implementada y validada; **push solo con visto bueno explícito de Neil**.
