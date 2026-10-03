# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Administrador y dueño:** Neil. Registra marcadores, gestiona fichajes y nerfeos, y controla el ciclo completo del torneo.
- **Jugadores:** 8-10 amigos de la liga. Participan en el draft de equipos, dejan sus pronósticos, sufren las cartas de castigo y consultan tabla, fixture y logros.

Todos usan la app en **un único dispositivo compartido** (el de Neil) que se pasa de mano en mano durante las jornadas de la liga. No hay cuentas ni sesiones: quien sostiene el dispositivo es quien interactúa.

## Product Purpose

DG League administra una liga de fútbol virtual (FIFA/eFootball) entre amigos: inscripción con draft de equipos, fase de grupos, bracket eliminatorio, fichajes 1x1, nerfeos, pronósticos sociales, ruleta de cartas de castigo y logros.

**Éxito** (confirmado por Neil): (1) el ritual social se siente divertido — pronósticos, castigos y logros generan momentos entre amigos; (2) administrar la liga toma segundos y no estorba el juego; (3) la competencia se mantiene viva toda la temporada.

## Positioning

App hecha a la medida del ritual propio del grupo: reglas caseras codificadas como ley (nocaut 3-0 cierra el partido, Neil elige siempre último en el draft, máximo 10 jugadores con nombres únicos, fichajes y nerfeos). Ninguna app genérica de gestión de torneos puede copiar esas reglas ni el tono entre amigos. Es 100% frontend y privada: sin cuentas, sin backend, sin redes.

## Operating Context

- Un dispositivo compartido = una liga. El estado completo vive en `localStorage` (clave `dg_league_state`); cada dispositivo tiene su propia copia independiente del torneo.
- Las jornadas presenciales son el momento de uso principal: se pasan marcadores, se registran pronósticos del grupo y se consulta el bracket en vivo. Móvil primero; escritorio progresivo (max-width creciente, no layouts distintos).
- Los nombres de los jugadores son la clave de identidad en todo el sistema (partidos, tabla, predicciones, fichajes): cambiar un nombre rompe referencias.
- Toda la UI y el dominio están en español.

## Capabilities and Constraints

- **Fases del torneo:** `setup` (inscripción + sorteo de orden) → `draft` (elección de equipos, turno a turno) → `group` (tabla, fixture, eliminatorias por pestaña interna). La fase `knockout` del modelo de datos existe pero nunca se activa.
- **Draft:** catálogo estático de 12 equipos del Top EA FC (`src/utils/teamCatalog.js`) con logos en `public/TeamLogos/`; máximo 10 jugadores garantiza holgura de elección. Regla hardcodeada: si el nombre es "neil" (case-insensitive) siempre elige de último, excluido del sorteo aleatorio.
- **Nocaut 3-0:** todo partido con marcador 3-0 se cierra automáticamente (`closed: true`); un partido cerrado no admite cambios de marcador ni nuevos pronósticos.
- **Pronósticos:** cada amigo tiene un único pick por partido; registrarlo de nuevo lo sobreescribe. Actualmente guardan solo el ganador.
- **Tabla de posiciones:** orden por puntos → diferencia de goles → goles a favor.
- **Estado:** un único objeto global gestionado por `useTournament()`; las vistas nunca mutan estado directamente. Al añadir campos, actualizar `initialState` para que estados viejos en `localStorage` hereden los nuevos.
- **Persistencia:** solo `localStorage`; sin backend ni base de datos. La persistencia en la nube (Prisma + Supabase en Railway) es idea futura, fuera de alcance actual.
- **En construcción (confirmado por Neil, 2026-10-03):** la Fase 1 (LandingView + DraftView, sin commitear) está en construcción; faltan partes por completar o pulir antes de considerarla cerrada y validada con el grupo.
- **Decidido pero sin implementar (Fase 2):** quiniela de marcador exacto escalonado (3 pts exacto / 1 pt ganador o empate / 0 fallar, migrando predicciones de `pick` a `{ score1, score2 }`) y premios de temporada solo con ganadores (más goles anotados, menos goles recibidos, mayor goleada, + campeón y mejor pronosticador propuestos).
- **Fuera de alcance:** pronósticos de eliminatorias, mostrar equipos en las tablas del torneo (pulir tras Fase 1), backend/persistencia en la nube.

## Brand Commitments

- Nombre: **DG League**, con logo propio (`public/LOGO-1.png`) en el header.
- Idioma: todo en español (UI, dominio, comentarios).
- Tono: informal y de broma entre amigos — los castigos, logros y nerfeos son parte del humor del grupo.
- Identidad visual incumbente: tema oscuro mobile-first (el sistema visual detallado vive en el código y, cuando exista, en DESIGN.md).

## Evidence on Hand

- Logo real: `dg_league/public/LOGO-1.png`.
- Imagen de onboarding: `dg_league/public/onboarding-bg.webp`.
- Logos de 12 equipos reales (PNG): `dg_league/public/TeamLogos/`.
- Catálogo de equipos confirmado por Neil: Top-12 EA FC (`src/utils/teamCatalog.js`).
- **No existen:** testimonios, datos de usuarios, prensa ni material de marketing. Nada de esto debe fabricarse.

## Product Principles

1. **El ritual manda.** Cada pantalla sirve primero al momento social (el pick del amigo, la carta de castigo, el logro alcanzado) y después a la administración.
2. **Cero fricción para Neil.** Registrar un marcador, un fichaje o un nerfeo toma segundos; la app nunca estorba el partido real.
3. **Un dispositivo, una liga.** El estado es único y compartido; todo cambio debe sobrevivir a cierres de pestaña y heredar hacia versiones futuras del esquema.
4. **Las reglas del grupo son ley.** Nocaut 3-0, Neil elige último, máximo 10 jugadores: se codifican sin excepciones y sin menús de configuración.
5. **Móvil primero, escritorio cuando compite.** El diseño nace en el teléfono que se pasa entre manos; el escritorio amplía, no reinventa.
