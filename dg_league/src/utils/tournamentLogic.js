/**
 * Utilidades puras para las estadísticas sociales del torneo (rachas y logros).
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
