/**
 * Utilidades puras del torneo: estadísticas sociales (rachas y logros) y
 * derivaciones de la quiniela (tabla de grupos, cuadro eliminatorio y opciones
 * de pronóstico).
 * No conocen React ni el estado global: reciben datos y devuelven datos,
 * de modo que puedan reutilizarse y verificarse de forma aislada
 * (Principio de Responsabilidad Única: el hook orquesta, aquí se calcula).
 */

/** Indica si un partido ya tiene marcador final ingresado. */
const isPlayed = (match) => match.score1 !== null && match.score2 !== null;

/** Devuelve el nombre del ganador de un partido jugado, o null si fue empate. */
const getWinner = (match) => {
    const s1 = parseInt(match.score1, 10);
    const s2 = parseInt(match.score2, 10);
    if (s1 > s2) return match.player1;
    if (s2 > s1) return match.player2;
    return null;
};

/**
 * Detecta la racha de victorias consecutivas ACTIVA de cada jugador.
 * Una racha solo cuenta si su último partido jugado fue victoria.
 *
 * @param {Array} matches - Partidos del torneo en orden de registro.
 * @returns {Array<{name: string, streak: number}>} Rachas activas (>= 2), ordenadas desc.
 */
export function detectStreaks(matches) {
    /** @type {Map<string, {streak: number, lastWon: boolean}>} */
    const streaks = new Map();

    const registerResult = (winner, loser) => {
        const current = streaks.get(winner) || { streak: 0, lastWon: false };
        streaks.set(winner, {
            streak: current.lastWon ? current.streak + 1 : 1,
            lastWon: true,
        });
        streaks.set(loser, { streak: 0, lastWon: false });
    };

    matches.filter(isPlayed).forEach((match) => {
        const winner = getWinner(match);
        if (!winner) return;
        const loser = winner === match.player1 ? match.player2 : match.player1;
        registerResult(winner, loser);
    });

    return [...streaks.entries()]
        .filter(([, info]) => info.lastWon && info.streak >= 2)
        .map(([name, info]) => ({ name, streak: info.streak }))
        .sort((a, b) => b.streak - a.streak);
}

/**
 * Calcula los logros honoríficos derivables exclusivamente de los marcadores
 * finales. Solo se emite un logro si existe al menos un jugador que lo cumpla.
 *
 * Logros: máximo goleador (Pichichi), muralla (más vallas invictas),
 * goleada del torneo (mayor margen) y racha de fuego (3+ victorias seguidas).
 *
 * @param {Array} matches - Partidos del torneo.
 * @returns {Array<{id: string, emoji: string, title: string, holder: string, description: string}>}
 */
export function getAchievements(matches) {
    const played = matches.filter(isPlayed);

    /** Acumuladores por jugador. */
    /** @type {Map<string, {gf: number, ga: number, cleanSheets: number}>} */
    const stats = new Map();
    const ensureRow = (name) => {
        if (!stats.has(name)) stats.set(name, { gf: 0, ga: 0, cleanSheets: 0 });
        return stats.get(name);
    };

    let biggestWin = null; // { holder, opponent, score, diff }

    played.forEach((match) => {
        const s1 = parseInt(match.score1, 10);
        const s2 = parseInt(match.score2, 10);
        const rowP1 = ensureRow(match.player1);
        const rowP2 = ensureRow(match.player2);

        rowP1.gf += s1;
        rowP1.ga += s2;
        rowP2.gf += s2;
        rowP2.ga += s1;
        if (s2 === 0) rowP1.cleanSheets += 1;
        if (s1 === 0) rowP2.cleanSheets += 1;

        const diff = Math.abs(s1 - s2);
        if (diff > 0 && (!biggestWin || diff > biggestWin.diff)) {
            biggestWin = {
                holder: s1 > s2 ? match.player1 : match.player2,
                opponent: s1 > s2 ? match.player2 : match.player1,
                score: `${s1}-${s2}`,
                diff,
            };
        }
    });

    const achievements = [];

    // Pichichi: más goles a favor acumulados.
    const topScorer = [...stats.entries()]
        .filter(([, row]) => row.gf > 0)
        .sort((a, b) => b[1].gf - a[1].gf)[0];
    if (topScorer) {
        achievements.push({
            id: 'pichichi',
            emoji: '👑',
            title: 'Máximo Goleador',
            holder: topScorer[0],
            description: `${topScorer[1].gf} goles anotados`,
        });
    }

    // Muralla: más partidos con valla invicta.
    const topWall = [...stats.entries()]
        .filter(([, row]) => row.cleanSheets > 0)
        .sort((a, b) => b[1].cleanSheets - a[1].cleanSheets)[0];
    if (topWall) {
        achievements.push({
            id: 'muralla',
            emoji: '🧤',
            title: 'La Muralla',
            holder: topWall[0],
            description: `${topWall[1].cleanSheets} valla(s) invicta(s)`,
        });
    }

    // Goleada del torneo: mayor margen de victoria registrado.
    if (biggestWin) {
        achievements.push({
            id: 'goleada',
            emoji: '💀',
            title: 'Goleada del Torneo',
            holder: biggestWin.holder,
            description: `Ganó ${biggestWin.score} a ${biggestWin.opponent}`,
        });
    }

    // Racha de fuego: 3+ victorias consecutivas activas.
    detectStreaks(matches)
        .filter((s) => s.streak >= 3)
        .forEach((s) => {
            achievements.push({
                id: `racha-${s.name}`,
                emoji: '🔥',
                title: 'Racha de Fuego',
                holder: s.name,
                description: `${s.streak} victorias seguidas`,
            });
        });

    return achievements;
}

// ============================================================================
// Quiniela: constantes de dominio y derivaciones puras (grupos y cruces)
// ============================================================================

/** Valor reservado del pick de empate; solo válido en fase de grupos. */
export const DRAW_PICK = 'empate';

/**
 * Regla social DG: un marcador 3-0 (en cualquier sentido) es un "nocaut".
 * La app solo lo MUESTRA como insignia informativa; el cumplimiento de la
 * regla (castigos, ventajas en el siguiente cruce...) lo aplican los
 * jugadores entre ellos. NUNCA bloquea la edición del marcador ni los
 * pronósticos (lección del 1er torneo: un 3-0 mal ingresado quedó
 * congelado y alteró la tabla y el resto del cuadro).
 *
 * @param {number|string|null} score1 - Goles del participante 1.
 * @param {number|string|null} score2 - Goles del participante 2.
 * @returns {boolean} true si el marcador completo es exactamente 3-0 o 0-3.
 */
export function isBlowout(score1, score2) {
    if (score1 === null || score2 === null) return false;
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    return (s1 === 3 && s2 === 0) || (s2 === 3 && s1 === 0);
}

/** Etapas fijas del cuadro eliminatorio, en orden de juego. */
export const KO_STAGES = ['semi1', 'semi2', 'third', 'final'];

/** Etiquetas visibles de cada cruce de eliminatorias. */
export const KO_LABELS = {
    semi1: 'Semifinal 1',
    semi2: 'Semifinal 2',
    third: 'Tercer Puesto',
    final: 'Gran Final',
};

/** Placeholders exactos de participante pendiente en cada cruce. */
const PLACEHOLDERS = {
    semi1: ['1° Grupo A', '2° Grupo B'],
    semi2: ['1° Grupo B', '2° Grupo A'],
    third: ['Perdedor S1', 'Perdedor S2'],
    final: ['Ganador S1', 'Ganador S2'],
};

/**
 * Tabla de posiciones de un grupo. Incluye a TODOS los jugadores del grupo
 * (incluso sin partidos jugados) y ordena por puntos > diferencia de goles >
 * goles a favor. Extracción 1:1 de la lógica que vivía en `useTournament`.
 *
 * @param {Array} matches - Partidos del torneo.
 * @param {string} groupId - Grupo a tabular ('A' | 'B').
 * @param {string[]} groupPlayers - Jugadores del grupo (clave de identidad).
 * @returns {Array<{name: string, points: number, goalsFor: number, goalsAgainst: number, goalDifference: number, played: number, won: number, drawn: number, lost: number}>} Tabla ordenada.
 */
export function getGroupStandings(matches, groupId, groupPlayers) {
    const standings = groupPlayers.map((player) => ({
        name: player,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
    }));

    matches
        .filter((m) => m.groupId === groupId && m.score1 !== null && m.score2 !== null)
        .forEach((m) => {
            const p1 = standings.find((s) => s.name === m.player1);
            const p2 = standings.find((s) => s.name === m.player2);

            if (!p1 || !p2) return;

            const s1 = parseInt(m.score1, 10);
            const s2 = parseInt(m.score2, 10);

            p1.played += 1;
            p2.played += 1;
            p1.goalsFor += s1;
            p1.goalsAgainst += s2;
            p1.goalDifference += (s1 - s2);
            p2.goalsFor += s2;
            p2.goalsAgainst += s1;
            p2.goalDifference += (s2 - s1);

            if (s1 > s2) {
                p1.points += 3;
                p1.won += 1;
                p2.lost += 1;
            } else if (s2 > s1) {
                p2.points += 3;
                p2.won += 1;
                p1.lost += 1;
            } else {
                p1.points += 1;
                p2.points += 1;
                p1.drawn += 1;
                p2.drawn += 1;
            }
        });

    // Ordenar Puntos > Diferencia de Goles > Goles a Favor
    standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });

    return standings;
}

/**
 * Resuelve ganador y perdedor de un cruce a partir de su marcador. Corrige el
 * quirk histórico (`2 > null === true`): exige AMBOS marcadores para decidir
 * y un cruce empatado no avanza a nadie.
 *
 * @param {string} p1 - Participante 1 del cruce (nombre o placeholder).
 * @param {string} p2 - Participante 2 del cruce (nombre o placeholder).
 * @param {{score1: number|string|null, score2: number|string|null}} estado - Marcador del cruce.
 * @returns {{winner: string|null, loser: string|null}} Ganador y perdedor, o null si no está decidido.
 */
const decideKo = (p1, p2, estado) => {
    const score1 = estado.score1 ?? null;
    const score2 = estado.score2 ?? null;
    if (score1 === null || score2 === null) return { winner: null, loser: null };
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    if (s1 > s2) return { winner: p1, loser: p2 };
    if (s2 > s1) return { winner: p2, loser: p1 };
    return { winner: null, loser: null }; // Empate: nadie avanza
};

/**
 * Deriva los 4 cruces de eliminatorias desde la tabla de grupos y el estado de
 * marcadores. Única fuente de verdad del bracket: la consumen la vista del
 * cuadro, la quiniela y su puntuación.
 *
 * Cada cruce expone:
 * - `confirmedP1` / `confirmedP2` / `confirmed`: si el participante ya es un
 *   jugador real (semis: existe fila de tabla; final/tercero: hay decidido).
 * - `score1` / `score2` / `closed`: copia del estado de eliminatorias.
 * - `winner`: nombre del ganador, o null si el cruce está incompleto o empatado.
 *
 * @param {Array} matches - Partidos de fase de grupos.
 * @param {{A: string[], B: string[]}} groups - Jugadores por grupo.
 * @param {Object} knockout - Estado de eliminatorias por etapa ({score1, score2, closed}).
 * @returns {Array<{id: string, stage: string, label: string, p1: string, p2: string, confirmedP1: boolean, confirmedP2: boolean, confirmed: boolean, score1: number|null, score2: number|null, closed: boolean, winner: string|null}>} Cruces en orden de juego.
 */
export function getKnockoutBracket(matches, groups, knockout) {
    // Paridad con hoy: la tabla incluye a todos los jugadores del grupo, así
    // que las semis quedan confirmadas en cuanto existen los grupos.
    const tablaA = getGroupStandings(matches, 'A', groups?.A || []);
    const tablaB = getGroupStandings(matches, 'B', groups?.B || []);

    const estadoDe = (stage) => knockout?.[stage] || { score1: null, score2: null, closed: false };

    const semi1P1 = tablaA[0]?.name || PLACEHOLDERS.semi1[0];
    const semi1P2 = tablaB[1]?.name || PLACEHOLDERS.semi1[1];
    const semi2P1 = tablaB[0]?.name || PLACEHOLDERS.semi2[0];
    const semi2P2 = tablaA[1]?.name || PLACEHOLDERS.semi2[1];

    const r1 = decideKo(semi1P1, semi1P2, estadoDe('semi1'));
    const r2 = decideKo(semi2P1, semi2P2, estadoDe('semi2'));

    const finalP1 = r1.winner || PLACEHOLDERS.final[0];
    const finalP2 = r2.winner || PLACEHOLDERS.final[1];
    const thirdP1 = r1.loser || PLACEHOLDERS.third[0];
    const thirdP2 = r2.loser || PLACEHOLDERS.third[1];

    /** Construye un cruce normalizado con sus flags de confirmación. */
    const armarCruce = (stage, p1, p2, confirmedP1, confirmedP2) => {
        const estado = estadoDe(stage);
        return {
            id: `ko-${stage}`,
            stage,
            label: KO_LABELS[stage],
            p1,
            p2,
            confirmedP1,
            confirmedP2,
            confirmed: confirmedP1 && confirmedP2,
            score1: estado.score1 ?? null,
            score2: estado.score2 ?? null,
            closed: estado.closed ?? false,
            winner: decideKo(p1, p2, estado).winner,
        };
    };

    return [
        armarCruce('semi1', semi1P1, semi1P2, Boolean(tablaA[0]), Boolean(tablaB[1])),
        armarCruce('semi2', semi2P1, semi2P2, Boolean(tablaB[0]), Boolean(tablaA[1])),
        armarCruce('third', thirdP1, thirdP2, r1.loser !== null, r2.loser !== null),
        armarCruce('final', finalP1, finalP2, r1.winner !== null, r2.winner !== null),
    ];
}

/**
 * Opciones de pick de un enfrentamiento. En fase de grupos existen exactamente
 * 3 (local, empate, visita); en cruces de eliminatorias solo 2, sin empate.
 *
 * @param {string} p1 - Participante local.
 * @param {string} p2 - Participante visitante.
 * @param {boolean} allowDraw - true solo en fase de grupos.
 * @returns {string[]} Opciones válidas de pronóstico.
 */
export function getPickOptions(p1, p2, allowDraw) {
    return allowDraw ? [p1, DRAW_PICK, p2] : [p1, p2];
}

/**
 * Tabla de aciertos de la quiniela con subtotales por fase. Solo puntúan
 * partidos y cruces con marcador completo, y solo aparecen filas de amigos
 * con al menos un pick (paridad con el comportamiento actual del hook).
 *
 * - Grupos: 'empate' acierta si el marcador quedó empatado (RF-2); un nombre
 *   acierta si es el ganador (RF-3); un 3-0 nunca es empate (CL-1, CL-5) y
 *   un pick antiguo en un empate no acierta ni se reinterpreta (CL-4).
 * - Cruces: solo cuentan cruces confirmados con resultado registrado; un
 *   cruce empatado no puntúa a nadie (RF-7); el pick vive en el cruce y
 *   puntúa contra quienes finalmente lo jueguen, sin borrarse nunca (CL-2).
 *
 * @param {Array} matches - Partidos de fase de grupos.
 * @param {{A: string[], B: string[]}} groups - Jugadores por grupo.
 * @param {Object} knockout - Estado de eliminatorias por etapa ({score1, score2, closed}).
 * @param {Array} predictions - Picks del torneo ({id, matchId, player, pick}).
 * @returns {Array<{name: string, group: {hits: number, total: number}, ko: {hits: number, total: number}, total: number}>} Ranking ordenado por total desc → ko.hits desc → alfabético.
 */
export function getPredictionStandings(matches, groups, knockout, predictions) {
    const crucesPorId = new Map(
        getKnockoutBracket(matches, groups, knockout).map((cruce) => [cruce.id, cruce])
    );
    const grupoJugadoPorId = new Map(matches.filter(isPlayed).map((m) => [m.id, m]));

    /** @type {Map<string, {name: string, group: {hits: number, total: number}, ko: {hits: number, total: number}, total: number}>} */
    const tabla = new Map();
    predictions.forEach((pred) => {
        const fila =
            tabla.get(pred.player) ||
            { name: pred.player, group: { hits: 0, total: 0 }, ko: { hits: 0, total: 0 }, total: 0 };

        if (pred.matchId.startsWith('ko-')) {
            const cruce = crucesPorId.get(pred.matchId);
            // Solo suman cruces confirmados con resultado registrado (RF-5, RF-17).
            if (cruce && cruce.confirmed && cruce.score1 !== null && cruce.score2 !== null) {
                fila.ko.total += 1;
                // Cruce empatado → winner null → nadie puntúa (RF-7).
                // Pick huérfano → no acierta, y NADA se borra (CL-2).
                if (cruce.winner !== null && pred.pick === cruce.winner) fila.ko.hits += 1;
            }
        } else {
            const m = grupoJugadoPorId.get(pred.matchId);
            if (m) {
                fila.group.total += 1;
                const s1 = parseInt(m.score1, 10);
                const s2 = parseInt(m.score2, 10);
                const winner = s1 > s2 ? m.player1 : s2 > s1 ? m.player2 : null;
                // 'empate' acierta solo con marcador empatado (RF-2; un 3-0 nunca entra aquí).
                // Un pick antiguo de nombre en un empate no acierta (CL-4).
                if (
                    (pred.pick === DRAW_PICK && winner === null) ||
                    (winner !== null && pred.pick === winner)
                ) {
                    fila.group.hits += 1;
                }
            }
        }

        fila.total = fila.group.hits + fila.ko.hits;
        tabla.set(pred.player, fila);
    });

    // Orden total desc → ko.hits desc → alfabético (RF-16 + desempate CL-7).
    return [...tabla.values()].sort(
        (a, b) => b.total - a.total || b.ko.hits - a.ko.hits || a.name.localeCompare(b.name)
    );
}

/**
 * Líder(es) de la quiniela para la card "Micasino.com". El empate a total se
 * desempata por mayor subtotal de eliminatorias (CL-7); si el empate persiste,
 * la card se comparte entre varios nombres.
 *
 * @param {Array} standings - Filas de `getPredictionStandings` ({name, group, ko, total}).
 * @returns {{names: string[], points: number}|null} Líder con sus puntos, o null si ningún pick puntuó (RF-19).
 */
export function getBestPredictor(standings) {
    const conPuntos = standings.filter((fila) => fila.total > 0);
    if (conPuntos.length === 0) return null; // RF-19: sin picks puntuados no hay card.

    const maxTotal = Math.max(...conPuntos.map((fila) => fila.total));
    const candidatos = conPuntos.filter((fila) => fila.total === maxTotal);

    const maxKo = Math.max(...candidatos.map((fila) => fila.ko.hits));
    // 1 nombre normal; N nombres si el empate persiste (CL-7), en orden alfabético.
    const names = candidatos
        .filter((fila) => fila.ko.hits === maxKo)
        .map((fila) => fila.name)
        .sort((a, b) => a.localeCompare(b));

    return { names, points: maxTotal };
}
