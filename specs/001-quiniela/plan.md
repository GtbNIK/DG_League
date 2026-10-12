# Plan 001 — Quiniela del torneo: empate, eliminatorias y tabla

Basado en `specs/001-quiniela/spec.md` (aprobada). Verdad técnica verificada hoy sobre el código: los picks viven en `predictions` como `{id, matchId, player, pick}` (pick = string con el nombre del ganador), `addPrediction` solo busca en partidos de grupo y rechaza cerrados, `getPredictionStandings` vive dentro del hook (deuda), el bracket se deriva localmente en TournamentView con el quirk `2 > null === true`, y el estado de eliminatorias solo guarda `{score1, score2, closed}` por stage (`semi1`, `semi2`, `third`, `final`).

## Archivos y responsabilidades

- `dg_league/src/utils/tournamentLogic.js` — ampliar con toda la lógica pura de quiniela: constantes de dominio, `getGroupStandings`, `getKnockoutBracket`, `getPickOptions`, `getPredictionStandings`, `getBestPredictor`. Sin React ni estado global: recibe datos y devuelve datos. Cubre el cálculo de RF-1..RF-9, RF-15..RF-17, RF-18..RF-20.
- `dg_league/src/utils/tournamentLogic.test.js` — NUEVO. Primera suite de tests del proyecto con `node --test` (RNF-4). Cubre los casos de RF y casos límite CL-1..CL-7 en el nivel de cálculo.
- `dg_league/src/hooks/useTournament.js` — `addPrediction` extendido a cruces (valida cruce confirmado, no cerrado, sin empate) y con guard de "quien juega no vota" para grupos y cruces; `removePrediction` ya es genérica por `matchId + player` (sin cambios); `getStandings` y `getPredictionStandings` se vuelven delegaciones de las funciones puras (API del hook intacta, llamadores sin tocar). Cubre RF-4, RF-5, RF-9, RF-13 en el nivel de escritura de estado.
- `dg_league/src/views/PredictionsView.jsx` — tres pestañas ('grupos' | 'ko' | 'tabla') con pastilla deslizante, sub-encabezados por grupo, chip "Empate", ocultado de participantes y contador `players.length - 2`, sección de cruces y tabla por fases. Cubre RF-1, RF-10..RF-14 y la presentación de RF-15..RF-17.
- `dg_league/src/views/TournamentView.jsx` — cambia la derivación local del bracket (líneas 30-47) por consumo de `getKnockoutBracket`; elimina el quirk. Cubre RF-6 con una única fuente de verdad.
- `dg_league/src/views/AchievementsView.jsx` — card dorada "Micasino.com" al final de la vista, fuera del grid de logros. Cubre RF-18..RF-20 en presentación.
- `dg_league/src/components/TeamTag.jsx` — sin cambios; se reusa donde ya se muestran nombres (partidos, cruces, tabla, card Micasino).
- `dg_league/package.json` — añadir script `"test": "node --test src/utils/"` (la constitución manda `node --test`; el script lo hace ejecutable igual que `lint`/`build`).

## Funciones puras e interfaz

Ninguna función nueva usa fechas ni reloj: el parámetro "hoy" no aplica en esta spec (todo deriva del estado del torneo).

```js
// Constantes exportadas (fuente única de valores de dominio)
export const DRAW_PICK = 'empate';   // valor reservado del pick de empate; solo válido en grupos
export const KO_STAGES = ['semi1', 'semi2', 'third', 'final'];
export const KO_LABELS = { semi1: 'Semifinal 1', semi2: 'Semifinal 2', third: 'Tercer Puesto', final: 'Gran Final' };
// Ids sintéticos de pronósticos de cruces: `ko-${stage}` → 'ko-semi1', 'ko-semi2', 'ko-third', 'ko-final'

/**
 * Tabla de posiciones de un grupo (puntos > DG > GF), incluidos los jugadores
 * sin partidos jugados. Extracción 1:1 de la lógica actual del hook.
 */
export function getGroupStandings(matches, groupId, groupPlayers)
// → [{ name, points, goalsFor, goalsAgainst, goalDifference, played, won, drawn, lost }]

/**
 * Deriva los 4 cruces. Única fuente de verdad del bracket: la consumen
 * TournamentView, PredictionsView y la puntuación de la quiniela.
 * Placeholders exactos de hoy: '1° Grupo A', '2° Grupo B', '1° Grupo B',
 * '2° Grupo A', 'Ganador S1', 'Perdedor S1', 'Ganador S2', 'Perdedor S2'.
 */
export function getKnockoutBracket(matches, groups, knockout)
// → [{ id: 'ko-semi1', stage, label, p1, p2,
//      confirmedP1, confirmedP2, confirmed,   // confirmedP = el nombre NO es placeholder
//      score1, score2, closed,                 // del estado knockout
//      winner }]                               // nombre | null (null = incompleto o empate)

/**
 * Opciones de pick de un enfrentamiento: RF-1 (3 opciones con empate en grupos)
 * y RF-4 (2 opciones en cruces).
 */
export function getPickOptions(p1, p2, allowDraw)
// → [p1, 'empate', p2] | [p1, p2]

/**
 * Tabla de aciertos completa. Filas solo de amigos con al menos un pick
 * (paridad con el comportamiento actual).
 */
export function getPredictionStandings(matches, groups, knockout, predictions)
// → [{ name, group: { hits, total }, ko: { hits, total }, total }]   // total = group.hits + ko.hits
// Orden: total desc → ko.hits desc → alfabético (RF-16 + desempate CL-7).

/**
 * Líder(es) de la quiniela para la card Micasino.com.
 * Desempata por ko.hits (CL-7); si persiste, devuelve varios nombres.
 */
export function getBestPredictor(standings)
// → { names: string[], points: number } | null   // null si ningún pick puntuó (RF-19)
```

Cambios en el hook (firmas públicas intactas salvo ampliación de `addPrediction`):

```js
addPrediction(matchId, player, pick)
// matchId ahora también acepta 'ko-semi1' | 'ko-semi2' | 'ko-third' | 'ko-final'
removePrediction(matchId, player)   // sin cambios
getStandings(groupId)               // delega en getGroupStandings
getPredictionStandings()            // delega en la pura: (data.matches, data.groups, data.knockout, data.predictions)
```

## Algoritmos (pseudocódigo)

### getKnockoutBracket(matches, groups, knockout)

```
tablaA = getGroupStandings(matches, 'A', groups.A)
tablaB = getGroupStandings(matches, 'B', groups.B)

decidir(cruce):                        // corrige el quirk: exige AMBOS marcadores
    si score1 === null o score2 === null → { winner: null, loser: null }
    s1 = entero(score1); s2 = entero(score2)
    si s1 > s2  → { winner: p1, loser: p2 }
    si s2 > s1  → { winner: p2, loser: p1 }
    si s1 === s2 → { winner: null, loser: null }   // empate: nadie avanza

semi1: p1 = tablaA[0] o '1° Grupo A'; p2 = tablaB[1] o '2° Grupo B'
semi2: p1 = tablaB[0] o '1° Grupo B'; p2 = tablaA[1] o '2° Grupo A'
w1/l1 = decidir(semi1) → final.p1 = w1 o 'Ganador S1'; third.p1 = l1 o 'Perdedor S1'
w2/l2 = decidir(semi2) → final.p2 = w2 o 'Ganador S2'; third.p2 = l2 o 'Perdedor S2'

para cada stage en ['semi1', 'semi2', 'third', 'final']:
    confirmedP1/confirmedP2 = el nombre derivado no es placeholder
    (semis: existe la fila de standings, como hoy; final/tercero: winner/loser !== null)
    devolver { id: 'ko-' + stage, label, p1, p2, confirmedP1, confirmedP2,
               confirmed: confirmedP1 && confirmedP2,
               score1, score2, closed: knockout[stage].closed, winner: decidir(...).winner }
```

Nota de paridad: la tabla actual del hook incluye a todos los jugadores del grupo con 0 puntos, así que las semis muestran nombres reales en cuanto existen los grupos; `getKnockoutBracket` reproduce exactamente eso (por eso recibe `groups`).

### getPredictionStandings(matches, groups, knockout, predictions)

```
bracket = getKnockoutBracket(matches, groups, knockout)
crucesPorId = mapa bracket por id
grupoJugadoPorId = mapa de matches con score1 !== null && score2 !== null

fila(para amigo) = { name, group: {hits: 0, total: 0}, ko: {hits: 0, total: 0}, total: 0 }

para cada pred en predictions:
    si pred.matchId empieza por 'ko-':
        cruce = crucesPorId[pred.matchId]
        si cruce && cruce.confirmed && ambos scores !== null:
            fila.ko.total += 1                          // resultado registrado del cruce
            si cruce.winner !== null && pred.pick === cruce.winner → fila.ko.hits += 1
            // cruce empatado → winner null → nadie puntúa (RF-7)
            // pick huérfano (su amigo ya no juega el cruce) → no acierta, NADA se borra (CL-2)
    si no:
        m = grupoJugadoPorId[pred.matchId]
        si m:
            fila.group.total += 1
            winner = s1 > s2 ? m.player1 : s2 > s1 ? m.player2 : null
            si (pred.pick === 'empate' && winner === null)   // RF-2; un 3-0 nunca entra aquí (CL-1/CL-5)
               || (winner !== null && pred.pick === winner)  // RF-3; pick antiguo en empate no acierta (CL-4)
            → fila.group.hits += 1
    fila.total = fila.group.hits + fila.ko.hits

devolver filas ordenadas: total desc → ko.hits desc → name asc
```

### getBestPredictor(standings)

```
conPuntos = standings.filter(fila => fila.total > 0)
si vacío → null                                        // RF-19
maxTotal = máximo total; candidatos = los que lo igualan
maxKo = máximo ko.hits entre candidatos
names = candidatos con ko.hits === maxKo, mapeados a nombre   // 1 nombre normal, N si empate persiste (CL-7)
devolver { names, points: maxTotal }
```

### addPrediction (hook)

```
setData(prev):
    si matchId empieza por 'ko-':
        cruce = getKnockoutBracket(prev.matches, prev.groups, prev.knockout).find(id === matchId)
        si !cruce || !cruce.confirmed → return prev        // RF-5 en escritura
        si cruce.closed → return prev                      // RF-9
        si pick === 'empate' → return prev                 // RF-4: solo 2 opciones en cruces
        si player === cruce.p1 || player === cruce.p2 → return prev   // RF-13 en escritura
    si no:
        match = prev.matches.find(id === matchId)
        si !match || match.closed → return prev            // RF-9 (comportamiento actual)
        si player === match.player1 || player === match.player2 → return prev  // RF-13 (nuevo en grupos)
    quitar el pick previo de (matchId, player) y añadir { id: uuid nuevo, matchId, player, pick }
```

## Decisiones (con alternativa descartada)

1. **`DRAW_PICK = 'empate'` como string literal en español.** Encaja con el esquema actual (pick es string) sin migración, y es imposible que colisione con un resultado (la puntuación comprueba 'empate' antes de comparar nombres). Alternativa descartada: pick como objeto `{tipo, valor}` (obliga a migrar datos existentes, prohibido por la spec) o `'draw'` en inglés (viola RNF-1).
2. **Ids sintéticos `ko-semi1`, `ko-semi2`, `ko-third`, `ko-final`** reutilizando el array `predictions`. La constitución ya los prevé y un pick por cruce se filtra igual que por partido. Alternativa descartada: un array aparte `koPredictions` (duplicaría upsert, contadores y persistencia).
3. **Corregir el quirk `2 > null === true`:** el ganador de una semi solo se confirma con AMBOS marcadores; una semi empatada deja 'Ganador S1'/'Perdedor S1' como placeholders y la final/tercero sin apuesta. Alternativa descartada: mantener el quirk (confirma con medio marcador, asimétrico con `0 > null === false`, y contradice el "resultado registrado" de RF-17).
4. **Firma `getKnockoutBracket(matches, groups, knockout)` + extracción `getGroupStandings` (el hook delega).** Necesaria para paridad exacta: hoy la tabla incluye a todos los jugadores del grupo con 0 puntos, y derivarla solo de partidos jugados dejaría las semis sin confirmar hasta el primer resultado, un cambio de comportamiento que la spec no pide. Alternativa descartada: recibir las tablas ya calculadas (la versión pura de la quiniela no podría derivar el bracket por sí misma y la puntuación dependería del hook); o duplicar el cálculo de tabla dentro del bracket (riesgo de divergencia con `getStandings`).
5. **`getPredictionStandings` pura con subtotales por fase; el hook delega.** La constitución manda lógica derivable en utilidades testeables. Filas solo de amigos con al menos un pick (paridad con hoy). Alternativa descartada: una fila en cero por cada amigo (ruido visual en móvil y cambio de comportamiento no pedido).
6. **Orden `total desc → ko.hits desc → alfabético`**, el mismo criterio dentro de `getBestPredictor`: implementa el desempate CL-7 resuelto por Neil. Alternativa descartada: card compartida directa ante cualquier empate a total (ignora la resolución).
7. **CL-2 (resuelto): el pick vive en el cruce.** Puntúa contra quienes finalmente lo jueguen; un pick huérfano no acierta pero sí cuenta en `ko.total` (el cruce tiene resultado registrado); nada se borra. Alternativa descartada: purgar picks al cambiar los clasificados (penaliza al que apostó a tiempo y rompe el historial).
8. **Guard de "quien juega no vota" también en la acción**, además del ocultado en la UI: la regla es ley en la constitución y así queda en profundidad en grupos y cruces. Alternativa descartada: confiar solo en el ocultado de la UI (un bug lo saltaría).
9. **'empate' rechazado en cruces en la acción**, aunque la UI tampoco lo ofrezca: RF-4 garantizado a nivel de dato. Alternativa descartada: validar solo en la vista.
10. **Card Micasino derivada en render, sin estado persistido**, y evaluada fuera del early-return de "no hay partidos jugados" de AchievementsView: pueden existir picks puntuados de cruces sin partidos de grupo jugados, y RF-18/RF-19 mandan. Alternativa descartada: persistir el holder (queda obsoleto en cuanto cambia el líder) y heredar el early-return (ocultaría la card en el caso de arista).
11. **TournamentView consume `getKnockoutBracket`** (mobile y desktop): única fuente de verdad del bracket y del resaltado de ganador (que pasa a usar `winner`/`confirmed`, no comparaciones de score sueltas). Alternativa descartada: duplicar la derivación en PredictionsView (dos verdades que divergen con el quirk corregido).
12. **Script npm `"test": "node --test src/utils/"`.** La constitución exige `node --test` para lógica pura; el script lo hace simétrico a `lint`/`build`. Alternativa descartada: lanzar el comando a mano en cada tarea.

## Estrategia de tests (node --test)

- Archivo: `dg_league/src/utils/tournamentLogic.test.js`, con `node:test` y `node:assert/strict`, imports ESM relativos (`./tournamentLogic.js`). Ejecución: `npm test` (o `node --test src/utils/`) desde `dg_league/`. La utilidad no importa React ni JSX, así que Node la ejecuta directamente.
- Flujo por tarea de lógica: tests primero en rojo → código → verde → `npm run lint` + `npm run build` (constitución).
- Casos `getGroupStandings` (T1): orden puntos > DG > GF; jugador sin partidos aparece con ceros (paridad).
- Casos `getKnockoutBracket` (T1): grupos sin jugar / vacíos → placeholders y sin confirmar; grupos con jugadores → semis confirmadas con nombres reales (paridad); semi con un solo marcador → winner null (quirk corregido); semi con marcador completo → final y tercero reciben nombres reales y confirmados; semi empatada → placeholders persisten en final/tercero; 3-0 → `closed: true`; cambio de marcador de grupo → cambian los derivados (base de CL-6).
- Casos `getPickOptions` (T1): grupos → 3 opciones con 'empate' en medio; cruces → 2 opciones (RF-1, RF-4).
- Casos `getPredictionStandings` (T2): acierto de ganador (RF-3); 'empate' acierta con marcador empatado (RF-2); 'empate' no acierta con 3-0 (CL-1, CL-5); pick antiguo (nombre) en partido empatado no acierta y no se reinterpreta (CL-4); partido con un solo marcador no suma ni a hits ni a total; acierto y fallo de cruce (RF-8); cruce empatado no suma a nadie (RF-7); pick huérfano no acierta pero cuenta en `ko.total` y nada se borra (CL-2); pick sobre cruce sin confirmar o con marcador incompleto no suma; forma exacta `{name, group, ko, total}` y orden total → ko → alfabético (RF-15, RF-16, RF-17).
- Casos `getBestPredictor` (T3): sin picks puntuados → null (RF-19); líder único; empate a total desempatado por ko.hits; empate a total y ko → `names` con ambos (CL-7); cambiando los resultados cambia la salida (RF-20).
- Regresión: los tests existentes de rachas/logros no cambian; la suite completa debe quedar verde sin tocarlos.

## Cobertura RF por parte

| RF | Cálculo (utils) | Hook | UI |
|----|-----------------|------|----|
| RF-1 | `getPickOptions` (T1) | — | panel de grupos con chip Empate (T5) |
| RF-2, RF-3 | `getPredictionStandings` (T2) | delegación (T4) | tabla (T7) |
| RF-4 | `getPickOptions` sin empate (T1) | guard cruce confirmado (T4) | pestaña Eliminatorias (T6) |
| RF-5 | `confirmed` en bracket (T1) | guard (T4) | cruce bloqueado (T6) |
| RF-6 | nombres reales en bracket (T1) | — | pestaña KO (T6), TournamentView (T8) |
| RF-7, RF-8 | `getPredictionStandings` (T2) | delegación (T4) | tabla (T7) |
| RF-9 | — | guard closed (T4) | disabled en UI (T5, T6) |
| RF-10 | — | — | pestañas (T5) |
| RF-11 | — | — | sub-encabezados por grupo (T5) |
| RF-12 | — | — | pestaña KO lista 4 cruces (T6) |
| RF-13 | — | guard participante (T4) | ocultado en lista (T5, T6) |
| RF-14 | — | — | contador players - 2 (T5, T6) |
| RF-15, RF-16, RF-17 | subtotales + orden (T2) | delegación (T4) | tabla por fases (T7) |
| RF-18, RF-19, RF-20 | `getBestPredictor` (T3) | — | card dorada (T9) |
