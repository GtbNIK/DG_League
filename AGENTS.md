# AGENTS.md — DG_League

## Propósito

App **React frontend-only** para administrar una liga de fútbol virtual entre amigos (DG League): fase de grupos, bracket eliminatorio, fichajes, nerfs, pronósticos sociales y logros. **No hay backend ni base de datos**: todo el estado vive en `localStorage`.

## Estructura

- `dg_league/` — **la app real** (Vite 8 + React 19 + Tailwind CSS 4). Todos los comandos se ejecutan aquí, no en la raíz.
  - `src/hooks/useTournament.js` — hook central: estado completo del torneo y todas las mutaciones.
  - `src/hooks/useLocalStorage.js` — persistencia genérica en `localStorage`.
  - `src/utils/tournamentLogic.js` — lógica pura del torneo.
  - `src/views/` — pantallas: Setup, Tournament, Predictions, Rules, LoserCards, Achievements.
  - `src/components/BottomNav.jsx` — navegación inferior móvil.
  - `src/index.css` — tema Tailwind 4 vía `@theme` (no existe `tailwind.config.js`).
- Raíz del repo: solo scaffolds antiguos (`package.json` placeholder sin deps, `index.html`, `postcss.config.js`). **Ignorar; no agregar dependencias ahí.**
- `.agents/skills/` — skills locales (interface-design, vercel-react-best-practices, etc.).

## Comandos (desde `dg_league/`)

```bash
npm run dev      # servidor de desarrollo Vite
npm run build    # build de producción
npm run lint     # ESLint 9 (flat config, sin TypeScript)
npm run preview  # servir el build
```

No hay tests configurados (`npm test` no existe).

## Arquitectura y estado

- El estado global es un único objeto persistido bajo la clave `dg_league_state`, gestionado por `useTournament()`. Las vistas reciben el objeto `tournament` como prop y **nunca** mutan el estado directamente: solo llaman a las acciones del hook.
- Fases del torneo: `'setup' | 'group' | 'knockout'`; `App.jsx` hace render condicional según la fase y controla el tab activo con `BottomNav`.
- **Migración de esquema**: al añadir un campo nuevo al estado, agregarlo también a `initialState` en `useTournament.js`. La unión `{ ...initialState, ...storedData }` hace que estados viejos guardados hereden los campos nuevos.
- IDs con `uuid` (v4). Íconos con `lucide-react`. Clases con `clsx` + `tailwind-merge`.

## Reglas de negocio (no romper)

- **Nocaut 3-0**: un partido con marcador 3-0 (en cualquier sentido) se marca `closed: true` automáticamente. Un partido cerrado **no admite** cambios de marcador ni nuevos pronósticos.
- Pronósticos: cada amigo tiene **un único pick por partido**; registrarlo de nuevo sobreescribe el anterior.
- Tabla de posiciones ordena por: puntos → diferencia de goles → goles a favor.
- Máximo 10 jugadores; nombres de jugador únicos.

## Convenciones

- JavaScript con JSX, **sin TypeScript**.
- Comentarios, textos de UI y nombres de dominio **en español**.
- Indentación objetivo: 4 espacios (preferencia de Neil). El código legado mezcla 2 y 4 espacios: **no reformatear archivos completos**, solo tocar lo necesario en cambios quirúrgicos.
- ESLint: `no-unused-vars` ignora identificadores que empiezan con mayúscula o `_` (útil para evitar warns en exports de contexto).
- UI mobile-first con tema oscuro: fondo `slate-950`, acento `emerald`, utilidad `glass-panel` (glassmorphism) definida en `src/index.css`. Desktop se logra con `max-w` progresivo (`md:max-w-5xl lg:max-w-7xl`), no con layouts distintos.

## Gotchas

- Ejecutar `npm` siempre desde `dg_league/`; el `package.json` de la raíz está vacío.
- `dg_league/dist/` existe localmente pero **no está versionado** — no editar a mano ni commitearlo.
- Al guardar marcadores desde inputs: convertir `''` a `null` y usar `parseInt` (ver `TournamentView.jsx`), porque `getStandings` filtra por `score !== null`.
- Repo remoto: `github.com/GtbNIK/DG_League`, rama `main`.
