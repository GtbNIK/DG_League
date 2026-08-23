import { useLocalStorage } from "./useLocalStorage";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  phase: "setup", // 'setup' | 'group' | 'knockout'
  players: [],
  matches: [],
  groups: { A: [], B: [] },
  transfers: [],
  nerfs: [],
  predictions: [], // Pronósticos sociales: { id, matchId, player, pick }
  knockout: {
    semi1: { score1: null, score2: null, closed: false },
    semi2: { score1: null, score2: null, closed: false },
    third: { score1: null, score2: null, closed: false },
    final: { score1: null, score2: null, closed: false },
  }
};

export function useTournament() {
    const [storedData, setData] = useLocalStorage("dg_league_state", initialState);

    // Migración ligera de esquema: estados guardados por versiones anteriores
    // pueden carecer de campos nuevos (p. ej. 'predictions'). Se combinan con
    // los defaults sin tocar lo persistido hasta el próximo cambio de estado.
    const data = { ...initialState, ...storedData };

  // Funciones de Setup
  const addPlayer = (name) => {
    if (data.players.length >= 10 || data.players.includes(name)) return false;
    setData((prev) => ({ ...prev, players: [...prev.players, name] }));
    return true;
  };

  const removePlayer = (name) => {
    setData((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p !== name),
    }));
  };

  const generateGroupsAndMatches = () => {
    // Mezclar aleatoriamente a los jugadores
    const shuffled = [...data.players].sort(() => 0.5 - Math.random());
    const half = Math.ceil(shuffled.length / 2);
    const groupA = shuffled.slice(0, half);
    const groupB = shuffled.slice(half);

    // Generar Partidos Grupo A (todos contra todos)
    const matches = [];
    for (let i = 0; i < groupA.length; i++) {
      for (let j = i + 1; j < groupA.length; j++) {
        matches.push({
          id: uuidv4(),
          groupId: "A",
          player1: groupA[i],
          player2: groupA[j],
          score1: null,
          score2: null,
          closed: false,
        });
      }
    }
    // Generar Partidos Grupo B
    for (let i = 0; i < groupB.length; i++) {
      for (let j = i + 1; j < groupB.length; j++) {
        matches.push({
          id: uuidv4(),
          groupId: "B",
          player1: groupB[i],
          player2: groupB[j],
          score1: null,
          score2: null,
          closed: false,
        });
      }
    }

    setData((prev) => ({
      ...prev,
      groups: { A: groupA, B: groupB },
      matches,
      phase: "group",
    }));
  };

  // Funciones de Torneo
  const updateMatchScore = (id, score1, score2) => {
    setData((prev) => {
      const newMatches = prev.matches.map((m) => {
        if (m.id === id) {
          // Evaluar nocaut 3-0 pedido por Neil
          let isClosed = false;
          if (
            (score1 === 3 && score2 === 0) ||
            (score2 === 3 && score1 === 0)
          ) {
            isClosed = true;
          }
          return { ...m, score1, score2, closed: isClosed };
        }
        return m;
      });
      return { ...prev, matches: newMatches };
    });
  };

  const getStandings = (groupId) => {
    const groupPlayers = data.groups[groupId];
    const standings = groupPlayers.map((player) => ({
      name: player,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0
    }));

    data.matches
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
  };

  // Fichajes y reglas
  const addTransfer = (user, playerOut, playerIn) => {
    setData((prev) => ({
      ...prev,
      transfers: [...prev.transfers, { id: uuidv4(), user, playerOut, playerIn }]
    }));
  };

  const toggleNerf = (userId, desc) => {
    setData((prev) => {
      const exists = prev.nerfs.find(n => n.userId === userId && n.description === desc);
      if (exists) {
        return { ...prev, nerfs: prev.nerfs.filter(n => n.id !== exists.id) };
      }
      return { ...prev, nerfs: [...prev.nerfs, { id: uuidv4(), userId, description: desc, active: true }] };
    });
  };

  const updateKnockoutScore = (stage, score1, score2) => {
    setData((prev) => {
      let isClosed = false;
      if ((score1 === 3 && score2 === 0) || (score2 === 3 && score1 === 0)) {
        isClosed = true;
      }
      return {
        ...prev,
        knockout: {
          ...prev.knockout,
          [stage]: { score1, score2, closed: isClosed }
        }
      };
    });
  };

    // Pronósticos sociales (Neil los anota por todos)
    /**
     * Registra (o sobreescribe) el pronóstico de un amigo sobre un partido.
     * Solo permitido mientras el partido no esté cerrado por 3-0.
     *
     * @param {string} matchId - Partido pronosticado.
     * @param {string} player - Amigo que pronostica.
     * @param {string} pick - Nombre del jugador al que se ve como ganador.
     */
    const addPrediction = (matchId, player, pick) => {
        setData((prev) => {
            const match = prev.matches.find((m) => m.id === matchId);
            if (!match || match.closed) return prev;
            // Un amigo tiene un único pick por partido: se descarta el anterior.
            const others = prev.predictions.filter(
                (p) => !(p.matchId === matchId && p.player === player)
            );
            return {
                ...prev,
                predictions: [...others, { id: uuidv4(), matchId, player, pick }]
            };
        });
    };

    /**
     * Elimina el pronóstico de un amigo en un partido concreto.
     */
    const removePrediction = (matchId, player) => {
        setData((prev) => ({
            ...prev,
            predictions: prev.predictions.filter(
                (p) => !(p.matchId === matchId && p.player === player)
            )
        }));
    };

    /**
     * Tabla paralela de aciertos de pronósticos. Solo puntúan partidos con
     * marcador ingresado; los empates no dan puntos a nadie.
     *
     * @returns {Array<{name: string, hits: number, total: number}>} Ranking ordenado.
     */
    const getPredictionStandings = () => {
        const playedById = new Map(
            data.matches
                .filter((m) => m.score1 !== null && m.score2 !== null)
                .map((m) => [m.id, m])
        );

        /** @type {Map<string, {name: string, hits: number, total: number}>} */
        const table = new Map();
        data.predictions.forEach((pred) => {
            const row = table.get(pred.player) || { name: pred.player, hits: 0, total: 0 };
            const match = playedById.get(pred.matchId);
            if (match) {
                row.total += 1;
                const s1 = parseInt(match.score1, 10);
                const s2 = parseInt(match.score2, 10);
                const winner =
                    s1 > s2 ? match.player1 : s2 > s1 ? match.player2 : null;
                if (winner && winner === pred.pick) row.hits += 1;
            }
            table.set(pred.player, row);
        });

        return [...table.values()].sort(
            (a, b) => b.hits - a.hits || a.name.localeCompare(b.name)
        );
    };

    const resetData = () => {
    if (confirm("¿Seguro que quieres borrar todo el torneo y empezar de cero?")) {
      setData(initialState);
    }
  };

  return {
    data,
    addPlayer,
    removePlayer,
    generateGroupsAndMatches,
    updateMatchScore,
    updateKnockoutScore,
    getStandings,
    addTransfer,
    toggleNerf,
    addPrediction,
    removePrediction,
    getPredictionStandings,
    resetData
  };
}
