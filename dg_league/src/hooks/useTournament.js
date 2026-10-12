import { useLocalStorage } from "./useLocalStorage";
import { v4 as uuidv4 } from "uuid";
import { TEAM_CATALOG } from "../utils/teamCatalog";
import {
    DRAW_PICK,
    getGroupStandings,
    getKnockoutBracket,
    getPredictionStandings as getPredictionStandingsPura,
} from "../utils/tournamentLogic";

const initialState = {
  phase: "setup", // 'setup' | 'draft' | 'drawn' | 'group' | 'knockout'
  onboardingDone: false, // Si ya pasó por la pantalla de inicio (landing)
  players: [],
  matches: [],
  groups: { A: [], B: [] },
  transfers: [],
  nerfs: [],
  predictions: [], // Pronósticos sociales: { id, matchId, player, pick }
  draftOrder: [], // Orden de turnos del draft: string[] de nombres
  draftPicks: [], // Elecciones del draft: { player, teamId }
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
  /**
   * Marca el onboarding (pantalla de inicio) como completado.
   */
  const finishOnboarding = () => {
    setData((prev) => ({ ...prev, onboardingDone: true }));
  };

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
      // Grupos sorteados: la previsualización los confirma con "Abrir torneo".
      phase: "drawn",
    }));
  };

  // Draft de equipos
  /**
   * Detecta si un nombre corresponde a Neil (case-insensitive).
   * Regla casera: Neil siempre elige de último en el draft.
   */
  const isNeil = (name) => name.trim().toLowerCase() === "neil";

  /**
   * Sortea el orden de turnos del draft: mezcla aleatoriamente a los
   * jugadores y deja a Neil SIEMPRE en el último lugar (no entra en el
   * sorteo aleatorio). Cambia la fase a 'draft'.
   */
  const startDraftOrder = () => {
    const shuffled = data.players
      .filter((p) => !isNeil(p))
      .sort(() => 0.5 - Math.random());
    const fixedLast = data.players.filter((p) => isNeil(p));

    setData((prev) => ({
      ...prev,
      draftOrder: [...shuffled, ...fixedLast],
      phase: "draft",
    }));
  };

  /**
   * Asigna el equipo libre indicado al jugador del turno actual.
   * El turno se deriva de la cantidad de elecciones ya hechas.
   *
   * @param {string} teamId - Id del equipo del catálogo.
   */
  const pickTeam = (teamId) => {
    setData((prev) => {
      const alreadyTaken = prev.draftPicks.some((pick) => pick.teamId === teamId);
      const currentPlayer = prev.draftOrder[prev.draftPicks.length];
      // Si el equipo está tomado o ya no quedan turnos, no hacer nada.
      if (alreadyTaken || !currentPlayer) return prev;
      return {
        ...prev,
        draftPicks: [...prev.draftPicks, { player: currentPlayer, teamId }],
      };
    });
  };

  /**
   * Asigna un equipo libre al azar para el jugador del turno actual.
   */
  const pickRandomTeam = () => {
    const takenIds = data.draftPicks.map((pick) => pick.teamId);
    const available = TEAM_CATALOG.filter((team) => !takenIds.includes(team.id));
    if (available.length === 0) return;
    const randomTeam = available[Math.floor(Math.random() * available.length)];
    pickTeam(randomTeam.id);
  };

  /**
   * Finaliza el draft y arranca la liga: genera grupos y partidos
   * (si no existían) y cambia la fase a 'group'.
   */
  const startLeague = () => {
    if (data.matches.length === 0) {
      generateGroupsAndMatches();
    } else {
      // Torneo ya en curso (p. ej. se añadieron equipos a mitad): solo cambia la fase.
      setData((prev) => ({ ...prev, phase: "group" }));
    }
  };

    /**
     * Abre oficialmente el torneo desde la previsualización de grupos
     * (fase 'drawn'): solo pasa la fase a 'group', sin regenerar nada.
     */
    const openTournament = () => {
        setData((prev) => ({ ...prev, phase: "group" }));
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

  /**
   * Tabla de posiciones de un grupo (puntos > DG > GF, incluidos los jugadores
   * sin partidos). Delega en la función pura `getGroupStandings`, extracción
   * 1:1 del cálculo que vivía aquí.
   */
  const getStandings = (groupId) =>
    getGroupStandings(data.matches, groupId, data.groups[groupId]);

  // Fichajes: intercambio 1x1 donde user entrega playerOut y toma playerIn
  // de la plantilla de targetPlayer (quien cede el jugador).
  const addTransfer = (user, playerOut, playerIn, targetPlayer) => {
    setData((prev) => ({
      ...prev,
      transfers: [...prev.transfers, { id: uuidv4(), user, playerOut, playerIn, targetPlayer }]
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
     * Registra (o sobreescribe) el pronóstico de un amigo sobre un partido de
     * grupo o un cruce de eliminatorias (matchId 'ko-semi1' | 'ko-semi2' |
     * 'ko-third' | 'ko-final'). Guardas: cruce sin participantes confirmados
     * bloqueado (RF-5), nada cerrado por 3-0 admite picks (RF-9), en cruces no
     * existe el empate (RF-4) y quien juega un partido o cruce no puede
     * pronosticarlo (RF-13).
     *
     * @param {string} matchId - Partido pronosticado, o 'ko-*' para un cruce.
     * @param {string} player - Amigo que pronostica.
     * @param {string} pick - Nombre del ganador previsto, o 'empate' en grupos.
     */
    const addPrediction = (matchId, player, pick) => {
        setData((prev) => {
            if (matchId.startsWith("ko-")) {
                const cruce = getKnockoutBracket(prev.matches, prev.groups, prev.knockout).find(
                    (c) => c.id === matchId
                );
                if (!cruce || !cruce.confirmed) return prev; // RF-5: cruce sin confirmar
                if (cruce.closed) return prev; // RF-9: cruce cerrado por 3-0
                if (pick === DRAW_PICK) return prev; // RF-4: en cruces solo 2 opciones
                if (player === cruce.p1 || player === cruce.p2) return prev; // RF-13: quien juega, no vota
            } else {
                const match = prev.matches.find((m) => m.id === matchId);
                if (!match || match.closed) return prev; // RF-9 (comportamiento actual)
                if (player === match.player1 || player === match.player2) return prev; // RF-13 (nuevo en grupos)
            }
            // Un amigo tiene un único pick por partido o cruce: se descarta el anterior.
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
     * Tabla de aciertos de la quiniela con subtotales por fase (Grupos /
     * Eliminatorias / TOTAL). Delega en la función pura
     * `getPredictionStandings`, con paridad exacta sobre los picks de grupos
     * existentes respecto al cálculo que vivía aquí (RNF-3).
     *
     * @returns {Array<{name: string, group: {hits: number, total: number}, ko: {hits: number, total: number}, total: number}>} Ranking ordenado.
     */
    const getPredictionStandings = () =>
        getPredictionStandingsPura(data.matches, data.groups, data.knockout, data.predictions);

    const resetData = () => {
    if (confirm("¿Seguro que quieres borrar todo el torneo y empezar de cero?")) {
      setData(initialState);
    }
  };

  return {
    data,
    addPlayer,
    removePlayer,
    finishOnboarding,
    startDraftOrder,
    pickTeam,
    pickRandomTeam,
    startLeague,
    openTournament,
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
